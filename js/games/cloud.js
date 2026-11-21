"use strict";
/* ================= MINI-JEU 9 : AUDIT CLOUD ================= */
var cgl = null;
function startCloud(resume){
  cgl = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], hintCount:0, phase:"classify", fixIdx:0, fixAnswers:[], qcm:null, start:Date.now(), elapsed:0 };
  if(cgl.hintCount===undefined) cgl.hintCount = 0;
  if(!cgl._examStart) cgl._examStart = Date.now();
  cgl.start = Date.now();
  S.inProgress = { game:"cloud", data:cgl }; save();
  show("cloud");
  renderCloud();
}
function renderCloud(){
  msClearType();
  if(cgl.phase==="fixes") renderCglFix();
  else if(cgl.phase==="fixWhy") renderCglFixWhy();
  else if(cgl.phase==="qcm") renderCglQcm();
  else if(cgl.phase==="qcmResult") renderCglQcmResult();
  else renderCglStep();
}
function cglHead(){
  return '<div class="ghead"><button class="quit" id="cglQuit" aria-label="Quitter">✕</button><div class="ttl">Audit cloud — Ciel Cloud</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return cgl ? cgl._examStart : null; }); return ""; })();
}
function renderCglStep(){
  var a = CLOUD_ITEMS[cgl.idx];
  var html = cglHead();
  html += '<div class="stepct">Ressource '+(cgl.idx+1)+' / '+CLOUD_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*cgl.idx/CLOUD_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Ressource cloud</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Source : <b>'+a.src+'</b></span><span>Audit : <b>'+a.time+'</b></span></div>'
    + '<button class="detbtn" id="cglDet">Détails de la ressource '+(cgl.seen[cgl.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(cgl.seen[cgl.idx]?' on':'')+'" id="cglDetails">'+a.det+'</div></div>';
  html += '<div class="trio">'
    + '<button class="b-vp" data-choice="crit">'+ICONS.warn+'Critique</button>'
    + '<button class="b-esc" data-choice="corr">'+ICONS.up+'À corriger</button>'
    + '<button class="b-fp" data-choice="ok">'+ICONS.check+'Acceptable</button></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="cglHint">Indice d\'Amara — '+(cgl.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="cglHintBox">« <span class="ms-tw" id="cglHintTw">'+(cgl.hintUsed[cgl.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-cloud").innerHTML = html;
  $("cglQuit").addEventListener("click", quitGame);
  $("cglDet").addEventListener("click", function(){
    cgl.seen[cgl.idx] = true; S.inProgress.data = cgl; save();
    $("cglDetails").classList.add("on"); this.textContent = "Détails de la ressource ▴";
  });
  var thb = $("cglHint");
  if(thb) thb.addEventListener("click", function(){
    if(cgl.hintUsed[cgl.idx]){ $("cglHintBox").classList.add("on"); return; }
    if(cgl.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(cgl.hintCount>0) S.credits -= 15;
    cgl.hintUsed[cgl.idx] = true; cgl.hintCount++; S.inProgress.data = cgl; save();
    $("cglHintBox").classList.add("on"); sndTap();
    var ttw = $("cglHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(cgl.hintUsed[cgl.idx] && $("cglHintBox")) $("cglHintBox").classList.add("on");
  document.querySelectorAll("#view-cloud [data-choice]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      cgl.answers[cgl.idx] = b.getAttribute("data-choice");
      S.inProgress.data = cgl; save();
      sndTap();
      advanceCgl();
    });
  });
}
function advanceCgl(){
  cgl.idx++;
  if(cgl.idx >= CLOUD_ITEMS.length){ cgl.phase = "fixes"; S.inProgress.data = cgl; save(); renderCglFix(); }
  else { S.inProgress.data = cgl; save(); renderCglStep(); }
}
function renderCglFix(){
  var f = CLOUD_FIXES[cgl.fixIdx];
  var html = cglHead();
  html += '<div class="stepct">Remédiation '+(cgl.fixIdx+1)+' / '+CLOUD_FIXES.length+'</div><div class="progressline"><i style="width:'+Math.round(100*(CLOUD_ITEMS.length+cgl.fixIdx)/(CLOUD_ITEMS.length+CLOUD_FIXES.length))+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Remédiation</span><div class="jq">'+f.q+'</div><div class="jopts">';
  f.opts.forEach(function(o, oi){ html += '<button data-fopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-cloud").innerHTML = html;
  $("cglQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-cloud [data-fopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      cgl.fixAnswers[cgl.fixIdx] = +b.getAttribute("data-fopt");
      cgl.phase = "fixWhy"; S.inProgress.data = cgl; save(); renderCglFixWhy();
    });
  });
}
function renderCglFixWhy(){
  var f = CLOUD_FIXES[cgl.fixIdx];
  var ok = cgl.fixAnswers[cgl.fixIdx]===f.ok;
  var html = cglHead();
  html += '<div class="stepct">Remédiation '+(cgl.fixIdx+1)+' / '+CLOUD_FIXES.length+'</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne remédiation' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+f.opts[cgl.fixAnswers[cgl.fixIdx]], ok ? f.why : "Ce n'était pas la bonne porte. "+f.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(f.opts[f.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="cglNext">'+(cgl.fixIdx+1>=CLOUD_FIXES.length ? 'Dernière question' : 'Remédiation suivante')+'</button>';
  $("view-cloud").innerHTML = html;
  $("cglQuit").addEventListener("click", quitGame);
  $("cglNext").addEventListener("click", function(){
    sndTap();
    cgl.fixIdx++;
    if(cgl.fixIdx>=CLOUD_FIXES.length){ cgl.phase = "qcm"; S.inProgress.data = cgl; save(); renderCglQcm(); }
    else { cgl.phase = "fixes"; S.inProgress.data = cgl; save(); renderCglFix(); }
  });
}
function renderCglQcm(){
  var q = CLOUD_QCM;
  var html = cglHead();
  html += '<div class="stepct">Dernière question — qui sécurise quoi</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">'+q.q+'</div><div class="jopts">';
  q.opts.forEach(function(o, oi){ html += '<button data-qopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-cloud").innerHTML = html;
  $("cglQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-cloud [data-qopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      cgl.qcm = +b.getAttribute("data-qopt");
      cgl.phase = "qcmResult"; S.inProgress.data = cgl; save(); renderCglQcmResult();
    });
  });
}
function renderCglQcmResult(){
  var q = CLOUD_QCM;
  var ok = cgl.qcm===q.ok;
  var html = cglHead();
  html += '<div class="stepct">Qui sécurise quoi</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne réponse' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+q.opts[cgl.qcm], ok ? q.why : "Ce n'était pas la bonne porte. "+q.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(q.opts[q.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="cglDebrief">Voir le debrief</button>';
  $("view-cloud").innerHTML = html;
  $("cglQuit").addEventListener("click", quitGame);
  $("cglDebrief").addEventListener("click", function(){ sndTap(); finishCloud(); });
}
function finishCloud(){
  var correct = 0, okGood = 0;
  CLOUD_ITEMS.forEach(function(a, i){
    if(cgl.answers[i] === a.ans){ correct++; if(a.ans==="ok") okGood++; }
  });
  var classScore = 5 * correct;
  var fixCorrect = 0;
  CLOUD_FIXES.forEach(function(f, i){ if(cgl.fixAnswers[i]===f.ok) fixCorrect++; });
  var fixScore = 10 * fixCorrect;
  var qcmOk = cgl.qcm===CLOUD_QCM.ok;
  var qcmScore = qcmOk ? 20 : 0;
  var score = classScore + fixScore + qcmScore;
  var lbl = { crit:"Critique", corr:"À corriger", ok:"Acceptable" };
  var why = "";
  CLOUD_ITEMS.forEach(function(a, i){
    var mine = cgl.answers[i];
    var good = mine===a.ans;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+(lbl[mine]||"Non classé"), a.why);
  });
  why += '<h3 style="margin-top:14px">Les remédiations</h3>';
  CLOUD_FIXES.forEach(function(f, i){
    var mine = cgl.fixAnswers[i];
    var good = mine===f.ok;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+f.q, f.why);
  });
  why += '<h3 style="margin-top:14px">Qui sécurise quoi</h3>';
  why += whyRow(qcmOk, qcmOk?"ok":"ko", "Ton choix : "+CLOUD_QCM.opts[cgl.qcm], CLOUD_QCM.why);
  var seenCount = cgl.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = CLOUD_ITEMS.map(function(a,i){ return i; }).filter(function(i){ return cgl.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (cgl.hintCount||0) - 1);
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+CLOUD_ITEMS.length+' ressources bien classées.</p>'
    + '<p style="margin:4px 0"><b>Remédiations :</b> '+fixCorrect+' / '+CLOUD_FIXES.length+' bonnes remédiations.</p>'
    + '<p style="margin:4px 0"><b>Principe :</b> '+(qcmOk ? 'la bonne réponse — responsabilité partagée.' : 'la réponse n\'était pas la bonne — revois la responsabilité partagée.')+'</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> détails ouverts sur '+seenCount+' / '+CLOUD_ITEMS.length+' ressources'+(seenCount<CLOUD_ITEMS.length ? ' — décider sans ouvrir les détails, c\'est décider à l\'aveugle.' : '.')+'</p>';
  finishMission("cloud", score, [
    { label:"Findings classés", got:classScore, max:40 },
    { label:"Remédiations", got:fixScore, max:40 },
    { label:"Principe", got:qcmScore, max:20 }
  ], why, function(){
    S.fpTotal += okGood;
    if(cgl.answers[0]==="crit" && unlockDex("stockage")) finishMission._newDex.push("stockage");
    if(fixCorrect===CLOUD_FIXES.length && unlockDex("iam")) finishMission._newDex.push("iam");
  }, "Le pourquoi, ressource par ressource");
}
