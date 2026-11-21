"use strict";
/* ================= MINI-JEU 1 : TRI D'ALERTES ================= */
var tri = null, triTimer = null;
function startTri(resume){
  tri = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], justAnswers:{}, hintCount:0, variant:(S.plays.tri % 3), start:Date.now(), elapsed:0 };
  if(tri.variant===undefined) tri.variant = 0;
  if(!tri.justAnswers) tri.justAnswers = {};
  if(tri.hintCount===undefined) tri.hintCount = 0;
  tri.alerts = alertsForVariant(tri.variant);
  if(!tri._examStart) tri._examStart = Date.now();
  tri.start = Date.now();
  S.inProgress = { game:"tri", data:tri }; save();
  show("tri");
  renderTriStep();
  clearInterval(triTimer);
  triTimer = setInterval(tickTri, 500);
}
function triRemaining(){
  var used = tri.elapsed + (Date.now()-tri.start)/1000;
  return Math.max(0, 180 - used);
}
function tickTri(){
  var el = $("triTimer");
  if(curView!=="tri" || !el){
    if(tri){ tri.elapsed += (Date.now()-tri.start)/1000; tri.start = Date.now(); if(S.inProgress && S.inProgress.game==="tri"){ S.inProgress.data = tri; save(); } }
    clearInterval(triTimer); return;
  }
  var r = triRemaining(), m = Math.floor(r/60), s = Math.floor(r%60);
  el.textContent = m+":"+String(s).padStart(2,"0");
  el.classList.toggle("low", r<30);
  var tb = $("triTimeBar");
  if(tb){ tb.style.width = Math.round(100*r/180)+"%"; tb.classList.toggle("low", r<30); }
  if(r<=0){ clearInterval(triTimer); finishTri(true); }
}
function renderTriStep(){
  msClearType();
  var a = tri.alerts[tri.idx];
  var html = '<div class="ghead"><button class="quit" id="triQuit" aria-label="Quitter">✕</button><div class="ttl">Tri d\'alertes — Le SOC</div><div class="timer" id="triTimer">3:00</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>';
  examStartClock(function(){ return tri ? tri._examStart : null; });
  html += '<div class="timetrack"><i id="triTimeBar" style="width:100%"></i></div><div class="stepct">Alerte '+(tri.idx+1)+' / '+tri.alerts.length+' · '+TRI_VARIANTS[tri.variant].label+'</div><div class="progressline"><i style="width:'+Math.round(100*tri.idx/tri.alerts.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Alerte SIEM</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Source : <b>'+a.host+'</b></span><span>Heure : <b>'+a.time+'</b></span></div>'
    + '<button class="detbtn" id="triDet">Détails de l\'alerte '+(tri.seen[tri.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(tri.seen[tri.idx]?' on':'')+'" id="triDetails">'+a.det+'</div></div>';
  html += '<div class="trio">'
    + '<button class="b-fp" data-choice="fp">'+ICONS.check+'Faux positif</button>'
    + '<button class="b-vp" data-choice="vp">'+ICONS.warn+'Vrai positif</button>'
    + '<button class="b-esc" data-choice="esc">'+ICONS.up+'Escalader</button></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="triHint">Indice d\'Amara — '+(tri.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="triHintBox">« <span class="ms-tw" id="triHintTw">'+(tri.hintUsed[tri.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-tri").innerHTML = html;
  $("triQuit").addEventListener("click", quitGame);
  $("triDet").addEventListener("click", function(){
    tri.seen[tri.idx] = true; S.inProgress.data = tri; save();
    $("triDetails").classList.add("on"); this.textContent = "Détails de l'alerte ▴";
  });
  var thb = $("triHint");
  if(thb) thb.addEventListener("click", function(){
    if(tri.hintUsed[tri.idx]){ $("triHintBox").classList.add("on"); return; }
    if(tri.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(tri.hintCount>0) S.credits -= 15;
    tri.hintUsed[tri.idx] = true; tri.hintCount++; S.inProgress.data = tri; save();
    $("triHintBox").classList.add("on"); sndTap();
    var ttw = $("triHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(tri.hintUsed[tri.idx] && $("triHintBox")) $("triHintBox").classList.add("on");
  document.querySelectorAll("#view-tri [data-choice]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      tri.answers[tri.idx] = b.getAttribute("data-choice");
      S.inProgress.data = tri; save();
      sndTap();
      var cur = tri.alerts[tri.idx];
      if(cur.jq && tri.justAnswers[tri.idx]===undefined){ renderTriJustify(); return; }
      advanceTri();
    });
  });
}
function advanceTri(){
  tri.idx++;
  if(tri.idx >= tri.alerts.length){ clearInterval(triTimer); finishTri(false); }
  else { S.inProgress.data = tri; save(); renderTriStep(); }
}
function renderTriJustify(){
  var a = tri.alerts[tri.idx];
  var html = '<div class="ghead"><button class="quit" id="triQuit" aria-label="Quitter">✕</button><div class="ttl">Tri d\'alertes — Le SOC</div><div class="timer" id="triTimer">3:00</div></div>';
  html += '<div class="timetrack"><i id="triTimeBar" style="width:100%"></i></div><div class="stepct">Alerte '+(tri.idx+1)+' / '+tri.alerts.length+' — justification</div><div class="progressline"><i style="width:'+Math.round(100*tri.idx/tri.alerts.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">'+a.jq+'</div><div class="jopts">';
  a.jopts.forEach(function(o, oi){ html += '<button data-jopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-tri").innerHTML = html;
  $("triQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-tri [data-jopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      tri.justAnswers[tri.idx] = (+b.getAttribute("data-jopt") === a.jok);
      S.inProgress.data = tri; save(); sndTap();
      advanceTri();
    });
  });
}
function finishTri(timeout){
  var alerts = tri.alerts || ALERTS;
  var correct = 0, fpGood = 0;
  alerts.forEach(function(a, i){
    if(tri.answers[i] === a.ans){ correct++; if(a.ans==="fp") fpGood++; }
  });
  var prec = Math.round(40 * correct / alerts.length);
  var chain = [4,5,6].filter(function(i){ return tri.answers[i]==="vp"; }).length;
  var attaque = Math.round(30 * chain / 3);
  var used = 180 - triRemaining();
  var rapid = Math.round(20 * Math.max(0, 1 - used/180));
  var jIdx = [3,4,5,6], jGood = 0;
  jIdx.forEach(function(i){ if(tri.justAnswers && tri.justAnswers[i]) jGood++; });
  var justif = Math.round(10 * jGood / jIdx.length);
  var score = prec + attaque + rapid + justif;
  var capped = false;
  if(timeout && [4,5,6].some(function(i){ return tri.answers[i]===undefined; })){ score = Math.min(score, 59); capped = true; }
  var why = "";
  alerts.forEach(function(a, i){
    var mine = tri.answers[i];
    var lbl = mine==="fp" ? "Faux positif" : mine==="vp" ? "Vrai positif" : mine==="esc" ? "Escalader" : "Non classée";
    var good = mine===a.ans;
    var extra = "";
    if(a.jq) extra = tri.justAnswers && tri.justAnswers[i] ? " Justification : la bonne preuve a été citée." : " Justification : la preuve citée n'était pas la décisive — relis les détails.";
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+lbl, a.why + extra);
  });
  if(chain===3) why += '<p style="color:var(--mut);font-size:14px">Les alertes 5, 6 et 7 ne sont pas trois problèmes séparés : reliées, elles forment <b style="color:var(--txt)">un seul incident</b> — force brute, compromission, puis exfiltration.</p>';
  if(capped) why += '<p style="color:var(--red);font-weight:700;font-size:14px">Note plafonnée : une alerte critique de la chaîne d\'attaque est restée sans réponse.</p>';
  var seenCount = tri.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = alerts.map(function(a,i){ return i; }).filter(function(i){ return tri.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (tri.hintCount||0) - 1); /* la 1re aide essentielle est gratuite et ne bloque pas la maîtrise */
  finishMission._variant = tri.variant||0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+alerts.length+' classifications justes.</p>'
    + '<p style="margin:4px 0"><b>Preuves utilisées :</b> '+jGood+' / '+jIdx.length+' justifications décisives citées.</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> détails ouverts sur '+seenCount+' / '+alerts.length+' alertes'+(seenCount<alerts.length ? ' — décider sans ouvrir les détails, c\'est décider à l\'aveugle.' : '.')+'</p>'
    + '<p style="margin:4px 0"><b>Conséquences métier :</b> '+(chain===3 ? 'la chaîne complète a été vue comme un seul incident : le compte peut être isolé avant que l\'exfiltration continue.' : 'la chaîne d\'attaque n\'a été repérée qu\'en partie ('+chain+' / 3) : un maillon manqué laisse l\'attaquant avancer.')+'</p>';
  finishMission("tri", score, [
    { label:"Précision", got:prec, max:40 },
    { label:"Attaque identifiée", got:attaque, max:30 },
    { label:"Rapidité", got:rapid, max:20 },
    { label:"Raisonnement (justifications)", got:justif, max:10 }
  ], why, function(){
    S.fpTotal += fpGood;
    var noUselessEsc = alerts.every(function(a,i){ return !(tri.answers[i]==="esc" && a.ans!=="esc"); });
    if(noUselessEsc && tri.answers.length>=alerts.length) unlockBadge("oeil");
    if(S.fpTotal >= 50) unlockBadge("fauxpos");
    if(chain===3 && unlockDex("brute")) finishMission._newDex.push("brute");
    if(tri.answers[0]==="fp" && unlockDex("backup")) finishMission._newDex.push("backup");
    if(tri.answers[7]==="vp" && unlockDex("trojan")) finishMission._newDex.push("trojan");
  });
}