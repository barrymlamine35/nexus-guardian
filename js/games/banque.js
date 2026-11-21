"use strict";
/* ================= MINI-JEU 5 : FRAUDE AUX VIREMENTS ================= */
var bq = null;
function startBanque(resume){
  bq = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], hintCount:0, phase:"classify", decIdx:0, decAnswers:[], start:Date.now(), elapsed:0 };
  if(bq.hintCount===undefined) bq.hintCount = 0;
  if(!bq._examStart) bq._examStart = Date.now();
  bq.start = Date.now();
  S.inProgress = { game:"banque", data:bq }; save();
  show("banque");
  renderBanque();
}
function renderBanque(){
  msClearType();
  if(bq.phase==="decisions") renderBqDec();
  else if(bq.phase==="decWhy") renderBqDecWhy();
  else renderBqStep();
}
function bqHead(){
  return '<div class="ghead"><button class="quit" id="bqQuit" aria-label="Quitter">✕</button><div class="ttl">Fraude aux virements — La Banque</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return bq ? bq._examStart : null; }); return ""; })();
}
function renderBqStep(){
  var a = BANQUE_ITEMS[bq.idx];
  var html = bqHead();
  html += '<div class="stepct">Opération '+(bq.idx+1)+' / '+BANQUE_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*bq.idx/BANQUE_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Opération bancaire</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Source : <b>'+a.src+'</b></span><span>Heure : <b>'+a.time+'</b></span></div>'
    + '<button class="detbtn" id="bqDet">Détails de l\'opération '+(bq.seen[bq.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(bq.seen[bq.idx]?' on':'')+'" id="bqDetails">'+a.det+'</div></div>';
  html += '<div class="trio">'
    + '<button class="b-vp" data-choice="fraud">'+ICONS.warn+'Frauduleuse</button>'
    + '<button class="b-fp" data-choice="legit">'+ICONS.check+'Légitime</button>'
    + '<button class="b-esc" data-choice="verif">'+ICONS.up+'À vérifier</button></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="bqHint">Indice d\'Amara — '+(bq.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="bqHintBox">« <span class="ms-tw" id="bqHintTw">'+(bq.hintUsed[bq.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-banque").innerHTML = html;
  $("bqQuit").addEventListener("click", quitGame);
  $("bqDet").addEventListener("click", function(){
    bq.seen[bq.idx] = true; S.inProgress.data = bq; save();
    $("bqDetails").classList.add("on"); this.textContent = "Détails de l'opération ▴";
  });
  var thb = $("bqHint");
  if(thb) thb.addEventListener("click", function(){
    if(bq.hintUsed[bq.idx]){ $("bqHintBox").classList.add("on"); return; }
    if(bq.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(bq.hintCount>0) S.credits -= 15;
    bq.hintUsed[bq.idx] = true; bq.hintCount++; S.inProgress.data = bq; save();
    $("bqHintBox").classList.add("on"); sndTap();
    var ttw = $("bqHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(bq.hintUsed[bq.idx] && $("bqHintBox")) $("bqHintBox").classList.add("on");
  document.querySelectorAll("#view-banque [data-choice]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      bq.answers[bq.idx] = b.getAttribute("data-choice");
      S.inProgress.data = bq; save();
      sndTap();
      advanceBq();
    });
  });
}
function advanceBq(){
  bq.idx++;
  if(bq.idx >= BANQUE_ITEMS.length){ bq.phase = "decisions"; S.inProgress.data = bq; save(); renderBqDec(); }
  else { S.inProgress.data = bq; save(); renderBqStep(); }
}
function renderBqDec(){
  var d = BANQUE_DECISIONS[bq.decIdx];
  var html = bqHead();
  html += '<div class="stepct">Décision '+(bq.decIdx+1)+' / '+BANQUE_DECISIONS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*(BANQUE_ITEMS.length+bq.decIdx)/(BANQUE_ITEMS.length+BANQUE_DECISIONS.length))+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Décision — équipe fraude</span><div class="jq">'+d.q+'</div><div class="jopts">';
  d.opts.forEach(function(o, oi){ html += '<button data-dopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-banque").innerHTML = html;
  $("bqQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-banque [data-dopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      bq.decAnswers[bq.decIdx] = +b.getAttribute("data-dopt");
      bq.phase = "decWhy"; S.inProgress.data = bq; save(); renderBqDecWhy();
    });
  });
}
function renderBqDecWhy(){
  var d = BANQUE_DECISIONS[bq.decIdx];
  var ok = bq.decAnswers[bq.decIdx]===d.ok;
  var html = bqHead();
  html += '<div class="stepct">Décision '+(bq.decIdx+1)+' / '+BANQUE_DECISIONS.length+'</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne décision' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+d.opts[bq.decAnswers[bq.decIdx]], ok ? d.why : "Ce n'était pas la bonne porte. "+d.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(d.opts[d.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="bqNext">'+(bq.decIdx+1>=BANQUE_DECISIONS.length ? 'Voir le debrief' : 'Décision suivante')+'</button>';
  $("view-banque").innerHTML = html;
  $("bqQuit").addEventListener("click", quitGame);
  $("bqNext").addEventListener("click", function(){
    sndTap();
    bq.decIdx++;
    if(bq.decIdx>=BANQUE_DECISIONS.length){ finishBanque(); }
    else { bq.phase = "decisions"; S.inProgress.data = bq; save(); renderBqDec(); }
  });
}
function finishBanque(){
  var correct = 0, legitGood = 0;
  BANQUE_ITEMS.forEach(function(a, i){
    if(bq.answers[i] === a.ans){ correct++; if(a.ans==="legit") legitGood++; }
  });
  var classScore = 5 * correct;
  var decCorrect = 0;
  BANQUE_DECISIONS.forEach(function(d, i){ if(bq.decAnswers[i]===d.ok) decCorrect++; });
  var decScore = 20 * decCorrect;
  var score = classScore + decScore;
  var lbl = { fraud:"Frauduleuse", legit:"Légitime", verif:"À vérifier" };
  var why = "";
  BANQUE_ITEMS.forEach(function(a, i){
    var mine = bq.answers[i];
    var good = mine===a.ans;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+(lbl[mine]||"Non classé"), a.why);
  });
  why += '<h3 style="margin-top:14px">Les décisions</h3>';
  BANQUE_DECISIONS.forEach(function(d, i){
    var mine = bq.decAnswers[i];
    var good = mine===d.ok;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+d.q, d.why);
  });
  var seenCount = bq.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = BANQUE_ITEMS.map(function(a,i){ return i; }).filter(function(i){ return bq.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (bq.hintCount||0) - 1);
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+BANQUE_ITEMS.length+' opérations bien classées.</p>'
    + '<p style="margin:4px 0"><b>Décisions :</b> '+decCorrect+' / '+BANQUE_DECISIONS.length+' décisions justes.</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> détails ouverts sur '+seenCount+' / '+BANQUE_ITEMS.length+' opérations'+(seenCount<BANQUE_ITEMS.length ? ' — décider sans ouvrir les détails, c\'est décider à l\'aveugle.' : '.')+'</p>';
  finishMission("banque", score, [
    { label:"Transactions classées", got:classScore, max:40 },
    { label:"Décisions de fraude", got:decScore, max:60 }
  ], why, function(){
    S.fpTotal += legitGood;
    if(decCorrect===BANQUE_DECISIONS.length && unlockDex("bec")) finishMission._newDex.push("bec");
    if(bq.answers[5]==="fraud" && unlockDex("mule")) finishMission._newDex.push("mule");
  }, "Le pourquoi, opération par opération");
}
