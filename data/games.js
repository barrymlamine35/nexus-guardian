"use strict";
/* ================= DONNEES JEUX ================= */
var GAMES = {
  tri:{ name:"Tri d'alertes", lieu:"Le SOC", domaine:"soc", domLabel:"SOC", xpBase:150,
    briefing:"Nuit calme au SOC, en apparence. Huit alertes viennent de tomber sur la console d'Atlas Logistics. Tu as 45 minutes de temps de jeu (accéléré) avant la relève de 04h00. Classe-les une par une. Quelque part là-dedans, il y a peut-être une vraie attaque. — Cdt. Amara Keïta" },
  phish:{ name:"Chasse au phishing", lieu:"QG Aegis", domaine:"soc", domLabel:"SOC", xpBase:120,
    briefing:"Six e-mails attendent dans la boîte d'Atlas Logistics. Certains sont propres, d'autres non. Ouvre-les, examine-les, et décide. Et si Kevin de la Compta appelle : dis-lui de ne toucher à rien. — Cdt. Amara Keïta" },
  defense:{ name:"Défense réseau", lieu:"Quartier Réseau", domaine:"reseau", domLabel:"Réseau", xpBase:150,
    briefing:"Atlas Logistics refait son réseau. Tu as 12 000 € pour placer tes défenses, ensuite le trafic arrive : du vrai, du faux, et une diversion signée ÉCLIPSE. Protège sans bloquer le travail. — Cdt. Amara Keïta" },
  forensics:{ name:"Analyse de preuves", lieu:"Labo Forensics", domaine:"soc", domLabel:"SOC", xpBase:150,
    briefing:"Le poste du chef d'équipe est saisi et son image est sur le banc, bloqueur en écriture en place. Dix artefacts à classer, une nuit à remettre en ordre, et une question qui fait tenir un dossier : qu'est-ce qu'on préserve en premier ? — Cdt. Amara Keïta" }
};
var ALERTS = [
  { t:"Sauvegarde nocturne planifiée", host:"srv-backup-01", time:"03:00", det:"Tâche « backup-full » lancée par le compte de service svc-backup. Volume copié habituel, destination interne.", ans:"fp", crit:false,
    hint:"Regarde qui lance la tâche, et à quelle heure.", why:"Tâche planifiée, compte de service connu, horaire habituel : rien d'anormal." },
  { t:"Mise à jour planifiée", host:"PC du chef d'équipe", time:"03:09", det:"Windows Update : correctifs signés Microsoft, redémarrage programmé dans la fenêtre de maintenance.", ans:"fp", crit:false,
    hint:"Des correctifs signés, en pleine fenêtre de maintenance…", why:"Correctifs signés, fenêtre de maintenance habituelle : comportement normal." },
  { t:"Scan interne de vulnérabilités", host:"scanner-vuln", time:"02:30", det:"Balayage hebdomadaire lancé par l'équipe sécurité, depuis l'outil officiel, sur les plages internes.", ans:"fp", crit:false,
    hint:"Un scan peut aussi venir de chez nous.", why:"Scanner officiel de l'équipe sécurité, créneau hebdomadaire connu." },
  { t:"Connexion impossible — deux pays", host:"Compte j.martin", time:"03:11", det:"Connexion depuis la France, puis 20 minutes plus tard depuis un autre pays. Le trajet est physiquement impossible.", ans:"esc", crit:false,
    hint:"20 minutes entre deux pays. Possible, ça ?", why:"Deux pays en 20 minutes : voyage impossible. À escalader pour vérifier auprès de l'utilisateur avant de conclure.",
    jq:"Quelle information pourrait te faire changer d'avis ?", jopts:["L'utilisateur confirme être en voyage et passer par un VPN", "L'adresse IP source change entre les deux connexions", "L'alerte est arrivée pendant la nuit"], jok:0 },
  { t:"Rafale d'échecs de connexion", host:"Compte j.martin", time:"03:12", det:"Événement 4625 répété 312 fois en 4 minutes. IP source : 203.0.113.45.", ans:"vp", crit:true,
    hint:"312 échecs en 4 minutes, ce n'est pas une faute de frappe.", why:"312 échecs 4625 en 4 minutes depuis la même IP : une force brute en cours.",
    jq:"Quel indice justifie ton choix ?", jopts:["312 échecs 4625 en 4 minutes, depuis la même IP", "L'alerte est arrivée à 03:12, en pleine nuit", "Le compte appartient à un employé ancien"], jok:0 },
  { t:"Connexion réussie", host:"Compte j.martin", time:"03:12", det:"Événement 4624. IP source : 203.0.113.45 — la même que la rafale d'échecs. MFA non activée sur ce compte.", ans:"vp", crit:true,
    hint:"Compare l'IP avec celle de l'alerte précédente.", why:"Un 4624 juste après 312 échecs, depuis la même IP et sans MFA : la force brute a réussi.",
    jq:"Quel indice justifie ton choix ?", jopts:["L'heure : 03:12, personne ne travaille", "Un 4624 depuis la même IP juste après la rafale d'échecs, sans MFA", "Le compte n'a pas de photo de profil"], jok:1 },
  { t:"Règle de transfert e-mail créée", host:"Compte j.martin", time:"03:14", det:"Nouvelle règle de boîte mail : tous les messages entrants sont copiés vers une adresse externe inconnue.", ans:"vp", crit:true,
    hint:"Deux minutes après la connexion réussie. Coïncidence ?", why:"Deux minutes après la compromission, une règle copie tous les e-mails vers l'extérieur : persistance et exfiltration.",
    jq:"Quel indice justifie ton choix ?", jopts:["Le titre de l'alerte est très long", "La règle arrive deux minutes après la compromission", "La règle copie tous les e-mails vers une adresse externe inconnue"], jok:2 },
  { t:"PowerShell encodé", host:"PC du chef d'équipe", time:"03:40", det:"PowerShell lancé avec le paramètre -EncodedCommand, hors heures de bureau, sans tâche planifiée associée.", ans:"vp", crit:false,
    hint:"Du code encodé, à 03:40, sans raison planifiée…", why:"PowerShell encodé à 03:40, sans tâche planifiée : exécution suspecte, typique d'une attaque." }
];
/* Artefacts du poste saisi (PC du chef d'équipe, compte j.martin) : ans = mal (malveillant) / ben (bénin) / verif (à vérifier). */
var FORENSICS_ITEMS = [
  { t:"Rafale d'échecs de connexion", src:"Journal de sécurité — Événement 4625", time:"03:12", det:"312 échecs de connexion en 4 minutes, tous depuis la même adresse : 203.0.113.45.", ans:"mal",
    hint:"312 fois la même erreur, depuis la même adresse.", why:"312 événements 4625 en 4 minutes depuis une seule IP : une force brute en cours. Le nombre et la répétition font la preuve." },
  { t:"Connexion réussie", src:"Journal de sécurité — Événement 4624", time:"03:12", det:"Connexion réussie du compte j.martin depuis 203.0.113.45 — la même adresse que la rafale. MFA non activée sur ce compte.", ans:"mal",
    hint:"Compare l'adresse avec celle de l'artefact précédent.", why:"Un 4624 juste après 312 échecs, depuis la même IP et sans MFA : la force brute a réussi. Le compte est compromis." },
  { t:"PowerShell encodé", src:"Journal — Événement 4688, création de processus", time:"03:40", det:"powershell.exe lancé avec -EncodedCommand. Processus parent : WINWORD.EXE.", ans:"mal",
    hint:"Qui a lancé PowerShell ? Un humain, ou un document ?", why:"Un processus lancé par Word, avec du code encodé : la macro du document de paie a exécuté quelque chose à 03:40." },
  { t:"Tâche planifiée « MajService »", src:"Planificateur de tâches", time:"03:40", det:"Tâche créée à 03:40, qui relance un script au démarrage du poste. Auteur : compte j.martin.", ans:"mal",
    hint:"Une tâche qui survit au redémarrage, ça sert à quoi ?", why:"Persistance : la tâche relance l'attaque à chaque démarrage. C'est pour ça qu'on ne restaure pas un poste avant de l'avoir supprimée." },
  { t:"Programme au démarrage", src:"Registre — clé Run", time:"03:40", det:"Entrée Run ajoutée : un programme au nom d'outil système, rangé dans AppData\\Roaming, qui se lance à chaque ouverture de session.", ans:"mal",
    hint:"Un nom qui ressemble à un outil Windows, mais dans le mauvais dossier.", why:"Persistance par le registre : un programme légitime ne se cache pas dans AppData avec un nom d'emprunt." },
  { t:"Nouveau service « SvcUpdate »", src:"Journal système — Événement 7045", time:"03:41", det:"Service installé à 03:41. Son binaire est rangé dans un dossier temporaire.", ans:"mal",
    hint:"Un service tout neuf, dont le programme vit dans un dossier temporaire…", why:"Un service installé à 03:41, avec un binaire dans un dossier temporaire : une persistance déguisée en mise à jour." },
  { t:"Le document de paie", src:"Empreinte SHA-256 comparée", time:"22:41", det:"Le document reçu par e-mail à 22:41 : son empreinte (SHA-256, extrait 9d4e…f2a8) correspond exactement à un fichier signalé dans la liste des fichiers connus malveillants.", ans:"mal",
    hint:"L'empreinte ne ment pas : elle dit si ce fichier est celui qu'on croit.", why:"L'empreinte du document de 22:41 correspond à un fichier signalé : c'est le point d'entrée de l'attaque. La macro a fait le reste." },
  { t:"Clé USB branchée", src:"Historique des périphériques USB", time:"18:42 (la veille)", det:"Clé USB personnelle du chef d'équipe, branchée la veille à 18:42. Aucun fichier lancé depuis elle.", ans:"ben",
    hint:"Une clé branchée ne veut pas dire une clé qui a infecté.", why:"Branchée la veille, rien lancé depuis : un fait, pas une preuve d'attaque. Tout ce qui est branché n'est pas suspect." },
  { t:"Téléchargement depuis le portail interne", src:"Historique du navigateur", time:"02:47", det:"Fichier téléchargé depuis atlas-logistics.example/portail — le portail interne de l'entreprise, domaine et certificat vérifiés.", ans:"ben",
    hint:"Le domaine, c'est celui de l'entreprise. Vérifie-le lettre par lettre.", why:"Domaine interne vérifié, certificat valide : un téléchargement normal sur le portail de l'entreprise." },
  { t:"Connexion depuis deux pays", src:"Journal de sécurité — Événement 4624", time:"03:11", det:"Connexion du compte j.martin depuis la France, puis 20 minutes plus tard depuis un autre pays. Le trajet est physiquement impossible — mais l'utilisateur n'a pas encore été joint.", ans:"verif",
    hint:"Impossible physiquement… sauf si quelque chose d'autre explique les deux adresses.", why:"Deux pays en 20 minutes, c'est impossible — sauf via un VPN, ou si le compte est partagé. Sans la parole de l'utilisateur, on ne tranche pas : on vérifie." }
];
/* Frise de la nuit, dans l'ordre chronologique (la rafale et la réussite partagent la minute 03:12 : l'ordre se lit dans la cause). */
var FORENSICS_TIMELINE = [
  { t:"Sauvegarde nocturne planifiée", time:"03:00", det:"Tâche « backup-full » lancée par le compte de service svc-backup." },
  { t:"Rafale d'échecs de connexion", time:"03:12", det:"312 événements 4625 depuis 203.0.113.45." },
  { t:"Connexion réussie", time:"03:12", det:"Événement 4624, même adresse, sans MFA." },
  { t:"Règle de transfert e-mail créée", time:"03:14", det:"Tous les messages copiés vers une adresse externe inconnue." },
  { t:"PowerShell encodé lancé", time:"03:40", det:"-EncodedCommand, processus parent WINWORD.EXE." }
];
var FORENSICS_TIMELINE_WHY = "03:00, la sauvegarde — du bruit normal, avant tout le reste. 03:12, deux événements à la même minute : d'abord la rafale, puis la réussite — l'ordre se lit dans la cause, pas seulement dans l'heure. 03:14, la règle de transfert : deux minutes après la compromission, l'attaque s'installe. 03:40, PowerShell : presque une demi-heure plus tard, l'attaquant passe à l'exécution. Une frise, c'est ça : pas une liste d'heures, une histoire qui tient.";
var FORENSICS_QCM = {
  q:"Le poste est encore allumé quand tu arrives sur place. Par quoi tu commences ?",
  opts:[
    "La mémoire vive et les processus en cours, puis l'image du disque — vérifiée par son empreinte.",
    "Le disque dur : c'est là qu'il y a le plus de preuves.",
    "Éteindre le poste proprement pour figer la scène.",
    "L'historique du navigateur et les derniers fichiers ouverts."
  ],
  ok:0,
  why:"Ordre de volatilité : la mémoire vive et les processus en cours disparaissent au premier redémarrage — le disque, lui, attend. Et l'image du disque se vérifie par son empreinte avant toute analyse, derrière un bloqueur en écriture : on ne travaille jamais sur l'original, sinon la preuve ne vaut plus rien."
};
var EMAILS = [
  { from:"Service Paie", addr:"paie@atlas-logistics.example", time:"08:02", subj:"Votre bulletin de paie est disponible",
    body:"Bonjour,\n\nVotre bulletin de paie de novembre est disponible sur le portail interne.\n\nLe service Paie",
    link:{ label:"Ouvrir le portail paie", shown:"atlas-logistics.example/portail", real:"https://atlas-logistics.example/portail" },
    spf:"Réussi", dkim:"Réussi", dmarc:"Réussi", legit:true,
    hint:"Compare le domaine de l'adresse à celui du lien, lettre par lettre.", why:"Expéditeur et lien sur le vrai domaine atlas-logistics.example, en-têtes propres : e-mail légitime." },
  { from:"Service Paie", addr:"paie@atlas-l0gistics.example", time:"08:17", subj:"URGENT – confirmez votre paie",
    body:"URGENT : une erreur a été détectée sur votre paie. Confirmez vos identifiants dans l'heure, sinon votre virement sera bloqué.\n\nCliquez sur le lien ci-dessous et ouvrez le document joint pour vérifier vos informations.",
    link:{ label:"Confirmer maintenant", shown:"atlas-logistics.example/paie", real:"hxxp://paie-verif.example/login" },
    attach:"Paie_nov.docm",
    spf:"Échec", dkim:"Absent", dmarc:"Échec", legit:false,
    hint:"« l0gistics »… avec un zéro. Et ce .docm, tu en penses quoi ?", why:"Domaine usurpé (l0gistics avec un zéro), urgence fabriquée, lien vers un faux site et pièce jointe .docm : phishing classique." },
  { from:"S. Roche — Manager", addr:"manager@atlas-logistics.example", time:"09:05", subj:"Invitation : réunion d'équipe jeudi 10h",
    body:"Bonjour à tous,\n\nRéunion d'équipe jeudi à 10h en salle B, comme d'habitude. Ordre du jour : point sur les livraisons de décembre.\n\nÀ jeudi,\nS. Roche",
    spf:"Réussi", dkim:"Réussi", dmarc:"Réussi", legit:true,
    hint:"Aucun lien, aucune pièce jointe, aucune urgence. Ça arrive aussi.", why:"Expéditeur interne connu, aucun lien ni pièce jointe, ton normal : e-mail légitime." },
  { from:"Le PDG", addr:"pdg@atlas-logistics-support.example", time:"09:41", subj:"Virement urgent et confidentiel",
    body:"Je suis en réunion avec un partenaire, je ne peux pas parler. J'ai besoin que vous fassiez un virement urgent et confidentiel aujourd'hui même.\n\nNe le dites à personne, je vous expliquerai après. Répondez-moi vite.",
    spf:"Échec", dkim:"Absent", dmarc:"Échec", legit:false,
    hint:"Un PDG qui écrit depuis « atlas-logistics-support » et demande le secret ?", why:"Fraude au président (BEC) : domaine inventé, urgence, demande de virement et secret exigé. On ne vire jamais sur un simple e-mail." },
  { from:"Karim — Logistique", addr:"colis@atlas-logistic.example", time:"10:12", subj:"Photos du séminaire",
    body:"Salut !\n\nVoici les photos du séminaire de la semaine dernière, tout est dans le fichier joint. Il y en a des bonnes !\n\nKarim",
    attach:"Photos_seminaire.zip",
    spf:"Réussi", dkim:"Absent", dmarc:"Échec", legit:false,
    hint:"L'adresse a l'air presque normale. Presque. Compte les « s ».", why:"Spear phishing : adresse presque identique (atlas-logistic, sans le s final) et pièce jointe .zip. Le contenu sympa ne rend pas le fichier sûr." },
  { from:"Service IT", addr:"it@atlas-logistics.example", time:"11:30", subj:"Maintenance planifiée du VPN samedi",
    body:"Bonjour,\n\nLe VPN sera en maintenance samedi entre 6h et 8h. Aucune action de votre part n'est nécessaire.\n\nLe service IT",
    spf:"Réussi", dkim:"Réussi", dmarc:"Réussi", legit:true,
    hint:"Aucune action demandée, ton neutre, domaine interne.", why:"Information interne, ton neutre, aucune action urgente demandée, en-têtes propres : e-mail légitime." }
];
var TOOLS = {
  fw:{ name:"Pare-feu", cost:3000, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 12h7v7M10 5v7h5v7M15 12h6"/></svg>' },
  ids:{ name:"IDS", cost:2500, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>' },
  waf:{ name:"WAF", cost:3500, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8z"/><path d="M8.8 12h6.4M12 8.8v6.4"/></svg>' },
  vlan:{ name:"VLAN", cost:2000, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="4" width="7" height="7" rx="1.5"/><rect x="13.5" y="4" width="7" height="7" rx="1.5"/><rect x="8.5" y="14" width="7" height="7" rx="1.5"/><path d="M10.5 7.5h3M12 11v3"/></svg>' }
};
var SLOTS = [
  { id:"entree", label:"Emplacement — Entrée Internet", zone:"top" },
  { id:"web", label:"Emplacement — Serveur Web", zone:"dmz" },
  { id:"mail", label:"Emplacement — Serveur Mail", zone:"dmz" },
  { id:"pont", label:"Emplacement — Entre DMZ et interne", zone:"mid" },
  { id:"interne", label:"Emplacement — Réseau interne", zone:"int" }
];
var WAVES = [
  { type:"legit", label:"Visiteurs du site Web", target:"web", ownBlock:"web:fw", why:"Les visiteurs passent par le serveur Web : un pare-feu posé dessus les bloque comme des intrus." },
  { type:"mal", label:"Scan de ports", target:"entree", blockers:{"entree:fw":1,"entree:ids":0.5}, why:"Un pare-feu à l'entrée ferme les ports avant le scan. Un IDS voit le scan, mais ne le bloque pas." },
  { type:"legit", label:"E-mails des clients", target:"mail", ownBlock:"mail:fw", why:"Le courrier des clients arrive sur le serveur Mail : un pare-feu posé dessus coupe le service." },
  { type:"mal", label:"Force brute sur RDP", target:"interne", blockers:{"entree:fw":1,"pont:fw":1,"entree:ids":0.5,"pont:ids":0.5}, why:"Le RDP ne doit jamais être exposé : un pare-feu à l'entrée ou avant le réseau interne arrête la force brute." },
  { type:"mal", label:"Injection sur le site Web", target:"web", blockers:{"web:waf":1,"web:ids":0.5,"entree:ids":0.5,"web:fw":0.5}, why:"Le WAF est fait pour ça : il filtre les requêtes Web malveillantes avant qu'elles touchent le serveur." },
  { type:"mal", label:"Exfiltration par DNS", target:"interne", blockers:{"interne:vlan":1,"pont:fw":1,"interne:ids":0.5,"pont:ids":0.5}, why:"La segmentation (VLAN) cloisonne le réseau interne : les données ne sortent plus librement, même par DNS." },
  { type:"mal", label:"Scan massif — diversion d'ÉCLIPSE", target:"entree", blockers:{"entree:fw":1,"entree:ids":0.5}, why:"Le scan massif fait du bruit pour attirer l'œil ailleurs. Le traiter à l'entrée évite de se disperser." },
  { type:"legit", label:"Navigation des employés", target:"interne", ownBlock:"interne:fw", why:"Un pare-feu trop strict sur le réseau interne empêche les employés de travailler : le service s'effondre." }
];
var DEXDATA = [
  { id:"phishing", name:"Phishing", txt:"E-mail frauduleux qui imite un expéditeur de confiance pour voler des identifiants ou faire ouvrir une pièce jointe piégée." },
  { id:"brute", name:"Force brute", txt:"Essayer des centaines de mots de passe jusqu'à trouver le bon. La MFA et le verrouillage de compte la rendent presque inutile." },
  { id:"ransom", name:"Ransomware", txt:"Logiciel qui chiffre les fichiers et exige une rançon. Les sauvegardes testées restent la meilleure réponse." },
  { id:"trojan", name:"Cheval de Troie", txt:"Programme malveillant caché dans un fichier ou un logiciel en apparence utile, comme un document .docm piégé." },
  { id:"privilege", name:"Moindre privilège", txt:"Ne donner à chaque compte que les droits dont il a besoin. Un compte compromis fait alors beaucoup moins de dégâts." },
  { id:"segment", name:"Segmentation", txt:"Découper le réseau en zones (DMZ, VLAN…) pour qu'une attaque ne puisse pas se répandre partout." },
  { id:"backup", name:"Sauvegardes 3-2-1", txt:"3 copies des données, sur 2 supports différents, dont 1 hors site. La règle d'or contre la perte de données." },
  { id:"cloud", name:"Cloud — responsabilité partagée", txt:"Notion essentielle dès la v1 : le fournisseur cloud sécurise l'infrastructure, toi tu restes responsable de tes comptes, de tes accès et de tes données. Un compte sans MFA reste une porte ouverte, même dans le cloud." },
  { id:"gouv", name:"Gouvernance", txt:"Notion essentielle dès la v1 : les politiques de sécurité (mots de passe, MFA, sauvegardes) protègent seulement si elles sont écrites, connues et vérifiées. La technique sans règles partagées ne tient pas longtemps." },
  { id:"c201", name:"Carte C2-01 · Point d'entrée", txt:"Carte générée par la Mission 1 : retrouver le point d'entrée (l'e-mail, le document, le premier poste) avant de conclure. Sans lui, impossible de savoir qui d'autre est touché." },
  { id:"c203", name:"Carte C2-03 · Vérification hors canal", txt:"Carte générée par la Mission 1 : un changement de coordonnées bancaires ou un ordre inhabituel se vérifie par un canal indépendant — rappeler sur le numéro déjà connu, jamais celui du message suspect." },
  { id:"c401", name:"Carte C4-01 · Calendrier de maintenance", txt:"Carte générée par la Mission 1 : avant d'escalader une alerte, comparer avec ce qui est attendu — sauvegardes, scans et mises à jour planifiés figurent au calendrier de maintenance." },
  { id:"c402", name:"Carte C4-02 · Élargir l'enquête", txt:"Carte générée par la Mission 1 : un incident a rarement un seul poste. Chercher qui d'autre a reçu le même message, ouvert le même document, avant de déclarer l'incident clos." },
  { id:"c403", name:"Carte C4-03 · Indicateur ≠ éradication", txt:"Carte générée par la Mission 1 : bloquer un domaine ou une adresse coupe un indicateur, pas l'attaque. Éradiquer, c'est supprimer les moyens de revenir : comptes, sessions, règles, tâches planifiées." },
  { id:"c404", name:"Carte C4-04 · Éradiquer avant de restaurer", txt:"Carte générée par la Mission 1 : on ne restaure un poste qu'après avoir supprimé la persistance. Sinon, la tâche planifiée relance l'attaque sur un système tout propre." },
  { id:"c507", name:"Carte C5-07 · Coordonnées bancaires", txt:"Carte générée par la Mission 1 : tout changement de RIB fournisseur exige une double validation et un rappel sur un numéro connu. Un virement parti sur un faux RIB ne revient presque jamais." },
  { id:"forensics", name:"Analyse forensique", txt:"Reconstruire ce qui s'est passé à partir des traces laissées sur un poste : journaux, processus, tâches planifiées, registre, empreintes de fichiers. Une preuve ne vaut que si on peut dire d'où elle vient et qu'elle n'a pas été modifiée." },
  { id:"volatilite", name:"Ordre de volatilité", txt:"Collecter les preuves de la plus volatile à la plus stable : mémoire vive et processus en cours d'abord, puis disque. Ce qui disparaît vite se sauve en premier — éteindre un poste efface sa RAM." },
  { id:"chaine", name:"Chaîne de possession", txt:"Documenter qui a touché une preuve, quand et comment — image du disque derrière un bloqueur en écriture, empreinte vérifiée, copie de travail. Sans chaîne de possession, une preuve ne tient pas." }
];
var DEX_JUST = []; /* ids des fiches débloquées pendant cette session : surbrillance unique, jamais sauvegardée */
var TRI_VARIANTS = [
  { user:"j.martin", ip:"203.0.113.45", label:"Variante 1 — Compte j.martin" },
  { user:"s.bernard", ip:"203.0.113.77", label:"Variante 2 — Compte s.bernard" },
  { user:"a.diallo", ip:"203.0.113.99", label:"Variante 3 — Compte a.diallo" }
];
var EXAM_NOTES = {
  tri:"À l'examen (SY0-701), ça tombe comme ça : « Un analyste SOC reçoit 312 événements 4625 suivis d'un 4624, tous depuis la même adresse IP, sur un compte sans MFA. Quelle est la première action ? » Réponse attendue : <b>traiter l'incident comme une compromission confirmée</b> — contenir le compte et escalader. Le piège classique : répondre « faux positif » parce qu'un seul 4624, pris isolément, ressemble à une connexion normale. L'examen teste la corrélation, pas l'alerte seule.",
  phish:"À l'examen (SY0-701), ça tombe comme ça : « Un employé reçoit un e-mail du PDG demandant un virement urgent et confidentiel. L'adresse d'expédition est pdg@entreprise-support.example et les contrôles SPF et DMARC échouent. De quel type d'attaque s'agit-il ? » Réponse attendue : <b>fraude au président (BEC), une forme d'ingénierie sociale</b>. Le piège : se focaliser sur la pièce jointe ou le lien — ici, il n'y en a pas, et c'est justement le signe.",
  defense:"À l'examen (SY0-701), ça tombe comme ça : « Une entreprise veut que son serveur Web public reste accessible, sans exposer son réseau interne en cas de compromission. Où place-t-on ce serveur ? » Réponse attendue : <b>dans une DMZ, derrière un pare-feu</b> — et un WAF devant lui pour filtrer les attaques applicatives. Le piège : confondre IDS et pare-feu. Un IDS détecte et alerte ; il ne bloque pas le trafic à lui tout seul.",
  clinique:"À l'examen (SY0-701), ça tombe comme ça : « Après un ransomware, une organisation découvre que ses sauvegardes n'ont jamais été testées et que la restauration échoue. Quelle mesure aurait évité cette situation ? » Réponse attendue : <b>tester régulièrement les restaurations, dans le cadre d'une stratégie de sauvegarde type 3-2-1</b>. Le piège : « augmenter la fréquence des sauvegardes » — sauvegarder plus souvent un système qu'on ne sait pas restaurer ne protège de rien.",
  mairie:"À l'examen (SY0-701), ça tombe comme ça : « Le site web d'une collectivité est défiguré un vendredi soir. Quelle est la séquence correcte ? » Réponse attendue : <b>contenir (basculer sur une copie saine), préserver les journaux comme preuves, puis communiquer des faits vérifiés</b>. Le piège : « ne rien dire tant que l'enquête n'est pas terminée » — à l'examen comme dans la vraie vie, le silence laisse la rumeur décider à ta place.",
  finale:"À l'examen (SY0-701), ça tombe comme ça : « Pendant un incident, un scan massif monopolise l'équipe, tandis qu'un journal montre une unique connexion réussie anormale. Que prioriser ? » Réponse attendue : <b>la connexion réussie</b> — le scan peut être une diversion, et la réponse à incident commence par identifier le vecteur d'entrée réel. Le piège : traiter le signal le plus bruyant en premier. En sécurité des opérations, le signal faible est souvent le vrai incident.",
  mission1:"À l'examen (SY0-701), ça tombe comme ça : « À 03h09, un poste lance powershell.exe -enc avec WINWORD.EXE comme processus parent, quelques heures après la réception d'un document de paie par e-mail. Quelle est la première action ? » Réponse attendue : <b>isoler l'hôte et élargir l'enquête aux autres destinataires du document</b>. Le piège : « restaurer le poste depuis une image propre » — restaurer avant d'avoir supprimé la persistance (compte de service, tâche planifiée) laisse l'attaquant revenir. À l'examen comme à Atlas : contenir, éradiquer, puis seulement restaurer.",
  m1b:"À l'examen (SY0-701), ça tombe comme ça : « Un compte de messagerie compromis a servi à créer une règle de transfert automatique vers l'extérieur. L'administrateur réinitialise le mot de passe. Que reste-t-il à faire ? » Réponse attendue : <b>révoquer les sessions ouvertes et supprimer la règle de transfert</b> — elle survit au changement de mot de passe. Le piège : croire qu'un nouveau mot de passe ferme toutes les portes. Une session déjà ouverte et une règle déjà créée ne demandent plus le mot de passe.",
  m1c:"À l'examen (SY0-701), ça tombe comme ça : « Un employé branche une clé USB trouvée sur un parking et lance un fichier nommé Salaires_2026.pdf.exe. Son poste tente ensuite des connexions SMB vers douze postes de son segment. Quelle réponse est proportionnée ? » Réponse attendue : <b>isoler le segment concerné</b> et traiter les autres postes avant de conclure. Le piège double : isoler le seul poste (la propagation est déjà partie) ou tout le site (on arrête l'activité pour rien). Et blâmer l'employé qui a signalé détruit la culture du signalement — l'examen le compte faux.",
  forensics:"À l'examen (SY0-701), ça tombe comme ça : « Un poste encore allumé doit être analysé après un incident. Dans quel ordre collecte-t-on les preuves ? » Réponse attendue : <b>par ordre de volatilité — la mémoire vive et les processus en cours d'abord, le disque ensuite</b>. Le piège : commencer par le disque parce qu'il contient « plus de preuves » — éteindre le poste efface la RAM, et analyser le disque saisi sans bloqueur en écriture ni vérification d'empreinte abîme la preuve."
};