"use strict";
/* ================= MINI-JEU 8 : LA CRISE, CÔTÉ DIRECTION ================= */
var cn = null;
function startConseil(resume){
  cn = resume && resume.data ? resume.data : { idx:0, answers:[], start:Date.now(), elapsed:0, phase:"decide" };
  if(!cn._examStart) cn._examStart = Date.now();
  cn.start = Date.now();
  S.inProgress = { game:"conseil", data:cn }; save();
  show("conseil");
  renderConseil();
}
function renderConseil(){
  msClearType();
  if(cn.phase==="why") renderCnWhy();
  else renderCnStep();
}
function cnHead(){
  return '<div class="ghead"><button class="quit" id="cnQuit" aria-label="Quitter">✕</button><div class="ttl">La crise, côté direction — Tour du Conseil</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>'
    + (function(){ examStartClock(function(){ return cn ? cn._examStart : null; }); return ""; })();
}
function renderCnStep(){
  var d = CONSEIL_ITEMS[cn.idx];
  var html = cnHead();
  html += '<div class="stepct">Décision '+(cn.idx+1)+' / '+CONSEIL_ITEMS.length+'</div><div class="progressline"><i style="width:'+Math.round(100*cn.idx/CONSEIL_ITEMS.length)+'%"></i></div>';
  html += '<div class="alertcard"><span class="tag">Décision — '+(d.group==="crise" ? 'Crise immédiate' : 'Gouvernance')+'</span><div class="jq">'+d.q+'</div><div class="jopts">';
  d.opts.forEach(function(o, oi){ html += '<button data-dopt="'+oi+'">'+esc(o)+'</button>'; });
  html += '</div></div>';
  $("view-conseil").innerHTML = html;
  $("cnQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-conseil [data-dopt]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap"); sndTap();
      cn.answers[cn.idx] = +b.getAttribute("data-dopt");
      cn.phase = "why"; S.inProgress.data = cn; save(); renderCnWhy();
    });
  });
}
function renderCnWhy(){
  var d = CONSEIL_ITEMS[cn.idx];
  var ok = cn.answers[cn.idx]===d.ok;
  var html = cnHead();
  html += '<div class="stepct">Décision '+(cn.idx+1)+' / '+CONSEIL_ITEMS.length+'</div><div class="progressline"><i style="width:100%"></i></div>';
  html += '<div class="card"><h3>'+(ok ? 'Bonne décision' : 'Pas tout à fait')+'</h3>';
  html += whyRow(ok, ok?"ok":"ko", "Ton choix : "+d.opts[cn.answers[cn.idx]], ok ? d.why : "Ce n'était pas la bonne porte. "+d.why);
  if(!ok) html += '<p style="color:var(--mut);font-size:14px">La bonne réponse : <b style="color:var(--txt)">'+esc(d.opts[d.ok])+'</b></p>';
  html += '</div>';
  html += '<button class="btn primary big" id="cnNext">'+(cn.idx+1>=CONSEIL_ITEMS.length ? 'Voir le debrief' : 'Décision suivante')+'</button>';
  $("view-conseil").innerHTML = html;
  $("cnQuit").addEventListener("click", quitGame);
  $("cnNext").addEventListener("click", function(){
    sndTap();
    cn.idx++;
    if(cn.idx>=CONSEIL_ITEMS.length){ finishConseil(); }
    else { cn.phase = "decide"; S.inProgress.data = cn; save(); renderCnStep(); }
  });
}
function finishConseil(){
  var correct = 0, criseCorrect = 0, gouvCorrect = 0;
  CONSEIL_ITEMS.forEach(function(d, i){
    if(cn.answers[i]===d.ok){
      correct++;
      if(d.group==="crise") criseCorrect++; else gouvCorrect++;
    }
  });
  var criseScore = 20 * criseCorrect;
  var gouvScore = 20 * gouvCorrect;
  var score = criseScore + gouvScore;
  var why = "";
  CONSEIL_ITEMS.forEach(function(d, i){
    var mine = cn.answers[i];
    var good = mine===d.ok;
    why += whyRow(good, good?"ok":"ko", (i+1)+". "+d.q, d.why);
  });
  finishMission._newDex = [];
  finishMission._covered = CONSEIL_ITEMS.map(function(d,i){ return i; }).filter(function(i){ return cn.answers[i]!==undefined; });
  finishMission._hintsUsed = 0;
  finishMission._variant = 0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décision :</b> '+correct+' / '+CONSEIL_ITEMS.length+' décisions justes.</p>'
    + '<p style="margin:4px 0"><b>Crise immédiate :</b> '+criseCorrect+' / 3 justes.</p>'
    + '<p style="margin:4px 0"><b>Gouvernance :</b> '+gouvCorrect+' / 2 justes.</p>';
  finishMission("conseil", score, [
    { label:"Crise immédiate", got:criseScore, max:60 },
    { label:"Gouvernance", got:gouvScore, max:40 }
  ], why, function(){
    if(cn.answers[1]===CONSEIL_ITEMS[1].ok && unlockDex("rancon")) finishMission._newDex.push("rancon");
    if(cn.answers[0]===CONSEIL_ITEMS[0].ok && unlockDex("notification")) finishMission._newDex.push("notification");
  }, "Le pourquoi, décision par décision");
}
