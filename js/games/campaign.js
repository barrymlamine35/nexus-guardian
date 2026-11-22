"use strict";
function campMemoryLines(){
  var lines = [];
  if(S.campaign.upgrades.indexOf("journalisation")>=0) lines.push({ ok:true, txt:"Journalisation renforcée : les journaux des trois organisations étaient complets — la connexion discrète de la mairie (22 h 03) a été repérée en quelques minutes, pas le lendemain." });
  else lines.push({ ok:false, txt:"Sans journalisation renforcée, l'équipe a reconstitué la nuit à la main, journal par journal. Plus lent, plus fatigant — mais la connexion de la mairie a quand même été retrouvée. Rien n'était bloqué, tout a juste coûté plus d'heures." });
  if(S.campaign.upgrades.indexOf("mfa")>=0) lines.push({ ok:true, txt:"MFA partout : à Atlas (22 h 21), la rafale d'échecs s'est brisée sur le second facteur. Aucune connexion réussie — c'est l'amélioration qui a parlé." });
  else lines.push({ ok:false, txt:"Sans MFA généralisée, la rafale d'Atlas (22 h 21) n'a échoué que parce que le mot de passe a tenu cette fois. L'équipe a forcé la réinitialisation du compte dans la nuit. Ça passe — de justesse, et personne ne s'en félicite." });
  if(S.campaign.upgrades.indexOf("sauvegardes")>=0) lines.push({ ok:true, txt:"Sauvegardes 3-2-1 testées : à Saint-Roch, le poste d'accueil est reparti d'un point de restauration vérifié. Les soins n'ont rien vu passer." });
  else lines.push({ ok:false, txt:"Sans sauvegardes testées, le poste de Saint-Roch a été reconstruit à la main pendant que l'accueil tournait au papier. Faisable, pénible — et c'est exactement pour ça que la fiche 3-2-1 existe." });
  return lines;
}
function prepEstimee(){
  var covT = {tri:ALERTS.length, phish:EMAILS.length, defense:WAVES.length};
  var totCov = S.coverage.tri.length + S.coverage.phish.length + S.coverage.defense.length;
  var totObj = covT.tri + covT.phish + covT.defense;
  var totClean = S.mastery.tri.clean + S.mastery.phish.clean + S.mastery.defense.clean;
  var prep = Math.round(100 * (0.5*(totCov/totObj) + 0.5*(totClean/3)));
  if(S.delayedDone) prep = Math.round((prep + S.delayedScore)/2);
  var missing = [];
  if(S.coverage.tri.length < covT.tri) missing.push("tri d'alertes incomplet");
  if(S.coverage.phish.length < covT.phish) missing.push("phishing incomplet");
  if(S.coverage.defense.length < covT.defense) missing.push("défense réseau incomplète");
  if(totClean < 3) missing.push("maîtrise sans aide encore insuffisante");
  if(!S.delayedDone) missing.push("épreuve différée non passée");
  return { prep:prep, totCov:totCov, totObj:totObj, totClean:totClean, missing:missing };
}
/* ---------- Persistance : améliorations durables ---------- */
function upgradesListHtml(){
  var html = "";
  UPGRADES.forEach(function(u){
    var owned = S.campaign.upgrades.indexOf(u.id)>=0;
    html += '<div class="upg"><div><b>'+u.name+'</b><p>'+u.txt+'</p></div>'
      + (owned ? '<span class="tag done ub">En place</span>' : '<button class="btn ub" data-upg="'+u.id+'">Installer · '+u.cost+' crédits</button>')
      + '</div>';
  });
  html += '<p style="margin:8px 0 0">Solde : <b style="color:var(--txt)">'+S.credits+' crédits</b></p>';
  return html;
}
function upgradesSectionHtml(){
  return '<div class="card upgzone"><h3>Améliorations durables — mémoire de la ville</h3><p>Chaque installation reste en place pour toute la campagne et change la suite : un indice de plus, une porte fermée, une restauration plus rapide. Aucune n\'est obligatoire — sans elles, la campagne reste terminable, simplement plus rude.</p><div class="upglist">'+upgradesListHtml()+'</div></div>';
}
function trustCardHtml(){
  function row(name, v){ return '<div class="orgline"><div class="ol"><span>'+name+'</span><span>'+v+' / 100</span></div><div class="trustbar"><i style="width:'+v+'%"></i></div></div>'; }
  return '<div class="card"><h3>Confiance des organisations</h3><p>Elle monte ou baisse selon tes décisions dans chaque épisode. En finale, une confiance haute fait partager les journaux volontiers — un indice de plus ; une confiance basse ajoute une étape de persuasion. Elle ne bloque jamais rien.</p>'
    + row("Atlas Logistics", S.campaign.trust.atlas) + row("Clinique Saint-Roch", S.campaign.trust.clinique) + row("Mairie de Nexus City", S.campaign.trust.mairie) + '</div>';
}
function refreshUpgrades(root){
  if(!root) return;
  root.querySelectorAll(".upglist").forEach(function(l){ l.innerHTML = upgradesListHtml(); });
  bindUpgrades(root);
}
function bindUpgrades(root){
  if(!root) return;
  root.querySelectorAll("[data-upg]").forEach(function(b){
    if(b._upgBound) return; b._upgBound = true;
    b.addEventListener("click", function(){
      var u = UPGRADES.filter(function(x){ return x.id===b.getAttribute("data-upg"); })[0];
      if(!u || S.campaign.upgrades.indexOf(u.id)>=0) return;
      if(S.credits < u.cost){ toast("Pas assez de crédits ("+u.cost+" requis)."); sndBad(); return; }
      sheet('<h3>Installer : '+u.name+' ?</h3><p>'+u.txt+'</p><p>Coût : <b style="color:var(--txt)">'+u.cost+' crédits</b> · Solde après installation : <b style="color:var(--txt)">'+(S.credits-u.cost)+'</b>. L\'amélioration reste en place pour toute la suite de la campagne.</p><div class="sbtns"><button class="btn primary big" id="upgYes">Installer</button><button class="btn big" onclick="closeSheet()">Pas maintenant</button></div>');
      $("upgYes").addEventListener("click", function(){
        S.credits -= u.cost; S.campaign.upgrades.push(u.id);
        if(u.id==="sauvegardes" && unlockDex("backup")){}
        if(u.id==="mfa" && unlockDex("privilege")){}
        if(u.id==="journalisation" && unlockDex("brute")){}
        save(); closeSheet(); sndOk(); toast(u.name+" installée."); refreshUpgrades(root);
      });
    });
  });
}
/* ---------- Effets persistants visibles pendant les épisodes ---------- */
function campEffectNote(cid, idx){
  var has = function(id){ return S.campaign.upgrades.indexOf(id)>=0; };
  var notes = [];
  if(cid==="clinique"){
    if(idx===0 && has("sauvegardes")) notes.push("Effet durable — Sauvegardes 3-2-1 testées : un point de restauration sain de l'imagerie a été vérifié la semaine dernière. Si le chiffrement a touché des fichiers, la restauration est déjà planifiée, pas improvisée.");
    if(idx===1 && has("journalisation")) notes.push("Effet durable — Journalisation renforcée : un indice supplémentaire apparaît. Le même message a été envoyé à 14 boîtes du personnel en dix minutes — une campagne ciblée, pas un envoi isolé.");
    if(idx===3 && has("mfa")) notes.push("Effet durable — MFA généralisée : ce poste inconnu exigera aussi un second facteur. La vérification par le standard reste nécessaire, mais elle ne suffira plus, à elle seule, à ouvrir la porte.");
  }
  if(cid==="mairie"){
    if(idx===0 && has("sauvegardes")) notes.push("Effet durable — Sauvegardes 3-2-1 vérifiées : une copie saine du site, datée de jeudi, est prête. La bascule vers la page saine prend quelques minutes, pas un week-end.");
    if(idx===0 && has("journalisation")) notes.push("Effet durable — Journalisation renforcée : les journaux du serveur sont complets — l'altération vient d'un compte d'administration précis, déjà identifié dans les logs.");
    if(idx===4 && has("mfa")) notes.push("Effet durable — MFA généralisée : les journaux montrent que la seconde connexion a échoué à l'étape du second facteur. Le compte n'est pas compromis — mais le mot de passe, lui, est passé : il faut quand même escalader.");
    if(idx===4 && has("journalisation")) notes.push("Effet durable — Journalisation renforcée : un indice supplémentaire apparaît. Les journaux montrent aussi une tentative de création de règle de transfert, bloquée faute de droits — le schéma d'Atlas, rejoué à la mairie.");
  }
  return notes.length ? notes.join("<br>") : null;
}
function finaleNote(idx){
  var has = function(id){ return S.campaign.upgrades.indexOf(id)>=0; };
  var t = S.campaign.trust, notes = [];
  if(idx===0){
    if(t.mairie>=65) notes.push("Confiance — Mairie ("+t.mairie+" / 100) : la mairie partage ses journaux sans discuter. Indice supplémentaire : la connexion discrète part de la même plage d'adresses que l'attaque de l'épisode 3.");
    else if(t.mairie<=35) notes.push("Confiance — Mairie ("+t.mairie+" / 100) : l'élu de permanence hésite avant de transmettre les journaux — une étape de persuasion en plus. Ils finissent par arriver : une confiance basse ralentit, elle ne bloque jamais.");
    else notes.push("Confiance — Mairie ("+t.mairie+" / 100) : les journaux sont transmis après un appel au cabinet. Ni raccourci, ni mur.");
  }
  if(idx===1){
    if(has("mfa")) notes.push("Effet durable — MFA généralisée : c'est le second facteur qui a arrêté la rafale. Le mot de passe seul ne suffisait plus.");
    else notes.push("Faiblesse connue — pas de MFA généralisée : rien d'automatique n'arrêtera la prochaine rafale. Ce soir, tout repose sur la vigilance et la réinitialisation forcée.");
    if(t.atlas>=65) notes.push("Confiance — Atlas ("+t.atlas+" / 100) : l'exploitation transmet ses journaux complets sans qu'on ait à les réclamer.");
  }
  if(idx===2){
    if(has("sauvegardes")) notes.push("Effet durable — Sauvegardes 3-2-1 testées : un point de restauration vérifié existe pour ce poste. La restauration est une procédure, pas une improvisation.");
    else notes.push("Faiblesse connue — sauvegardes non testées : si le partage est touché, il faudra reconstruire et vérifier à la main. Plus long, plus pénible — pas impossible.");
    if(t.clinique>=65) notes.push("Confiance — Saint-Roch ("+t.clinique+" / 100) : la cadre de garde applique le plan sans discuter chaque mesure.");
  }
  if(idx===3){
    if(has("journalisation")) notes.push("Effet durable — Journalisation renforcée : les journaux des trois organisations couvrent toute la nuit. La recherche d'exfiltration a de la matière — un indice de plus, offert par un choix fait plusieurs épisodes plus tôt.");
    else notes.push("Faiblesse connue — journalisation partielle : la recherche d'exfiltration avancera journal par journal, à la main. Elle aboutira, plus lentement.");
  }
  return notes.length ? notes.join("<br>") : null;
}
function finaleWeaknessLines(){
  var has = function(id){ return S.campaign.upgrades.indexOf(id)>=0; };
  return [
    has("journalisation") ? "Journalisation renforcée en place : les journaux des trois organisations sont complets — ÉCLIPSE devra faire sans les angles morts." : "Faiblesse connue — journalisation incomplète : c'est par les angles morts des journaux qu'ÉCLIPSE compte revenir.",
    has("mfa") ? "MFA généralisée en place : les comptes des trois organisations ont un second facteur — la force brute devra trouver une autre porte." : "Faiblesse connue — comptes sans MFA : un mot de passe volé reste une porte à un seul battant.",
    has("sauvegardes") ? "Sauvegardes 3-2-1 testées : les restaurations sont des procédures connues, pas des paris." : "Faiblesse connue — sauvegardes jamais testées : si le chiffrement passe, la restauration sera une découverte en pleine nuit."
  ];
}
/* ================= MOTEUR MINI-CAMPAGNE ================= */
var camp = null;
function startCampChapter(cid){
  if(isGuest()){ demoLockSheet("La nuit d'ÉCLIPSE"); return; }
  if(cid==="finale" && !finaleUnlocked()){ toast("Finale verrouillée : termine d'abord les épisodes 1 à 3."); sndBad(); return; }
  camp = { id:cid, idx:0, answers:[], intro:true, trustRun:S.campaign.trust.mairie, start:Date.now() };
  show("campaign");
  renderCamp();
}
function renderCamp(){
  msClearType();
  var sc = CAMP_SCENARIOS[camp.id];
  var html = "";
  if(camp.intro){
    html += '<div class="ghead"><button class="quit" id="campQuit" aria-label="Quitter">✕</button><div class="ttl">Mini-campagne</div></div>';
    html += '<div class="card"><span class="tag soc">'+sc.orgName+'</span><h3 style="margin-top:8px;font-size:19px">'+sc.title+'</h3><p style="color:var(--txt)"><span class="ms-tw typing" id="campTw"></span></p>';
    if(camp.id==="finale"){
      html += '<p style="color:var(--mut);font-size:14px">Améliorations en place ce soir : <b style="color:var(--txt)">'+(S.campaign.upgrades.length ? S.campaign.upgrades.map(function(u){ return UPGRADES.filter(function(x){return x.id===u;})[0].name; }).join(" · ") : "aucune")+'</b>. Sans amélioration, la nuit sera plus rude — jamais bloquée : l\'équipe compensera à la main.</p>';
      html += '<div class="conseq" style="margin:10px 0 0"><b style="color:var(--txt)">Le chemin d\'attaque d\'ÉCLIPSE, lu dans l\'état de la ville :</b><br>'+finaleWeaknessLines().join("<br>")+'</div>';
      html += '<p style="color:var(--mut);font-size:14px">Confiance au départ — Atlas : <b style="color:var(--txt)">'+S.campaign.trust.atlas+' / 100</b> · Saint-Roch : <b style="color:var(--txt)">'+S.campaign.trust.clinique+' / 100</b> · Mairie : <b style="color:var(--txt)">'+S.campaign.trust.mairie+' / 100</b>. Haute, elle offre des indices ; basse, elle ajoute des étapes. Jamais un mur.</p>';
    }
    html += '</div><button class="btn primary big" id="campGo">Commencer — '+sc.questions.length+' situations</button>';
    $("view-campaign").innerHTML = html;
    msTypeEl($("campTw"), sc.intro);
    $("campQuit").addEventListener("click", function(){ msClearType(); show("missions"); });
    $("campGo").addEventListener("click", function(){ camp.intro=false; sndTap(); renderCamp(); });
    return;
  }
  if(camp.idx < sc.questions.length){
    var q = sc.questions[camp.idx];
    html += '<div class="ghead"><button class="quit" id="campQuit" aria-label="Quitter">✕</button><div class="ttl">'+sc.title+'</div>'+examClockHtml()+'</div>';
    examStartClock(function(){ return camp && camp.start; });
    html += '<div class="stepct">Situation '+(camp.idx+1)+' / '+sc.questions.length+' · '+sc.orgName+'</div><div class="progressline"><i style="width:'+Math.round(100*camp.idx/sc.questions.length)+'%"></i></div>';
    if(camp.id==="mairie") html += '<div class="orgline"><div class="ol"><span>Confiance des habitants</span><span>'+camp.trustRun+' / 100</span></div><div class="trustbar"><i style="width:'+camp.trustRun+'%"></i></div></div>';
    if(camp.id==="clinique") html += '<div class="orgline"><div class="ol"><span>Confiance de Saint-Roch</span><span>'+S.campaign.trust.clinique+' / 100</span></div><div class="trustbar"><i style="width:'+S.campaign.trust.clinique+'%"></i></div></div>';
    var fxNote = camp.id==="finale" ? finaleNote(camp.idx) : campEffectNote(camp.id, camp.idx);
    html += '<div class="alertcard"><div class="body" style="font-size:15.5px">'+q.q+'</div>'+(q.impact?'<div class="conseq" style="margin:10px 0 0">'+q.impact+'</div>':'')+(fxNote?'<div class="conseq" style="margin:10px 0 0">'+fxNote+'</div>':'')+'<div class="jopts">';
    q.opts.forEach(function(o, oi){ html += '<button data-cq="'+oi+'">'+esc(o)+'</button>'; });
    html += '</div></div>';
    $("view-campaign").innerHTML = html;
    $("campQuit").addEventListener("click", function(){ msClearType(); show("missions"); });
    document.querySelectorAll("#view-campaign [data-cq]").forEach(function(b){
      b.addEventListener("click", function(){ b.classList.add("ms-tap"); var oi = +b.getAttribute("data-cq"); camp.answers[camp.idx] = oi; if(camp.id==="mairie" && sc.questions[camp.idx].t) camp.trustRun = Math.max(0, Math.min(100, camp.trustRun + sc.questions[camp.idx].t[oi])); camp.idx++; sndTap(); renderCamp(); });
    });
    return;
  }
  finishCampChapter();
}
function finishCampChapter(){
  var sc = CAMP_SCENARIOS[camp.id];
  var good = 0;
  sc.questions.forEach(function(q, i){ if(camp.answers[i]===q.ok) good++; });
  var base = Math.round(100 * good / sc.questions.length);
  var bonus = camp.id==="finale" ? Math.min(12, 4 * S.campaign.upgrades.length) : 0;
  var score = Math.min(100, base + bonus);
  var first = !S.campaign.done[camp.id];
  var mult = first ? 1.5 : 1; /* rejouer rapporte plein pot, comme les missions */
  var xpBase = camp.id==="finale" ? 150 : 100;
  var xp = Math.round(xpBase * (score/100) * mult);
  var credits = Math.round((20 + 40*(score/100)) * mult);
  S.campaign.plays[camp.id]++;
  S.campaign.done[camp.id] = true;
  if(score > S.campaign.best[camp.id]) S.campaign.best[camp.id] = score;
  if(camp.id==="finale") S.campaign.finished = true;
  S.xp.soc += xp; S.credits += credits;
  function bump(org, d){ S.campaign.trust[org] = Math.max(10, Math.min(100, S.campaign.trust[org] + d)); }
  if(camp.id==="mairie"){ S.campaign.trust.mairie = Math.max(0, Math.min(100, camp.trustRun)); }
  else if(camp.id==="clinique"){ bump("clinique", score>=70 ? 10 : score>=40 ? 0 : -5); }
  if(!S.delayedDue && !S.delayedDone) S.delayedDue = Date.now() + 7*24*3600*1000;
  save();
  var why = "";
  sc.questions.forEach(function(q, i){
    var okc = camp.answers[i]===q.ok;
    why += whyRow(okc, okc?"ok":"ko", "Situation "+(i+1), q.why);
  });
  var html = '<div class="ghead"><div class="ttl">Debrief — '+sc.title+'</div></div>';
  html += '<div class="scorebig">'+score+'<small> / 100</small></div><div class="gradelbl">'+gradeLabel(score)+'</div>';
  html += '<div class="card"><h3>Barème</h3>'
    + '<div class="breakrow"><div class="bl"><span>Décisions justes</span><span>'+good+' / '+sc.questions.length+'</span></div><div class="breakbar"><i style="width:'+base+'%"></i></div></div>'
    + (camp.id==="finale" ? '<div class="breakrow"><div class="bl"><span>Mémoire de la ville (améliorations)</span><span>+'+bonus+' pts</span></div><div class="breakbar"><i style="width:'+Math.round(100*bonus/12)+'%"></i></div></div>' : '')
    + '</div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">+'+xp+' XP</div><div class="rl">SOC'+(first?' · 1re fois ×1,5':'')+'</div></div><div class="rw"><div class="rv" style="color:var(--orange)">+'+credits+'</div><div class="rl">Crédits</div></div></div>';
  if(camp.id==="finale"){
    html += '<div class="card ms-enter"><h3>Mémoire de la ville — ce que tes choix ont changé ce soir</h3>';
    campMemoryLines().forEach(function(l){ html += whyRow(l.ok, l.ok?"ok":"mid", l.ok?"En place":"Compensé à la main", l.txt); });
    html += '</div>';
    var PE2 = prepEstimee();
    html += '<div class="card ms-enter"><h3>Bilan de campagne — La nuit d\'ÉCLIPSE</h3>'
      + '<p>Chapitres — Atlas Logistics : <b style="color:var(--txt)">'+S.best.tri+' / 100</b> · Clinique Saint-Roch : <b style="color:var(--txt)">'+S.campaign.best.clinique+' / 100</b> · Mairie de Nexus City : <b style="color:var(--txt)">'+S.campaign.best.mairie+' / 100</b> · Finale : <b style="color:var(--txt)">'+score+' / 100</b></p>'
      + '<p>Confiance à la fin de la nuit — Atlas : <b style="color:var(--txt)">'+S.campaign.trust.atlas+' / 100</b> · Saint-Roch : <b style="color:var(--txt)">'+S.campaign.trust.clinique+' / 100</b> · Mairie : <b style="color:var(--txt)">'+S.campaign.trust.mairie+' / 100</b></p>'
      + '<p>Améliorations en place : <b style="color:var(--txt)">'+(S.campaign.upgrades.length ? S.campaign.upgrades.map(function(u){ return UPGRADES.filter(function(x){return x.id===u;})[0].name; }).join(" · ") : "aucune — la nuit a été tenue à la main, et elle a été tenue")+'</b></p>'
      + '<p><b style="color:var(--txt)">Ce qui a été appris :</b> relire les mêmes réflexes — trier un signal faible dans le bruit, reconnaître une force brute et un phishing, isoler sans tout arrêter, communiquer des faits vérifiés — dans trois organisations aux contraintes opposées, puis les tenir ensemble la même nuit.</p>'
      + '<p><b style="color:var(--txt)">Les décisions qui ont compté :</b> celles des épisodes ont dessiné cette nuit avant qu\'elle commence — journaux, MFA, sauvegardes et confiance ont décidé de ce qu\'ÉCLIPSE a trouvé en arrivant, et de la vitesse à laquelle l\'équipe a pu répondre.</p>'
      + '<p>Préparation estimée — Security+ : <b style="color:var(--txt)">'+PE2.prep+' %</b>, recalculée avec tout ce que le jeu a observé jusqu\'ici'+(PE2.missing.length ? ' · Encore insuffisamment évalué : '+PE2.missing.join(" · ") : '')+'. Une estimation, jamais une garantie de réussite à l\'examen.</p></div>';
    html += '<div class="conseq ms-enter"><b>Campagne terminée.</b> La nuit d\'ÉCLIPSE est bouclée — et rejouable : repars avec d\'autres améliorations, une autre confiance, d\'autres décisions, et la même nuit se racontera autrement. Aucune ancienne décision ne pouvait la rendre impossible : c\'était la règle, et elle a tenu.</div>';
  } else if(camp.id==="mairie"){
    html += '<div class="conseq">Confiance des habitants à la fin de l\'épisode : <b>'+S.campaign.trust.mairie+' / 100</b>. '+(score>=70 ? "La mairie a informé tôt et juste : les habitants ont suivi, et la rumeur n'a pas pris." : score>=40 ? "Confiance entamée mais tenue : les habitants ont eu des réponses, parfois tardives." : "La confiance a payé les silences et les messages maladroits. Elle se regagne épisode après épisode — et ne bloque jamais la suite.")+'</div>';
  } else {
    html += '<div class="conseq">'+(score>=70 ? "Saint-Roch a tenu ses soins toute la nuit, sans jamais tout bloquer. C'est exactement l'équilibre cherché." : score>=40 ? "Les soins ont continué, avec des hésitations qui ont coûté du temps. L'équilibre sécurité / continuité reste le cœur du lieu." : "La nuit a été rude pour les équipes : trop bloquer ou pas assez, à Saint-Roch les deux se paient en soins retardés.")+'</div>';
  }
  html += '<div class="card"><h3>Le pourquoi, situation par situation</h3>'+why+'</div>';
  html += examBoxHtml(camp.id);
  html += '<p class="sub">Lien Security+ : opérations de sécurité et réponse à incident — adapter la même décision au contexte de chaque organisation.</p>';
  if(camp.id==="clinique" || camp.id==="mairie") html += upgradesSectionHtml();
  html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="campHome">'+(camp.id==="finale" ? "Campagne" : "Missions")+'</button><button class="btn primary" style="flex:1" id="campReplay">Rejouer</button></div>';
  $("view-campaign").innerHTML = html;
  $("view-campaign").querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
  msScoreCount($("view-campaign"));
  msStaggerWhy($("view-campaign"));
  window.scrollTo(0,0);
  bindUpgrades($("view-campaign"));
  var wasFinale = camp.id==="finale";
  $("campHome").addEventListener("click", function(){ if(wasFinale) openCampaign(); else show("missions"); });
  var cid = camp.id;
  $("campReplay").addEventListener("click", function(){ startCampChapter(cid); });
  if(score>=60) sndOk(); else sndBad();
}
/* ================= ECRAN DE CAMPAGNE ================= */
function openCampaign(){
  if(isGuest()){ demoLockSheet("La nuit d'ÉCLIPSE"); return; }
  camp = null;
  show("campaign");
  renderCampaignScreen();
}
function renderCampaignScreen(){
  var n = campChaptersDone();
  var html = '<div class="ghead"><button class="quit" id="campBack" aria-label="Retour">‹</button><div class="ttl">Campagne SOC — La nuit d\'ÉCLIPSE</div></div>';
  html += '<div class="stepct">Progression : '+n+' / 4 chapitres'+(S.campaign.finished ? ' · Campagne terminée — rejouable à volonté' : '')+'</div>';
  html += '<div class="campsteps"><i class="'+(atlasDone()?"done":"")+'"></i><i class="'+(S.campaign.done.clinique?"done":"")+'"></i><i class="'+(S.campaign.done.mairie?"done":"")+'"></i><i class="'+(S.campaign.done.finale?"done":"")+'"></i></div>';
  html += '<div class="progressline"><i style="width:'+Math.round(100*n/4)+'%"></i></div>';
  html += '<div class="card ms-enter"><div class="row between"><span class="tag soc">Épisode 1 · SOC</span>'+(atlasDone()?'<span class="tag done">Terminé · meilleur '+S.best.tri+' / 100</span>':'<span class="tag">Disponible</span>')+'</div><h3 style="margin-top:8px">Atlas Logistics — Alerte à 03h12</h3><p>La Mission 1 complète, variante A « Le chef d\'équipe » : tri, corrélation, décision sous pression, enquête, éradication, message à la direction. Tu as 45 minutes de temps de jeu (accéléré) avant la relève de 04h00.</p><button class="btn primary big" id="csEp1">'+(atlasDone()?'Rejouer l\'épisode':'Jouer l\'épisode')+'</button></div>';
  ["clinique","mairie"].forEach(function(cid, i){
    var sc = CAMP_SCENARIOS[cid];
    html += '<div class="card ms-enter"><div class="row between"><span class="tag soc">Épisode '+(i+2)+' · SOC</span>'+(S.campaign.done[cid]?'<span class="tag done">Terminé · meilleur '+S.campaign.best[cid]+' / 100</span>':'<span class="tag">Disponible</span>')+'</div><h3 style="margin-top:8px">'+sc.title.split("— ")[1]+'</h3><p>'+(cid==="clinique" ? "Protéger les dossiers et les appareils sans jamais arrêter les soins. 5 situations." : "Des services aux habitants frappés, un journaliste au téléphone, et un compteur de confiance qui bouge à chaque décision. 5 situations.")+'</p><button class="btn primary big" data-cs="'+cid+'">'+(S.campaign.done[cid]?'Rejouer l\'épisode':'Jouer l\'épisode')+'</button></div>';
  });
  if(S.campaign.done.finale){
    html += '<div class="card ms-enter"><div class="row between"><span class="tag reseau">Finale</span><span class="tag done">Terminée · meilleur '+S.campaign.best.finale+' / 100</span></div><h3 style="margin-top:8px">La nuit d\'ÉCLIPSE — finale</h3><p>Les trois organisations attaquées la même nuit. Campagne bouclée — rejoue-la avec d\'autres améliorations ou une autre confiance : la nuit se racontera autrement.</p><button class="btn magenta big" data-cs="finale">Rejouer la finale</button></div>';
  } else if(finaleUnlocked()){
    html += '<div class="card ms-enter"><div class="row between"><span class="tag reseau">Finale</span><span class="tag">Débloquée</span></div><h3 style="margin-top:8px">La nuit d\'ÉCLIPSE — finale</h3><p>Les trois organisations attaquées la même nuit. ÉCLIPSE lira l\'état de la ville avant de frapper : tes améliorations ferment des portes, tes manques dessinent son chemin — et tes confiances décident de la vitesse de réponse.</p><button class="btn magenta big" data-cs="finale">Jouer la finale</button></div>';
  } else {
    html += '<div class="card ms-enter" style="opacity:.6"><div class="row between"><span class="tag reseau">Finale</span><span class="tag lock">Verrouillée</span></div><h3 style="margin-top:8px">La nuit d\'ÉCLIPSE — finale</h3><p>Les trois organisations attaquées la même nuit. Elle s\'ouvre quand les épisodes 1 à 3 sont terminés.</p><button class="btn magenta big" disabled>Épisodes 1 à 3 requis</button></div>';
  }
  html += trustCardHtml();
  html += upgradesSectionHtml();
  $("view-campaign").innerHTML = html;
  $("campBack").addEventListener("click", function(){ show("hub"); });
  $("csEp1").addEventListener("click", function(){ sndTap(); startM1("A"); });
  document.querySelectorAll("#view-campaign [data-cs]").forEach(function(b){
    b.addEventListener("click", function(){ sndTap(); startCampChapter(b.getAttribute("data-cs")); });
  });
  bindUpgrades($("view-campaign"));
}