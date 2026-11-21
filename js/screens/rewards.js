"use strict";
/* ================= RECOMPENSES ================= */
function unlockBadge(id){
  if(S.badges.indexOf(id)<0){ S.badges.push(id); }
}
function unlockDex(id){
  if(S.dex.indexOf(id)<0){ S.dex.push(id); return true; }
  return false;
}
function gradeLabel(score){
  if(score>=90) return "Excellent";
  if(score>=75) return "Solide";
  if(score>=60) return "Correct";
  if(score>=40) return "Fragile";
  return "À retravailler";
}
function finishMission(gameId, score, breakdown, whyHtml, extra, whyTitle){
  var g = GAMES[gameId];
  var first = S.plays[gameId]===0;
  var mult = first ? 1.5 : 1; /* rejouer rapporte plein pot : ce sont les paramètres qui changent (variantes) */
  var xp = Math.round(g.xpBase * (score/100) * mult);
  var credits = Math.round((20 + 40*(score/100)) * mult);
  var dailyBonus = 0;
  if(dailyGame()===gameId && !S.dailyDone){ S.dailyDone = true; dailyBonus = 30; }
  S.plays[gameId]++;
  if(score > S.best[gameId]) S.best[gameId] = score;
  S.xp[g.domaine] += xp;
  S.credits += credits + dailyBonus;
  S.inProgress = null;
  /* Couverture : objectifs rencontrés (distinct de l'XP et de la maîtrise) */
  var covBefore = S.coverage[gameId].length;
  (finishMission._covered||[]).forEach(function(o){ if(S.coverage[gameId].indexOf(o)<0) S.coverage[gameId].push(o); });
  var covNew = S.coverage[gameId].length - covBefore;
  var covTotal = gameId==="tri" ? ALERTS.length : gameId==="phish" ? EMAILS.length : WAVES.length;
  /* Maîtrise : réussir seul, sans indice, dans une situation nouvelle */
  var hintsUsed = finishMission._hintsUsed||0;
  var variant = (finishMission._variant===undefined ? 0 : finishMission._variant);
  var newSituation = S.seenVariants[gameId].indexOf(variant)<0;
  if(newSituation) S.seenVariants[gameId].push(variant);
  var masteryClean = score>=70 && hintsUsed===0;
  S.mastery[gameId].total++;
  if(masteryClean) S.mastery[gameId].clean++;
  /* Épreuve différée : programmée 7 jours après la première mission terminée */
  if(!S.delayedDue && !S.delayedDone) S.delayedDue = Date.now() + 7*24*3600*1000;
  if(extra) extra();
  if(gameId==="tri"){ S.campaign.trust.atlas = Math.max(10, Math.min(100, S.campaign.trust.atlas + (score>=70 ? 15 : score>=40 ? 5 : -5))); }
  if(["tri","phish","defense"].every(function(x){ return S.best[x]>0; })){
    if(unlockDex("gouv")) (finishMission._newDex = finishMission._newDex||[]).push("gouv");
  }
  save();
  var newDex = (finishMission._newDex||[]);
  var html = '<div class="ghead"><div class="ttl">Debrief — '+g.name+'</div></div>';
  html += '<div class="scorebig">'+score+'<small> / 100</small></div><div class="gradelbl">'+gradeLabel(score)+'</div>';
  html += '<div class="card"><h3>Barème</h3>';
  breakdown.forEach(function(b){
    html += '<div class="breakrow"><div class="bl"><span>'+b.label+'</span><span>'+b.got+' / '+b.max+'</span></div><div class="breakbar"><i style="width:'+Math.round(100*b.got/b.max)+'%"></i></div></div>';
  });
  html += '</div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">+'+xp+' XP</div><div class="rl">'+g.domLabel+(first?' · 1re fois ×1,5':'')+'</div></div>'
    + '<div class="rw"><div class="rv" style="color:var(--orange)">+'+(credits+dailyBonus)+'</div><div class="rl">Crédits'+(dailyBonus?' · dont +30 mission du jour':'')+'</div></div></div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv">'+S.coverage[gameId].length+' / '+covTotal+'</div><div class="rl">Couverture'+(covNew?' · +'+covNew+' objectif'+(covNew>1?'s':''):'')+'</div></div>'
    + '<div class="rw"><div class="rv" style="color:'+(masteryClean?'var(--green)':'var(--orange)')+'">'+(masteryClean?'Validée':'Non validée')+'</div><div class="rl">Maîtrise</div></div></div>';
  html += '<p class="sub">'+(masteryClean
    ? (newSituation ? 'Réussite sans indice, dans une situation nouvelle : elle compte pour la maîtrise. Confirmation définitive à l\'épreuve différée.' : 'Réussite sans indice. Situation déjà rencontrée : elle entretient la maîtrise sans la prouver à nouveau.')
    : (hintsUsed>0 ? 'Tu as utilisé '+hintsUsed+' indice'+(hintsUsed>1?'s':'')+' : la mission avance et l\'histoire continue, mais une réussite aidée ne valide pas la maîtrise.' : 'Score sous les 70 : la mission avance, la maîtrise attendra une réussite plus nette, sans indice.'))+'</p>';
  if(finishMission._evalHtml) html += '<div class="card"><h3>Évaluation du raisonnement</h3>'+finishMission._evalHtml+'</div>';
  newDex.forEach(function(id){
    var d = DEXDATA.filter(function(x){return x.id===id;})[0];
    if(d){ if(DEX_JUST.indexOf(id)<0) DEX_JUST.push(id); html += '<div class="unlock gx-pop">Fiche Cyberdex débloquée : <b>'+d.name+'</b></div>'; }
  });
  html += '<div class="card"><h3>'+(whyTitle||'Le pourquoi, alerte par alerte')+'</h3>'+whyHtml+'</div>';
  if(gameId==="tri") html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta — Mentore</div><div class="txt">« <span class="ms-tw typing" id="dbTw"></span> »</div></div></div></div>';
  html += examBoxHtml(gameId);
  html += '<p class="sub">Lien Security+ : '+ (gameId==="defense" ? "architecture et sécurité réseau — segmentation, DMZ, défense en profondeur." : gameId==="phish" ? "ingénierie sociale et sécurité des communications — phishing, BEC, SPF/DKIM/DMARC." : "opérations de sécurité et réponse à incident — tri, corrélation, escalade.") +'</p>';
  html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="dbHome">Retour</button><button class="btn primary" style="flex:1" id="dbReplay">Rejouer</button></div>';
  $("view-debrief").innerHTML = html;
  $("view-debrief").querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
  msScoreCount($("view-debrief"));
  msStaggerWhy($("view-debrief"));
  msTypeEl($("dbTw"), 'Bien joué pour Atlas. Mais écoute-moi bien : le même mode opératoire — mêmes heures, même patience — vient d\'être repéré ailleurs dans la ville. Une clinique, puis une mairie. On dirait qu\'ÉCLIPSE répète sa nuit, organisation après organisation. La suite se joue là-bas : Épisode 2, la Clinique Saint-Roch.');
  show("debrief");
  $("dbHome").addEventListener("click", function(){ show("hub"); });
  $("dbReplay").addEventListener("click", function(){ startBriefing(gameId); });
  if(score>=60) sndOk(); else sndBad();
}
function whyRow(ok, cls, title, why){
  var sym = cls==="ok" ? "✓" : cls==="mid" ? "!" : "✗";
  return '<div class="whyitem"><div class="wi2 '+cls+'">'+sym+'</div><div><b>'+title+'</b><span>'+why+'</span></div></div>';
}