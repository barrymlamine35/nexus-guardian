"use strict";
/* ================= HUB ================= */
var ZONES = [
  { id:"qg", name:"QG Aegis", game:"phish", amb:"Bureaux feutrés, écrans partout, café toujours chaud.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#E5307A" stroke-width="1.8"><path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8z"/><path d="m9.3 12 2 2 3.6-3.8"/></svg>' },
  { id:"soc", name:"Le SOC", game:"tri", amb:"Lumière basse, consoles allumées jour et nuit.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#00D1FF" stroke-width="1.8"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="m7 9.5 2.5 2.5L7 14.5M12.5 14.5H17M9 20.5h6"/></svg>' },
  { id:"reseau", name:"Quartier Réseau", game:"defense", amb:"Câbles, voyants et plans affichés au mur.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#00D1FF" stroke-width="1.8"><circle cx="12" cy="5.5" r="2.3"/><circle cx="5" cy="18" r="2.3"/><circle cx="19" cy="18" r="2.3"/><path d="M10.8 7.3 6.2 16M13.2 7.3 17.8 16M7.3 18h9.4"/></svg>' },
  { id:"forensics", name:"Labo Forensics", amb:"Silence, gants, et des preuves sous scellés.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/></svg>' },
  { id:"banque", name:"La Banque", amb:"Marbre, chiffres, et des coffres bien gardés.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><path d="M3.5 9.5 12 4l8.5 5.5M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3.5 20.5h17"/></svg>' },
  { id:"rouge", name:"Tour Rouge", amb:"Personne n'y entre. Personne ne sait qui en sort.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><path d="M7 21.5v-17L12 2.5l5 2v17"/><path d="M4 21.5h16M10 8h4M10 12h4M10 16h4"/></svg>' },
  { id:"dev", name:"Quartier Dev", amb:"Tableaux pleins de post-it et de code en cours.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><path d="m8 8-4.5 4L8 16M16 8l4.5 4L16 16M13.5 5l-3 14"/></svg>' },
  { id:"conseil", name:"Tour du Conseil", amb:"Vue sur toute la ville, décisions à huis clos.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><path d="M5 21.5V8l7-4.5L19 8v13.5"/><path d="M2.5 21.5h19M9.5 21.5v-5h5v5"/></svg>' },
  { id:"cloud", name:"Ciel Cloud", amb:"Là-haut, des serveurs que personne ne touche.", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" stroke-width="1.8"><path d="M7 18.5h9.5a4.3 4.3 0 0 0 .8-8.5A6 6 0 0 0 5.6 11 3.8 3.8 0 0 0 7 18.5z"/></svg>' }
];
function renderHub(){
  var dg = dailyGame(), d = GAMES[dg];
  var html = '<h1>Nexus City</h1>';
  html += '<p class="sub">'+esc(S.alias)+' · Stagiaire · XP total : <b style="color:var(--txt)">'+totalXP()+'</b> · SOC N'+levelOf(S.xp.soc)+' · Réseau N'+levelOf(S.xp.reseau)+'</p>';
  html += '<div class="card simcard"><div class="row between"><span class="tag soc">Simulation</span>'+(S.m1.done?'<span class="tag done">Terminée</span>':'')+'</div><h3 style="margin-top:6px">Alerte à 03h12</h3><p>Atlas Logistics · 03h12 — l\'incident complet, 45 minutes en temps accéléré.</p><button class="btn primary big" data-act="simM1">'+(S.m1.done?'Rejouer la simulation':'Lancer la simulation')+'</button></div>';
  if(S.inProgress){
    var pg = GAMES[S.inProgress.game];
    html += '<div class="card resume"><div class="row between"><div><h3>Partie en cours</h3><p>'+pg.name+' — '+pg.lieu+'</p></div><button class="btn primary" data-act="resume">Reprendre</button></div></div>';
  }
  html += '<div class="card"><div class="row between"><div><span class="tag ms-daily">Mission du jour</span><h3 style="margin-top:6px">'+d.name+'</h3><p>'+d.lieu+' · Récompense : +30 crédits</p></div>';
  html += S.dailyDone ? '<span class="tag done">Terminée</span>' : '<button class="btn primary" data-act="play" data-game="'+dg+'">Jouer</button>';
  html += '</div></div>';
  var campDone = ["tri","phish","defense"].filter(function(g){ return S.best[g]>0; }).length;
  html += '<div class="card"><div class="row between"><div><span class="tag soc">Campagne SOC — Acte 1</span><h3 style="margin-top:6px">'+(campDone>=3 ? "Campagne terminée" : "Trois missions, un fil conducteur")+'</h3></div><span class="tag">'+campDone+' / 3</span></div><div class="campsteps"><i class="'+(S.best.tri>0?"done":"")+'"></i><i class="'+(S.best.phish>0?"done":"")+'"></i><i class="'+(S.best.defense>0?"done":"")+'"></i></div><p>1 · Tri d\'alertes — 2 · Chasse au phishing — 3 · Défense réseau. L\'incident d\'Atlas Logistics se lit d\'un bout à l\'autre.</p></div>';
  var chDone = campChaptersDone();
  html += '<div class="card"><div class="row between"><div><span class="tag reseau">Mini-campagne — La nuit d\'ÉCLIPSE</span><h3 style="margin-top:6px">Trois organisations, une même nuit</h3></div><span class="tag">'+chDone+' / 4 chapitres</span></div><div class="campsteps"><i class="'+(atlasDone()?"done":"")+'"></i><i class="'+(S.campaign.done.clinique?"done":"")+'"></i><i class="'+(S.campaign.done.mairie?"done":"")+'"></i><i class="'+(S.campaign.done.finale?"done":"")+'"></i></div>'
    + '<p>Épisode 1 · Atlas Logistics — Épisode 2 · Clinique Saint-Roch — Épisode 3 · Mairie de Nexus City — Finale · '+(S.campaign.done.finale ? "terminée" : finaleUnlocked() ? "débloquée" : "verrouillée")+'.</p>'
    + '<button class="btn primary big" data-act="gocampaign">Ouvrir la campagne</button></div>';
  if(S.delayedDue && !S.delayedDone){
    if(Date.now() >= S.delayedDue){
      html += '<div class="card resume"><div class="row between"><div><h3>Épreuve différée disponible</h3><p>Une semaine après, mêmes notions, autre décor : la Clinique Saint-Roch. C\'est elle qui valide la maîtrise.</p></div><button class="btn primary" data-act="delayed">Passer</button></div></div>';
    } else {
      html += '<div class="card"><h3>Épreuve différée programmée</h3><p>Le '+new Date(S.delayedDue).toLocaleDateString("fr-FR")+' : les mêmes notions reviendront dans un autre contexte. La maîtrise se juge après un délai, pas à chaud.</p></div>';
    }
  }
  if(S.delayedDone){
    html += '<div class="card"><div class="row between"><div><h3>Épreuve différée passée</h3><p>Clinique Saint-Roch — score : '+S.delayedScore+' / 100. Ce qui reste une semaine plus tard, c\'est ce qui est appris.</p></div><span class="tag done">Maîtrise confirmée</span></div></div>';
  }
  if(S.kevinStage===0){
    html += '<div class="card kevin"><p class="kt" style="margin:0">Alerte — Comptabilité</p><h3 style="margin-top:4px">Kevin a reçu un e-mail bizarre</h3><p>« URGENT – confirmez votre paie », signé de sa responsable, avec un document joint. Le portail interne d\'Atlas est si mal fichu que Kevin vérifie toujours sa paie par e-mail. Il a le doigt sur la souris.</p><div class="row" style="flex-wrap:wrap"><button class="btn magenta" data-act="kevin-stop">« Kevin, non ! Ne clique pas. »</button><button class="btn" data-act="kevin-open">Le laisser ouvrir</button></div></div>';
  } else if(S.kevinStage===1){
    html += '<div class="card kevin"><p class="kt" style="margin:0">Comptabilité — suite</p><h3 style="margin-top:4px">Kevin a signalé un e-mail tout seul</h3><p>Ce matin, Kevin a reçu un « avis de virement » suspect… et il l\'a signalé au SOC avant d\'y toucher. Une première. Tu confirmes son signalement ?</p><div class="row" style="flex-wrap:wrap"><button class="btn magenta" data-act="kevin-signal">Confirmer : c\'était bien un piège</button><button class="btn" data-act="kevin-ignore">Pas le temps de vérifier</button></div></div>';
  } else if(S.kevinStage===2){
    html += '<div class="card kevin"><p class="kt" style="margin:0">Comptabilité — l\'indice de Kevin</p><h3 style="margin-top:4px">« Au fait, j.martin ne voyage jamais. »</h3><p>Kevin, qui gère les notes de frais, te le glisse au café : j.martin n\'a pas pris un jour de congé ni un train depuis deux ans. Si un jour tu vois son compte se connecter depuis deux pays… tu sauras.</p><div class="row"><button class="btn magenta" data-act="kevin-clue">Noté, merci Kevin</button></div></div>';
  }
  html += '<div class="city"><svg class="skyline" width="100%" height="70" preserveAspectRatio="none" viewBox="0 0 360 70"><path d="M0 70V38h28V22h22v16h18V10h26v28h20V26h24v12h22V18h26v20h20V30h24v8h22V14h28v24h20V70z" fill="#131f47"/></svg><svg class="citylights" width="100%" height="70" preserveAspectRatio="none" viewBox="0 0 360 70"><rect x="12" y="44" width="3" height="4"/><rect x="37" y="28" width="3" height="4"/><rect x="74" y="16" width="3" height="4"/><rect x="84" y="26" width="3" height="4"/><rect x="124" y="32" width="3" height="4"/><rect x="168" y="24" width="3" height="4"/><rect x="178" y="34" width="3" height="4"/><rect x="216" y="36" width="3" height="4"/><rect x="260" y="20" width="3" height="4"/><rect x="270" y="30" width="3" height="4"/><rect x="288" y="44" width="3" height="4"/></svg><div class="zones">';
  ZONES.forEach(function(z){
    if(z.game){
      html += '<button class="zone '+(z.id==="qg"?"hubz":"play")+'" data-act="play" data-game="'+z.game+'">'+z.icon+'<span class="zname">'+z.name+'</span><span class="zamb">'+z.amb+'</span><span class="ztag">'+GAMES[z.game].name+'</span></button>';
    } else {
      html += '<div class="zone lock">'+z.icon+'<span class="zname">'+z.name+'</span><span class="zamb">'+z.amb+'</span><span class="ztag">Bientôt</span></div>';
    }
  });
  html += '</div></div>';
  var pkScen = Object.keys(S.pack.scen).length, pkCards = Object.keys(S.pack.cards).filter(function(k){ return S.pack.cards[k].n>0; }).length;
  html += '<div class="card"><div class="row between"><div><span class="tag reseau">Pack Security+ · Révise pour l\'examen</span><h3 style="margin-top:6px">Réviser comme on joue</h3><p>Scénarios éclair : '+pkScen+' / 18 · Cartes revues : '+pkCards+' / 40'+(S.pack.examPlays ? ' · Mini-examen : meilleur '+S.pack.examBest+' %' : '')+'</p></div></div><button class="btn primary big" data-act="gopack">Ouvrir le Pack Security+</button></div>';
  html += '<div class="card"><div class="row between"><div><span class="tag soc">Le Dojo · Parcours pwn.college adapté</span><h3 style="margin-top:6px">Apprendre le hacking, un dojo à la fois</h3></div></div><button class="btn primary big" data-act="godojo">Ouvrir le Dojo</button></div>';
  html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta — Mentore</div><div class="txt">« Trois secteurs actifs pour l\'instant : le SOC, le QG et le Quartier Réseau. Le reste de la ville ouvrira plus tard. Au travail, '+esc(S.alias)+'. »</div></div></div>'
    + '<div class="mentor" style="margin-top:12px"><div class="ava" style="background:linear-gradient(135deg,#7048E8,#4c2a9e)">DV</div><div><div class="who" style="color:var(--blue)">Directrice Valence — Direction d\'Aegis</div><div class="txt">« Montrez-moi l\'impact. »</div></div></div>'
    + '<div class="mentor" style="margin-top:12px"><div class="ava" style="background:linear-gradient(135deg,#8FA3C4,#5b6b8c)">LC</div><div><div class="who" style="color:var(--blue)">Le Cartographe — il connaît Nexus City par cœur</div><div class="txt">« Je connais chaque chemin. »</div></div></div></div>';
  html += '<p class="sub" style="margin-top:12px">Léo « Zéro » rôde près de la Tour Rouge. ÉCLIPSE aussi, paraît-il.</p>';
  $("view-hub").innerHTML = html;
  bindActions($("view-hub"));
}
function bindActions(root){
  root.querySelectorAll("[data-act]").forEach(function(el){
    el.addEventListener("click", function(){
      var act = el.getAttribute("data-act");
      if(act==="play") startBriefing(el.getAttribute("data-game"));
      if(act==="gomissions") show("missions");
      if(act==="gopack"){ packTab="home"; show("pack"); }
      if(act==="godojo"){ dojoScreen="map"; show("dojo"); }
      if(act==="gostarthere"){ dojoScreen="start"; show("dojo"); }
      if(act==="golum"){ dojoScreen="lum"; show("dojo"); }
      if(act==="gopwp"){ dojoScreen="pwp"; show("dojo"); }
      if(act==="goc101"){ dojoScreen="c101"; show("dojo"); }
      if(act==="goics"){ dojoScreen="ics"; show("dojo"); }
      if(act==="gows"){ dojoScreen="ws"; show("dojo"); }
      if(act==="gocrypto"){ dojoScreen="crypto"; show("dojo"); }
      if(act==="goire"){ dojoScreen="ire"; show("dojo"); }
      if(act==="gops"){ dojoScreen="progsec"; show("dojo"); }
      if(act==="goss"){ dojoScreen="syssec"; show("dojo"); }
      if(act==="gose"){ dojoScreen="softexp"; show("dojo"); }
      if(act==="godsu"){ dojoScreen="dsucamp"; show("dojo"); }
      if(act==="gope"){ dojoScreen="privilege"; show("dojo"); }
      if(act==="goipl"){ dojoScreen="proglang"; show("dojo"); }
      if(act==="goshell"){ dojoScreen="shellart"; show("dojo"); }
      if(act==="gofluffy"){ dojoScreen="fluffyadv"; show("dojo"); }
      if(act==="goci"){ dojoScreen="contentinj"; show("dojo"); }
      if(act==="gopw"){ dojoScreen="pwndamentals"; show("dojo"); }
      if(act==="goww"){ dojoScreen="pwndamentals"; show("dojo"); }
      if(act==="gopt"){ dojoScreen="pwntools"; show("dojo"); }
      if(act==="goqq"){ dojoScreen="quarterly"; show("dojo"); }
      if(act==="godcs"){ dojoScreen="codesprouts"; show("dojo"); }
      if(act==="goxnu"){ dojoScreen="xnudojo"; show("dojo"); }
      if(act==="goarmarch"){ dojoScreen="xnudojo"; show("dojo"); }
      if(act==="goarmdojo"){ dojoScreen="xnudojo"; show("dojo"); }
      if(act==="gofuzz"){ dojoScreen="fuzzdojo"; show("dojo"); }
      if(act==="goaml"){ dojoScreen="amldojo"; show("dojo"); }
      if(act==="gohanto"){ dojoScreen="hantodojo"; show("dojo"); }
      if(act==="simM1"){ sndTap(); startM1("A"); }
      if(act==="gocampaign") openCampaign();
      if(act==="resume" && S.inProgress) resumeGame();
      if(act==="delayed") startDelayed();
      if(act==="kevin-stop"){
        S.kevinDone = true; S.kevinStage = 1; unlockBadge("kevin"); unlockDex("phishing");
        S.credits += 10; save(); sndOk();
        sheet('<h3>Kevin, non !</h3><p>Kevin a lâché sa souris. En regardant de près : le message imitait sa responsable et le portail paie officiel est tellement confus que tout le monde vérifie par e-mail. L\'erreur n\'était pas que de Kevin. L\'e-mail part en analyse, son poste reste propre.</p><p><b style="color:var(--txt)">+10 crédits</b> · Succès débloqué : <b style="color:var(--orange)">Kevin, non !</b></p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Continuer</button></div>');
        renderHub();
      }
      if(act==="kevin-open"){
        S.kevinFailed = true; S.kevinStage = 1; save(); sndBad();
        sheet('<h3>Trop tard.</h3><p>Kevin a cliqué. Le document piégé s\'est ouvert et son poste est compromis : l\'équipe SOC passe la soirée à le réinstaller. Pour sa défense : le message imitait sa responsable et le portail interne est illisible. Kevin suivra la formation phishing — et il retiendra la leçon.</p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Aïe.</button></div>');
        renderHub();
      }
      if(act==="kevin-signal"){
        S.kevinStage = 2; S.credits += 15; save(); sndOk();
        sheet('<h3>Bien vu, Kevin.</h3><p>Son signalement était juste : domaine usurpé, urgence fabriquée. Il a même joint une capture d\'écran nette. La Compta a un nouveau réflexe — et toi, un allié de plus.</p><p><b style="color:var(--txt)">+15 crédits</b></p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Continuer</button></div>');
        renderHub();
      }
      if(act==="kevin-ignore"){
        S.kevinStage = 2; save(); sndTap();
        sheet('<h3>Signalement en attente.</h3><p>Amara l\'a traité une heure plus tard : c\'était bien un piège. Kevin avait raison — la prochaine fois, son signalement mérite une réponse rapide, sinon il cessera de signaler.</p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Continuer</button></div>');
        renderHub();
      }
      if(act==="kevin-clue"){
        S.kevinStage = 3; S.credits += 10; if(unlockDex("brute")){} save(); sndOk();
        sheet('<h3>L\'indice de Kevin.</h3><p>« j.martin ne voyage jamais » : gardé en tête, ce détail rend l\'alerte « deux pays en 20 minutes » limpide. Les gens de terrain voient ce que les consoles ne voient pas.</p><p><b style="color:var(--txt)">+10 crédits</b></p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Continuer</button></div>');
        renderHub();
      }
    });
  });
}