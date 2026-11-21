"use strict";
function startPackSim(id){
  packSim = { id:id, order:[], assign:{}, sel:null, phase:"play", counted:false };
  packTab = "sims";
  renderPack(); window.scrollTo(0,0);
}
function renderPackSims(root){
  var html = "";
  if(!packSim){
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Simulations PBQ</div></div>';
    html += '<div class="stepct">Trois mini-simulations, en plus de la simulation pare-feu du mini-examen · Seuil d\'entraînement : plus de 80 %</div>';
    ["ir","ctrl","threat"].forEach(function(id){
      var d = SIMS[id], st = S.pack.sims[id];
      html += '<div class="card"><div class="row between"><span class="tag soc">Simulation PBQ</span>'+(st && st.plays ? '<span class="tag done">Meilleur : '+st.best+' % · '+st.plays+' partie'+(st.plays>1?"s":"")+'</span>' : '')+'</div><h3 style="margin-top:8px">'+d.title+'</h3><p>'+d.sub+'</p><button class="btn primary big" data-sim="'+id+'">'+(st && st.plays ? "Rejouer" : "Jouer")+'</button></div>';
    });
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packTab="home"; renderPack(); });
    root.querySelectorAll("[data-sim]").forEach(function(b){
      b.addEventListener("click", function(){ sndTap(); startPackSim(b.getAttribute("data-sim")); });
    });
    return;
  }
  var d = SIMS[packSim.id];
  if(packSim.phase==="play"){
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Quitter">✕</button><div class="ttl">'+d.title+'</div></div>';
    if(packSim.id==="ir"){
      html += '<div class="stepct">Simulation (PBQ) · Touche les étapes dans le bon ordre</div><div class="progressline"><i style="width:'+Math.round(100*packSim.order.length/7)+'%"></i></div>';
      html += '<div class="alertcard pk-enter"><div class="body" style="font-size:15.5px">'+d.sub+'</div>';
      d.display.forEach(function(step){
        var pos = packSim.order.indexOf(step);
        html += '<button class="ruleitem" data-ir="'+esc(step)+'" '+(pos>=0?"disabled":"")+'>'+(pos>=0?'<span class="ord">'+(pos+1)+'</span>':'')+esc(step)+'</button>';
      });
      html += '</div>';
      html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="pkSimReset">Recommencer</button><button class="btn primary" style="flex:1" id="pkSimGo" '+(packSim.order.length>=7?"":"disabled")+'>Voir mon résultat</button></div>';
      root.innerHTML = html;
      $("pkBack").addEventListener("click", function(){ packSim = null; renderPack(); });
      root.querySelectorAll("[data-ir]").forEach(function(b){
        b.addEventListener("click", function(){ packSim.order.push(b.getAttribute("data-ir")); sndTap(); renderPackSims(root); });
      });
      var rs = $("pkSimReset"); if(rs) rs.addEventListener("click", function(){ packSim.order = []; renderPackSims(root); });
      var go = $("pkSimGo"); if(go) go.addEventListener("click", function(){ packSim.phase = "res"; sndTap(); renderPackSims(root); window.scrollTo(0,0); });
      return;
    }
    var total = d.items.length, assigned = Object.keys(packSim.assign).length;
    html += '<div class="stepct">Simulation (PBQ) · Associer : '+assigned+' / '+total+'</div><div class="progressline"><i style="width:'+Math.round(100*assigned/total)+'%"></i></div>';
    html += '<div class="alertcard pk-enter"><div class="body" style="font-size:15.5px">'+d.sub+' Touche un élément, puis son type.</div>';
    d.items.forEach(function(it, ii){
      html += '<button class="simitem'+(packSim.sel===ii?" sel":"")+'" data-item="'+ii+'"><span>'+esc(it.t)+'</span>'+(packSim.assign[ii] ? '<span class="given">'+esc(packSim.assign[ii])+'</span>' : '')+'</button>';
    });
    html += '<div class="chiprow" style="margin-top:12px">';
    d.types.forEach(function(t){ html += '<button class="fchip" data-type="'+esc(t)+'">'+esc(t)+'</button>'; });
    html += '</div></div>';
    html += '<button class="btn primary big" id="pkSimGo" style="margin-top:10px" '+(assigned>=total?"":"disabled")+'>Voir mon résultat</button>';
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packSim = null; renderPack(); });
    root.querySelectorAll("[data-item]").forEach(function(b){
      b.addEventListener("click", function(){ packSim.sel = +b.getAttribute("data-item"); sndTap(); renderPackSims(root); });
    });
    root.querySelectorAll("[data-type]").forEach(function(b){
      b.addEventListener("click", function(){
        if(packSim.sel===null){ toast("Touche d'abord un élément de la liste."); return; }
        packSim.assign[packSim.sel] = b.getAttribute("data-type");
        var nxt = null;
        d.items.forEach(function(it, ii){ if(packSim.assign[ii]===undefined && nxt===null) nxt = ii; });
        packSim.sel = nxt;
        sndTap(); renderPackSims(root);
      });
    });
    var go2 = $("pkSimGo"); if(go2) go2.addEventListener("click", function(){ packSim.phase = "res"; sndTap(); renderPackSims(root); window.scrollTo(0,0); });
    return;
  }
  /* résultats */
  var good = 0, total = 0, corr = "";
  if(packSim.id==="ir"){
    total = d.order.length;
    packSim.order.forEach(function(step, pos){ if(d.order[pos]===step) good++; });
    corr = d.order.map(function(step, pos){
      var mine = packSim.order[pos], okc = mine===step;
      return whyRow(okc, okc?"ok":"ko", "Étape "+(pos+1)+" — "+step, okc ? "Bien placée." : "Tu avais mis : "+mine+".");
    }).join("");
  } else {
    total = d.items.length;
    corr = d.items.map(function(it, ii){
      var mine = packSim.assign[ii], okc = mine===it.type;
      if(okc) good++;
      return whyRow(okc, okc?"ok":"ko", it.t, "Bonne réponse : "+it.type+(okc ? "." : " · Ta réponse : "+(mine||"—")+"."));
    }).join("");
  }
  var pct = Math.round(100*good/total);
  if(!packSim.counted){
    packSim.counted = true;
    var prev = S.pack.sims[packSim.id] || { best:0, plays:0 };
    S.pack.sims[packSim.id] = { best:Math.max(prev.best||0, pct), plays:(prev.plays||0)+1 };
    S.credits += 10; S.xp.soc += 15;
    save();
  }
  html += '<div class="ghead"><div class="ttl">'+d.title+' — résultat</div></div>';
  html += '<div class="scorebig pk-enter" data-pct="'+pct+'">'+pct+'<small> %</small></div><div class="gradelbl">'+(pct>80 ? "Au-dessus du seuil d’entraînement (80 %)" : "Sous le seuil d’entraînement (80 %) — refais la simulation, puis revois la carte liée")+'</div>';
  html += '<div class="card"><h3>Barème</h3><div class="breakrow"><div class="bl"><span>Bonnes réponses</span><span>'+good+' / '+total+'</span></div><div class="breakbar"><i style="width:'+pct+'%"></i></div></div><p style="margin:8px 0 0">'+d.why+'</p></div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">+15 XP</div><div class="rl">SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">+10</div><div class="rl">Crédits</div></div></div>';
  html += '<div class="card"><h3>Corrections</h3>'+corr;
  d.cards.forEach(function(cid){ html += '<div style="margin:8px 0 2px"><button class="btn" data-review-card="'+cid+'">Revoir la carte '+cid+'</button></div>'; });
  html += '</div>';
  html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="pkSimList">Autres simulations</button><button class="btn primary" style="flex:1" id="pkSimRetry">Refaire</button></div>';
  root.innerHTML = html;
  root.querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
  pkScoreCount(root.querySelector(".scorebig"));
  root.querySelectorAll("[data-review-card]").forEach(function(b){
    b.addEventListener("click", function(){ var cid = b.getAttribute("data-review-card"); packSim = null; openCardInPack(cid); });
  });
  $("pkSimList").addEventListener("click", function(){ packSim = null; renderPack(); });
  $("pkSimRetry").addEventListener("click", function(){ startPackSim(packSim.id); });
  if(pct>80) sndOk(); else sndBad();
}
var PARCOURS = [
  { w:"Semaines 1–2", t:"Fondations", scen:["S1-1","S1-2","S1-3","S2-1"], cards:["C1-01","C1-02","C1-03","C1-04","C1-05","C1-06","C1-07","C1-08"], obj:"Concepts généraux solides, notions de contrôles et de chiffrement." },
  { w:"Semaines 3–4", t:"Menaces et vulnérabilités", scen:["S2-2","S2-3","S2-4","S4-3"], cards:["C2-01","C2-02","C2-03","C2-04","C2-05","C2-06","C2-07","C2-08","C4-05"], obj:"Reconnaître les familles de menaces et prioriser les correctifs." },
  { w:"Semaines 5–6", t:"Architecture et réseau", scen:["S3-1","S3-2","S3-3"], cards:["C3-01","C3-02","C3-03","C3-04","C3-05","C3-06","C3-07","C3-08"], obj:"Concevoir un réseau segmenté, comprendre le cloud et la résilience." },
  { w:"Semaines 7–8", t:"Opérations de sécurité", scen:["S4-1","S4-2","S4-4","S4-5"], cards:["C4-01","C4-02","C4-03","C4-04","C4-06","C4-07","C4-08"], obj:"Triage, journaux, réponse à incident, identités." },
  { w:"Semaine 9", t:"Gouvernance et risque", scen:["S5-1","S5-2","S5-3"], cards:["C5-01","C5-02","C5-03","C5-04","C5-05","C5-06","C5-07","C5-08"], obj:"Risques, conformité, tiers, sensibilisation." },
  { w:"Semaine 10", t:"Points faibles", scen:[], cards:[], obj:"Reprendre les scénarios les moins réussis et les cartes en retard. Objectif : remonter les domaines les plus bas.", special:"weak" },
  { w:"Semaine 11", t:"Examens blancs", scen:[], cards:[], obj:"Mini-examen du pack, puis un examen complet du jeu ; revoir les cartes des erreurs. Objectif : analyser les écarts par domaine.", special:"exam" },
  { w:"Semaine 12", t:"Dernière ligne droite", scen:[], cards:[], obj:"Examen blanc final et révision éclair. Objectif : des examens blancs réguliers au-dessus du seuil visé, puis l’inscription.", special:"final" }
];
var CARD_INTERVALS = [1,3,7,14,30];
var packTab = "home", packScenId = null, packScenAnswer = null, packCardFilter = "due", packCardIdx = 0, packCardFlipped = false, pkSkipEnter = false;
var packExam = null;
function cardState(id){
  if(!S.pack.cards[id]) S.pack.cards[id] = { lv:0, due:0, n:0 };
  return S.pack.cards[id];
}
function cardDueList(){
  var now = Date.now();
  return CARDS40.filter(function(c){ var st = S.pack.cards[c.id]; return !st || !st.n || (st.due && st.due <= now); });
}
function cardListForFilter(){
  if(packCardFilter==="due") return cardDueList();
  if(packCardFilter==="all") return CARDS40.slice();
  var d = +packCardFilter;
  return CARDS40.filter(function(c){ return +c.id.charAt(1)===d; });
}
function scenDoneCount(){ return Object.keys(S.pack.scen).length; }
function cardsReviewedCount(){ return Object.keys(S.pack.cards).filter(function(k){ return S.pack.cards[k].n>0; }).length; }
function openScenInPack(scenId){
  packTab = "scen"; packScenId = scenId; packScenAnswer = null;
  show("pack");
}
function openCardInPack(cardId){
  packTab = "cards"; packCardFilter = "all";
  var list = cardListForFilter();
  for(var i=0;i<list.length;i++){ if(list[i].id===cardId){ packCardIdx = i; break; } }
  packCardFlipped = false;
  show("pack");
}