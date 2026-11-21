"use strict";
/* ================= MINI-JEU 4 : ANALYSE DE PREUVES ================= */
var fr = null;
function startForensics(resume){
  fr = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], hintCount:0, phase:"classify", tlEvents:null, tlOrder:[], qcm:null, start:Date.now(), elapsed:0 };
  if(fr.hintCount===undefined) fr.hintCount = 0;
  if(!fr._examStart) fr._examStart = Date.now();
  fr.start = Date.now();
  if(!fr.tlEvents){
    fr.tlEvents = FORENSICS_TIMELINE.map(function(e,i){ return i; });
    for(var i=fr.tlEvents.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=fr.tlEvents[i]; fr.tlEvents[i]=fr.tlEvents[j]; fr.tlEvents[j]=t; }
  }
  if(!fr.tlOrder) fr.tlOrder = [];
  S.inProgress = { game:"forensics", data:fr }; save();
  show("forensics");
  renderForensics();
}
function renderForensics(){
  msClearType();
  if(fr.phase==="timeline") renderFrTimeline();
  else if(fr.phase==="tlResult") renderFrTlResult();
  else if(fr.phase==="qcm") renderFrQcm();
  else if(fr.phase==="qcmResult") renderFrQcmResult();
  else renderFrStep();
}
function frHead(){
  return '<div class="ghead"><button class="quit" id="frQuit" aria-label="Quitter">✕</button><div class="ttl">Analyse de preuves — Labo Forensics</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return fr ? fr._examStart : null; }); return ""; })();
}
function renderFrStep(){
  var a = FORENSICS_ITEMS[fr.idx];
  var html = frHead();
  html += '<div class="stepct">Artefact '+(fr.idx+1)+' / '+FORENSICS_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*fr.idx/FORENSICS_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Artefact forensique</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Source : <b>'+a.src+'</b></span><span>Heure : <b>'+a.time+'</b></span></div>'
    + '<button class="detbtn" id="frDet">Détails de l\'artefact '+(fr.seen[fr.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(fr.seen[fr.idx]?' on':'')+'" id="frDetails">'+a.det+'</div></div>';
  html += '<div class="trio">'
    + '<button class="b-vp" data-choice="mal">'+ICONS.warn+'Malveillant</button>'
    + '<button class="b-fp" data-choice="ben">'+ICONS.check+'Bénin</button>'
    + '<button class="b-esc" data-choice="verif">'+ICONS.up+'À vérifier</button></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="frHint">Indice d\'Amara — '+(fr.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="frHintBox">« <span class="ms-tw" id="frHintTw">'+(fr.hintUsed[fr.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-forensics").innerHTML = html;
  $("frQuit").addEventListener("click", quitGame);
  $("frDet").addEventListener("click", function(){
    fr.seen[fr.idx] = true; S.inProgress.data = fr; save();
    $("frDetails").classList.add("on"); this.textContent = "Détails de l'artefact ▴";
  });
  var thb = $("frHint");
  if(thb) thb.addEventListener("click", function(){
    if(fr.hintUsed[fr.idx]){ $("frHintBox").classList.add("on"); return; }
    if(fr.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(fr.hintCount>0) S.credits -= 15;
    fr.hintUsed[fr.idx] = true; fr.hintCount++; S.inProgress.data = fr; save();
    $("frHintBox").classList.add("on"); sndTap();
    var ttw = $("frHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(fr.hintUsed[fr.idx] && $("frHintBox")) $("frHintBox").classList.add("on");
  document.querySelectorAll("#view-forensics [data-choice]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      fr.answers[fr.idx] = b.getAttribute("data-choice");
      S.inProgress.data = fr; save();
      sndTap();
      advanceFr();
    });
  });
}
function advanceFr(){
  fr.idx++;
  if(fr.idx >= FORENSICS_ITEMS.length){ fr.phase = "timeline"; S.inProgress.data = fr; save(); renderFrTimeline(); }
  else { S.inProgress.data = fr; save(); renderFrStep(); }
}
function renderFrTimeline(){
  var html = frHead();
  html += '<div class="stepct">La nuit, dans l\'ordre</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>Remets la nuit en ordre</h3><p>Touche les événements dans l\'ordre où ils se sont passés — le premier en haut de ta frise. Deux partagent la même minute : l\'ordre se lit dans la cause, pas seulement dans l\'heure.</p></div>';
  var remaining = fr.tlEvents.filter(function(i){ return fr.tlOrder.indexOf(i)<0; });
  html += '<div class="jopts">';
  remaining.forEach(function(i){
    var e = FORENSICS_TIMELINE[i];
    html += '<button data-tl="'+i+'"><b>'+e.time+'</b> — '+esc(e.t)+'</button>';
  });
  html += '</div>';
  html += '<div class="card" style="margin-top:12px"><h3>Ta frise</h3>';
  if(!fr.tlOrder.length) html += '<p>Aucun événement placé pour l\'instant.</p>';
  fr.tlOrder.forEach(function(i, n){
    var e = FORENSICS_TIMELINE[i];
    html += '<div class="row between" style="margin-top:6px"><div><b>'+(n+1)+'.</b> '+esc(e.t)+'</div><button class="btn" data-unplace="'+i+'">Retirer</button></div>';
  });
  html += '</div>';
  html += '<button class="btn primary big" id="frTlGo"'+(fr.tlOrder.length<FORENSICS_TIMELINE.length?' disabled':'')+'>Valider la frise</button>';
  $("view-forensics").innerHTML = html;
  $("frQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-forensics [data-tl]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      fr.tlOrder.push(+b.getAttribute("data-tl")); S.inProgress.data = fr; save(); renderFrTimeline();
    });
  });
  document.querySelectorAll("#view-forensics [data-unplace]").forEach(function(b){
    b.addEventListener("click", function(){
      sndTap();
      var i = +b.getAttribute("data-unplace");
      fr.tlOrder = fr.tlOrder.filter(function(x){ return x!==i; }); S.inProgress.data = fr; save(); renderFrTimeline();
    });
  });
  var go = $("frTlGo");
  if(go) go.addEventListener("click", function(){
    if(fr.tlOrder.length<FORENSICS_TIMELINE.length) return;
    sndTap(); fr.phase = "tlResult"; S.inProgress.data = fr; save(); renderFrTlResult();
  });
}
function frTlScore(){
  var s = 0;
  fr.tlOrder.forEach(function(i, n){ if(i===n) s++; });
  return s;
}
function renderFrTlResult(){
  var good = frTlScore();
  var html = frHead();
  html += '<div class="stepct">Ta frise — '+good+' / '+FORENSICS_TIMELINE.length+' à la bonne place</div><div class="progressline"><i style="width:'+Math.round(100*good/FORENSICS_TIMELINE.length)+'%"></i></div>';
  html += '<div class="card"><h3>L\'ordre de la nuit</h3>';
  FORENSICS_TIMELINE.forEach(function(e, n){
    var mine = fr.tlOrder.indexOf(n);
    var ok = mine===n;
    html += whyRow(ok, ok?"ok":"ko", (n+1)+". "+e.time+" — "+e.t, e.det+(ok ? "" : " (tu l'avais placé en position "+(mine+1)+")"));
  });
  html += '<p style="color:var(--mut);font-size:14px">'+FORENSICS_TIMELINE_WHY+'</p></div>';
  html += '<button class="btn primary big" id="frToQcm">Dernière question</button>';
  $("view-forensics").innerHTML = html;
  $("frQuit").addEventListener("click", quitGame);
  $("frToQcm").addEventListener("click", function(){ sndTap(); fr.phase = "qcm"; S.inProgress.data = fr; save(); renderFrQcm(); });
}
function renderFrQcm(){
  var q = FORENSICS_QCM;
  var html = frHead();
  html += '<div class="stepct">Dernière question — préserver les preuves</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">'+q.q+'</div><div class="jopts">';
  q.opts.forEach(function(o, oi){ html += '<button data-qopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-forensics").innerHTML = html;
  $("frQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-forensics [data-qopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      fr.qcm = +b.getAttribute("data-qopt");
      fr.phase = "qcmResult"; S.inProgress.data = fr; save(); renderFrQcmResult();
    });
  });
}
function renderFrQcmResult(){
  var q = FORENSICS_QCM;
  var ok = fr.qcm===q.ok;
  var html = frHead();
  html += '<div class="stepct">Préservation des preuves</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne réponse' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+q.opts[fr.qcm], ok ? q.why : "Ce n'était pas la bonne porte. "+q.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(q.opts[q.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="frDebrief">Voir le debrief</button>';
  $("view-forensics").innerHTML = html;
  $("frQuit").addEventListener("click", quitGame);
  $("frDebrief").addEventListener("click", function(){ sndTap(); finishForensics(); });
}
function finishForensics(){
  var correct = 0, benGood = 0;
  FORENSICS_ITEMS.forEach(function(a, i){
    if(fr.answers[i] === a.ans){ correct++; if(a.ans==="ben") benGood++; }
  });
  var classScore = 5 * correct;
  var tlGood = frTlScore();
  var tlScore = 6 * tlGood;
  var qcmOk = fr.qcm===FORENSICS_QCM.ok;
  var qcmScore = qcmOk ? 20 : 0;
  var score = classScore + tlScore + qcmScore;
  var lbl = { mal:"Malveillant", ben:"Bénin", verif:"À vérifier" };
  var why = "";
  FORENSICS_ITEMS.forEach(function(a, i){
    var mine = fr.answers[i];
    var good = mine===a.ans;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+(lbl[mine]||"Non classé"), a.why);
  });
  why += '<h3 style="margin-top:14px">La frise</h3>';
  FORENSICS_TIMELINE.forEach(function(e, n){
    var mine = fr.tlOrder.indexOf(n);
    var ok = mine===n;
    why += whyRow(ok, ok?"ok":"ko", (n+1)+". "+e.time+" — "+e.t, e.det+(ok ? "" : " (tu l'avais placé en position "+(mine+1)+")"));
  });
  why += '<p style="color:var(--mut);font-size:14px">'+FORENSICS_TIMELINE_WHY+'</p>';
  why += '<h3 style="margin-top:14px">Préserver les preuves</h3>';
  why += whyRow(qcmOk, qcmOk?"ok":"ko", "Ton choix : "+FORENSICS_QCM.opts[fr.qcm], FORENSICS_QCM.why);
  var seenCount = fr.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = FORENSICS_ITEMS.map(function(a,i){ return i; }).filter(function(i){ return fr.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (fr.hintCount||0) - 1);
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+FORENSICS_ITEMS.length+' classifications justes.</p>'
    + '<p style="margin:4px 0"><b>Frise :</b> '+tlGood+' / '+FORENSICS_TIMELINE.length+' événements à la bonne place.</p>'
    + '<p style="margin:4px 0"><b>Préservation :</b> '+(qcmOk ? 'la bonne première action — ordre de volatilité respecté.' : 'la première action n\'était pas la bonne — revois l\'ordre de volatilité.')+'</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> détails ouverts sur '+seenCount+' / '+FORENSICS_ITEMS.length+' artefacts'+(seenCount<FORENSICS_ITEMS.length ? ' — décider sans ouvrir les détails, c\'est décider à l\'aveugle.' : '.')+'</p>';
  finishMission("forensics", score, [
    { label:"Classification des artefacts", got:classScore, max:50 },
    { label:"Frise chronologique", got:tlScore, max:30 },
    { label:"Préservation des preuves", got:qcmScore, max:20 }
  ], why, function(){
    S.fpTotal += benGood;
    if(tlGood===FORENSICS_TIMELINE.length && unlockDex("forensics")) finishMission._newDex.push("forensics");
    if(qcmOk && unlockDex("volatilite")) finishMission._newDex.push("volatilite");
    if(fr.answers[6]==="mal" && unlockDex("chaine")) finishMission._newDex.push("chaine");
  }, "Le pourquoi, artefact par artefact");
}
