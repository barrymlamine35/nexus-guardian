"use strict";
/* ================= BRIEFING ================= */
var pendingGame = null;
function startBriefing(gameId){
  if(!demoCanPlayDistrict()){ demoLockSheet(GAMES[gameId].name); return; }
  pendingGame = gameId;
  var g = GAMES[gameId];
  var html = '<div class="ghead"><button class="quit" id="bfBack" aria-label="Retour">✕</button><div class="ttl">Briefing</div></div>';
  html += '<div class="card"><span class="tag '+g.domaine+'">'+g.domLabel+'</span> <span class="tag">'+g.lieu+'</span>'+(gameId==="tri" ? ' <span class="tag">Campagne — Épisode 1</span>' : '')
    + '<h3 style="margin-top:8px;font-size:19px">'+g.name+'</h3>'
    + '<div class="mentor" style="margin-top:10px"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="bfTw"></span> »</div></div></div></div>';
  if(gameId==="defense"){
    html += '<div class="card"><h3>Ton budget</h3><p>12 000 € · les équipements se posent avant l\'arrivée du trafic.</p></div>';
  }
  if(gameId==="tri"){
    html += '<div class="card"><h3>Console du SOC</h3><p>8 alertes · chrono : 3 minutes.</p></div>';
  }
  if(gameId==="phish"){
    html += '<div class="card"><h3>Boîte d\'Atlas Logistics</h3><p>6 e-mails à examiner.</p></div>';
  }
  if(gameId==="forensics"){
    html += '<div class="card"><h3>Le banc d\'analyse</h3><p>10 artefacts à classer · une frise à remettre en ordre · une question de préservation.</p></div>';
  }
  if(gameId==="banque"){
    html += '<div class="card"><h3>La table des virements</h3><p>8 opérations à classer · 3 décisions à trancher avec l\'équipe fraude.</p></div>';
  }
  if(gameId==="rouge"){
    html += '<div class="card"><h3>Les flux de la Tour Rouge</h3><p>8 flux à classer · une kill chain à remettre en ordre · une contre-mesure à choisir.</p></div>';
  }
  if(gameId==="dev"){
    html += '<div class="card"><h3>La revue de code</h3><p>8 extraits à examiner · 4 correctifs à choisir · un principe à retenir.</p></div>';
  }
  if(gameId==="conseil"){
    html += '<div class="card"><h3>La table du conseil</h3><p>5 décisions, des arbitrages, aucune bonne réponse facile.</p></div>';
  }
  if(gameId==="cloud"){
    html += '<div class="card"><h3>L\'audit cloud</h3><p>8 ressources à classer · 4 remédiations à choisir · un principe à retenir.</p></div>';
  }
  html += '<button class="btn primary big" id="bfGo">Commencer la mission</button>';
  $("view-briefing").innerHTML = html;
  msTypeEl($("bfTw"), g.briefing);
  show("briefing");
  $("bfBack").addEventListener("click", function(){ msClearType(); show("missions"); });
  $("bfGo").addEventListener("click", function(){ sndTap(); launchGame(gameId); });
}
function launchGame(gameId){
  S.inProgress = null; save();
  if(gameId==="tri") startTri(null);
  if(gameId==="phish") startPhish(null);
  if(gameId==="defense") startDefense(null);
  if(gameId==="forensics") startForensics(null);
  if(gameId==="banque") startBanque(null);
  if(gameId==="rouge") startRouge(null);
  if(gameId==="dev") startDev(null);
  if(gameId==="conseil") startConseil(null);
  if(gameId==="cloud") startCloud(null);
}
function resumeGame(){
  if(!demoCanPlayDistrict()){ demoLockSheet("Partie en cours"); return; }
  var p = S.inProgress; if(!p) return;
  if(p.game==="tri") startTri(p);
  if(p.game==="phish") startPhish(p);
  if(p.game==="defense") startDefense(p);
  if(p.game==="forensics") startForensics(p);
  if(p.game==="banque") startBanque(p);
  if(p.game==="rouge") startRouge(p);
  if(p.game==="dev") startDev(p);
  if(p.game==="conseil") startConseil(p);
  if(p.game==="cloud") startCloud(p);
}
function quitGame(){
  msClearType();
  sheet('<h3>Quitter la mission ?</h3><p>Ta partie est sauvegardée : tu la retrouveras sur l\'accueil avec le bouton Reprendre.</p><div class="sbtns"><button class="btn primary big" id="qYes">Quitter</button><button class="btn big" onclick="closeSheet()">Continuer la partie</button></div>');
  $("qYes").addEventListener("click", function(){ closeSheet(); show("hub"); });
}