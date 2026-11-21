"use strict";
/* ================= MINI-JEU 3 : DEFENSE RESEAU ================= */
var def = null;
function startDefense(resume){
  def = resume && resume.data ? resume.data : { placed:{}, selTool:null, hintUsed:false, variant:(S.plays.defense % 3), start:Date.now() };
  if(def.variant===undefined) def.variant = 0;
  if(!def.start) def.start = Date.now();
  def.waves = wavesForVariant(def.variant);
  S.inProgress = { game:"defense", data:def }; save();
  show("defense");
  renderDefense(false);
}
function defSpent(){ var t=0; for(var k in def.placed) t += TOOLS[def.placed[k]].cost; return t; }
function defSave(){ S.inProgress = { game:"defense", data:def }; save(); }
function slotHtml(slot){
  var t = def.placed[slot.id];
  if(t) return '<button class="slot filled" data-slot="'+slot.id+'">'+TOOLS[t].icon+TOOLS[t].name+' · '+TOOLS[t].cost+' €<span style="color:var(--mut);font-weight:600">— toucher pour retirer</span></button>';
  return '<button class="slot" data-slot="'+slot.id+'">+ '+slot.label+'</button>';
}
function renderDefense(running){
  var spent = defSpent(), left = 12000 - spent;
  var html = '<div class="ghead"><button class="quit" id="defQuit" aria-label="Quitter">✕</button><div class="ttl">Défense réseau</div>'+examClockHtml()+'</div>';
  html += '<div class="stepct">'+DEF_VARIANTS[def.variant||0].label+'</div>';
  examStartClock(function(){ return def && def.start; });
  html += '<div class="netmap" id="netmap"><div class="packet" id="packet"></div>'
    + '<div class="zoneband"><div class="zb-t">Internet</div><div class="nodes"><div class="node">Trafic entrant<span class="ns">clients · visiteurs · attaquants</span></div></div>'+slotHtml(SLOTS[0])+'</div>'
    + '<div class="zoneband dmz"><div class="zb-t">DMZ</div><div class="nodes"><div class="node">Serveur Web<span class="ns">site public</span></div><div class="node">Serveur Mail<span class="ns">messagerie</span></div></div>'+slotHtml(SLOTS[1])+slotHtml(SLOTS[2])+'</div>'
    + slotHtml(SLOTS[3])
    + '<div class="zoneband int"><div class="zb-t">Réseau interne</div><div class="nodes"><div class="node">Postes<span class="ns">employés</span></div><div class="node">Serveurs<span class="ns">données</span></div><div class="node">Caisse<span class="ns">paiements</span></div></div>'+slotHtml(SLOTS[4])+'</div>'
    + '</div>';
  html += '<div class="servicewrap"><div class="sl"><span>Service (trafic légitime)</span><span id="svcVal">100 %</span></div><div class="servicebar"><i id="svcBar" style="width:100%"></i></div></div>';
  html += '<div class="budgetbar"><span>Budget restant</span><span class="'+(left<0?'neg':'')+'">'+left.toLocaleString("fr-FR")+' € / 12 000 €</span></div>';
  html += '<div class="toolbox">';
  for(var k in TOOLS){
    var usedSomewhere = Object.keys(def.placed).some(function(s){ return def.placed[s]===k; });
    html += '<button class="tool'+(def.selTool===k?' sel':'')+'" data-tool="'+k+'">'+TOOLS[k].icon+TOOLS[k].name+'<span class="tp">'+TOOLS[k].cost.toLocaleString("fr-FR")+' €</span></button>';
  }
  html += '</div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="defHint">Indice d\'Amara — <b>aide essentielle gratuite</b></button><div class="hintbox" id="defHintBox">« <span class="ms-tw" id="defHintTw">'+(def.hintUsed?'Chaque équipement a sa place : le WAF protège le Web, le VLAN cloisonne l\'interne, le pare-feu garde les entrées. Un IDS voit tout… mais ne bloque rien tout seul.':'')+'</span> »</div>';
  }
  html += '<div id="waveZone"></div>';
  html += '<button class="btn primary big" id="defLaunch" style="margin-top:14px" '+(running?'disabled':'')+'>Lancer les vagues de trafic</button>';
  $("view-defense").innerHTML = html;
  $("defQuit").addEventListener("click", quitGame);
  var dhb = $("defHint");
  if(dhb) dhb.addEventListener("click", function(){
    if(def.hintUsed){ $("defHintBox").classList.add("on"); return; }
    def.hintUsed = true; defSave();
    $("defHintBox").classList.add("on"); sndTap();
    var dtw = $("defHintTw"); if(dtw){ dtw.classList.add("typing"); msTypeEl(dtw, "Chaque équipement a sa place : le WAF protège le Web, le VLAN cloisonne l'interne, le pare-feu garde les entrées. Un IDS voit tout… mais ne bloque rien tout seul."); }
  });
  if(def.hintUsed && $("defHintBox")) $("defHintBox").classList.add("on");
  document.querySelectorAll("#view-defense [data-tool]").forEach(function(b){
    b.addEventListener("click", function(){
      if(def.running) return;
      var t = b.getAttribute("data-tool");
      def.selTool = (def.selTool===t) ? null : t; defSave(); sndTap(); renderDefense(false);
    });
  });
  document.querySelectorAll("#view-defense [data-slot]").forEach(function(b){
    b.addEventListener("click", function(){
      if(def.running) return;
      var slot = b.getAttribute("data-slot");
      if(def.placed[slot]){ delete def.placed[slot]; defSave(); sndTap(); renderDefense(false); return; }
      if(!def.selTool){ toast("Choisis d'abord un équipement en bas."); return; }
      if(defSpent() + TOOLS[def.selTool].cost > 12000){ toast("Budget dépassé : retire un équipement."); sndBad(); return; }
      def.placed[slot] = def.selTool; def.selTool = null; defSave(); sndTap(); renderDefense(false);
    });
  });
  $("defLaunch").addEventListener("click", runWaves);
}
function waveOutcome(w){
  if(w.type==="legit"){
    if(w.ownBlock && def.placed[w.ownBlock.split(":")[0]] === w.ownBlock.split(":")[1]) return { res:0, lbl:"Bloqué par ton propre équipement" };
    return { res:1, lbl:"Passé" };
  }
  var best = 0;
  for(var key in w.blockers){
    var parts = key.split(":");
    if(def.placed[parts[0]] === parts[1]) best = Math.max(best, w.blockers[key]);
  }
  if(best>=1) return { res:1, lbl:"Bloquée" };
  if(best>0) return { res:0.5, lbl:"Détectée, pas bloquée" };
  return { res:0, lbl:"Passée !" };
}
function runWaves(){
  var count = Object.keys(def.placed).length;
  if(count===0){ toast("Place au moins un équipement."); sndBad(); return; }
  def.running = true;
  $("defLaunch").disabled = true;
  $("defLaunch").textContent = "Trafic en cours…";
  var wz = $("waveZone");
  wz.innerHTML = '<div class="wavelog" id="wavelog"></div>';
  var log = $("wavelog");
  var packet = $("packet");
  var idx = 0, service = 100;
  var outcomes = [];
  var waves = def.waves || WAVES;
  function step(){
    if(idx >= waves.length){ finishDefense(outcomes, service); return; }
    var w = waves[idx], o = waveOutcome(w);
    outcomes.push(o.res);
    var row = document.createElement("div");
    row.className = "wave";
    row.innerHTML = '<div class="wi run">•</div><span>'+(idx+1)+'. '+w.label+'</span><span class="wv" style="color:var(--mut)">'+o.lbl+'</span>';
    log.appendChild(row);
    if(packet){
      packet.className = "packet" + (w.type==="mal" ? " bad" : "");
      packet.style.transition = "none"; packet.style.top = "6px"; packet.style.opacity = "1";
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        packet.style.transition = "top 0.7s linear";
        packet.style.top = (o.res>=1 && w.type==="mal") ? "90px" : "calc(100% - 26px)";
      });});
    }
    if(w.type==="legit" && o.res===0){ service -= 34; if(service<0) service=0; }
    var sb = $("svcBar"), sv = $("svcVal");
    if(sb){ sb.style.width = service+"%"; sb.style.background = "var(--cyan)"; }
    if(sv) sv.textContent = service+" %";
    if(w.type==="mal" && o.res>=1) sndOk(); else if(o.res===0) sndBad(); else sndTap();
    idx++;
    setTimeout(step, 950);
  }
  step();
}
function finishDefense(outcomes, service){
  def.running = false;
  var malIdx = [1,3,4,5,6], malSum = 0;
  malIdx.forEach(function(i){ malSum += outcomes[i]; });
  var blocked = Math.round(40 * malSum / malIdx.length);
  var legitIdx = [0,2,7], legitSum = 0;
  legitIdx.forEach(function(i){ legitSum += outcomes[i]; });
  var preserved = Math.round(30 * legitSum / legitIdx.length);
  var spent = defSpent();
  var budget = Math.round(20 * (1 - (spent/12000) * 0.5));
  var count = Object.keys(def.placed).length;
  var simple = Math.max(0, Math.round(10 * (1 - Math.max(0, count-2)/6)));
  var score = blocked + preserved + budget + simple;
  var why = "";
  (def.waves || WAVES).forEach(function(w, i){
    var res = outcomes[i];
    var cls = res>=1 ? "ok" : res>0 ? "mid" : "ko";
    var lbl = w.type==="legit" ? (res>=1 ? "Trafic passé" : "Trafic bloqué") : (res>=1 ? "Attaque bloquée" : res>0 ? "Attaque détectée seulement" : "Attaque passée");
    why += whyRow(res>=1, cls, (i+1)+". "+w.label+" — "+lbl, w.why);
  });
  why += '<p style="color:var(--mut);font-size:14px">Service final : <b style="color:var(--txt)">'+service+' %</b> · Budget dépensé : <b style="color:var(--txt)">'+spent.toLocaleString("fr-FR")+' €</b></p>';
  finishMission._newDex = [];
  finishMission._covered = (def.waves || WAVES).map(function(w,i){ return i; });
  finishMission._hintsUsed = 0; /* l'indice de placement est l'aide essentielle gratuite */
  finishMission._variant = def.variant||0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décisions :</b> '+count+' équipement'+(count>1?'s':'')+' placé'+(count>1?'s':'')+' pour '+spent.toLocaleString("fr-FR")+' € sur 12 000 €.</p>'
    + '<p style="margin:4px 0"><b>Preuves utilisées :</b> chaque vague du debrief relie le résultat à l\'équipement (ou à l\'absence d\'équipement) sur sa zone.</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> le service légitime a été suivi vague par vague — une défense qui casse le service n\'est pas une défense.</p>'
    + '<p style="margin:4px 0"><b>Conséquences métier :</b> service final '+service+' % — '+(service>=67 ? 'les équipes ont pu travailler pendant l\'incident.' : 'le réseau protégé a aussi bloqué le travail : à rééquilibrer.')+'</p>';
  finishMission("defense", score, [
    { label:"Attaques bloquées", got:blocked, max:40 },
    { label:"Trafic légitime préservé", got:preserved, max:30 },
    { label:"Budget respecté", got:budget, max:20 },
    { label:"Simplicité des règles", got:simple, max:10 }
  ], why, function(){
    if(unlockDex("segment")) finishMission._newDex.push("segment");
    if(unlockDex("privilege")) finishMission._newDex.push("privilege");
    if(unlockDex("cloud")) finishMission._newDex.push("cloud");
  }, "Le pourquoi, vague par vague");
}