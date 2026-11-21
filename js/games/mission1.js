"use strict";
/* ================= MISSION 1 — ALERTE A 03H12 (Tome 2) =================
   La Mission 1 est le prologue du jeu : elle remplace l'ancien cold open
   (une seule ouverture, pas de doublon). L'épisode 1 Atlas de la campagne
   renvoie vers sa variante A. Le mini-jeu de tri reste l'outil de tri. */
var M1A_ALERTS = [
  { id:"sauv", t:"Volume sortant élevé", host:"SRV-SAUVEGARDE", time:"03:00",
    det:"Sauvegarde nocturne : le volume copié cette nuit est plus élevé que d'habitude, vers le stockage interne d'Atlas.",
    ans:"fp", why:"Sauvegarde nocturne planifiée, inscrite au calendrier de maintenance : faux positif. Le volume s'explique par la clôture mensuelle." },
  { id:"ps", t:"PowerShell encodé lancé depuis Office", host:"CE-07", time:"03:09",
    det:"Événement 4688 : powershell.exe avec l'argument -enc (tronqué). Processus parent : WINWORD.EXE. Utilisateur : j.mbaye.",
    ans:"esc", why:"C'est le début de l'attaque : un document piégé, ouvert par le chef d'équipe, vient de lancer PowerShell." },
  { id:"scan", t:"Scan de ports interne", host:"SCANNER-VULN", time:"02:30",
    det:"Balayage de ports sur les plages internes, lancé depuis l'outil officiel de l'équipe informatique.",
    ans:"fp", why:"Scan de vulnérabilités planifié par l'équipe informatique, depuis son outil habituel : faux positif." }
];
var M1_JOURNAL = [
  { time:"22:41:07", src:"PASSERELLE-MAIL", txt:"LIVRÉ — de paie@atlas-l0gistics.example à j.mbaye@atlas-logistics.example · objet « URGENT : confirmez votre paie » · pièce jointe Paie_nov.docm" },
  { time:"03:05:44", src:"CE-07", txt:"4688 — Processus WINWORD.EXE · Parent explorer.exe · Utilisateur j.mbaye" },
  { time:"03:06:30", src:"PASSERELLE-MAIL", txt:"TRANSFÉRÉ — de j.mbaye à k.diallo@atlas-logistics.example · pièce jointe Paie_nov.docm", late:true },
  { time:"03:09:12", src:"CE-07", txt:"4688 — Processus powershell.exe · Parent WINWORD.EXE · Arguments -enc (tronqué)" },
  { time:"03:09:40", src:"PARE-FEU", txt:"AUTORISÉ — src CE-07 · dst 203.0.113.45:443 · domaine maj-service-paie.example (âge : 2 jours)" },
  { time:"03:10:21", src:"CE-03", txt:"4688 — Processus powershell.exe · Parent WINWORD.EXE · Utilisateur k.diallo", late:true },
  { time:"03:12:20", src:"SIEM", txt:"ALERTE — règle PowerShell_encodé_depuis_Office · hôte CE-07 · priorité haute" }
];
var M1_PHRASES = [
  { txt:"Un poste du quai 4 a ouvert un document piégé reçu par e-mail ; il est isolé depuis 03h18.", good:true },
  { txt:"Le quai 4 est ralenti ; les expéditions de 4 h ne sont pas menacées à ce stade.", good:true },
  { txt:"Un second poste est concerné ; nous le traitons.", good:true },
  { txt:"Nous avons besoin de votre accord pour changer un mot de passe de service dans la matinée.", good:true },
  { txt:"À ce stade, nous n'avons pas de preuve de sortie de données ; la vérification continue.", good:true },
  { txt:"Nous avons été piratés par ÉCLIPSE.", good:false },
  { txt:"C'est la faute de Joël, il a ouvert la pièce jointe.", good:false },
  { txt:"Tout est sous contrôle, il n'y a aucun risque.", good:false }
];
var M1_ERAD = [
  { id:"compte", txt:"Réinitialiser le mot de passe du compte de service exposé" },
  { id:"domaine", txt:"Bloquer le domaine maj-service-paie.example" },
  { id:"tache", txt:"Supprimer la tâche planifiée « MajService »" },
  { id:"restaurer", txt:"Restaurer le poste CE-07" }
];
var M1V = {
  B:{ title:"Variante B · Le faux fournisseur", org:"Atlas Logistics — Service comptabilité",
    intro:"Changement de décor, même nuit. À la comptabilité, Nadia Perrin gère les paiements fournisseurs. Un virement de 48 000 € vers « Transports Delmas » est programmé à 8 h. Et trois alertes viennent de tomber sur son périmètre.",
    charName:"Nadia Perrin — Comptabilité", charQuote:"Je n'ai rien cliqué de grave… enfin, juste une page de connexion qui m'a demandé mon mot de passe.",
    alerts:[
      { t:"Connexion depuis un pays inhabituel", host:"Compte a.perrin", time:"03:12",
        det:"Connexion réussie depuis l'extérieur, d'un pays où Nadia Perrin ne s'est jamais connectée. Compte sans MFA.",
        ans:"esc", why:"Une connexion réussie depuis un pays inhabituel, sur un compte sans MFA : c'est le point d'entrée probable." },
      { t:"Règle de transfert automatique créée", host:"Messagerie — a.perrin", time:"03:14",
        det:"Nouvelle règle : tout message contenant « facture », « virement » ou « RIB » est copié vers une adresse externe inconnue.",
        ans:"esc", why:"Deux minutes après la connexion : l'attaquant s'installe. Cette règle cherche précisément les informations de paiement." },
      { t:"Mise à jour planifiée du serveur comptable", host:"SRV-COMPTA", time:"02:00",
        det:"Correctifs signés, fenêtre de maintenance habituelle du serveur comptable.",
        ans:"fp", why:"Mise à jour planifiée, dans sa fenêtre habituelle : faux positif." }
    ],
    firstIdx:0,
    entryTitle:"Ce que l'enquête montre déjà",
    entryBody:"À 02:41 cette nuit, un e-mail « Mettez à jour vos accès » arrive chez Nadia, avec un lien vers une page de connexion qui imite celle d'Atlas. À 02:50, une connexion réussit depuis l'extérieur. Le compte de Nadia n'a pas de MFA : le mot de passe seul a suffi. Et les coordonnées bancaires de « Transports Delmas » ont été modifiées dans la nuit.",
    dec1q:"Le compte de Nadia est compromis. Tu fais quoi, tout de suite ?",
    dec1:[
      { txt:"Réinitialiser le mot de passe seulement", pts:8, pen:0, conseq:"Le mot de passe change — mais la session déjà ouverte par l'attaquant reste valable, et la règle de transfert continue de copier les factures vers l'extérieur. Il faudra y revenir en urgence." },
      { txt:"Réinitialiser le mot de passe, révoquer toutes les sessions et supprimer la règle de transfert", pts:25, pen:0, conseq:"Mot de passe réinitialisé, sessions révoquées, règle supprimée : l'attaquant perd ses trois moyens de rester. C'est l'éradication complète, pas un pansement." },
      { txt:"Laisser agir encore un peu, pour identifier tous les destinataires", pts:0, pen:5, conseq:"À 03:20, pendant que tu observes, un message part au fournisseur pour lui demander de valider un changement de compte bancaire. Observer un compte de paiement compromis, ça se paie comptant." }
    ],
    justq:"Quel indice justifie de tout révoquer, et pas seulement le mot de passe ?",
    justopts:["La règle de transfert survit à un changement de mot de passe, et une session déjà ouverte reste ouverte", "L'alerte est arrivée à 03:14, en pleine nuit", "Nadia travaille à la comptabilité depuis longtemps"],
    justok:0,
    dec2q:"Le virement de 48 000 € vers « Transports Delmas » part à 8 h. Ses coordonnées bancaires ont été modifiées cette nuit. Tu fais quoi ?",
    dec2:[
      { txt:"Suspendre le virement et rappeler le fournisseur sur le numéro déjà connu, pour vérifier hors canal", pts:15, conseq:"Virement suspendu, fournisseur rappelé sur son numéro habituel : le « nouveau RIB » n'était pas le sien. Les 48 000 € restent chez Atlas, et la procédure de double validation des changements de coordonnées devient la règle." },
      { txt:"Laisser partir : le virement était programmé avant l'incident", pts:0, conseq:"À 8 h, le virement part — vers le compte de l'attaquant. 48 000 € perdus, révélés au grand jour dans ce debrief : un RIB modifié la nuit d'une compromission ne se laisse jamais passer sans vérification hors canal." },
      { txt:"Demander à Nadia de confirmer par e-mail que tout est normal", pts:4, conseq:"Nadia confirme… depuis la boîte que l'attaquant lisait encore il y a une heure. Le virement finit suspendu de justesse par la banque, après une matinée d'appels. Vérifier par le canal compromis, ce n'est pas vérifier." }
    ],
    examKey:"m1b"
  },
  C:{ title:"Variante C · La clé du parking", org:"Atlas Logistics — Bureaux, clôture mensuelle",
    intro:"Kevin Martin termine la clôture mensuelle de nuit, aux bureaux. Sur le parking, il a trouvé une clé USB étiquetée « Salaires 2026 ». Il l'a branchée. Trois alertes viennent de tomber.",
    charName:"Kevin Martin — Comptabilité", charQuote:"Euh, j'ai un message d'erreur bizarre sur mon PC… Je l'ai signalé, c'est bien, non ?",
    charReply:"C'est très bien, Kevin. C'est même exactement ce qu'il fallait faire.",
    alerts:[
      { t:"Exécutable lancé depuis un support amovible", host:"CE-12", time:"03:09",
        det:"« Salaires_2026.pdf.exe » lancé depuis une clé USB branchée quelques minutes plus tôt.",
        ans:"esc", why:"Un exécutable déguisé en PDF (double extension), lancé depuis une clé trouvée sur un parking : c'est le point d'entrée." },
      { t:"Nouvelle tâche planifiée", host:"CE-12", time:"03:10",
        det:"Une tâche planifiée vient d'être créée sur CE-12, une minute après le lancement de l'exécutable.",
        ans:"esc", why:"Une minute après l'exécution : la persistance s'installe. Cette tâche relancera le programme même après un redémarrage." },
      { t:"Mise à jour antivirus planifiée", host:"CE-12", time:"03:00",
        det:"Mise à jour des signatures antivirus, planifiée chaque nuit à 03:00.",
        ans:"fp", why:"Mise à jour antivirus planifiée, à son heure habituelle : faux positif." }
    ],
    firstIdx:0,
    entryTitle:"Ce que l'enquête montre déjà",
    entryBody:"Le fichier s'appelle « Salaires_2026.pdf.exe » : la double extension est le déguisement — Windows masque le .exe, l'icône imite un PDF. Depuis CE-12, les journaux montrent des tentatives de connexion SMB vers douze postes du segment Bureaux. Kevin, lui, a fait ce qu'il fallait : il a vu le message d'erreur et il a signalé, tout de suite.",
    dec1q:"CE-12 est compromis et il a déjà essayé de toucher douze postes. Tu isoles quoi ?",
    dec1:[
      { txt:"Isoler CE-12 seulement", pts:10, pen:0, conseq:"CE-12 est isolé — mais deux autres postes du segment avaient déjà répondu aux tentatives SMB. Il faut les retrouver un par un, pendant que la paie attend." },
      { txt:"Isoler le segment Bureaux entier", pts:25, pen:0, conseq:"Le segment Bureaux est isolé : la propagation s'arrête net. Les bureaux restent hors ligne une trentaine de minutes et la clôture de la paie prend du retard — un coût réel, mais borné." },
      { txt:"Isoler tout le site d'Atlas", pts:8, pen:5, conseq:"Tout le site est isolé, expéditions comprises — alors que le segment Entrepôt n'avait aucun signe de compromission. Les camions restent à quai pour rien : contenir large rassure, contenir juste protège." }
    ],
    justq:"Quel indice justifie d'isoler plus large que le seul poste de Kevin ?",
    justopts:["Les tentatives de connexion SMB de CE-12 vers douze postes de son segment", "La clé USB était étiquetée « Salaires 2026 »", "Kevin a déjà cliqué sur un e-mail piégé par le passé"],
    justok:0,
    dec2q:"Kevin est au téléphone, un peu honteux. Tu lui réponds quoi ?",
    dec2:[
      { txt:"« C'est très bien, Kevin. C'est même exactement ce qu'il fallait faire : signaler vite nous a fait gagner la nuit. »", pts:15, conseq:"Kevin raccroche soulagé — et la prochaine fois, il signalera encore plus tôt. C'est comme ça qu'une culture du signalement se construit : jamais en punissant celui qui prévient." },
      { txt:"« La prochaine fois, ne branche plus rien, c'est tout. »", pts:7, conseq:"C'est vrai, mais incomplet : Kevin retient la règle, pas la confiance. Le prochain message d'erreur bizarre, il hésitera peut-être avant d'appeler." },
      { txt:"« Tu te rends compte des dégâts, j'espère ? »", pts:0, conseq:"Kevin raccroche en s'excusant — et décide, au fond de lui, que la prochaine erreur bizarre restera sur son écran, sans appel. Le blâme vient de coûter au SOC ses prochains signalements." }
    ],
    examKey:"m1c"
  }
};
var m1 = null, m1Timer = null;
function m1Grade(score){
  if(score>=85) return "Excellent";
  if(score>=70) return "Solide";
  if(score>=50) return "À consolider";
  return "À retenter";
}
function startM1(variant){
  clearInterval(m1Timer);
  m1 = { variant:variant, step:"intro", start:Date.now(),
    tri:{ classified:{}, firstOpened:-1, view:-1 },
    emailFound:false, journalSeen:false, mailSeen:false,
    d1:null, d1Timeout:false, d1Just:-1, d1Mind:-1,
    widened:false, foundCE03:false, restoredEarly:false,
    eradOrder:[], msgSel:[], hintsUsed:0,
    vent:false, vdec1:-1, vjust:-1, vdec2:-1 };
  show("cold");
  renderM1();
}
function m1Head(title){
  return '<div class="ghead"><button class="quit" id="m1Quit" aria-label="Quitter">✕</button><div class="ttl">'+title+'</div>'+(S.examMode?'<div class="timer" data-exam-clock title="Chrono réel — Mode Examen">0:00</div>':'')+'</div>';
}
function m1Alerts(){ return m1.variant==="A" ? M1A_ALERTS : M1V[m1.variant].alerts; }
function m1BindQuit(dest){
  var q = $("m1Quit"); if(q) q.addEventListener("click", function(){ msClearType(); clearInterval(m1Timer); show(dest||"missions"); });
}
function renderM1(){
  msClearType();
  examStartClock(function(){ return m1 ? m1.start : null; });
  if(m1.variant==="A") renderM1A();
  else renderM1V();
}
function m1PhaseIdx(){
  var order = { intro:0, tri:1, corr:2, corrq:2, entry:2, d1:3, d1q:3, dec1:3, dec1c:3,
    inv:4, erad:5, dec2:4, msg:6, debrief:7 };
  return order[m1.step] !== undefined ? order[m1.step] : 0;
}
function m1ClockLabel(){
  var mins = 192 + Math.round(45 * m1PhaseIdx() / 7); /* 03:12 → 04:00 */
  return String(Math.floor(mins/60)).padStart(2,"0")+":"+String(mins%60).padStart(2,"0");
}
function nightBarHtml(){
  return '<div class="nightbar"><div class="nb-l"><span>03:12 — début de nuit</span><span>'
    + m1ClockLabel() + ' · relève 04:00</span></div><div class="nb-t"><i style="width:'
    + Math.round(100*m1PhaseIdx()/7) + '%"></i></div></div>';
}
/* ---------- tri partagé (A, B, C) ---------- */
function renderM1Tri(title, sub, nextLabel){
  var alerts = m1Alerts();
  var html = "";
  if(m1.tri.view >= 0){
    var a = alerts[m1.tri.view];
    html += m1Head(title);
    html += nightBarHtml();
    html += '<div class="stepct">'+sub+'</div><div class="progressline"><i style="width:'+Math.round(100*Object.keys(m1.tri.classified).length/3)+'%"></i></div>';
    html += '<div class="alertcard"><span class="tag">Alerte SIEM</span><div class="at">'+a.t+'</div>'
      + '<div class="meta"><span>Source : <b>'+a.host+'</b></span><span>Heure : <b>'+a.time+'</b></span></div>'
      + '<div class="details on">'+a.det+'</div></div>';
    html += '<div class="trio"><button data-mc="fp">'+ICONS.check+'Faux positif</button><button data-mc="surv">'+ICONS.warn+'À surveiller</button><button data-mc="esc">'+ICONS.up+'Escalader</button></div>';
    html += '<button class="btn big" id="m1BackList" style="margin-top:10px">Retour aux alertes</button>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    $("m1BackList").addEventListener("click", function(){ m1.tri.view = -1; sndTap(); renderM1(); });
    document.querySelectorAll("#view-cold [data-mc]").forEach(function(b){
      b.addEventListener("click", function(){
        b.classList.add("ms-tap");
        m1.tri.classified[m1.tri.view] = b.getAttribute("data-mc");
        m1.tri.view = -1; sndTap(); renderM1();
      });
    });
    return;
  }
  html += m1Head(title);
    html += nightBarHtml();
  html += '<div class="stepct">'+sub+'</div><div class="progressline"><i style="width:'+Math.round(100*Object.keys(m1.tri.classified).length/3)+'%"></i></div>';
  alerts.forEach(function(a, i){
    var c = m1.tri.classified[i];
    html += '<button class="m1alert" data-ma="'+i+'"><div class="at2">'+a.t+'</div><div class="am">'+a.host+' · '+a.time+'</div>'
      + (c ? '<div style="margin-top:6px"><span class="tag">'+(c==="fp"?"Classée : faux positif":c==="surv"?"Classée : à surveiller":"Classée : escaladée")+'</span></div>' : '<div style="margin-top:6px"><span class="tag">À classer</span></div>')
      + '</button>';
  });
  var doneCount = Object.keys(m1.tri.classified).length;
  html += '<button class="btn primary big" id="m1TriNext" '+(doneCount>=3?'':'disabled')+'>'+nextLabel+'</button>';
  $("view-cold").innerHTML = html;
  m1BindQuit();
  document.querySelectorAll("#view-cold [data-ma]").forEach(function(b){
    b.addEventListener("click", function(){
      b.classList.add("ms-tap");
      var i = +b.getAttribute("data-ma");
      if(m1.tri.firstOpened < 0) m1.tri.firstOpened = i;
      m1.tri.view = i; sndTap(); renderM1();
    });
  });
  var nx = $("m1TriNext");
  if(nx) nx.addEventListener("click", function(){
    sndTap();
    if(m1.variant==="A") m1.step = "corr"; else m1.step = "entry";
    renderM1();
  });
}
function m1TriScore(){
  var alerts = m1Alerts(), correct = 0, fpEsc = 0;
  alerts.forEach(function(a, i){
    if(m1.tri.classified[i] === a.ans) correct++;
    if(a.ans==="fp" && m1.tri.classified[i]==="esc") fpEsc++;
  });
  var firstIdx = m1.variant==="A" ? 1 : M1V[m1.variant].firstIdx;
  return { correct:correct, fpEsc:fpEsc, firstOk:(m1.tri.firstOpened===firstIdx) };
}
/* ---------- variante A : déroulé complet en 7 phases ---------- */
function renderM1A(){
  var html = "";
  if(m1.step==="intro"){
    html += '<div class="ghead"><div class="ttl">Atlas Logistics — entrepôt de nuit</div></div>';
    html += '<div class="clock">03:12</div><p class="sub" style="text-align:center">Écran noir, bruit d\'entrepôt au loin. Ton téléphone vibre. Tu as 45 minutes de temps de jeu (accéléré) avant la relève de 04h00.</p>';
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta — appel entrant</div><div class="txt">« <span class="ms-tw typing" id="m1Tw"></span> »</div></div></div></div>';
    html += '<button class="btn primary big" id="m1Go">Décrocher — voir les trois alertes</button>';
    $("view-cold").innerHTML = html;
    msTypeEl($("m1Tw"), 'Recrue ? Désolée pour l\'heure. Atlas Logistics, entrepôt de nuit. Trois alertes viennent de tomber. Dis-moi par laquelle tu commencerais.');
    $("m1Go").addEventListener("click", function(){ m1.step="tri"; sndTap(); renderM1(); });
    return;
  }
  if(m1.step==="tri"){
    renderM1Tri("Mission 1 — Alerte à 03h12", "Phase 1 · Briefing et tri — touche une alerte pour l'ouvrir, puis classe-la. En mode normal, aucun verdict n'est coloré avant le debrief.", "Passer à la corrélation");
    return;
  }
  if(m1.step==="corr"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 2 · Corrélation — d\'où vient ce PowerShell ?</div>';
    if(m1.tri.classified[0] !== "fp"){
      html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="m1Tw"></span> »</div></div></div></div>';
    }
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="m1TwB"></span> »</div></div></div></div>';
    html += '<div class="alertcard"><span class="tag">Alerte SIEM — détail</span><div class="at">PowerShell encodé lancé depuis Office</div><div class="meta"><span>Source : <b>CE-07</b></span><span>Heure : <b>03:09</b></span></div><div class="details on">Processus parent de powershell.exe : <b style="color:var(--txt)">WINWORD.EXE</b>. Un document Word a lancé PowerShell. Reste à trouver le document — et comment il est arrivé.</div></div>';
    html += '<h2 style="margin-bottom:2px">Journal de la nuit</h2><div class="jlog">';
    M1_JOURNAL.filter(function(j){ return !j.late; }).forEach(function(j){
      html += '<div class="jl"><b>'+j.time+'</b><span>'+j.src+' — '+j.txt+'</span></div>';
    });
    html += '</div>';
    html += '<h2 style="margin-bottom:2px">Boîte mail de j.mbaye</h2>';
    html += '<div class="card mailview"><div class="from">De : <b>Service Paie</b><br>paie@atlas-l0gistics.example · 22:41</div><div class="subj">URGENT : confirmez votre paie</div><div class="body">Un document de paie, reçu à 22:41 — quelques heures avant que Word ne lance PowerShell sur CE-07. Le domaine expéditeur s\'écrit « l0gistics », avec un zéro.</div></div>';
    html += '<div class="jopts">'
      + '<button data-corr="link">Relier cet e-mail à l\'alerte : c\'est le point d\'entrée probable</button>'
      + '<button data-corr="skip">Aucun lien évident — passer à la décision</button></div>';
    $("view-cold").innerHTML = html;
    msTypeEl($("m1Tw"), 'Regarde le calendrier de maintenance. Cette sauvegarde est prévue. Cherche ce qui n\'est écrit nulle part.');
    msTypeEl($("m1TwB"), 'PowerShell lancé par Word, à 3 h du matin. Qui a ouvert quoi, et d\'où ça vient ?');
    m1BindQuit();
    m1.journalSeen = true; m1.mailSeen = true;
    document.querySelectorAll("#view-cold [data-corr]").forEach(function(b){
      b.addEventListener("click", function(){
        b.classList.add("ms-tap");
        if(b.getAttribute("data-corr")==="link"){ m1.emailFound = true; m1.step = "corrq"; }
        else { m1.step = "d1"; startM1D1Timer(); }
        sndTap(); renderM1();
      });
    });
    return;
  }
  if(m1.step==="corrq"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 2 · Corrélation</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="m1Tw"></span> »</div></div></div></div>';
    html += '<div class="jq">Quel indice relie l\'e-mail de 22:41 à l\'alerte de 03:09 ?</div><div class="jopts">'
      + '<button data-cq2="0">Le processus parent de PowerShell est WINWORD.EXE, et le document joint à cet e-mail a été ouvert sur CE-07</button>'
      + '<button data-cq2="1">L\'alerte PowerShell est la plus récente des trois</button>'
      + '<button data-cq2="2">L\'objet de l\'e-mail contient le mot URGENT, comme beaucoup d\'alertes</button></div>';
    $("view-cold").innerHTML = html;
    msTypeEl($("m1Tw"), 'Pourquoi celle-là ? Un seul indice suffit.');
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-cq2]").forEach(function(b){
      b.addEventListener("click", function(){
        b.classList.add("ms-tap");
        m1.emailFound = (+b.getAttribute("data-cq2") === 0);
        m1.step = "d1"; sndTap(); startM1D1Timer(); renderM1();
      });
    });
    return;
  }
  if(m1.step==="d1"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 3 · Décision n°1 — le chrono tourne</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">IR</div><div><div class="who">Inès Roussel — Exploitation, au téléphone</div><div class="txt">« <span class="ms-tw typing" id="m1Tw"></span> »</div></div></div></div>';
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="m1TwB"></span> »</div></div></div></div>';
    html += '<div class="timer" id="m1D1Timer" style="text-align:center;font-size:20px">1:00</div>';
    html += '<div class="timetrack"><i id="m1D1Bar" style="width:100%"></i></div>';
    html += '<div class="jq">CE-07 exécute du code inconnu et parle à un domaine créé il y a deux jours. Tu fais quoi ?</div><div class="jopts">'
      + '<button data-d1="iso">Isoler CE-07 du réseau, maintenant</button>'
      + '<button data-d1="obs">Observer dix minutes pour en apprendre plus</button>'
      + '<button data-d1="dom">Bloquer seulement le domaine maj-service-paie.example</button></div>';
    $("view-cold").innerHTML = html;
    msTypeEl($("m1Tw"), 'Si vous coupez le quai 4, j\'ai six cents colis qui attendent. Vous êtes sûrs ?');
    msTypeEl($("m1TwB"), 'Tu as soixante secondes. Il n\'y a pas de réponse parfaite : il y en a une que tu sais défendre.');
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-d1]").forEach(function(b){
      b.addEventListener("click", function(){
        b.classList.add("ms-tap");
        clearInterval(m1Timer);
        m1.d1 = b.getAttribute("data-d1"); m1.step = "d1q"; sndTap(); renderM1();
      });
    });
    return;
  }
  if(m1.step==="d1q"){
    var consA = {
      iso:"CE-07 est isolé : le quai 4 ralentit, les colis attendent un peu — mais rien ne se propage. Contenir tôt a un coût métier, et il est acceptable.",
      obs:"Dix minutes d'observation : pendant ce temps, une connexion part de CE-07 vers le serveur de fichiers. Observer aide à comprendre, mais ça a un prix — et ce prix-là n'a pas été choisi, il a été subi.",
      dom:"Le domaine est bloqué : la connexion se coupe… six minutes. Puis CE-07 parle à un second domaine, inconnu lui aussi. Bloquer un indicateur n'est pas éradiquer."
    };
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 3 · Décision n°1 — conséquence</div>';
    html += '<div class="conseq ms-enter">'+(m1.d1Timeout ? "Le chrono est tombé à zéro : sans décision, l'observation s'est imposée d'elle-même. " : "")+consA[m1.d1]+'</div>';
    if(m1.d1Just < 0){
      html += '<div class="jq">Quel indice défend ton choix ?</div><div class="jopts">'
        + '<button data-dj="0">Le processus parent : WINWORD.EXE a lancé PowerShell — un document Office ne fait pas ça tout seul</button>'
        + '<button data-dj="1">L\'heure : 03h09, tout l\'entrepôt dort</button>'
        + '<button data-dj="2">Le volume inhabituel de la sauvegarde de 03:00</button></div>';
    } else if(m1.d1Mind < 0){
      html += '<div class="jq">Qu\'est-ce qui te ferait changer d\'avis ?</div><div class="jopts">'
        + '<button data-dm="0">Si un second poste montre le même processus parent, j\'élargis le confinement</button>'
        + '<button data-dm="1">Rien : une décision prise ne se discute plus</button>'
        + '<button data-dm="2">Si Inès insiste assez fort au téléphone</button></div>';
    } else {
      html += '<button class="btn primary big" id="m1ToEnq">Passer à l\'enquête</button>';
    }
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-dj]").forEach(function(b){
      b.addEventListener("click", function(){ m1.d1Just = +b.getAttribute("data-dj"); sndTap(); renderM1(); });
    });
    document.querySelectorAll("#view-cold [data-dm]").forEach(function(b){
      b.addEventListener("click", function(){ m1.d1Mind = +b.getAttribute("data-dm"); sndTap(); renderM1(); });
    });
    var te = $("m1ToEnq"); if(te) te.addEventListener("click", function(){ m1.step="enq"; sndTap(); renderM1(); });
    return;
  }
  if(m1.step==="enq"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 4 · Enquête — qui d\'autre est touché ?</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">JM</div><div><div class="who">Joël Mbaye — quai 4, au téléphone</div><div class="txt">« Allô ? C\'est Joël, quai 4. Mon terminal rame depuis tout à l\'heure. Oui, j\'ai ouvert un document de paie… Il y a un problème ? »</div></div></div></div>';
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« Bien. Maintenant : qui d\'autre a reçu ce message ? »</div></div></div></div>';
    html += '<h2 style="margin-bottom:2px">Journal de la nuit — vue élargie</h2><div class="jlog">';
    M1_JOURNAL.forEach(function(j){
      html += '<div class="jl'+(j.late?' newrow':'')+'"><b>'+j.time+'</b><span>'+j.src+' — '+j.txt+'</span></div>';
    });
    html += '</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">LZ</div><div><div class="who">Léo « Zéro » — hacker éthique</div><div class="txt">« Si j\'étais l\'attaquant, je laisserais une tâche planifiée. Je dis ça, je dis rien. »</div></div></div></div>';
    html += '<div class="jq">Le journal élargi montre que Joël a transféré le document à k.diallo — et que CE-03 a lancé le même PowerShell à 03:10. Tu fais quoi ?</div><div class="jopts">'
      + '<button data-enq="widen">Élargir l\'enquête : isoler aussi CE-03 et lister tous les destinataires du document</button>'
      + '<button data-enq="focus">Rester sur CE-07 : c\'est le poste d\'origine, ça suffit</button>'
      + '<button data-enq="restore">Restaurer CE-07 tout de suite pour relancer le quai 4</button></div>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-enq]").forEach(function(b){
      b.addEventListener("click", function(){
        var c = b.getAttribute("data-enq");
        if(c==="widen"){ m1.widened = true; m1.foundCE03 = true; }
        if(c==="restore"){ m1.restoredEarly = true; }
        m1.step = "erad"; sndTap(); renderM1();
      });
    });
    return;
  }
  if(m1.step==="erad"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 5 · Éradication — dans quel ordre ?</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« On ne restaure pas tant qu\'on n\'a pas compris comment il compte revenir. »</div></div></div></div>';
    html += '<p class="sub">L\'enquête a trouvé la persistance : un compte de service exposé et une tâche planifiée « MajService » qui relancerait l\'attaque. Touche les actions dans l\'ordre où tu les ferais.</p>';
    M1_ERAD.forEach(function(a){
      var pos = m1.eradOrder.indexOf(a.id);
      html += '<button class="eradaction" data-erad="'+a.id+'" '+(pos>=0?'disabled':'')+'>'+(pos>=0?'<span class="ord">'+(pos+1)+'</span>':'')+a.txt+'</button>';
    });
    html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="m1EradReset">Recommencer l\'ordre</button><button class="btn primary" style="flex:1" id="m1EradGo" '+(m1.eradOrder.length>=4?'':'disabled')+'>Valider l\'ordre</button></div>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-erad]").forEach(function(b){
      b.addEventListener("click", function(){ m1.eradOrder.push(b.getAttribute("data-erad")); sndTap(); renderM1(); });
    });
    var rs = $("m1EradReset"); if(rs) rs.addEventListener("click", function(){ m1.eradOrder = []; renderM1(); });
    var go2 = $("m1EradGo"); if(go2) go2.addEventListener("click", function(){ m1.step="msg"; sndTap(); renderM1(); });
    return;
  }
  if(m1.step==="msg"){
    html += m1Head("Mission 1 — Alerte à 03h12");
    html += nightBarHtml();
    html += '<div class="stepct">Phase 6 · Communication — le message à la direction</div>';
    html += '<div class="card"><div class="mentor"><div class="ava">IR</div><div><div class="who">Inès Roussel — Exploitation</div><div class="txt">« Donnez-moi cinq lignes : ce qui s\'est passé, ce que ça change pour moi, ce que vous faites, ce dont vous avez besoin. »</div></div></div></div>';
    html += '<p class="sub">Touche les phrases pour composer le message — exactement cinq lignes. Chaque phrase est jugée sur le fond, pas sur le style. Lignes choisies : <b style="color:var(--txt)">'+m1.msgSel.length+' / 5</b></p>';
    M1_PHRASES.forEach(function(p, i){
      var pos = m1.msgSel.indexOf(i);
      html += '<button class="phrase'+(pos>=0?' sel':'')+'" data-ph="'+i+'">'+(pos>=0?'<span class="pn ms-tap">Ligne '+(pos+1)+'</span>':'')+esc(p.txt)+'</button>';
    });
    html += '<button class="btn primary big" id="m1MsgGo" style="margin-top:10px" '+(m1.msgSel.length===5?'':'disabled')+'>Envoyer le message — passer au debrief</button>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-ph]").forEach(function(b){
      b.addEventListener("click", function(){
        b.classList.add("ms-tap");
        var i = +b.getAttribute("data-ph"), pos = m1.msgSel.indexOf(i);
        if(pos>=0) m1.msgSel.splice(pos,1);
        else if(m1.msgSel.length<5) m1.msgSel.push(i);
        else { toast("Cinq lignes, pas une de plus : retire une phrase d'abord."); return; }
        sndTap(); renderM1();
      });
    });
    var mg = $("m1MsgGo"); if(mg) mg.addEventListener("click", function(){ finishM1A(); });
    return;
  }
}
function startM1D1Timer(){
  clearInterval(m1Timer);
  var deadline = Date.now() + 60000;
  m1Timer = setInterval(function(){
    var el = $("m1D1Timer");
    if(!el || !m1 || m1.step!=="d1"){ clearInterval(m1Timer); return; }
    var left = Math.max(0, Math.round((deadline - Date.now())/1000));
    el.textContent = Math.floor(left/60)+":"+String(left%60).padStart(2,"0");
    el.classList.toggle("low", left<=15);
    var b = $("m1D1Bar");
    if(b){ b.style.width = Math.round(100*left/60)+"%"; b.classList.toggle("low", left<=15); }
    if(left<=0){
      clearInterval(m1Timer);
      m1.d1 = "obs"; m1.d1Timeout = true; m1.step = "d1q"; renderM1();
    }
  }, 500);
}
function finishM1A(){
  var ts = m1TriScore();
  var detection = Math.round(10 * ts.correct / 3) + (ts.firstOk ? 5 : 0) + (m1.emailFound ? 10 : 0);
  var d1pts = m1.d1==="iso" ? 10 : m1.d1==="dom" ? 5 : 3;
  var reaction = d1pts + (m1.foundCE03 ? 8 : 0) + (m1.eradOrder[m1.eradOrder.length-1]==="restaurer" && !m1.restoredEarly ? 7 : m1.eradOrder[m1.eradOrder.length-1]==="restaurer" ? 3 : 0);
  var raisonnement = (m1.d1Just===0 ? 8 : 0) + (m1.d1Mind===0 ? 6 : 0) + ((m1.journalSeen && m1.mailSeen) ? 6 : 0);
  var goodSel = m1.msgSel.filter(function(i){ return M1_PHRASES[i].good; }).length;
  var badSel = m1.msgSel.length - goodSel;
  var communication = Math.round(10 * goodSel / 5) + (badSel===0 ? 5 : Math.max(0, 5 - 3*badSel));
  var precision = 15 - (ts.fpEsc>0 ? 5 : 0) - (m1.restoredEarly ? 5 : 0) - (m1.d1Timeout ? 5 : 0);
  if(precision < 0) precision = 0;
  var score = detection + reaction + raisonnement + communication + precision;
  var fb = [], cards = [];
  function addCard(id){ if(cards.indexOf(id)<0) cards.push(id); }
  M1A_ALERTS.forEach(function(a, i){
    fb.push({ ok:m1.tri.classified[i]===a.ans, cls:m1.tri.classified[i]===a.ans?"ok":"ko", title:"Alerte "+(i+1)+" — "+a.t, txt:a.why });
  });
  if(M1A_ALERTS.some(function(a, i){ return a.ans==="fp" && m1.tri.classified[i]==="vp"; })){
    fb.push({ ok:false, cls:"mid", title:"Faux positifs", txt:"Cette alerte correspondait à une tâche prévue au calendrier. Compare toujours avec ce qui est attendu." });
    addCard("c401");
  }
  if(m1.d1==="iso" && !m1.emailFound){
    fb.push({ ok:false, cls:"mid", title:"Point d'entrée manqué", txt:"Tu as isolé vite, bien. Mais sans le point d'entrée, tu ne sais pas qui d'autre a reçu le message." });
    addCard("c201"); addCard("c203");
  }
  if(!m1.foundCE03){
    fb.push({ ok:false, cls:"ko", title:"Enquête pas élargie", txt:"Un second poste avait ouvert le même document : CE-03 lançait le même PowerShell à 03:10. Sans élargir, il serait resté dans la nature." });
    addCard("c402");
  } else {
    fb.push({ ok:true, cls:"ok", title:"Enquête élargie", txt:"CE-03 a été retrouvé et traité : l'incident avait deux postes, pas un." });
  }
  if(m1.restoredEarly || m1.eradOrder[m1.eradOrder.length-1]!=="restaurer"){
    fb.push({ ok:false, cls:"ko", title:"Restauration trop tôt", txt:"La tâche planifiée « MajService » a relancé l'attaque sur le poste restauré. On éradique d'abord, on restaure ensuite." });
    addCard("c404");
  }
  if(m1.d1==="dom"){
    fb.push({ ok:false, cls:"mid", title:"Décision n°1", txt:"Bloquer un indicateur n'est pas éradiquer : l'attaquant est revenu par un second domaine." });
    addCard("c403");
  }
  if(m1.d1==="obs"){
    fb.push({ ok:false, cls:"mid", title:"Décision n°1", txt:"L'attaquant a atteint le serveur de fichiers. Observer aide à comprendre, mais a un coût — il faut le décider, pas le subir." });
    addCard("c403");
  }
  if(m1.d1Just===0){
    fb.push({ ok:true, cls:"ok", title:"Raisonnement", txt:"Ton raisonnement est solide : un processus Office qui lance PowerShell est un indicateur classique." });
  }
  if(badSel>0){
    fb.push({ ok:false, cls:"mid", title:"Message à la direction", txt:"Reste sur les faits : ce qui est vérifié, ce que ça change, ce que tu fais, ce dont tu as besoin. Ni spéculation, ni blâme, ni promesse non fondée." });
    addCard("c403");
  } else {
    fb.push({ ok:true, cls:"ok", title:"Message à la direction", txt:"Cinq lignes factuelles : le fait vérifié, l'impact métier, l'étendue, la demande, et ce qu'on ne sait pas encore. C'est exactement le format qu'attend une direction à 4 h du matin." });
  }
  fb.push({ ok:true, cls:"ok", title:"Cdt. Amara Keïta", txt:"« Tu as compris quelque chose et tu as agi : c'est ça, le métier. Bienvenue chez Aegis. »" });
  finishM1("A", "Mission 1 — Alerte à 03h12 · Variante A", score, [
    { label:"Détection", got:detection, max:25 },
    { label:"Réaction", got:reaction, max:25 },
    { label:"Raisonnement", got:raisonnement, max:20 },
    { label:"Communication", got:communication, max:15 },
    { label:"Précision", got:precision, max:15 }
  ], fb, cards, "mission1");
}
/* ---------- variantes B et C : moteur commun ---------- */
function renderM1V(){
  var d = M1V[m1.variant];
  var html = "";
  if(m1.step==="intro"){
    html += '<div class="ghead"><div class="ttl">Mission 1 — Alerte à 03h12</div></div>';
    html += '<div class="clock">03:12</div><p class="sub" style="text-align:center">'+d.org+'. Tu as 45 minutes de temps de jeu (accéléré) avant la relève de 04h00.</p>';
    html += '<div class="card"><span class="tag soc">Mission 1</span><h3 style="margin-top:8px;font-size:19px">'+d.title+'</h3><p style="color:var(--txt)">'+d.intro+'</p></div>';
    html += '<div class="card"><div class="mentor"><div class="ava">'+(m1.variant==="B"?"NP":"KM")+'</div><div><div class="who">'+d.charName+'</div><div class="txt">« '+d.charQuote+' »</div></div></div>'
      + (d.charReply ? '<div class="mentor" style="margin-top:10px"><div class="ava">AK</div><div><div class="who">Cdt. Amara Keïta</div><div class="txt">« <span class="ms-tw typing" id="m1Tw"></span> »</div></div></div>' : '')
      + '</div>';
    html += '<button class="btn primary big" id="m1Go">Voir les trois alertes</button>';
    $("view-cold").innerHTML = html;
    if(d.charReply) msTypeEl($("m1Tw"), d.charReply);
    $("m1Go").addEventListener("click", function(){ m1.step="tri"; sndTap(); renderM1(); });
    return;
  }
  if(m1.step==="tri"){
    renderM1Tri("Mission 1 — "+d.title, "Phase 1 · Tri — touche une alerte pour l'ouvrir, puis classe-la.", "Passer à l'enquête");
    return;
  }
  if(m1.step==="entry"){
    html += m1Head("Mission 1 — "+d.title);
    html += nightBarHtml();
    html += '<div class="stepct">Phase 2 · Enquête — le point d\'entrée</div>';
    html += '<div class="alertcard"><span class="tag">'+d.entryTitle+'</span><div class="body" style="font-size:15px;margin-top:6px">'+d.entryBody+'</div></div>';
    html += '<button class="btn primary big" id="m1ToDec1" style="margin-top:12px">Passer à la décision</button>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    m1.vent = true;
    $("m1ToDec1").addEventListener("click", function(){ m1.step="dec1"; sndTap(); renderM1(); });
    return;
  }
  if(m1.step==="dec1"){
    html += m1Head("Mission 1 — "+d.title);
    html += nightBarHtml();
    html += '<div class="stepct">Phase 3 · Décision n°1</div>';
    html += '<div class="jq">'+d.dec1q+'</div><div class="jopts">';
    d.dec1.forEach(function(o, oi){ html += '<button data-vd1="'+oi+'">'+esc(o.txt)+'</button>'; });
    html += '</div>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-vd1]").forEach(function(b){
      b.addEventListener("click", function(){ b.classList.add("ms-tap"); m1.vdec1 = +b.getAttribute("data-vd1"); m1.step="dec1c"; sndTap(); renderM1(); });
    });
    return;
  }
  if(m1.step==="dec1c"){
    html += m1Head("Mission 1 — "+d.title);
    html += nightBarHtml();
    html += '<div class="stepct">Phase 3 · Décision n°1 — conséquence</div>';
    html += '<div class="conseq ms-enter">'+d.dec1[m1.vdec1].conseq+'</div>';
    html += '<div class="jq">'+d.justq+'</div><div class="jopts">';
    d.justopts.forEach(function(o, oi){ html += '<button data-vj="'+oi+'">'+esc(o)+'</button>'; });
    html += '</div>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-vj]").forEach(function(b){
      b.addEventListener("click", function(){ b.classList.add("ms-tap"); m1.vjust = +b.getAttribute("data-vj"); m1.step="dec2"; sndTap(); renderM1(); });
    });
    return;
  }
  if(m1.step==="dec2"){
    html += m1Head("Mission 1 — "+d.title);
    html += nightBarHtml();
    html += '<div class="stepct">Phase 4 · '+(m1.variant==="B" ? "Le paiement de 8 h" : "La réponse à Kevin")+'</div>';
    html += '<div class="jq">'+d.dec2q+'</div><div class="jopts">';
    d.dec2.forEach(function(o, oi){ html += '<button data-vd2="'+oi+'">'+esc(o.txt)+'</button>'; });
    html += '</div>';
    $("view-cold").innerHTML = html;
    m1BindQuit();
    document.querySelectorAll("#view-cold [data-vd2]").forEach(function(b){
      b.addEventListener("click", function(){ b.classList.add("ms-tap"); m1.vdec2 = +b.getAttribute("data-vd2"); sndTap(); finishM1V(); });
    });
    return;
  }
}
function finishM1V(){
  var d = M1V[m1.variant];
  var ts = m1TriScore();
  var detection = Math.round(15 * ts.correct / 3) + (ts.firstOk ? 10 : 0);
  var reaction = d.dec1[m1.vdec1].pts;
  var raisonnement = (m1.vjust===d.justok ? 12 : 0) + (m1.vent ? 8 : 0);
  var communication = d.dec2[m1.vdec2].pts;
  var precision = 15 - (ts.fpEsc>0 ? 5 : 0) - (d.dec1[m1.vdec1].pen || 0);
  if(precision < 0) precision = 0;
  var score = detection + reaction + raisonnement + communication + precision;
  var fb = [], cards = [];
  function addCard(id){ if(cards.indexOf(id)<0) cards.push(id); }
  d.alerts.forEach(function(a, i){
    fb.push({ ok:m1.tri.classified[i]===a.ans, cls:m1.tri.classified[i]===a.ans?"ok":"ko", title:"Alerte "+(i+1)+" — "+a.t, txt:a.why });
  });
  if(d.alerts.some(function(a, i){ return a.ans==="fp" && m1.tri.classified[i]==="esc"; })){
    fb.push({ ok:false, cls:"mid", title:"Faux positif escaladé", txt:"Cette alerte correspondait à une tâche prévue. Compare toujours avec le calendrier de maintenance avant d'escalader." });
    addCard("c401");
  }
  fb.push({ ok:d.dec1[m1.vdec1].pts>=20, cls:d.dec1[m1.vdec1].pts>=20?"ok":d.dec1[m1.vdec1].pts>0?"mid":"ko", title:"Décision n°1", txt:d.dec1[m1.vdec1].conseq });
  fb.push({ ok:d.dec2[m1.vdec2].pts>=12, cls:d.dec2[m1.vdec2].pts>=12?"ok":d.dec2[m1.vdec2].pts>0?"mid":"ko", title:m1.variant==="B" ? "Le paiement de 8 h" : "La réponse à Kevin", txt:d.dec2[m1.vdec2].conseq });
  if(m1.variant==="B"){
    if(m1.vdec1===0) addCard("c403");
    if(m1.vdec2!==0){ addCard("c203"); addCard("c507"); }
    if(m1.vdec2===1) fb.push({ ok:false, cls:"ko", title:"Le virement est parti", txt:"Le virement est parti : il fallait rappeler le fournisseur sur un numéro connu. 48 000 €, c'est le prix d'une vérification hors canal oubliée." });
  }
  if(m1.variant==="C"){
    if(m1.vdec1===0) fb.push({ ok:false, cls:"mid", title:"Propagation", txt:"Deux autres postes étaient déjà touchés : la segmentation du segment Bureaux aurait borné l'incident dès le départ." });
    if(m1.vdec2===2) fb.push({ ok:false, cls:"mid", title:"Culture du signalement", txt:"Kevin avait bien fait de prévenir. Le blâme apprend aux gens à se taire — et un SOC sans signalements est un SOC aveugle." });
  }
  fb.push({ ok:true, cls:"ok", title:"Cdt. Amara Keïta", txt:"« Tu as compris quelque chose et tu as agi : c'est ça, le métier. Bienvenue chez Aegis. »" });
  finishM1(m1.variant, "Mission 1 — "+d.title, score, [
    { label:"Détection", got:detection, max:25 },
    { label:"Réaction", got:reaction, max:25 },
    { label:"Raisonnement", got:raisonnement, max:20 },
    { label:"Communication", got:communication, max:15 },
    { label:"Précision", got:precision, max:15 }
  ], fb, cards, d.examKey);
}
/* ---------- articulation Mission 1 / Pack Security+ ---------- */
var M1_LINKS = {
  A:{ scen:["S4-4","S4-5"], cards:["C4-03","C4-04"] },
  B:{ scen:["S2-1"], cards:["C2-03"] },
  C:{ scen:["S2-2"], cards:["C3-02"] }
};
var SCEN_ORIGIN = { "S4-4":"A", "S4-5":"A", "S2-1":"B", "S2-2":"C" };
var CARD_ORIGIN = { "C4-03":"A", "C4-04":"A", "C2-03":"B", "C3-02":"C" };
function m1SuiteHtml(variant){
  var L = M1_LINKS[variant]; if(!L) return "";
  var html = '<div class="card"><h3>Suite conseillée — dans le Pack Security+</h3><p>Ce que tu viens de jouer se révise là-bas, tout de suite :</p>';
  L.scen.forEach(function(sid){
    var sc = SCENARIOS.filter(function(x){ return x.id===sid; })[0];
    if(sc) html += '<button class="btn big" style="width:100%;margin:6px 0;text-align:left;justify-content:flex-start" data-suite-scen="'+sid+'">Scénario '+sid+' · '+esc(sc.t)+'</button>';
  });
  L.cards.forEach(function(cid){
    html += '<button class="btn big" style="width:100%;margin:6px 0;text-align:left;justify-content:flex-start" data-suite-card="'+cid+'">Carte '+cid+' — la revoir maintenant</button>';
  });
  html += '</div>';
  return html;
}
/* ---------- debrief commun Mission 1 ---------- */
function finishM1(variant, title, score, axes, fb, cards, examKey){
  clearInterval(m1Timer);
  var first = S.m1.plays[variant]===0;
  var mult = first ? 1.5 : 1; /* rejouer rapporte plein pot : ce sont les paramètres et les variantes qui changent */
  var xp = Math.round(150 * (score/100) * mult);
  var credits = Math.round((20 + 40*(score/100)) * mult);
  S.m1.plays[variant]++;
  if(score > S.m1.best[variant]) S.m1.best[variant] = score;
  if(variant==="A"){
    S.m1.done = true; S.coldDone = true;
    S.campaign.trust.atlas = Math.max(10, Math.min(100, S.campaign.trust.atlas + (score>=70 ? 15 : score>=40 ? 5 : -5)));
  }
  S.xp.soc += xp; S.credits += credits;
  if(!S.delayedDue && !S.delayedDone) S.delayedDue = Date.now() + 7*24*3600*1000;
  var newCards = [];
  cards.forEach(function(id){ if(unlockDex(id)) newCards.push(id); });
  save();
  var html = '<div class="ghead"><div class="ttl">Debrief — '+title+'</div></div>';
  html += '<div class="scorebig">'+score+'<small> / 100</small></div><div class="gradelbl">'+m1Grade(score)+'</div>';
  html += '<div class="card"><h3>Score — cinq axes</h3>';
  axes.forEach(function(b){
    html += '<div class="breakrow"><div class="bl"><span>'+b.label+'</span><span>'+b.got+' / '+b.max+'</span></div><div class="breakbar"><i style="width:'+Math.round(100*b.got/b.max)+'%"></i></div></div>';
  });
  html += '<p style="margin:8px 0 0">Paliers : 85 et plus, excellent · 70 à 84, solide · 50 à 69, à consolider · moins de 50, à retenter. Une réussite avec plusieurs aides fait avancer l\'histoire, mais ne compte pas comme preuve de maîtrise — les aides utilisées sont affichées ici : <b style="color:var(--txt)">'+(S.examMode ? "aucune (Mode Examen)" : "aide essentielle d\'Amara intégrée au guidage")+'</b>.</p></div>';
  html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">+'+xp+' XP</div><div class="rl">SOC'+(first?' · 1re fois ×1,5':'')+'</div></div><div class="rw"><div class="rv" style="color:var(--orange)">+'+credits+'</div><div class="rl">Crédits</div></div></div>';
  newCards.forEach(function(id){
    var cd = DEXDATA.filter(function(x){ return x.id===id; })[0];
    if(cd){ if(DEX_JUST.indexOf(id)<0) DEX_JUST.push(id); html += '<div class="unlock gx-pop">Carte de révision générée et ajoutée au Cyberdex : <b>'+cd.name+'</b></div>'; }
  });
  html += '<div class="card"><h3>Retour personnalisé — ce que tu as fait, ce que ça a produit</h3>';
  fb.forEach(function(f){ html += whyRow(f.ok, f.cls, f.title, f.txt); });
  html += '</div>';
  html += examBoxHtml(examKey);
  html += m1SuiteHtml(variant);
  html += '<p class="sub">Lien Security+ : '+(variant==="B" ? "objectifs 2.2, 2.4, 4.4, 4.6, 4.8 — compromission de compte, règles de messagerie, vérification hors canal." : variant==="C" ? "objectifs 2.2, 2.4, 3.2, 4.8 — supports amovibles, segmentation, culture du signalement." : "objectifs 2.2, 2.4, 4.4, 4.8, 4.9 — corrélation, confinement, éradication, communication d'incident.")+'</p>';
  html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="m1Home">Missions</button><button class="btn primary" style="flex:1" id="m1Replay">Rejouer</button></div>';
  $("view-cold").innerHTML = html;
  $("view-cold").querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
  msScoreCount($("view-cold"));
  msStaggerWhy($("view-cold"));
  window.scrollTo(0,0);
  $("m1Home").addEventListener("click", function(){ show("missions"); });
  $("m1Replay").addEventListener("click", function(){ startM1(variant); });
  $("view-cold").querySelectorAll("[data-suite-scen]").forEach(function(b){
    b.addEventListener("click", function(){ sndTap(); openScenInPack(b.getAttribute("data-suite-scen")); });
  });
  $("view-cold").querySelectorAll("[data-suite-card]").forEach(function(b){
    b.addEventListener("click", function(){ sndTap(); openCardInPack(b.getAttribute("data-suite-card")); });
  });
  if(score>=60) sndOk(); else sndBad();
}
