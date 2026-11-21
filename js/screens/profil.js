"use strict";
/* ================= PROFIL ================= */
function renderProfil(){
  var html = '<h1>Profil</h1>';
  html += '<div class="card"><div class="row between"><div><h3>'+esc(S.alias)+'</h3><p>Grade : Stagiaire · Acte 1 — Nexus City</p></div><span class="chip credits">'+ICONS.coin+S.credits+'</span></div>'
    + '<p>Série en cours : <b style="color:var(--txt)">'+S.streak+' jour'+(S.streak>1?'s':'')+'</b> · XP total : <b style="color:var(--txt)">'+totalXP()+'</b></p>'
    + '<div class="aliasrow"><input id="aliasInput" type="text" maxlength="20" value="'+esc(S.alias)+'" aria-label="Alias"><button class="btn" id="aliasSave">Enregistrer</button></div></div>';
  if(FBUser){
    html += '<div class="card"><h3>Compte</h3><p>'+esc(FBUser.email)+'</p>'
      + (FBUser.emailVerified ? '<p>E-mail vérifié.</p>' : '<p>E-mail pas encore vérifié — tu peux jouer quand même.</p>')
      + '<div class="btnrow">'
      + (FBUser.emailVerified ? '' : '<button class="btn" id="pResend">Renvoyer l\'e-mail de vérification</button>')
      + '<button class="btn danger" id="pLogout">Se déconnecter</button></div></div>';
  }
  html += '<div class="card"><h3>Mode Examen</h3><div class="switchrow"><div class="swtxt"><p style="margin:0"><b style="color:var(--txt)">'+(S.examMode ? 'Activé' : 'Désactivé')+'</b></p></div><button class="switch" id="examToggle" role="switch" aria-checked="'+(S.examMode?'true':'false')+'" aria-label="Mode Examen"><i></i></button></div></div>';
  html += '<div class="card"><h3>XP par domaine</h3>'
    + '<div class="xpbar"><div class="xl">SOC — Niveau '+levelOf(S.xp.soc)+'<span>'+S.xp.soc+' XP</span></div><div class="xptrack"><i style="width:'+levelPct(S.xp.soc)+'%"></i></div></div>'
    + '<div class="xpbar"><div class="xl">Réseau — Niveau '+levelOf(S.xp.reseau)+'<span>'+S.xp.reseau+' XP</span></div><div class="xptrack"><i class="mag" style="width:'+levelPct(S.xp.reseau)+'%"></i></div></div></div>';
  var PE = prepEstimee();
  var totCov = PE.totCov, totObj = PE.totObj, totClean = PE.totClean, prep = PE.prep, missing = PE.missing;
  html += '<div class="card"><h3>Préparation estimée — Security+</h3><div class="scorebig" style="font-size:40px">'+prep+'<small> %</small></div>'
    + '<p>Observé : '+totCov+' / '+totObj+' objectifs rencontrés.</p></div>';
  html += '<div class="card"><h3>Mini-campagne — La nuit d\'ÉCLIPSE</h3><p style="margin:0">Chapitres : <b style="color:var(--txt)">'+campChaptersDone()+' / 4</b> · Finale : <b style="color:var(--txt)">'+(S.campaign.done.finale ? 'terminée · meilleur '+S.campaign.best.finale+' / 100' : finaleUnlocked() ? 'débloquée' : 'verrouillée (épisodes 1 à 3)')+'</b></p></div>';
  var dojoTot = dojoDoneCount()+dojoLLCount()+dojoPWPCount()+dojoC101Count()+dojoICSCount()+dojoWSCount()+dojoCECount()+dojoIRECount()+dojoPSCount()+dojoSSCount()+dojoSECount()+dojoDSUCount()+dojoPECount()+dojoIPLCount()+dojoAOSCount()+dojoFLCount()+dojoCICount()+dojoPWCount()+dojoPTCount()+dojoQQCount()+dojoDCSCount()+dojoXNUCount();
  var dojoMax = DOJO_LESSONS.length+DOJO_LL_LESSONS.length+DOJO_PWP_LESSONS.length+DOJO_C101_LESSONS.length+DOJO_ICS_LESSONS.length+DOJO_WS_LESSONS.length+DOJO_CE_LESSONS.length+DOJO_IRE_LESSONS.length+DOJO_PS_LESSONS.length+DOJO_SS_LESSONS.length+DOJO_SE_LESSONS.length+DOJO_DSU_LESSONS.length+DOJO_PE_LESSONS.length+DOJO_IPL_LESSONS.length+DOJO_AOS_LESSONS.length+DOJO_FL_LESSONS.length+DOJO_CI_LESSONS.length+DOJO_PW_LESSONS.length+DOJO_PT_LESSONS.length+DOJO_QQ_LESSONS.length+DOJO_DCS_LESSONS.length+DOJO_XNU_LESSONS.length;
  html += '<div class="card"><h3>Le Dojo — parcours pwn.college</h3><p>'+dojoTot+' / '+dojoMax+' leçons terminées</p><div class="xptrack"><i style="width:'+Math.round(100*dojoTot/dojoMax)+'%"></i></div></div>';
  html += '<div class="card"><h3>Succès</h3><div class="badges">';
  BADGEDATA.forEach(function(b){
    var on = S.badges.indexOf(b.id)>=0;
    html += '<span class="badge '+(on?'on':'off')+'" title="'+esc(b.desc)+'">'+ICONS.medal+b.name+'</span>';
  });
  html += '</div><p style="margin-top:10px">Faux positifs bien classés (cumul) : <b style="color:var(--txt)">'+S.fpTotal+' / 50</b></p></div>';
  var dexOn = S.dex.length, dexTot = DEXDATA.length;
  html += '<h2>Cyberdex</h2><div class="xpbar" style="margin-top:2px"><div class="xl">Fiches débloquées<span id="dexCount">'+dexOn+' / '+dexTot+'</span></div><div class="xptrack"><i id="dexBar" style="width:0%"></i></div></div>'
    + '<input id="dexSearch" class="dexsearch" type="search" placeholder="Rechercher une fiche…" aria-label="Rechercher dans le Cyberdex">'
    + '<div class="dexfilters"><button class="on" data-dexf="all">Toutes</button><button data-dexf="on">Débloquées</button><button data-dexf="off">À débloquer</button></div>'
    + '<div class="dexgrid" id="dexGrid">';
  html += '</div>';
  var dexFilter = "all", dexQuery = "";
  function dexRender(){
    var g = $("dexGrid"); if(!g) return;
    var q = dexQuery.trim().toLowerCase(), out = "", n = 0;
    DEXDATA.forEach(function(d, i){
      var on = S.dex.indexOf(d.id)>=0;
      if(dexFilter==="on" && !on) return;
      if(dexFilter==="off" && on) return;
      if(q && (d.name+" "+d.txt).toLowerCase().indexOf(q)<0) return;
      n++;
      out += '<div class="dex gx-enter'+(on?'':' off')+(DEX_JUST.indexOf(d.id)>=0?' dex-new':'')+'" style="animation-delay:'+Math.min(i*30,240)+'ms"><b>'+d.name+'</b><p>'+(on ? d.txt : 'Fiche non débloquée — rencontre cette notion en mission.')+'</p></div>';
    });
    g.innerHTML = out || '<p style="color:var(--mut);font-size:14px">Aucune fiche ne correspond à ta recherche.</p>';
    var dc = $("dexCount"); if(dc) dc.textContent = dexOn+' / '+dexTot;
  }
  $("view-profil").innerHTML = html;
  dexRender();
  var dexBar = $("dexBar");
  if(dexBar){ var w = Math.round(100*dexOn/Math.max(dexTot,1)); if(DJ_REDUCED){ dexBar.style.width = w+'%'; } else { requestAnimationFrame(function(){ dexBar.style.width = w+'%'; }); } }
  var ds = $("dexSearch");
  if(ds) ds.addEventListener("input", function(){ dexQuery = ds.value; dexRender(); });
  document.querySelectorAll("[data-dexf]").forEach(function(b){
    b.addEventListener("click", function(){
      dexFilter = b.getAttribute("data-dexf"); sndTap();
      document.querySelectorAll("[data-dexf]").forEach(function(x){ x.classList.toggle("on", x===b); });
      dexRender();
    });
  });
  var et = $("examToggle");
  if(et) et.addEventListener("click", function(){
    S.examMode = !S.examMode; save(); sndTap();
    toast(S.examMode ? "Mode Examen activé : chrono réel, zéro indice." : "Mode Examen désactivé.");
    renderProfil();
  });
  $("aliasSave").addEventListener("click", function(){
    var v = $("aliasInput").value.trim();
    if(v){ S.alias = v; save(); toast("Alias mis à jour."); renderProfil(); }
  });
  var pl = $("pLogout"); if(pl) pl.addEventListener("click", function(){ doSignOut(); });
  var pr = $("pResend"); if(pr) pr.addEventListener("click", function(){
    if(FBUser) FBUser.sendEmailVerification().then(function(){ toast("E-mail de vérification renvoyé."); }).catch(function(e){ toast(fbErrMsg(e)); });
  });
}