"use strict";
function examBoxHtml(key){
  if(!EXAM_NOTES[key]) return "";
  return '<div class="exambox"><div class="et">Comment cette notion tombe à l\'examen</div><p>'+EXAM_NOTES[key]+'</p></div>';
}
/* ---------- Mode Examen : chrono réel ---------- */
var examTickTimer = null;
function examClockHtml(){
  return S.examMode ? '<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>' : '';
}
function examStartClock(getStart){
  clearInterval(examTickTimer);
  if(!S.examMode) return;
  examTickTimer = setInterval(function(){
    var els = document.querySelectorAll("[data-exam-clock]");
    if(!els.length){ clearInterval(examTickTimer); return; }
    var st = getStart(); if(!st) return;
    var sec = Math.max(0, Math.floor((Date.now()-st)/1000));
    var txt = Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0");
    els.forEach(function(e){ e.textContent = txt; });
  }, 500);
}
function alertsForVariant(v){
  var cfg = TRI_VARIANTS[v % TRI_VARIANTS.length];
  return ALERTS.map(function(a){
    var c = JSON.parse(JSON.stringify(a));
    ["t","host","det","why","hint"].forEach(function(k){ if(c[k]) c[k] = c[k].split("j.martin").join(cfg.user).split("203.0.113.45").join(cfg.ip); });
    if(c.jopts) c.jopts = c.jopts.map(function(o){ return o.split("j.martin").join(cfg.user).split("203.0.113.45").join(cfg.ip); });
    return c;
  });
}
var PHISH_VARIANTS = [
  { label:"Variante 1 — Boîte d'Atlas (semaine A)" },
  { label:"Variante 2 — Nouveaux expéditeurs, mêmes pièges" },
  { label:"Variante 3 — Autres adresses, autres montants" }
];
function emailsForVariant(v){
  var n = ((v % 3) + 3) % 3;
  var list = JSON.parse(JSON.stringify(EMAILS));
  if(n===1){
    list[0].time = "08:14";
    list[1].addr = "paie@atlas-log1stics.example"; list[1].time = "08:29";
    list[1].body = "URGENT : le virement de paie de 2 140 € n'a pas pu partir. Confirmez vos identifiants dans l'heure, sinon le paiement sera annulé.\n\nCliquez sur le lien ci-dessous et ouvrez le document joint pour vérifier vos informations.";
    list[1].link.real = "hxxp://paie-secure.example/verifier"; list[1].attach = "Bulletin_nov.docm";
    list[1].hint = "« log1stics »… avec un 1 à la place du i. Et ce .docm, tu en penses quoi ?";
    list[1].why = "Domaine usurpé (log1stics avec un 1), urgence fabriquée autour d'un montant précis, lien vers un faux site et pièce jointe .docm : phishing classique.";
    list[2].from = "L. Fabre — Manager"; list[2].time = "09:18";
    list[2].body = "Bonjour à tous,\n\nRéunion d'équipe jeudi à 10h en salle B, comme d'habitude. Ordre du jour : point sur les livraisons de décembre.\n\nÀ jeudi,\nL. Fabre";
    list[3].addr = "pdg@atlas-logistics-help.example"; list[3].time = "09:52";
    list[3].body = "Je suis en réunion avec un partenaire, je ne peux pas parler. J'ai besoin que vous fassiez un virement de 18 400 €, urgent et confidentiel, aujourd'hui même.\n\nNe le dites à personne, je vous expliquerai après. Répondez-moi vite.";
    list[3].hint = "Un PDG qui écrit depuis « atlas-logistics-help » et demande le secret ?";
    list[3].why = "Fraude au président (BEC) : domaine inventé, urgence, montant précis (18 400 €) et secret exigé. On ne vire jamais sur un simple e-mail.";
    list[4].from = "Yanis — Logistique"; list[4].addr = "colis@atlas-logistcs.example"; list[4].time = "10:24";
    list[4].attach = "Photos_seminaire_2026.zip";
    list[4].body = "Salut !\n\nVoici les photos du séminaire de la semaine dernière, tout est dans le fichier joint. Il y en a des bonnes !\n\nYanis";
    list[4].hint = "L'adresse a l'air presque normale. Presque. Relis-la lettre par lettre : « logistcs ».";
    list[4].why = "Spear phishing : adresse presque identique (atlas-logistcs, lettres inversées) et pièce jointe .zip. Le contenu sympa ne rend pas le fichier sûr.";
    list[5].time = "11:42";
  }
  if(n===2){
    list[0].time = "07:58";
    list[1].addr = "paie@atlas-l0gistcs.example"; list[1].time = "08:41";
    list[1].body = "URGENT : votre paie de 2 087 € est en attente de validation. Confirmez vos identifiants dans l'heure, sinon votre virement sera bloqué.\n\nCliquez sur le lien ci-dessous et ouvrez le document joint pour vérifier vos informations.";
    list[1].link.real = "hxxp://atlas-paie.example/connexion"; list[1].attach = "Verification_paie.docm";
    list[1].hint = "« l0gistcs »… un zéro, et des lettres mélangées. Et ce .docm, tu en penses quoi ?";
    list[1].why = "Domaine usurpé (l0gistcs, zéro et lettres inversées), urgence fabriquée, lien vers un faux site et pièce jointe .docm : phishing classique.";
    list[2].from = "M. Aubert — Manager"; list[2].time = "09:27";
    list[2].body = "Bonjour à tous,\n\nRéunion d'équipe jeudi à 10h en salle B, comme d'habitude. Ordre du jour : point sur les livraisons de décembre.\n\nÀ jeudi,\nM. Aubert";
    list[3].addr = "pdg@atlas-logistics-support.example"; list[3].time = "10:03";
    list[3].body = "Je suis en déplacement, injoignable au téléphone. J'ai besoin que vous fassiez un virement de 24 900 €, urgent et confidentiel, aujourd'hui même.\n\nNe le dites à personne, je vous expliquerai après. Répondez-moi vite.";
    list[3].why = "Fraude au président (BEC) : domaine inventé, urgence, montant précis (24 900 €) et secret exigé. On ne vire jamais sur un simple e-mail.";
    list[4].from = "Nadia — Logistique"; list[4].addr = "colis@atIas-logistics.example"; list[4].time = "10:37";
    list[4].attach = "Seminaire_photos.zip";
    list[4].body = "Salut !\n\nVoici les photos du séminaire de la semaine dernière, tout est dans le fichier joint. Il y en a des bonnes !\n\nNadia";
    list[4].hint = "L'adresse a l'air presque normale. Presque. Ce « I » majuscule dans « atIas », tu le vois ?";
    list[4].why = "Spear phishing : adresse presque identique (atIas-logistics, avec un I majuscule à la place du l) et pièce jointe .zip. Le contenu sympa ne rend pas le fichier sûr.";
    list[5].time = "11:15";
  }
  /* Les justifications citent des domaines précis : on les aligne sur la variante. */
  list.forEach(function(m){ m._variant = n; });
  return list;
}
var DEF_VARIANTS = [
  { label:"Variante 1 — Trafic de la semaine A" },
  { label:"Variante 2 — Autres attaques, mêmes zones" },
  { label:"Variante 3 — Le trafic change de visage" }
];
function wavesForVariant(v){
  var n = ((v % 3) + 3) % 3;
  var list = JSON.parse(JSON.stringify(WAVES));
  if(n===1){
    list[0].label = "Visiteurs du site Web (campagne pub)";
    list[1].label = "Scan de ports étendu — 2 000 ports";
    list[3].label = "Force brute sur SSH";
    list[3].why = "Le SSH ne doit jamais être exposé : un pare-feu à l'entrée ou avant le réseau interne arrête la force brute.";
    list[4].label = "Attaque XSS sur le site Web";
    list[4].why = "Le WAF est fait pour ça : il filtre les requêtes Web malveillantes (ici du script injecté) avant qu'elles touchent le serveur.";
    list[5].label = "Exfiltration par requêtes DNS longues";
    list[6].label = "Botnet qui scanne — diversion d'ÉCLIPSE";
    list[7].label = "Navigation des employés (visio de 14 h)";
  }
  if(n===2){
    list[0].label = "Clients sur la page de suivi de colis";
    list[1].label = "Balayage de vulnérabilités externe";
    list[1].why = "Un pare-feu à l'entrée ferme les ports avant le balayage. Un IDS voit le balayage, mais ne le bloque pas.";
    list[2].label = "E-mails des fournisseurs";
    list[3].label = "Force brute sur VPN";
    list[3].why = "Le VPN est une porte d'entrée : un pare-feu à l'entrée ou avant le réseau interne arrête la force brute avant qu'elle atteigne les comptes.";
    list[4].label = "Injection SQL sur le site Web";
    list[5].label = "Exfiltration par DNS";
    list[6].label = "Faux trafic massif — diversion d'ÉCLIPSE";
    list[7].label = "Mise à jour des postes des employés";
    list[7].why = "Un pare-feu trop strict sur le réseau interne empêche les postes de se mettre à jour : le service s'effondre.";
  }
  return list;
}
var BADGEDATA = [
  { id:"oeil", name:"Œil de nuit", desc:"Terminer le tri d'alertes sans aucune escalade inutile." },
  { id:"fauxpos", name:"Pas mon faux positif", desc:"Bien classer 50 faux positifs au total." },
  { id:"kevin", name:"Kevin, non !", desc:"Empêcher Kevin de la Compta de cliquer sur un e-mail piégé." }
];