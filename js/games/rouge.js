"use strict";
/* ================= MINI-JEU 6 : CHASSE À ÉCLIPSE ================= */
var rg = null;
function startRouge(resume){
  rg = resume && resume.data ? resume.data : { idx:0, answers:[], seen:[], hintUsed:[], hintCount:0, phase:"classify", tlEvents:null, tlOrder:[], qcm:null, start:Date.now(), elapsed:0 };
  if(rg.hintCount===undefined) rg.hintCount = 0;
  if(!rg._examStart) rg._examStart = Date.now();
  rg.start = Date.now();
  if(!rg.tlEvents){
    rg.tlEvents = ROUGE_KILLCHAIN.map(function(e,i){ return i; });
    for(var i=rg.tlEvents.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=rg.tlEvents[i]; rg.tlEvents[i]=rg.tlEvents[j]; rg.tlEvents[j]=t; }
  }
  if(!rg.tlOrder) rg.tlOrder = [];
  S.inProgress = { game:"rouge", data:rg }; save();
  show("rouge");
  renderRouge();
}
function renderRouge(){
  msClearType();
  if(rg.phase==="timeline") renderRgTimeline();
  else if(rg.phase==="tlResult") renderRgTlResult();
  else if(rg.phase==="qcm") renderRgQcm();
  else if(rg.phase==="qcmResult") renderRgQcmResult();
  else renderRgStep();
}
function rgHead(){
  return '<div class="ghead"><button class="quit" id="rgQuit" aria-label="Quitter">✕</button><div class="ttl">Chasse à ÉCLIPSE — Tour Rouge</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return rg ? rg._examStart : null; }); return ""; })();
}
function renderRgStep(){
  var a = ROUGE_ITEMS[rg.idx];
  var html = rgHead();
  html += '<div class="stepct">Flux '+(rg.idx+1)+' / '+ROUGE_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*rg.idx/ROUGE_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Flux réseau</span><div class="at">'+a.t+'</div>'
    + '<div class="meta"><span>Source : <b>'+a.src+'</b></span><span>Heure : <b>'+a.time+'</b></span></div>'
    + '<button class="detbtn" id="rgDet">Détails du flux '+(rg.seen[rg.idx]?'▴':'▾')+'</button>'
    + '<div class="details'+(rg.seen[rg.idx]?' on':'')+'" id="rgDetails">'+a.det+'</div></div>';
  html += '<div class="trio">'
    + '<button class="b-vp" data-choice="c2">'+ICONS.warn+'Beacon C2</button>'
    + '<button class="b-fp" data-choice="legit">'+ICONS.check+'Légitime</button>'
    + '<button class="b-esc" data-choice="verif">'+ICONS.up+'À vérifier</button></div>';
  if(S.examMode){
    html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
  } else {
    html += '<button class="hintbtn" id="rgHint">Indice d\'Amara — '+(rg.hintCount===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="rgHintBox">« <span class="ms-tw" id="rgHintTw">'+(rg.hintUsed[rg.idx]?a.hint:'')+'</span> »</div>';
  }
  $("view-rouge").innerHTML = html;
  $("rgQuit").addEventListener("click", quitGame);
  $("rgDet").addEventListener("click", function(){
    rg.seen[rg.idx] = true; S.inProgress.data = rg; save();
    $("rgDetails").classList.add("on"); this.textContent = "Détails du flux ▴";
  });
  var thb = $("rgHint");
  if(thb) thb.addEventListener("click", function(){
    if(rg.hintUsed[rg.idx]){ $("rgHintBox").classList.add("on"); return; }
    if(rg.hintCount>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if(rg.hintCount>0) S.credits -= 15;
    rg.hintUsed[rg.idx] = true; rg.hintCount++; S.inProgress.data = rg; save();
    $("rgHintBox").classList.add("on"); sndTap();
    var ttw = $("rgHintTw"); if(ttw){ ttw.classList.add("typing"); msTypeEl(ttw, a.hint); }
  });
  if(rg.hintUsed[rg.idx] && $("rgHintBox")) $("rgHintBox").classList.add("on");
  document.querySelectorAll("#view-rouge [data-choice]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      rg.answers[rg.idx] = b.getAttribute("data-choice");
      S.inProgress.data = rg; save();
      sndTap();
      advanceRg();
    });
  });
}
function advanceRg(){
  rg.idx++;
  if(rg.idx >= ROUGE_ITEMS.length){ rg.phase = "timeline"; S.inProgress.data = rg; save(); renderRgTimeline(); }
  else { S.inProgress.data = rg; save(); renderRgStep(); }
}
function renderRgTimeline(){
  var html = rgHead();
  html += '<div class="stepct">La chaîne d\'attaque, dans l\'ordre</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>Remets la kill chain en ordre</h3><p>Touche les étapes dans l\'ordre où ÉCLIPSE les a enchaînées — la première en haut. Une attaque, c\'est une chaîne : chaque étape prépare la suivante.</p></div>';
  var remaining = rg.tlEvents.filter(function(i){ return rg.tlOrder.indexOf(i)<0; });
  html += '<div class="jopts">';
  remaining.forEach(function(i){
    var e = ROUGE_KILLCHAIN[i];
    html += '<button data-tl="'+i+'"><b>'+e.time+'</b> — '+esc(e.t)+'</button>';
  });
  html += '</div>';
  html += '<div class="card" style="margin-top:12px"><h3>Ta kill chain</h3>';
  if(!rg.tlOrder.length) html += '<p>Aucune étape placée pour l\'instant.</p>';
  rg.tlOrder.forEach(function(i, n){
    var e = ROUGE_KILLCHAIN[i];
    html += '<div class="row between" style="margin-top:6px"><div><b>'+(n+1)+'.</b> '+esc(e.t)+'</div><button class="btn" data-unplace="'+i+'">Retirer</button></div>';
  });
  html += '</div>';
  html += '<button class="btn primary big" id="rgTlGo"'+(rg.tlOrder.length<ROUGE_KILLCHAIN.length?' disabled':'')+'>Valider la kill chain</button>';
  $("view-rouge").innerHTML = html;
  $("rgQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-rouge [data-tl]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      rg.tlOrder.push(+b.getAttribute("data-tl")); S.inProgress.data = rg; save(); renderRgTimeline();
    });
  });
  document.querySelectorAll("#view-rouge [data-unplace]").forEach(function(b){
    b.addEventListener("click", function(){
      sndTap();
      var i = +b.getAttribute("data-unplace");
      rg.tlOrder = rg.tlOrder.filter(function(x){ return x!==i; }); S.inProgress.data = rg; save(); renderRgTimeline();
    });
  });
  var go = $("rgTlGo");
  if(go) go.addEventListener("click", function(){
    if(rg.tlOrder.length<ROUGE_KILLCHAIN.length) return;
    sndTap(); rg.phase = "tlResult"; S.inProgress.data = rg; save(); renderRgTlResult();
  });
}
function rgTlScore(){
  var s = 0;
  rg.tlOrder.forEach(function(i, n){ if(i===n) s++; });
  return s;
}
function renderRgTlResult(){
  var good = rgTlScore();
  var html = rgHead();
  html += '<div class="stepct">Ta kill chain — '+good+' / '+ROUGE_KILLCHAIN.length+' à la bonne place</div><div class="progressline"><i style="width:'+Math.round(100*good/ROUGE_KILLCHAIN.length)+'%"></i></div>';
  html += '<div class="card"><h3>L\'ordre de l\'attaque</h3>';
  ROUGE_KILLCHAIN.forEach(function(e, n){
    var mine = rg.tlOrder.indexOf(n);
    var ok = mine===n;
    html += whyRow(ok, ok?"ok":"ko", (n+1)+". "+e.time+" — "+e.t, e.det+(ok ? "" : " (tu l'avais placée en position "+(mine+1)+")"));
  });
  html += '<p style="color:var(--mut);font-size:14px">'+ROUGE_KILLCHAIN_WHY+'</p></div>';
  html += '<button class="btn primary big" id="rgToQcm">Dernière question</button>';
  $("view-rouge").innerHTML = html;
  $("rgQuit").addEventListener("click", quitGame);
  $("rgToQcm").addEventListener("click", function(){ sndTap(); rg.phase = "qcm"; S.inProgress.data = rg; save(); renderRgQcm(); });
}
function renderRgQcm(){
  var q = ROUGE_QCM;
  var html = rgHead();
  html += '<div class="stepct">Dernière question — couper ÉCLIPSE</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Raisonnement</span><div class="jq">'+q.q+'</div><div class="jopts">';
  q.opts.forEach(function(o, oi){ html += '<button data-qopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-rouge").innerHTML = html;
  $("rgQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-rouge [data-qopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      rg.qcm = +b.getAttribute("data-qopt");
      rg.phase = "qcmResult"; S.inProgress.data = rg; save(); renderRgQcmResult();
    });
  });
}
function renderRgQcmResult(){
  var q = ROUGE_QCM;
  var ok = rg.qcm===q.ok;
  var html = rgHead();
  html += '<div class="stepct">Couper ÉCLIPSE</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne réponse' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+q.opts[rg.qcm], ok ? q.why : "Ce n'était pas la bonne porte. "+q.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(q.opts[q.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="rgDebrief">Voir le debrief</button>';
  $("view-rouge").innerHTML = html;
  $("rgQuit").addEventListener("click", quitGame);
  $("rgDebrief").addEventListener("click", function(){ sndTap(); finishRouge(); });
}
function finishRouge(){
  var correct = 0, legitGood = 0;
  ROUGE_ITEMS.forEach(function(a, i){
    if(rg.answers[i] === a.ans){ correct++; if(a.ans==="legit") legitGood++; }
  });
  var classScore = 5 * correct;
  var tlGood = rgTlScore();
  var tlScore = 6 * tlGood;
  var qcmOk = rg.qcm===ROUGE_QCM.ok;
  var qcmScore = qcmOk ? 30 : 0;
  var score = classScore + tlScore + qcmScore;
  var lbl = { c2:"Beacon C2", legit:"Légitime", verif:"À vérifier" };
  var why = "";
  ROUGE_ITEMS.forEach(function(a, i){
    var mine = rg.answers[i];
    var good = mine===a.ans;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+a.t+" — toi : "+(lbl[mine]||"Non classé"), a.why);
  });
  why += '<h3 style="margin-top:14px">La kill chain</h3>';
  ROUGE_KILLCHAIN.forEach(function(e, n){
    var mine = rg.tlOrder.indexOf(n);
    var ok = mine===n;
    why += whyRow(ok, ok?"ok":"ko", (n+1)+". "+e.time+" — "+e.t, e.det+(ok ? "" : " (tu l'avais placée en position "+(mine+1)+")"));
  });
  why += '<p style="color:var(--mut);font-size:14px">'+ROUGE_KILLCHAIN_WHY+'</p>';
  why += '<h3 style="margin-top:14px">Couper ÉCLIPSE</h3>';
  why += whyRow(qcmOk, qcmOk?"ok":"ko", "Ton choix : "+ROUGE_QCM.opts[rg.qcm], ROUGE_QCM.why);
  var seenCount = rg.seen.filter(Boolean).length;
  finishMission._newDex = [];
  finishMission._covered = ROUGE_ITEMS.map(function(a,i){ return i; }).filter(function(i){ return rg.answers[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (rg.hintCount||0) - 1);
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+ROUGE_ITEMS.length+' flux bien classés.</p>'
    + '<p style="margin:4px 0"><b>Kill chain :</b> '+tlGood+' / '+ROUGE_KILLCHAIN.length+' étapes à la bonne place.</p>'
    + '<p style="margin:4px 0"><b>Contre-mesure :</b> '+(qcmOk ? 'la bonne première action — couper le canal de commande.' : 'la première action n\'était pas la bonne — revois ce qui coupe vraiment une attaque.')+'</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> détails ouverts sur '+seenCount+' / '+ROUGE_ITEMS.length+' flux'+(seenCount<ROUGE_ITEMS.length ? ' — décider sans ouvrir les détails, c\'est décider à l\'aveugle.' : '.')+'</p>';
  finishMission("rouge", score, [
    { label:"Flux analysés", got:classScore, max:40 },
    { label:"Kill chain", got:tlScore, max:30 },
    { label:"Contre-mesure", got:qcmScore, max:30 }
  ], why, function(){
    S.fpTotal += legitGood;
    if(tlGood===ROUGE_KILLCHAIN.length && unlockDex("c2")) finishMission._newDex.push("c2");
    if([0,1,5,7].every(function(i){ return rg.answers[i]==="c2"; }) && unlockDex("beacon")) finishMission._newDex.push("beacon");
  }, "Le pourquoi, flux par flux");
}
