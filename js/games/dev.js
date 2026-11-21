"use strict";
/* ================= MINI-JEU 7 : REVUE DE CODE ================= */
var dvc = null;
function startDev(resume){
  dvc = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], hintCount:0, phase:"identify", fixIdx:0, fixAnswers:[], qcm:null, start:Date.now(), elapsed:0 };
  if(dvc.hintCount===undefined) dvc.hintCount = 0;
  if(!dvc._examStart) dvc._examStart = Date.now();
  dvc.start = Date.now();
  S.inProgress = { game:"dev", data:dvc }; save();
  show("dev");
  renderDev();
}
function renderDev(){
  msClearType();
  if(dvc.phase==="fixes") renderDevFix();
  else if(dvc.phase==="fixWhy") renderDevFixWhy();
  else if(dvc.phase==="qcm") renderDevQcm();
  else if(dvc.phase==="qcmResult") renderDevQcmResult();
  else renderDevStep();
}
function dvcHead(){
  return '<div class="ghead"><button class="quit" id="dvcQuit" aria-label="Quitter">✕</button><div class="ttl">Revue de code — Quartier Dev</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return dvc ? dvc._examStart : null; }); return ""; })();
}
function renderDevStep(){
  var a = DEV_ITEMS[dvc.idx];
  var html = dvcHead();
  html += '<div class="stepct">Extrait '+(dvc.idx+1)+' / '+DEV_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*dvc.idx/DEV_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Extrait de code</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Fichier : <b>'+a.src+'</b></span></div>'
    + '<button class="detbtn" id="dvcDet">Voir le code '+(dvc.seen[dvc.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(dvc.seen[dvc.idx]?' on':'')+'" id="dvcDetails"><span style="font-family:monospace">'+esc(a.code)+'</span><br><br>'+a.det+'</div></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">Quelle vulnérabilité se cache dans cet extrait ?</div><div class="jopts">';
  a.opts.forEach(function(o, oi){ html += '<button data-vopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="dvcHint">Indice d\'Amara — '+(dvc.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="dvcHintBox">« <span class="ms-tw" id="dvcHintTw">'+(dvc.hintUsed[dvc.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-dev").innerHTML = html;
  $("dvcQuit").addEventListener("click", quitGame);
  $("dvcDet").addEventListener("click", function(){
    dvc.seen[dvc.idx] = true; S.inProgress.data = dvc; save();
    $("dvcDetails").classList.add("on"); this.textContent = "Voir le code ▴";
  });
  var thb = $("dvcHint");
  if(thb) thb.addEventListener("click", function(){
    if(dvc.hintUsed[dvc.idx]){ $("dvcHintBox").classList.add("on"); return; }
    if(dvc.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(dvc.hintCount>0) S.credits -= 15;
    dvc.hintUsed[dvc.idx] = true; dvc.hintCount++; S.inProgress.data = dvc; save();
    $("dvcHintBox").classList.add("on"); sndTap();
    var ttw = $("dvcHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(dvc.hintUsed[dvc.idx] && $("dvcHintBox")) $("dvcHintBox").classList.add("on");
  document.querySelectorAll("#view-dev [data-vopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      dvc.answers[dvc.idx] = +b.getAttribute("data-vopt");
      S.inProgress.data = dvc; save();
      sndTap();
      advanceDvc();
    });
  });
}
function advanceDvc(){
  dvc.idx++;
  if(dvc.idx >= DEV_ITEMS.length){ dvc.phase = "fixes"; S.inProgress.data = dvc; save(); renderDevFix(); }
  else { S.inProgress.data = dvc; save(); renderDevStep(); }
}
function renderDevFix(){
  var f = DEV_FIXES[dvc.fixIdx];
  var html = dvcHead();
  html += '<div class="stepct">Correctif '+(dvc.fixIdx+1)+' / '+DEV_FIXES.length+'</div><div class="progressline"><i style="width:'+Math.round(100*(DEV_ITEMS.length+dvc.fixIdx)/(DEV_ITEMS.length+DEV_FIXES.length))+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Correctif</span><div class="jq">'+f.q+'</div><div class="jopts">';
  f.opts.forEach(function(o, oi){ html += '<button data-fopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-dev").innerHTML = html;
  $("dvcQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-dev [data-fopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      dvc.fixAnswers[dvc.fixIdx] = +b.getAttribute("data-fopt");
      dvc.phase = "fixWhy"; S.inProgress.data = dvc; save(); renderDevFixWhy();
    });
  });
}
function renderDevFixWhy(){
  var f = DEV_FIXES[dvc.fixIdx];
  var ok = dvc.fixAnswers[dvc.fixIdx]===f.ok;
  var html = dvcHead();
  html += '<div class="stepct">Correctif '+(dvc.fixIdx+1)+' / '+DEV_FIXES.length+'</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bon correctif' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+f.opts[dvc.fixAnswers[dvc.fixIdx]], ok ? f.why : "Ce n'était pas la bonne porte. "+f.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(f.opts[f.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="dvcNext">'+(dvc.fixIdx+1>=DEV_FIXES.length ? 'Dernière question' : 'Correctif suivant')+'</button>';
  $("view-dev").innerHTML = html;
  $("dvcQuit").addEventListener("click", quitGame);
  $("dvcNext").addEventListener("click", function(){
    sndTap();
    dvc.fixIdx++;
    if(dvc.fixIdx>=DEV_FIXES.length){ dvc.phase = "qcm"; S.inProgress.data = dvc; save(); renderDevQcm(); }
    else { dvc.phase = "fixes"; S.inProgress.data = dvc; save(); renderDevFix(); }
  });
}
function renderDevQcm(){
  var q = DEV_QCM;
  var html = dvcHead();
  html += '<div class="stepct">Dernière question — la règle qui protège</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">'+q.q+'</div><div class="jopts">';
  q.opts.forEach(function(o, oi){ html += '<button data-qopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-dev").innerHTML = html;
  $("dvcQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-dev [data-qopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      dvc.qcm = +b.getAttribute("data-qopt");
      dvc.phase = "qcmResult"; S.inProgress.data = dvc; save(); renderDevQcmResult();
    });
  });
}
function renderDevQcmResult(){
  var q = DEV_QCM;
  var ok = dvc.qcm===q.ok;
  var html = dvcHead();
  html += '<div class="stepct">La règle qui protège</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne réponse' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+q.opts[dvc.qcm], ok ? q.why : "Ce n'était pas la bonne porte. "+q.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(q.opts[q.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="dvcDebrief">Voir le debrief</button>';
  $("view-dev").innerHTML = html;
  $("dvcQuit").addEventListener("click", quitGame);
  $("dvcDebrief").addEventListener("click", function(){ sndTap(); finishDev(); });
}
function finishDev(){
  var correct = 0, safeGood = 0;
  DEV_ITEMS.forEach(function(a, i){
    if(dvc.answers[i] === a.ok){ correct++; if(a.opts[a.ok]==="Aucune vulnérabilité") safeGood++; }
  });
  var idScore = 5 * correct;
  var fixCorrect = 0;
  DEV_FIXES.forEach(function(f, i){ if(dvc.fixAnswers[i]===f.ok) fixCorrect++; });
  var fixScore = 10 * fixCorrect;
  var qcmOk = dvc.qcm===DEV_QCM.ok;
  var qcmScore = qcmOk ? 20 : 0;
  var score = idScore + fixScore + qcmScore;
  var why = "";
  DEV_ITEMS.forEach(function(a, i){
    var mine = dvc.answers[i];
    var good = mine===a.ok;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+(a.opts[mine]||"Non répondu"), a.why);
  });
  why += '<h3 style="margin-top:14px">Les correctifs</h3>';
  DEV_FIXES.forEach(function(f, i){
    var mine = dvc.fixAnswers[i];
    var good = mine===f.ok;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+f.q, f.why);
  });
  why += '<h3 style="margin-top:14px">La règle qui protège</h3>';
  why += whyRow(qcmOk, qcmOk?"ok":"ko", "Ton choix : "+DEV_QCM.opts[dvc.qcm], DEV_QCM.why);
  var seenCount = dvc.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = DEV_ITEMS.map(function(a,i){ return i; }).filter(function(i){ return dvc.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (dvc.hintCount||0) - 1);
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+DEV_ITEMS.length+' vulnérabilités bien identifiées.</p>'
    + '<p style="margin:4px 0"><b>Correctifs :</b> '+fixCorrect+' / '+DEV_FIXES.length+' bons correctifs.</p>'
    + '<p style="margin:4px 0"><b>Principe :</b> '+(qcmOk ? 'la bonne règle — plusieurs couches de défense.' : 'la règle n\'était pas la bonne — revois la défense en profondeur.')+'</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> code ouvert sur '+seenCount+' / '+DEV_ITEMS.length+' extraits'+(seenCount<DEV_ITEMS.length ? ' — juger un extrait sans l\'avoir lu, c\'est décider à l\'aveugle.' : '.')+'</p>';
  finishMission("dev", score, [
    { label:"Vulnérabilités identifiées", got:idScore, max:40 },
    { label:"Correctifs choisis", got:fixScore, max:40 },
    { label:"Principe de sécurité", got:qcmScore, max:20 }
  ], why, function(){
    S.fpTotal += safeGood;
    if(correct===DEV_ITEMS.length && unlockDex("injection")) finishMission._newDex.push("injection");
    if(fixCorrect===DEV_FIXES.length && unlockDex("correctif")) finishMission._newDex.push("correctif");
  }, "Le pourquoi, extrait par extrait");
}
