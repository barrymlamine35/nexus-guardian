"use strict";
/* ---------- Explorateur de protocoles (lecteur) ---------- */
var pxView = null, pxSearch = "", pxLayerF = 0;
var pxStep = 0, pxPlaying = false, pxSpeed = 1;
var pxPlayTimer = null, pxAnimTimers = [], pxToken = 0;
function pxReduced(){ return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
function pxById(id){ for(var i=0;i<PX_PROTOCOLS.length;i++){ if(PX_PROTOCOLS[i].id===id) return PX_PROTOCOLS[i]; } return null; }
function pxClearAnim(){ pxAnimTimers.forEach(function(t){ clearTimeout(t); }); pxAnimTimers = []; }
function pxClearPlay(){ if(pxPlayTimer){ clearTimeout(pxPlayTimer); pxPlayTimer = null; } }
function pxAnimLater(fn, ms){ var tok = pxToken; pxAnimTimers.push(setTimeout(function(){ if(tok===pxToken) fn(); }, ms)); }
function pxStop(){ pxToken++; pxClearAnim(); pxClearPlay(); pxPlaying = false; }
function stopNetAnim(){ pxStop(); }
function pxMeta(p){ return p.cl + (p.port ? " · Port " + p.port : ""); }
function pxIcon(name){
  var n = (name || "").toLowerCase(), inner;
  if(/^[0-9.]+$/.test(name)) inner = "<circle cx=\"12\" cy=\"12\" r=\"8.4\"/><path d=\"M3.6 12h16.8M12 3.6c2.3 2.3 3.4 5.1 3.4 8.4s-1.1 6.1-3.4 8.4c-2.3-2.3-3.4-5.1-3.4-8.4s1.1-6.1 3.4-8.4z\"/>";
  else if(n.indexOf("pare-feu")>=0) inner = "<path d=\"M12 3l7 2.6v5.2c0 4.6-3 8.6-7 10.2-4-1.6-7-5.6-7-10.2V5.6z\"/>";
  else if(n.indexOf("switch")>=0) inner = "<rect x=\"3\" y=\"8\" width=\"18\" height=\"8\" rx=\"1.6\"/><path d=\"M6.8 10.2l2.6 1.8-2.6 1.8M17.2 10.2L14.6 12l2.6 1.8\"/>";
  else if(n.indexOf("routeur")>=0 || n.indexOf("concentrateur")>=0) inner = "<circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21M6.2 6.2l2.3 2.3M17.8 6.2l-2.3 2.3\"/>";
  else if(n.indexOf("internet")>=0 || n.indexOf("nuage")>=0) inner = "<path d=\"M7.2 18.2h9.3a3.9 3.9 0 0 0 .8-7.7A5.6 5.6 0 0 0 6.5 8.7a4.4 4.4 0 0 0 .7 9.5z\"/>";
  else if(n.indexOf("point d")>=0) inner = "<path d=\"M4 10.2a12 12 0 0 1 16 0M6.9 13.7a8 8 0 0 1 10.2 0M9.7 17.1a4 4 0 0 1 4.6 0\"/><circle cx=\"12\" cy=\"19.6\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>";
  else if(n.indexOf("résolveur")>=0 || n.indexOf("dns")>=0 || n.indexOf("racine")>=0 || n.indexOf("tld")>=0 || n.indexOf("autorité")>=0) inner = "<circle cx=\"12\" cy=\"12\" r=\"8.4\"/><path d=\"M3.6 12h16.8M12 3.6c2.3 2.3 3.4 5.1 3.4 8.4s-1.1 6.1-3.4 8.4c-2.3-2.3-3.4-5.1-3.4-8.4s1.1-6.1 3.4-8.4z\"/>";
  else if(n.indexOf("serveur")>=0) inner = "<rect x=\"5\" y=\"3.6\" width=\"14\" height=\"6.8\" rx=\"1.6\"/><rect x=\"5\" y=\"13.6\" width=\"14\" height=\"6.8\" rx=\"1.6\"/><circle cx=\"8.6\" cy=\"7\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"8.6\" cy=\"17\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/>";
  else if(n.indexOf("téléphone")>=0) inner = "<path d=\"M6.2 3.8h3.6l1.4 4.3-2.3 1.7a12.5 12.5 0 0 0 5.3 5.3l1.7-2.3 4.3 1.4v3.6a2 2 0 0 1-2.1 2A16.8 16.8 0 0 1 4.2 5.9a2 2 0 0 1 2-2.1z\"/>";
  else if(n.indexOf("ordinateur")>=0 || n.indexOf("client")>=0 || n.indexOf("pc")>=0 || n.indexOf("poste")>=0 || n.indexOf("hôte")>=0 || n.indexOf("entrant")>=0 || n.indexOf("équipement")>=0 || n.indexOf("automate")>=0 || n.indexOf("passerelle")>=0 || n.indexOf("encodeur")>=0) inner = "<rect x=\"4.5\" y=\"4.5\" width=\"15\" height=\"10.5\" rx=\"1.6\"/><path d=\"M2.8 19.5h18.4l-1.7-3.2H4.5z\"/>";
  else inner = "<circle cx=\"5\" cy=\"12\" r=\"2.2\"/><circle cx=\"19\" cy=\"5.6\" r=\"2.2\"/><circle cx=\"19\" cy=\"18.4\" r=\"2.2\"/><path d=\"M7 11l9.7-4.3M7 13l9.7 4.3\"/>";
  return "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + inner + "</svg>";
}
function pxNodeLabel(name){
  var m = /^(.*?)\s+(\d+\.\d+\.\d+\.\d+)$/.exec(name);
  if(m) return esc(m[1]) + "<small>" + esc(m[2]) + "</small>";
  return esc(name);
}
function pxRenderGrid(){
  var grid = $("pxGrid"); if(!grid) return;
  var q = pxSearch.trim().toLowerCase(), html = "", count = 0;
  PX_PROTOCOLS.forEach(function(p){
    if(pxLayerF && p.layers.indexOf(pxLayerF)<0) return;
    if(q && p.title.toLowerCase().indexOf(q)<0) return;
    count++;
    html += "<button type=\"button\" class=\"netcard\" data-px=\"" + p.id + "\" aria-label=\"Ouvrir le protocole " + esc(p.title) + "\">"
      + "<span class=\"nhead\"><span class=\"nnum\">" + p.num + "</span><span class=\"ntitle\">" + esc(p.title) + "</span></span>"
      + "<span class=\"pxmeta\">" + esc(pxMeta(p)) + "</span>"
      + "<span class=\"pxgo\">Schéma animé ›</span></button>";
  });
  if(!count) html = "<div class=\"stepct\" style=\"grid-column:1/-1\">Aucun protocole ne correspond à ta recherche.</div>";
  grid.innerHTML = html;
  grid.querySelectorAll("[data-px]").forEach(function(b){
    b.addEventListener("click", function(){ sndTap(); pxOpen(b.getAttribute("data-px")); });
  });
}
function renderNetConcepts(root){
  if(pxView){ pxRenderPlayer(root); return; }
  var html = "";
  html += "<div class=\"ghead\"><button class=\"quit\" id=\"pkBack\" aria-label=\"Retour\">‹</button><div class=\"ttl\">Explorateur de protocoles</div></div>";
  html += "<div class=\"stepct\"><b>44 protocoles</b> — cherche un protocole ou filtre par couche OSI, puis touche une carte : le schéma s’anime étape par étape, avec le flux des paquets et la fiche du protocole.</div>";
  html += "<input type=\"search\" id=\"pxSearch\" class=\"pxsearch\" placeholder=\"Rechercher un protocole… (ex. DNS, SSH, TCP)\" value=\"" + esc(pxSearch) + "\" autocomplete=\"off\">";
  html += "<div class=\"pxfilters\" role=\"group\" aria-label=\"Filtrer par couche OSI\">";
  [0,2,3,4,5,6,7].forEach(function(L){
    html += "<button type=\"button\" class=\"pxfbtn" + (pxLayerF===L ? " on" : "") + "\" data-layer=\"" + L + "\">" + (L===0 ? "Tous" : "Couche " + L) + "</button>";
  });
  html += "</div>";
  html += "<div class=\"netgrid\" id=\"pxGrid\"></div>";
  root.innerHTML = html;
  $("pkBack").addEventListener("click", function(){ pxStop(); packTab = "home"; renderPack(); });
  var inp = $("pxSearch");
  inp.addEventListener("input", function(){ pxSearch = inp.value; pxRenderGrid(); });
  root.querySelectorAll("[data-layer]").forEach(function(b){
    b.addEventListener("click", function(){
      sndTap(); pxLayerF = +b.getAttribute("data-layer");
      root.querySelectorAll("[data-layer]").forEach(function(x){ x.classList.toggle("on", +x.getAttribute("data-layer")===pxLayerF); });
      pxRenderGrid();
    });
  });
  pxRenderGrid();
}
function pxOpen(id){
  pxStop(); pxView = id; pxStep = 0; pxSpeed = 1;
  var root = $("view-pack"); if(!root) return;
  pxRenderPlayer(root);
  window.scrollTo(0,0);
  if(!pxReduced()){
    pxPlaying = true;
    pxShowStep(0, true);
    pxSchedule();
    pxSyncControls();
  }
}
function pxRenderPlayer(root){
  var p = pxById(pxView);
  if(!p){ pxView = null; renderNetConcepts(root); return; }
  var html = "";
  html += "<div class=\"ghead\"><button class=\"quit\" id=\"pxBack\" aria-label=\"Retour à la liste des protocoles\">‹</button><div class=\"ttl\">" + esc(p.title) + "</div></div>";
  html += "<div class=\"stepct\">Protocole " + p.num + " / 44 · " + esc(pxMeta(p)) + "</div>";
  html += "<div class=\"pxdiag\" id=\"pxDiag\"><div class=\"pxnodes\">";
  p.nodes.forEach(function(n, ni){
    if(ni>0) html += "<span class=\"pxtrack\"></span>";
    html += "<span class=\"pxnode\">" + pxIcon(n) + "<span class=\"pxnlabel\">" + pxNodeLabel(n) + "</span></span>";
  });
  html += "</div><span class=\"pxpacket\" id=\"pxPacket\"></span><span class=\"pxplabel\" id=\"pxLabel\"></span></div>";
  html += "<div class=\"pxstepbox\" id=\"pxStepBox\" aria-live=\"polite\"></div>";
  html += "<div class=\"pxcontrols\">"
    + "<button type=\"button\" class=\"pxbtn\" id=\"pxPrev\" aria-label=\"Étape précédente\">‹ Préc.</button>"
    + "<button type=\"button\" class=\"pxbtn main\" id=\"pxPlay\">▶ Lecture</button>"
    + "<button type=\"button\" class=\"pxbtn\" id=\"pxNext\" aria-label=\"Étape suivante\">Suiv. ›</button>"
    + "<button type=\"button\" class=\"pxbtn\" id=\"pxSpeed\">1x</button>"
    + "<button type=\"button\" class=\"pxbtn\" id=\"pxReplay\">↺ Rejouer</button></div>";
  html += "<div class=\"pxsect\">Flux des paquets</div>";
  html += "<table class=\"pxflow\"><thead><tr><th style=\"width:6%\">N°</th><th style=\"width:13%\">Heure</th><th style=\"width:16%\">Source</th><th style=\"width:16%\">Destination</th><th style=\"width:12%\">Protocole</th><th style=\"width:28%\">Info</th><th style=\"width:9%\">Taille</th></tr></thead><tbody>";
  p.flow.forEach(function(f, i){
    html += "<tr data-row=\"" + i + "\"><td>" + (i+1) + "</td><td>" + esc(f.time) + "</td><td>" + esc(f.src) + "</td><td>" + esc(f.dst) + "</td><td>" + esc(f.proto) + "</td><td>" + esc(f.info) + "</td><td>" + esc(f.size) + "</td></tr>";
  });
  html += "</tbody></table>";
  html += "<div class=\"pxsect\">Aperçu du protocole</div><div class=\"pxspec\">";
  p.spec.forEach(function(kv){ html += "<div class=\"pxspecrow\"><span>" + esc(kv[0]) + "</span><b>" + esc(kv[1]) + "</b></div>"; });
  html += "</div>";
  html += "<div class=\"netexplain on\" style=\"margin-top:12px\"><div class=\"netexp-t\">Comment ça fonctionne — " + esc(p.title) + "</div><p>" + esc(p.explain) + "</p></div>";
  root.innerHTML = html;
  $("pxBack").addEventListener("click", function(){ sndTap(); pxStop(); pxView = null; renderNetConcepts(root); window.scrollTo(0,0); });
  $("pxPrev").addEventListener("click", function(){ sndTap(); pxGo(pxStep - 1); });
  $("pxNext").addEventListener("click", function(){ sndTap(); pxGo(pxStep + 1); });
  $("pxPlay").addEventListener("click", function(){ sndTap(); pxTogglePlay(); });
  $("pxSpeed").addEventListener("click", function(){ sndTap(); pxSpeed = pxSpeed===1 ? 2 : 1; pxSyncControls(); if(pxPlaying) pxSchedule(); });
  $("pxReplay").addEventListener("click", function(){ sndTap(); pxReplayFn(); });
  pxShowStep(pxStep, false);
  pxSyncControls();
}
function pxCenters(){
  var diag = $("pxDiag"); if(!diag) return [];
  var dr = diag.getBoundingClientRect(), out = [];
  diag.querySelectorAll(".pxnode").forEach(function(el){
    var r = el.getBoundingClientRect();
    out.push({ x: ((r.left + r.width/2 - dr.left) / dr.width) * 100, y: (r.top + 17 - dr.top) });
  });
  return out;
}
function pxShowStep(i, animate){
  var p = pxById(pxView); if(!p) return;
  pxStep = Math.max(0, Math.min(p.steps.length - 1, i));
  var st = p.steps[pxStep];
  pxClearAnim();
  var box = $("pxStepBox");
  if(box) box.innerHTML = "<div class=\"pxstept\">Étape " + (pxStep+1) + " sur " + p.steps.length + " — " + esc(st.t) + "</div><p>" + esc(st.d) + "</p>";
  document.querySelectorAll("#view-pack .pxflow tbody tr").forEach(function(tr){
    tr.classList.toggle("on", st.rows.indexOf(+tr.getAttribute("data-row")) >= 0);
  });
  var packet = $("pxPacket"), label = $("pxLabel"), centers = pxCenters();
  if(packet && label && centers.length && centers[st.from] && centers[st.to]){
    var from = centers[st.from], to = centers[st.to];
    label.textContent = st.label;
    packet.classList.remove("pulse");
    packet.style.top = from.y + "px";
    label.style.top = Math.max(4, from.y - 34) + "px";
    var lx = function(x){ return Math.max(13, Math.min(87, x)); };
    if(st.from === st.to){
      packet.style.transition = "none"; label.style.transition = "none";
      packet.style.left = from.x + "%"; label.style.left = lx(from.x) + "%";
      if(animate && !pxReduced()){ void packet.offsetWidth; packet.classList.add("pulse"); }
    } else if(animate && !pxReduced()){
      var dur = Math.round(1000 / pxSpeed);
      packet.style.transition = "none"; label.style.transition = "none";
      packet.style.left = from.x + "%"; label.style.left = lx(from.x) + "%";
      packet.style.top = from.y + "px"; label.style.top = Math.max(4, from.y - 34) + "px";
      void packet.offsetWidth;
      var tr = "left " + dur + "ms ease, top " + dur + "ms ease";
      packet.style.transition = tr; label.style.transition = tr;
      packet.style.left = to.x + "%"; label.style.left = lx(to.x) + "%";
      packet.style.top = to.y + "px"; label.style.top = Math.max(4, to.y - 34) + "px";
      if(st.back){
        pxAnimLater(function(){
          packet.style.left = from.x + "%"; label.style.left = lx(from.x) + "%";
          packet.style.top = from.y + "px"; label.style.top = Math.max(4, from.y - 34) + "px";
        }, dur + 150);
      }
    } else {
      var end = st.back ? from : to;
      packet.style.transition = "none"; label.style.transition = "none";
      packet.style.left = end.x + "%"; label.style.left = lx(end.x) + "%";
      packet.style.top = end.y + "px"; label.style.top = Math.max(4, end.y - 34) + "px";
    }
    packet.style.opacity = "1"; label.style.opacity = "1";
  }
  pxSyncControls();
}
function pxSchedule(){
  pxClearPlay();
  if(!pxPlaying) return;
  var p = pxById(pxView); if(!p) return;
  if(pxStep >= p.steps.length - 1){ pxPlaying = false; pxSyncControls(); return; }
  pxPlayTimer = setTimeout(function(){
    pxPlayTimer = null;
    pxShowStep(pxStep + 1, true);
    pxSchedule();
  }, Math.round(2400 / pxSpeed));
}
function pxGo(i){
  var p = pxById(pxView); if(!p) return;
  pxClearPlay(); pxToken++;
  pxShowStep(i, true);
  if(pxPlaying) pxSchedule();
}
function pxTogglePlay(){
  var p = pxById(pxView); if(!p) return;
  if(pxPlaying){ pxPlaying = false; pxClearPlay(); }
  else {
    if(pxStep >= p.steps.length - 1) pxShowStep(0, true);
    pxPlaying = true; pxSchedule();
  }
  pxSyncControls();
}
function pxReplayFn(){
  pxClearPlay(); pxToken++;
  pxShowStep(0, true);
  pxPlaying = !pxReduced();
  pxSyncControls();
  if(pxPlaying) pxSchedule();
}
function pxSyncControls(){
  var p = pxById(pxView); if(!p) return;
  var play = $("pxPlay"); if(play) play.textContent = pxPlaying ? "❚❚ Pause" : "▶ Lecture";
  var sp = $("pxSpeed"); if(sp) sp.textContent = pxSpeed + "x";
  var rp = $("pxReplay"); if(rp) rp.classList.toggle("hot", !pxPlaying && pxStep >= p.steps.length - 1);
  var pv = $("pxPrev"); if(pv) pv.disabled = pxStep <= 0;
  var nx = $("pxNext"); if(nx) nx.disabled = pxStep >= p.steps.length - 1;
}
function renderPack(){
  var root = $("view-pack");
  var html = "";
  if(packTab!=="net") stopNetAnim();
  if(packTab==="home"){
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Pack Security+</div></div>';
    html += '<div class="stepct">Scénarios : '+scenDoneCount()+' / 18 · Cartes revues : '+cardsReviewedCount()+' / 40 · Cartes à revoir : '+cardDueList().length+'</div><div class="progressline"><i style="width:'+Math.round(100*(scenDoneCount()+cardsReviewedCount())/58)+'%"></i></div>';
    html += '<div style="margin:2px 0 4px"><span class="tag reseau">Révise pour l\'examen</span></div>';
    html += '<div class="packtabs pk-enter">'
      + '<button class="packtab" data-pk="scen"><b>Scénarios éclair</b><span>18 situations, une décision, un debrief · '+scenDoneCount()+' / 18</span></button>'
      + '<button class="packtab" data-pk="cards"><b>Cartes de révision</b><span>40 cartes qui reviennent à intervalles espacés · '+cardDueList().length+' à revoir</span></button>'
      + '<button class="packtab" data-pk="exam"><b>Mini-examen blanc</b><span>10 questions + 1 simulation pare-feu'+(S.pack.examPlays ? ' · meilleur : '+S.pack.examBest+' %' : '')+'</span></button>'
      + '<button class="packtab" data-pk="sims"><b>Simulations PBQ</b><span>Réponse à incident, contrôles, menaces — 3 mini-simulations</span></button>'
      + '<button class="packtab" data-pk="parcours"><b>Parcours 12 semaines</b><span>Le plan complet, suivi au fil de tes parties</span></button>'
      + '<button class="packtab" data-pk="net"><b>Explorateur de protocoles — 44 protocoles animés</b><span>HTTP, HTTPS, DNS, TCP, TLS, DHCP, SSH, ARP, NAT, pare-feu… — touche un protocole pour voir son schéma s’animer étape par étape, son flux de paquets et son explication</span></button>'
      + '</div>';
    html += '<button class="btn big" id="pkGloss" style="width:100%;margin-top:12px">Glossaire — Fonctionnement du jeu</button>';
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ show("hub"); });
    $("pkGloss").addEventListener("click", function(){ renderHelp(); show("help"); });
    root.querySelectorAll("[data-pk]").forEach(function(b){
      b.addEventListener("click", function(){
        var k = b.getAttribute("data-pk"); sndTap();
        if(k==="exam"){ startPackExam(); return; }
        packTab = k; packScenAnswer = null;
        if(k==="sims") packSim = null;
        if(k==="cards"){ packCardIdx = 0; packCardFlipped = false; }
        renderPack();
      });
    });
    return;
  }
  if(packTab==="scen"){
    if(packScenId){
      var sc = SCENARIOS.filter(function(x){ return x.id===packScenId; })[0];
      html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Scénario '+sc.id+'</div></div>';
      html += '<div class="stepct">'+PACK_DOMS[sc.dom]+' · Objectif Security+ '+sc.obj+'</div>';
      html += '<div class="alertcard pk-enter"><span class="tag soc">'+sc.id+' · '+esc(sc.t)+'</span>'+(SCEN_ORIGIN[sc.id] ? '<br><span class="origin">Vu dans la Mission 1 — variante '+SCEN_ORIGIN[sc.id]+'</span>' : '')+'<div class="body" style="font-size:15.5px;margin-top:8px">'+sc.sit+'</div>';
      if(packScenAnswer===null){
        html += '<div class="jopts">';
        sc.opts.forEach(function(o, oi){ html += '<button data-so="'+oi+'">'+esc(o)+'</button>'; });
        html += '</div>';
      } else {
        var good = packScenAnswer===sc.ok;
        html += '<div class="conseq '+(good ? "ok" : "ko")+' pk-enter" style="margin-top:12px"><b>'+(good ? "Bonne décision." : "Pas celle-là.")+'</b><br>'+sc.why+'</div>';
        html += '<div class="row" style="gap:9px;margin-top:12px"><button class="btn" style="flex:1" id="pkCardLink">Revoir la carte '+sc.card+'</button><button class="btn primary" style="flex:1" id="pkScenList">Autres scénarios</button></div>';
      }
      html += '</div>';
      root.innerHTML = html;
      $("pkBack").addEventListener("click", function(){ packScenId = null; packScenAnswer = null; renderPack(); });
      root.querySelectorAll("[data-so]").forEach(function(b){
        b.addEventListener("click", function(){
          var oi = +b.getAttribute("data-so");
          packScenAnswer = oi;
          var firstTime = !S.pack.scen[sc.id];
          S.pack.scen[sc.id] = true;
          var sc100 = oi===sc.ok ? 100 : 0;
          if(sc100 > (S.pack.scenBest[sc.id]||0)) S.pack.scenBest[sc.id] = sc100;
          if(oi===sc.ok){
            S.xp[sc.dom===3 ? "reseau" : "soc"] += 20; S.credits += 10;
            cardState(sc.card);
            if(S.pack.cards[sc.card].due===0) S.pack.cards[sc.card].due = Date.now();
            sndOk();
          } else {
            var st = cardState(sc.card); st.due = Date.now();
            sndBad();
          }
          if(firstTime && !S.delayedDue && !S.delayedDone) S.delayedDue = Date.now() + 7*24*3600*1000;
          save(); renderPack();
        });
      });
      var cl = $("pkCardLink"); if(cl) cl.addEventListener("click", function(){ openCardInPack(sc.card); });
      var sl2 = $("pkScenList"); if(sl2) sl2.addEventListener("click", function(){ packScenId = null; packScenAnswer = null; renderPack(); });
      return;
    }
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Scénarios éclair</div></div>';
    html += '<div class="stepct">'+scenDoneCount()+' / 18 terminés · 3 à 5 minutes chacun</div>';
    [1,2,3,4,5].forEach(function(d){
      html += '<h2>'+PACK_DOMS[d]+'</h2>';
      SCENARIOS.filter(function(s){ return s.dom===d; }).forEach(function(s){
        var done = !!S.pack.scen[s.id], best = S.pack.scenBest[s.id];
        html += '<div class="card"><div class="row between"><span class="tag soc">'+s.id+' · Objectif '+s.obj+'</span>'+(done ? '<span class="tag '+(best>=100?"done":"")+'">'+(best>=100?"Réussi":"Terminé")+'</span>' : '')+'</div><h3 style="margin-top:8px">'+esc(s.t)+'</h3>'+(SCEN_ORIGIN[s.id] ? '<span class="origin">Vu dans la Mission 1 — variante '+SCEN_ORIGIN[s.id]+'</span>' : '')+'<p>'+esc(s.sit)+'</p><button class="btn primary big" data-scen="'+s.id+'">'+(done?"Rejouer":"Jouer")+'</button></div>';
      });
    });
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packTab="home"; renderPack(); });
    root.querySelectorAll("[data-scen]").forEach(function(b){
      b.addEventListener("click", function(){ packScenId = b.getAttribute("data-scen"); packScenAnswer = null; sndTap(); renderPack(); window.scrollTo(0,0); });
    });
    return;
  }
  if(packTab==="cards"){
    var list = cardListForFilter();
    if(packCardIdx >= list.length) packCardIdx = 0;
    var dueN = cardDueList().length;
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Cartes de révision</div></div>';
    html += '<div class="stepct">Revues : '+cardsReviewedCount()+' / 40 · À revoir maintenant : '+dueN+' · Répétition espacée : 1, 3, 7, 14 puis 30 jours</div>';
    html += '<div class="chiprow"><button class="fchip'+(packCardFilter==="due"?" on":"")+'" data-cf="due">À revoir ('+dueN+')</button><button class="fchip'+(packCardFilter==="all"?" on":"")+'" data-cf="all">Toutes (40)</button>';
    [1,2,3,4,5].forEach(function(d){ html += '<button class="fchip'+(packCardFilter===String(d)?" on":"")+'" data-cf="'+d+'">Domaine '+d+'</button>'; });
    html += '</div>';
    if(!list.length){
      html += '<div class="card"><h3>Rien à revoir pour le moment</h3><p>Toutes les cartes de cette sélection sont à jour. Elles reviendront selon leur intervalle — ou rouvre l’onglet « Toutes » pour réviser en avance.</p></div>';
    } else {
      var c = list[packCardIdx], st = cardState(c.id);
      var isM1 = M1_CARD_IDS.indexOf(c.id)>=0;
      html += '<div class="stepct" style="margin-top:8px">Carte '+(packCardIdx+1)+' / '+list.length+(st.n ? ' · Revue '+st.n+' fois · niveau '+(st.lv+1)+' / 5' : ' · Jamais revue')+(isM1 ? ' · Aussi générée par la Mission 1' : '')+'</div>';
      html += '<div class="fcardwrap'+(pkSkipEnter ? "" : " pk-enter")+'"><div class="fcard'+(packCardFlipped?" flipped":"")+'" id="pkCard" role="button" aria-label="Retourner la carte"><div class="fface"><div class="fid">'+c.id+' · Question · '+PACK_DOMS[+c.id.charAt(1)]+'</div><div class="fq">'+esc(c.q)+'</div>'+(CARD_ORIGIN[c.id] ? '<span class="origin">Vu dans la Mission 1 — variante '+CARD_ORIGIN[c.id]+'</span>' : '')+'<div class="fhint">Touche la carte pour voir la réponse.</div></div><div class="fface back"><div class="fid">'+c.id+' · Réponse</div><div class="fa">'+esc(c.a)+'</div>'+(c.nu ? '<div class="fnuance">'+c.nu+'</div>' : '')+'<div class="fhint">Sois honnête : tu savais, ou pas encore ?</div></div></div></div>';
      pkSkipEnter = false;
      if(packCardFlipped){
        html += '<div class="row" style="gap:9px;margin-top:12px"><button class="btn" style="flex:1" id="pkCardKo">À revoir</button><button class="btn primary" style="flex:1" id="pkCardOk">Je sais</button></div>';
      } else {
        html += '<button class="btn primary big" id="pkFlip" style="margin-top:12px">Retourner la carte</button>';
      }
      html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="pkPrev" '+(packCardIdx<=0?"disabled":"")+'>‹ Précédente</button><button class="btn" style="flex:1" id="pkNext" '+(packCardIdx>=list.length-1?"disabled":"")+'>Suivante ›</button></div>';
    }
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packTab="home"; renderPack(); });
    root.querySelectorAll("[data-cf]").forEach(function(b){
      b.addEventListener("click", function(){ packCardFilter = b.getAttribute("data-cf"); packCardIdx = 0; packCardFlipped = false; sndTap(); renderPack(); });
    });
    var flip = function(){ pkSkipEnter = true; packCardFlipped = !packCardFlipped; renderPack(); };
    var pkc = $("pkCard"); if(pkc) pkc.addEventListener("click", flip);
    var pkb = $("pkFlip"); if(pkb) pkb.addEventListener("click", flip);
    var prev = $("pkPrev"); if(prev) prev.addEventListener("click", function(){ packCardIdx--; packCardFlipped = false; renderPack(); });
    var next = $("pkNext"); if(next) next.addEventListener("click", function(){ packCardIdx++; packCardFlipped = false; renderPack(); });
    var okB = $("pkCardOk"), koB = $("pkCardKo");
    function gradeCard(known){
      var cc = list[packCardIdx], ss = cardState(cc.id);
      ss.n++;
      if(known){ ss.lv = Math.min(4, ss.lv+1); ss.due = Date.now() + CARD_INTERVALS[ss.lv]*24*3600*1000; }
      else { ss.lv = 0; ss.due = Date.now() + CARD_INTERVALS[0]*24*3600*1000; }
      save(); sndTap();
      if(packCardFilter==="due"){ packCardFlipped = false; renderPack(); }
      else if(packCardIdx < list.length-1){ packCardIdx++; packCardFlipped = false; renderPack(); }
      else { packCardFlipped = false; renderPack(); toast("Session terminée pour cette sélection."); }
    }
    if(okB) okB.addEventListener("click", function(){ gradeCard(true); });
    if(koB) koB.addEventListener("click", function(){ gradeCard(false); });
    return;
  }
  if(packTab==="net"){ renderNetConcepts(root); return; }
  if(packTab==="sims"){ renderPackSims(root); return; }
  if(packTab==="exam"){ renderPackExam(root); return; }
  if(packTab==="parcours"){
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Retour">‹</button><div class="ttl">Parcours 12 semaines</div></div>';
    html += '<div class="stepct">Rythme conseillé : 5 cartes par jour en session éclair, 2 à 3 scénarios par semaine, une mission du jeu le week-end.</div>';
    PARCOURS.forEach(function(w){
      var pct = null, detail = "";
      if(w.special==="weak"){
        var weakScen = SCENARIOS.filter(function(s){ return S.pack.scen[s.id] && (S.pack.scenBest[s.id]||0)<100; }).length;
        var lateCards = cardDueList().length;
        detail = "Scénarios terminés mais non réussis : "+weakScen+" · Cartes en retard : "+lateCards;
        pct = (weakScen===0 && scenDoneCount()>0) ? 100 : 0;
      } else if(w.special==="exam"){
        detail = S.pack.examPlays ? "Mini-examen passé "+S.pack.examPlays+" fois · meilleur : "+S.pack.examBest+" %" : "Mini-examen pas encore passé";
        pct = S.pack.examPlays ? Math.min(100, S.pack.examBest) : 0;
      } else if(w.special==="final"){
        detail = S.pack.examBest>=80 ? "Meilleur mini-examen : "+S.pack.examBest+" % — au-dessus du seuil d’entraînement" : "Meilleur mini-examen : "+(S.pack.examPlays ? S.pack.examBest+" %" : "pas encore passé")+" — seuil visé : plus de 80 %";
        pct = S.pack.examBest>=80 ? 100 : S.pack.examBest;
      } else {
        var sd = w.scen.filter(function(id){ return S.pack.scen[id]; }).length;
        var cd = w.cards.filter(function(id){ return S.pack.cards[id] && S.pack.cards[id].n>0; }).length;
        var tot = w.scen.length + w.cards.length, dn = sd + cd;
        pct = tot ? Math.round(100*dn/tot) : 0;
        detail = "Scénarios : "+sd+" / "+w.scen.length+" · Cartes : "+cd+" / "+w.cards.length;
      }
      html += '<div class="weekrow pk-enter"><div class="wl">'+w.w+' — '+w.t+'<span>'+pct+' %</span></div><div class="trustbar"><i style="width:'+pct+'%"></i></div><p>'+w.obj+'</p><p>'+detail+'</p></div>';
    });
    var totScenPct = Math.round(100*scenDoneCount()/18), totCardPct = Math.round(100*cardsReviewedCount()/40);
    html += '<div class="card"><h3>Progression globale du pack</h3><div class="xpbar"><div class="xl">Scénarios éclair<span>'+scenDoneCount()+' / 18</span></div><div class="xptrack"><i style="width:'+totScenPct+'%"></i></div></div><div class="xpbar"><div class="xl">Cartes de révision<span>'+cardsReviewedCount()+' / 40</span></div><div class="xptrack"><i class="mag" style="width:'+totCardPct+'%"></i></div></div><div class="xpbar"><div class="xl">Mini-examen blanc<span>'+(S.pack.examPlays ? "meilleur "+S.pack.examBest+" %" : "pas encore passé")+'</span></div><div class="xptrack"><i style="width:'+S.pack.examBest+'%"></i></div></div></div>';
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packTab="home"; renderPack(); });
    return;
  }
}
function startPackExam(){
  packExam = { idx:0, answers:{}, fwOrder:[], phase:"q" };
  packTab = "exam";
  show("pack");
}
function renderPackExam(root){
  var html = "";
  if(!packExam){ packTab = "home"; renderPack(); return; }
  if(packExam.phase==="q"){
    var q = EXAMQ[packExam.idx];
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Quitter">✕</button><div class="ttl">Mini-examen blanc</div></div>';
    html += '<div class="stepct">Question '+(packExam.idx+1)+' / 10 · Sans aide, comme le jour J</div><div class="progressline"><i style="width:'+Math.round(100*packExam.idx/11)+'%"></i></div>';
    html += '<div class="alertcard pk-enter"><div class="jq">'+q.q+'</div><div class="jopts">';
    q.opts.forEach(function(o, oi){ html += '<button data-eq="'+oi+'"'+(packExam.answers[packExam.idx]===oi?' style="border-color:var(--cyan);background:rgba(0,209,255,.10)"':'')+'>'+String.fromCharCode(65+oi)+'. '+esc(o)+'</button>'; });
    html += '</div></div>';
    html += '<button class="btn primary big" id="pkEqNext" style="margin-top:12px" '+(packExam.answers[packExam.idx]===undefined?"disabled":"")+'>'+(packExam.idx>=9 ? "Passer à la simulation pare-feu" : "Question suivante")+'</button>';
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packExam = null; packTab = "home"; show("pack"); });
    root.querySelectorAll("[data-eq]").forEach(function(b){
      b.addEventListener("click", function(){ packExam.answers[packExam.idx] = +b.getAttribute("data-eq"); sndTap(); renderPackExam(root); });
    });
    $("pkEqNext").addEventListener("click", function(){
      if(packExam.idx>=9) packExam.phase = "fw"; else packExam.idx++;
      sndTap(); renderPackExam(root); window.scrollTo(0,0);
    });
    return;
  }
  if(packExam.phase==="fw"){
    html += '<div class="ghead"><button class="quit" id="pkBack" aria-label="Quitter">✕</button><div class="ttl">Mini-examen — simulation</div></div>';
    html += '<div class="stepct">Simulation (PBQ) · Règles de pare-feu</div><div class="progressline"><i style="width:'+Math.round(100*10/11)+'%"></i></div>';
    html += '<div class="alertcard pk-enter"><div class="body" style="font-size:15.5px">Consigne : autoriser le web vers le serveur de la DMZ, bloquer l’accès à distance (RDP) depuis Internet, laisser les employés naviguer — tout le reste est refusé. Touche les règles dans l’ordre où tu les placerais.</div>';
    FW_DISPLAY.forEach(function(rid){
      var r = FW_RULES.filter(function(x){ return x.id===rid; })[0];
      var pos = packExam.fwOrder.indexOf(rid);
      html += '<button class="ruleitem" data-fw="'+rid+'" '+(pos>=0?"disabled":"")+'>'+(pos>=0?'<span class="ord">'+(pos+1)+'</span>':'')+esc(r.txt)+'</button>';
    });
    html += '</div>';
    html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="pkFwReset">Recommencer l’ordre</button><button class="btn primary" style="flex:1" id="pkFwGo" '+(packExam.fwOrder.length>=4?"":"disabled")+'>Voir mon résultat</button></div>';
    root.innerHTML = html;
    $("pkBack").addEventListener("click", function(){ packExam = null; packTab = "home"; show("pack"); });
    root.querySelectorAll("[data-fw]").forEach(function(b){
      b.addEventListener("click", function(){ packExam.fwOrder.push(b.getAttribute("data-fw")); sndTap(); renderPackExam(root); });
    });
    var rs = $("pkFwReset"); if(rs) rs.addEventListener("click", function(){ packExam.fwOrder = []; renderPackExam(root); });
    var go = $("pkFwGo"); if(go) go.addEventListener("click", function(){ packExam.phase = "res"; sndTap(); renderPackExam(root); window.scrollTo(0,0); });
    return;
  }
  /* résultats */
  var qGood = 0;
  EXAMQ.forEach(function(q, i){ if(packExam.answers[i]===q.ok) qGood++; });
  var fwPts = 0;
  packExam.fwOrder.forEach(function(rid, pos){ if(FW_RULES[pos].id===rid) fwPts++; });
  if(packExam.fwOrder[3]==="r4") fwPts += 1;
  var total = qGood + fwPts, pct = Math.round(100*total/15);
  if(!packExam.counted){
    packExam.counted = true;
    S.pack.examPlays++;
    if(pct > S.pack.examBest) S.pack.examBest = pct;
    if(fwPts > S.pack.fwBest) S.pack.fwBest = fwPts;
    S.credits += 15; S.xp.soc += 30;
    save();
  }
  html += '<div class="ghead"><div class="ttl">Mini-examen blanc — résultat</div></div>';
  html += '<div class="scorebig pk-enter" data-pct="'+pct+'">'+pct+'<small> %</small></div><div class="gradelbl">'+(pct>80 ? "Au-dessus du seuil d’entraînement (80 %)" : "Sous le seuil d’entraînement (80 %) — continue les examens blancs avant les examens complets")+'</div>';
  html += '<div class="card"><h3>Barème</h3>'
    + '<div class="breakrow"><div class="bl"><span>Questions</span><span>'+qGood+' / 10</span></div><div class="breakbar"><i style="width:'+(qGood*10)+'%"></i></div></div>'
    + '<div class="breakrow"><div class="bl"><span>Simulation pare-feu</span><span>'+fwPts+' / 5</span></div><div class="breakbar"><i style="width:'+(fwPts*20)+'%"></i></div></div>'
    + '<p style="margin:8px 0 0">Simulation : 1 point par règle bien placée, 1 point pour la règle par défaut en dernier. Ordre attendu : web DMZ autorisé (443), RDP refusé, navigation employés autorisée, refus par défaut en dernier.</p></div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">+30 XP</div><div class="rl">SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">+15</div><div class="rl">Crédits</div></div></div>';
  html += '<div class="card"><h3>Corrections — et la carte à revoir pour chaque question</h3>';
  EXAMQ.forEach(function(q, i){
    var mine = packExam.answers[i], good = mine===q.ok;
    html += whyRow(good, good?"ok":"ko", "Q"+(i+1)+" — "+q.q, "Bonne réponse : "+String.fromCharCode(65+q.ok)+". "+q.opts[q.ok]+(good ? "" : " · Ta réponse : "+(mine===undefined?"—":String.fromCharCode(65+mine)+". "+q.opts[mine]))+" "+q.why)
      + '<div style="margin:2px 0 10px"><button class="btn" data-review-card="'+q.card+'">Revoir la carte '+q.card+'</button></div>';
  });
  html += '</div>';
  html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="pkExamHome">Pack Security+</button><button class="btn primary" style="flex:1" id="pkExamRetry">Refaire l’examen</button></div>';
  root.innerHTML = html;
  root.querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
  pkScoreCount(root.querySelector(".scorebig"));
  root.querySelectorAll("[data-review-card]").forEach(function(b){
    b.addEventListener("click", function(){ packExam = null; openCardInPack(b.getAttribute("data-review-card")); });
  });
  $("pkExamHome").addEventListener("click", function(){ packExam = null; packTab = "home"; renderPack(); });
  $("pkExamRetry").addEventListener("click", function(){ startPackExam(); });
  if(pct>80) sndOk(); else sndBad();
}