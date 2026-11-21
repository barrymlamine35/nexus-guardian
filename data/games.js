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
    briefing:"Le poste du chef d'équipe est saisi et son image est sur le banc, bloqueur en écriture en place. Dix artefacts à classer, une nuit à remettre en ordre, et une question qui fait tenir un dossier : qu'est-ce qu'on préserve en premier ? — Cdt. Amara Keïta" },
  banque:{ name:"Fraude aux virements", lieu:"La Banque", domaine:"soc", domLabel:"SOC", xpBase:150,
    briefing:"La banque d'Atlas Logistics a signalé des virements suspects sur le compte de l'entreprise. Huit opérations à trier avant 10 h — c'est l'heure où part le prochain virement — puis trois décisions à trancher avec l'équipe fraude. Un virement parti ne revient presque jamais. — Cdt. Amara Keïta" },
  rouge:{ name:"Chasse à ÉCLIPSE", lieu:"Tour Rouge", domaine:"soc", domLabel:"SOC", xpBase:150,
    briefing:"Léo « Zéro » a repéré des flux bizarres qui sortent de la ville vers des serveurs inconnus. La Tour Rouge, c'est le territoire d'ÉCLIPSE. Huit flux à analyser, une kill chain à remettre en ordre, et une contre-mesure à choisir. — Cdt. Amara Keïta" },
  dev:{ name:"Revue de code", lieu:"Quartier Dev", domaine:"reseau", domLabel:"Réseau", xpBase:150,
    briefing:"L'équipe Dev d'Atlas livre une mise à jour du portail interne. Avant la mise en production, le SOC passe le code en revue : huit extraits à examiner, quatre correctifs à choisir. Le code qu'on ne relit pas, c'est une porte qu'on n'a pas vérifiée. — Cdt. Amara Keïta" },
  conseil:{ name:"La crise, côté direction", lieu:"Tour du Conseil", domaine:"soc", domLabel:"SOC", xpBase:150,
    briefing:"La fraude de la nuit est confirmée, et la direction d'Atlas est réunie. Cinq décisions à prendre, des arbitrages, et aucune bonne réponse facile. La technique, c'est notre métier ; les décisions, c'est celui du conseil. — Cdt. Amara Keïta" },
  cloud:{ name:"Audit cloud", lieu:"Ciel Cloud", domaine:"reseau", domLabel:"Réseau", xpBase:150,
    briefing:"Atlas a migré une partie de ses données dans le cloud, et l'audit de sécurité tombe ce mois-ci. Huit ressources à classer, quatre remédiations à choisir. Dans le cloud, les erreurs ne se voient pas — jusqu'au jour où elles se voient partout. — Cdt. Amara Keïta" }
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
/* Opérations à trier pour l'équipe fraude d'Atlas (ans = fraud / legit / verif). */
var BANQUE_ITEMS = [
  { t:"Virement 48 000 € — nouveau fournisseur", src:"Compte Atlas Logistics — virement programmé", time:"08:00", det:"48 000 € vers un nouveau fournisseur, RIB changé par e-mail la semaine dernière, jamais vérifié. Virement programmé à 8 h.", ans:"fraud",
    hint:"Un RIB qui change par e-mail, ça se vérifie comment ?", why:"Changement de coordonnées bancaires annoncé par e-mail, jamais vérifié par un rappel sur un numéro connu : la fraude classique au faux fournisseur. Un virement parti ne revient presque jamais." },
  { t:"Virement fournisseur habituel — 12 400 €", src:"Compte Atlas Logistics — virement programmé", time:"09:15", det:"12 400 € vers un fournisseur habituel, même RIB depuis deux ans, facture jointe et rapprochée.", ans:"legit",
    hint:"RIB connu, facture jointe… qu'est-ce qui manque pour être une fraude ?", why:"Fournisseur connu, RIB inchangé depuis deux ans, facture rapprochée : une opération normale, documentée." },
  { t:"Avance de frais — 9 800 €", src:"Compte Atlas Logistics — virement interne", time:"10:02", det:"9 800 € vers le compte personnel d'un employé, libellé « avance frais », aucun justificatif joint.", ans:"verif",
    hint:"Une avance, ça se justifie. Sans papier, on fait quoi ?", why:"Une avance de frais peut être légitime, mais sans justificatif ni validation du manager, on ne tranche pas : on vérifie auprès de la personne et de son responsable." },
  { t:"Quatre virements de 30 000 €", src:"Compte Atlas Logistics — virements du jour", time:"11:20", det:"120 000 € fractionnés en quatre virements de 30 000 €, vers quatre comptes différents, le même jour, sans facture.", ans:"fraud",
    hint:"Pourquoi couper 120 000 € en quatre morceaux ?", why:"Fractionner une somme en plusieurs virements vers des comptes différents, sans facture : le fractionnement sert à passer sous les seuils de contrôle. Comptes mules." },
  { t:"Paie mensuelle", src:"Compte Atlas Logistics — virement programmé", time:"08:30", det:"Virement de la paie du mois, montant et bénéficiaires habituels, ordre signé par la direction.", ans:"legit",
    hint:"Même montant, mêmes bénéficiaires, chaque mois…", why:"Paie mensuelle, montant et bénéficiaires habituels, ordre signé : une opération récurrente et documentée." },
  { t:"Remboursement trop-perçu — 7 500 €", src:"Compte Atlas Logistics — virement programmé", time:"13:45", det:"7 500 € vers un compte ouvert il y a trois jours, libellé « remboursement trop-perçu », bénéficiaire inconnu d'Atlas.", ans:"fraud",
    hint:"Un compte tout neuf, un bénéficiaire inconnu, un libellé qui rassure…", why:"Compte ouvert il y a trois jours, bénéficiaire inconnu, libellé rassurant : un compte mule classique. Le libellé est écrit par celui qui envoie." },
  { t:"Premier virement étranger — 2 300 €", src:"Compte Atlas Logistics — virement programmé", time:"14:10", det:"2 300 € vers un fournisseur étranger, première fois. Commande vérifiée par S. Roche, facture jointe.", ans:"verif",
    hint:"Première fois + étranger : qu'est-ce qui te rassure, qu'est-ce qui t'inquiète ?", why:"Première fois vers l'étranger, montant modeste, mais commande vérifiée par le manager et facture jointe : rien d'anormal, mais un premier virement vers un nouveau pays mérite un œil — on vérifie, on ne bloque pas." },
  { t:"Virement urgent du PDG — 65 000 €", src:"Compte Atlas Logistics — ordre par e-mail", time:"09:41", det:"E-mail du PDG : virement urgent et confidentiel de 65 000 € vers un compte externe, « ne le dites à personne ».", ans:"fraud",
    hint:"Un PDG qui demande le secret et l'urgence… tu as déjà vu ça où ?", why:"Fraude au président (BEC) : urgence fabriquée, secret exigé, compte externe. On ne vire jamais sur un simple e-mail — on vérifie par un autre canal." }
];
var BANQUE_DECISIONS = [
  { q:"Le virement de 48 000 € part à 8 h. Le RIB n'a pas été vérifié. Tu fais quoi ?",
    opts:["Bloquer le virement et appeler Nadia Perrin sur son numéro connu","Laisser partir le virement et vérifier après","Remettre l'ancien RIB et laisser partir"], ok:0,
    why:"On bloque, puis on vérifie par un canal indépendant — rappeler sur le numéro déjà connu, jamais celui du message suspect. Un virement parti sur un faux RIB ne revient presque jamais." },
  { q:"Un employé signale un virement suspect vers un compte mule. Que fait l'équipe ?",
    opts:["Escalader à l'équipe fraude et faire geler le compte","Attendre le prochain relevé pour voir","Prévenir le bénéficiaire du virement"], ok:0,
    why:"On escalade et on gèle : chaque heure compte, l'argent bouge vite entre comptes mules. Prévenir le bénéficiaire, c'est prévenir le fraudeur." },
  { q:"La direction propose de « régler ça en interne, sans prévenir la banque ». Tu réponds quoi ?",
    opts:["Prévenir la banque et déposer plainte","Accepter, pour éviter le scandale","Ne rien dire et surveiller en silence"], ok:0,
    why:"Une fraude bancaire se signale à la banque et aux autorités. La dissimulation n'arrête pas la fraude — elle l'aggrave, et elle engage la responsabilité de ceux qui savaient." }
];
/* Flux à analyser sur la Tour Rouge (ans = c2 / legit / verif). */
var ROUGE_ITEMS = [
  { t:"Connexion toutes les 60 secondes", src:"Journal du pare-feu — flux sortant", time:"03:41", det:"Un poste contacte la même adresse externe toutes les 60 secondes exactement, 2 Ko à chaque fois, depuis 03:41.", ans:"c2",
    hint:"Régulier comme une horloge, toujours la même taille…", why:"Un rythme fixe, une taille fixe, une adresse inconnue : un beacon — le poste appelle son serveur de commande et contrôle à intervalles réguliers pour recevoir des ordres." },
  { t:"Centaines de noms de domaine bizarres", src:"Journal DNS", time:"04:05", det:"Un poste demande des centaines de noms de domaine de 30 caractères, sans voyelles, en une heure. Aucun ne correspond à un site connu.", ans:"c2",
    hint:"Des noms illisibles, par centaines : qui génère ça ?", why:"Des domaines générés automatiquement, en masse : la signature d'un algorithme de génération de domaines (DGA). Le poste cherche son serveur de commande parmi des centaines de noms." },
  { t:"Sauvegarde nocturne vers le serveur interne", src:"Journal du pare-feu — flux interne", time:"03:00", det:"Copie planifiée vers srv-backup-01, volume habituel, destination interne, compte de service connu.", ans:"legit",
    hint:"Même heure, même volume, même destination…", why:"Sauvegarde planifiée, compte de service connu, destination interne, volume habituel : du bruit normal, pas une exfiltration." },
  { t:"Mises à jour vers l'éditeur", src:"Journal du pare-feu — flux sortant", time:"02:30", det:"Connexions vers les serveurs de mise à jour de l'éditeur du système, pendant la fenêtre de maintenance.", ans:"legit",
    hint:"La fenêtre de maintenance, encore elle…", why:"Mises à jour planifiées vers l'éditeur, en pleine fenêtre de maintenance : du trafic attendu, pas un beacon." },
  { t:"Gros envoi vers un service de partage", src:"Journal du pare-feu — flux sortant", time:"18:20", det:"Un poste envoie 4 Go vers un service de partage de fichiers connu, un vendredi soir. L'utilisateur est en déplacement.", ans:"verif",
    hint:"4 Go un vendredi soir : du travail, ou une fuite ?", why:"Un service connu, un utilisateur en déplacement : ça peut être du travail légitime comme une exfiltration. Sans parler à l'utilisateur, on ne tranche pas." },
  { t:"Une seule requête vers un domaine tout neuf", src:"Journal DNS", time:"22:47", det:"Un poste de la compta interroge un domaine enregistré la veille, jamais vu ailleurs dans la ville.", ans:"c2",
    hint:"Un domaine d'hier, interrogé par un poste de la compta…", why:"Un domaine tout neuf, jamais vu ailleurs, interrogé depuis un poste sensible : un premier contact avec un serveur de commande. Les domaines d'attaque vivent quelques jours, pas des années." },
  { t:"Trafic vers le portail interne", src:"Journal du pare-feu — flux interne", time:"09:05", det:"Connexions vers atlas-logistics.example/portail, adresses internes, certificats vérifiés.", ans:"legit",
    hint:"Le portail de l'entreprise, encore…", why:"Trafic interne vers le portail de l'entreprise, domaine et certificat vérifiés : du travail normal." },
  { t:"Connexion externe à 03:12", src:"Journal du pare-feu — flux sortant", time:"03:12", det:"Connexion sortante à 03:12, la minute même où le compte j.martin tombe. Adresse externe inconnue.", ans:"c2",
    hint:"03:12… cette minute te dit quelque chose ?", why:"À la minute où le compte est compromis, un poste contacte une adresse externe inconnue : la compromission appelle son serveur. La corrélation fait la preuve." }
];
/* Kill chain d'ÉCLIPSE, dans l'ordre (reconnaissance → exfiltration). */
var ROUGE_KILLCHAIN = [
  { t:"Reconnaissance", time:"21:58", det:"Scan des ports de l'entreprise, repéré par l'IDS." },
  { t:"Accès initial", time:"22:41", det:"Le document de paie est ouvert, la macro se lance." },
  { t:"Persistance", time:"03:40", det:"Tâche « MajService » créée pour relancer l'attaque." },
  { t:"Commande et contrôle", time:"03:41", det:"Premier beacon vers le serveur d'ÉCLIPSE, toutes les 60 secondes." },
  { t:"Exfiltration", time:"03:55", det:"Copies d'e-mails vers l'extérieur, via la règle de transfert." }
];
var ROUGE_KILLCHAIN_WHY = "Une attaque, c'est une chaîne : chaque étape prépare la suivante. La reconnaissance repère la cible, le document piégé ouvre la porte, la persistance la garde ouverte, le beacon reçoit les ordres, et l'exfiltration sort ce qui a de la valeur. Couper un seul maillon, c'est ralentir l'attaque — mais la casser, c'est supprimer la chaîne entière : comptes, sessions, règles, tâches planifiées.";
var ROUGE_QCM = {
  q:"Premier geste pour couper ÉCLIPSE, maintenant que tu as la chaîne complète ?",
  opts:[
    "Bloquer le domaine de commande et isoler les postes qui le contactent",
    "Éteindre tous les serveurs de la ville",
    "Changer tous les mots de passe de l'entreprise",
    "Attendre la prochaine connexion pour observer"
  ],
  ok:0,
  why:"On coupe le canal de commande et on isole les postes compromis : sans ordres, l'attaque s'arrête. Éteindre tout le monde arrête le travail sans supprimer la persistance — et changer les mots de passe ne ferme pas un beacon déjà installé."
};
/* Extraits de code du portail interne à examiner (opts = vulnérabilité suspectée, ok = index de la bonne réponse). */
var DEV_ITEMS = [
  { t:"Recherche de client", src:"portail-interne/recherche.js", code:"requête = \"SELECT * FROM clients WHERE id = \" + id_utilisateur", det:"La recherche de client du portail interne : l'identifiant tapé par l'utilisateur est collé tel quel dans la requête.", opts:["Injection SQL","Secret en dur","Aucune vulnérabilité"], ok:0,
    hint:"L'identifiant est collé dans la requête. Et si on tape autre chose qu'un chiffre ?", why:"L'entrée de l'utilisateur est collée telle quelle dans la requête SQL : un attaquant peut y glisser sa propre requête et lire — ou modifier — la base." },
  { t:"Page de bienvenue", src:"portail-interne/accueil.js", code:"page.innerHTML = \"Bonjour \" + nom_entrant", det:"La page d'accueil du portail affiche le nom tapé par le visiteur, sans aucun traitement.", opts:["Cross-site scripting (XSS)","Traversée de chemin","Aucune vulnérabilité"], ok:0,
    hint:"Le nom est affiché tel quel dans la page. Et si le nom contient du code ?", why:"Le nom entrant est injecté dans la page sans encodage : un attaquant peut y glisser du script, qui s'exécutera dans le navigateur des autres visiteurs." },
  { t:"Connexion à l'API", src:"portail-interne/api.js", code:"mot_de_passe_api = \"Atlas2026!\"", det:"Le mot de passe de l'API de facturation, écrit directement dans le code source du portail.", opts:["Secret en dur","Injection SQL","Aucune vulnérabilité"], ok:0,
    hint:"Un mot de passe dans le code, ça voyage où, le code ?", why:"Un secret écrit en dur dans le code part avec lui : dépôt, sauvegardes, copies. Il appartient à un coffre à secrets ou à une variable d'environnement, jamais au code." },
  { t:"Chargement d'un fichier partagé", src:"portail-interne/partage.js", code:"données = désérialiser(données_reçues)", det:"Le serveur exécute des données reçues telles quelles, sans vérifier d'où elles viennent.", opts:["Désérialisation non sécurisée","Cross-site scripting (XSS)","Aucune vulnérabilité"], ok:0,
    hint:"Des données reçues, exécutées telles quelles…", why:"Désérialiser des données non vérifiées, c'est exécuter ce que l'expéditeur a décidé : un attaquant peut y cacher des instructions." },
  { t:"Mot de passe stocké", src:"portail-interne/comptes.js", code:"mot_de_passe = hacher(mot_de_passe, sel_aléatoire)", det:"Les mots de passe des utilisateurs sont hashés avec un sel aléatoire avant d'être stockés.", opts:["Injection SQL","Secret en dur","Aucune vulnérabilité"], ok:2,
    hint:"Hashé, salé… qu'est-ce qu'il manque ?", why:"Rien ne manque : hachage avec sel aléatoire, c'est la bonne pratique. Même si la base fuit, les mots de passe ne sont pas lisibles." },
  { t:"Recherche sécurisée", src:"portail-interne/recherche.js", code:"requête = préparer(\"SELECT * FROM clients WHERE id = ?\", id_utilisateur)", det:"La même recherche de client, avec une requête préparée : l'identifiant ne touche plus jamais la requête.", opts:["Injection SQL","Traversée de chemin","Aucune vulnérabilité"], ok:2,
    hint:"L'identifiant est un paramètre, pas un morceau de requête.", why:"Requête préparée : l'identifiant est passé comme un paramètre, jamais collé dans la requête. L'injection n'a plus où s'accrocher." },
  { t:"Téléchargement de fichier", src:"portail-interne/fichiers.js", code:"fichier = ouvrir(\"/données/\" + nom_fichier)", det:"Le portail sert un fichier dont le nom vient de l'utilisateur, sans aucun contrôle.", opts:["Traversée de chemin","Injection SQL","Aucune vulnérabilité"], ok:0,
    hint:"Le nom du fichier vient de l'utilisateur. Et si le nom contient « .. » ?", why:"Sans contrôle, le nom de fichier peut remonter dans l'arborescence (« .. ») et ouvrir des fichiers hors du dossier prévu. Il faut une liste blanche de fichiers autorisés." },
  { t:"Journal des connexions", src:"portail-interne/journaux.js", code:"journal(\"Connexion de \" + utilisateur + \" / \" + mot_de_passe)", det:"Les journaux du portail enregistrent le nom d'utilisateur… et le mot de passe en clair.", opts:["Exposition d'informations sensibles","Désérialisation non sécurisée","Aucune vulnérabilité"], ok:0,
    hint:"Un mot de passe dans les journaux, ça se lit par qui ?", why:"Les journaux se relisent, se copient, se sauvegardent : un mot de passe en clair dans un journal, c'est un mot de passe qui circule." }
];
var DEV_FIXES = [
  { q:"Correctif pour la recherche de client (injection SQL) ?",
    opts:["Requêtes paramétrées, l'identifiant devient un paramètre","Échapper les guillemets à la main, partout","Interdire les chiffres dans la recherche"], ok:0,
    why:"La requête paramétrée sépare le code des données : l'entrée de l'utilisateur ne peut plus devenir du SQL. Échapper à la main, c'est oublier un cas sur deux." },
  { q:"Correctif pour la page de bienvenue (XSS) ?",
    opts:["Encoder la sortie avant de l'afficher dans la page","Désactiver JavaScript pour tout le monde","Afficher le nom en image au lieu de texte"], ok:0,
    why:"Encoder la sortie neutralise le code injecté : il s'affiche comme du texte, il ne s'exécute plus." },
  { q:"Correctif pour le mot de passe API en dur ?",
    opts:["Le mettre dans un coffre à secrets, lu au démarrage","Le mettre dans un autre fichier du dépôt","Le remplacer par un mot de passe plus long"], ok:0,
    why:"Un secret appartient à un coffre à secrets ou à une variable d'environnement, jamais au code : le code voyage, le coffre reste fermé." },
  { q:"Correctif pour le téléchargement de fichier (traversée de chemin) ?",
    opts:["Liste blanche : seuls les fichiers autorisés peuvent être servis","Vérifier seulement l'extension du fichier","Interdire les dossiers dans les noms"], ok:0,
    why:"Une liste blanche de fichiers autorisés ferme la porte : on ne sert que ce qui est prévu. Vérifier l'extension ne bloque pas les « .. »." }
];
var DEV_QCM = {
  q:"Le portail est corrigé. Quelle règle protège le mieux, sur la durée ?",
  opts:[
    "Plusieurs couches de défense : validation, requêtes paramétrées, moindre privilège",
    "Un seul pare-feu très fort devant tout",
    "Faire confiance au code interne, il est relu",
    "Ne plus rien journaliser, pour ne rien exposer"
  ],
  ok:0,
  why:"Défense en profondeur : plusieurs couches, pour qu'une faille seule ne suffise pas. Un seul mur, aussi fort soit-il, tombe d'un coup — et le code interne a des bugs, comme tout code."
};
/* Décisions du conseil d'Atlas (group = crise / gouv). */
var CONSEIL_ITEMS = [
  { q:"La fuite touche des données clients. Le régulateur attend une notification dans un délai légal. On fait quoi ?",
    opts:["Notifier dans le délai, avec les faits vérifiés","Attendre la fin de l'enquête pour tout dire d'un coup","Ne notifier que si la presse en parle"], ok:0, group:"crise",
    why:"Les délais de notification sont réglementaires : attendre, c'est s'exposer à des sanctions. On notifie dans le délai, avec ce qui est vérifié — et on complète ensuite." },
  { q:"ÉCLIPSE demande une rançon en échange des données volées. Le conseil vote :",
    opts:["Refuser de payer, restaurer depuis les sauvegardes testées","Payer vite pour récupérer les données","Négocier le montant à la baisse"], ok:0, group:"crise",
    why:"Payer ne garantit rien : ni la récupération, ni la non-publication — et l'argent finance la prochaine attaque. Les sauvegardes testées restent la seule réponse qui tient." },
  { q:"40 000 € à répartir pour sécuriser Atlas. La priorité ?",
    opts:["MFA partout et journalisation renforcée","Un seul outil de détection très cher","Former toute l'entreprise en une journée"], ok:0, group:"gouv",
    why:"Les mesures de base protègent plus qu'un outil seul : la MFA bloque la plupart des compromissions de comptes, et les journaux disent ce qui s'est passé. La formation compte, mais elle ne remplace pas les contrôles." },
  { q:"Un prestataire a accès au réseau d'Atlas et refuse un audit de sécurité. On fait quoi ?",
    opts:["Suspendre son accès tant qu'il refuse l'audit","Lui faire confiance, c'est un partenaire historique","Lui donner plus d'accès pour accélérer le travail"], ok:0, group:"gouv",
    why:"Un tiers non audité, c'est une porte qu'on ne contrôle pas. L'ancienneté ne remplace pas une vérification : on suspend l'accès, on discute ensuite." },
  { q:"Les clients d'Atlas demandent ce qui s'est passé. Que leur dit-on ?",
    opts:["Les faits vérifiés, ce qui est fait, et ce qu'ils doivent faire","Que tout va bien, pour ne pas inquiéter","Rien du tout, tant que l'enquête n'est pas finie"], ok:0, group:"crise",
    why:"La transparence sur des faits vérifiés garde la confiance : ce qui s'est passé, ce qui est fait, ce que les clients doivent faire. Le silence laisse la rumeur décider à notre place." }
];
/* Ressources cloud à classer pour l'audit (ans = crit / corr / ok). */
var CLOUD_ITEMS = [
  { t:"Sauvegardes accessibles à tout le monde", src:"Stockage cloud — contrôle d'accès", time:"Audit", det:"Le stockage des sauvegardes est accessible à tout le monde sur Internet, sans mot de passe.", ans:"crit",
    hint:"Des sauvegardes, ouvertes à tout le monde…", why:"Critique : des sauvegardes accessibles sans authentification, c'est l'entreprise entière à portée de clic. On restreint l'accès et on audite qui a déjà regardé." },
  { t:"Compte de service administrateur", src:"IAM — rôles et droits", time:"Audit", det:"Un compte de service qui ne lit que des rapports a le rôle « administrateur » complet.", ans:"crit",
    hint:"Un compte qui lit des rapports, avec tous les droits…", why:"Critique : un compte compromis avec des droits d'administrateur fait des dégâts sans limite. Le moindre privilège, c'est donner à chacun seulement ce dont il a besoin." },
  { t:"Clé d'accès dans un dépôt public", src:"Dépôt de code — secret repéré", time:"Audit", det:"Une clé d'accès cloud est écrite en clair dans un dépôt de code public.", ans:"crit",
    hint:"Une clé dans un dépôt public, ça se lit par qui ?", why:"Critique : une clé exposée publiquement, c'est une porte ouverte — et elle a peut-être déjà été copiée. On la révoque, on en crée une nouvelle, hors du code." },
  { t:"Journalisation désactivée", src:"Stockage cloud — journalisation", time:"Audit", det:"La journalisation des accès est désactivée sur le stockage des sauvegardes.", ans:"crit",
    hint:"Sans journaux, on saura quoi, quand quelque chose arrive ?", why:"Critique : sans journaux, on ne verra pas l'intrusion — ni qui a accédé à quoi, ni quand. La journalisation, c'est la mémoire de l'infrastructure." },
  { t:"Données chiffrées", src:"Stockage cloud — chiffrement", time:"Audit", det:"Les données sont chiffrées, clés gérées par le fournisseur, rotation automatique.", ans:"ok",
    hint:"Chiffré, clés gérées, rotation auto…", why:"Acceptable : chiffrement activé, clés gérées et tournées automatiquement. C'est la base, et elle est en place." },
  { t:"MFA pour les administrateurs", src:"IAM — authentification", time:"Audit", det:"La MFA est activée pour tous les comptes administrateurs du cloud.", ans:"ok",
    hint:"Tous les admins, avec un deuxième facteur…", why:"Acceptable : la MFA sur tous les comptes administrateurs bloque la plupart des compromissions de comptes. C'est le contrôle qui protège le plus, pour le moins cher." },
  { t:"Compte dormant de prestataire", src:"IAM — comptes", time:"Audit", det:"Le compte d'un prestataire parti il y a six mois est toujours actif.", ans:"corr",
    hint:"Un compte qui ne sert plus, mais qui ouvre toujours…", why:"À corriger : un compte dormant, c'est une porte oubliée. On le désactive — et on revoit la procédure de départ des prestataires." },
  { t:"Sauvegardes testées chaque mois", src:"Stockage cloud — sauvegardes", time:"Audit", det:"Les sauvegardes sont testées une fois par mois, restauration vérifiée et documentée.", ans:"ok",
    hint:"Testées, vérifiées, documentées…", why:"Acceptable : une sauvegarde non testée n'est pas une sauvegarde. Ici, la restauration est vérifiée chaque mois." }
];
var CLOUD_FIXES = [
  { q:"Remédiation pour les sauvegardes accessibles à tout le monde ?",
    opts:["Restreindre l'accès et auditer qui a déjà regardé","Supprimer les sauvegardes","Changer le nom du stockage"], ok:0,
    why:"On ferme l'accès et on vérifie qui a déjà consulté les données : supprimer les sauvegardes, c'est perdre la protection ; renommer ne ferme rien." },
  { q:"Remédiation pour le compte de service administrateur ?",
    opts:["Un rôle en lecture seule, juste ce qu'il faut pour les rapports","Donner le même rôle à tout le monde, pour être juste","Supprimer le compte de service"], ok:0,
    why:"Le moindre privilège : un rôle en lecture seule, juste ce qu'il faut. Supprimer le compte casserait les rapports — on réduit ses droits, on ne le supprime pas." },
  { q:"Remédiation pour la clé d'accès exposée ?",
    opts:["Révoquer la clé, en créer une nouvelle, hors du code","Changer le mot de passe du dépôt","Ne rien faire, la clé est ancienne"], ok:0,
    why:"Une clé exposée se révoque d'abord — elle a peut-être déjà été copiée — puis on en crée une nouvelle, stockée hors du code. Changer un mot de passe ne révoque pas une clé." },
  { q:"Remédiation pour la journalisation désactivée ?",
    opts:["Activer la journalisation, avec une alerte sur les accès sensibles","Journaliser seulement les erreurs","Désactiver les journaux pour économiser"], ok:0,
    why:"On active la journalisation et une alerte sur les accès sensibles : les journaux sont la mémoire de l'infrastructure. Les économiser, c'est s'aveugler." }
];
var CLOUD_QCM = {
  q:"Dans le cloud, qui sécurise quoi ?",
  opts:[
    "Partagée : l'infrastructure au fournisseur, tes comptes, tes accès et tes données à toi",
    "Tout au fournisseur, c'est son métier",
    "Tout à toi, le cloud ne fait rien",
    "Personne : le cloud est sûr par nature"
  ],
  ok:0,
  why:"Responsabilité partagée : le fournisseur sécurise l'infrastructure, tu restes responsable de tes comptes, de tes accès et de tes données. Un compte sans MFA reste une porte ouverte, même dans le cloud."
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
  { id:"chaine", name:"Chaîne de possession", txt:"Documenter qui a touché une preuve, quand et comment — image du disque derrière un bloqueur en écriture, empreinte vérifiée, copie de travail. Sans chaîne de possession, une preuve ne tient pas." },
  { id:"bec", name:"Fraude BEC", txt:"Business Email Compromise : un e-mail qui imite un dirigeant ou un fournisseur pour faire faire un virement. Urgence, secret, compte externe — et toujours une vérification par un autre canal avant de payer." },
  { id:"mule", name:"Compte mule", txt:"Compte ouvert pour recevoir puis transférer de l'argent frauduleux. Souvent ouvert avec une fausse identité, il ne vit que quelques jours — le fractionnement en plusieurs petits virements sert à passer sous les seuils de contrôle." },
  { id:"c2", name:"Commande et contrôle (C2)", txt:"Le serveur qui pilote les postes compromis : il envoie les ordres, récupère les données. Le couper — bloquer le domaine, isoler les postes — arrête l'attaque, mais il faut aussi supprimer la persistance." },
  { id:"beacon", name:"Beacon", txt:"Signal régulier envoyé par un poste compromis vers son serveur de commande : même rythme, même taille, à intervalles fixes. La régularité est la signature — le trafic humain, lui, est irrégulier." },
  { id:"injection", name:"Injection", txt:"Glisser du code ou une requête dans une entrée que le programme colle telle quelle : SQL, script dans une page, chemin de fichier. La défense : ne jamais faire confiance à une entrée — requêtes paramétrées, encodage de sortie, listes blanches." },
  { id:"correctif", name:"Corriger, pas contourner", txt:"Un correctif ne déplace pas le problème : il supprime la cause. Requête paramétrée contre l'injection, encodage de sortie contre le XSS, coffre à secrets contre le secret en dur, liste blanche contre la traversée de chemin." },
  { id:"notification", name:"Notification réglementaire", txt:"Quand une fuite touche des données personnelles, le régulateur attend d'être prévenu dans un délai légal. On notifie avec les faits vérifiés, puis on complète : attendre la fin de l'enquête, c'est s'exposer à des sanctions." },
  { id:"rancon", name:"Ne jamais payer la rançon", txt:"Payer une rançon ne garantit rien : ni la récupération des données, ni leur non-publication — et l'argent finance la prochaine attaque. La seule réponse qui tient : des sauvegardes testées, et une restauration vérifiée." },
  { id:"iam", name:"IAM — moindre privilège", txt:"Identity and Access Management : qui peut faire quoi, dans le cloud. Le moindre privilège, c'est donner à chaque compte seulement les droits dont il a besoin — un compte de service qui lit des rapports n'a pas besoin d'être administrateur." },
  { id:"stockage", name:"Stockage public", txt:"Un stockage cloud accessible à tout le monde sur Internet, sans authentification : l'erreur la plus simple et la plus grave. On restreint l'accès, on audite qui a déjà regardé, et on vérifie les partages régulièrement." }
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
  forensics:"À l'examen (SY0-701), ça tombe comme ça : « Un poste encore allumé doit être analysé après un incident. Dans quel ordre collecte-t-on les preuves ? » Réponse attendue : <b>par ordre de volatilité — la mémoire vive et les processus en cours d'abord, le disque ensuite</b>. Le piège : commencer par le disque parce qu'il contient « plus de preuves » — éteindre le poste efface la RAM, et analyser le disque saisi sans bloqueur en écriture ni vérification d'empreinte abîme la preuve.",
  banque:"À l'examen (SY0-701), ça tombe comme ça : « Un fournisseur envoie un nouvel RIB par e-mail et demande un virement urgent de 48 000 €. Que faire avant de payer ? » Réponse attendue : <b>vérifier le changement par un canal indépendant — rappeler sur le numéro déjà connu</b>. Le piège : se fier à l'e-mail parce qu'il « ressemble » à celui du fournisseur. Un RIB ne change jamais sur un simple e-mail.",
  rouge:"À l'examen (SY0-701), ça tombe comme ça : « Un poste contacte la même adresse externe toutes les 60 secondes, avec des paquets de même taille, et interroge des centaines de domaines générés automatiquement. Que révèle ce trafic ? » Réponse attendue : <b>un canal de commande et contrôle (C2), avec un beacon et des domaines générés (DGA)</b>. Le piège : appeler ça « du bruit de fond » — la régularité est la signature.",
  dev:"À l'examen (SY0-701), ça tombe comme ça : « Une application construit une requête SQL en collant l'entrée de l'utilisateur dans la chaîne. Quelle est la vulnérabilité, et quel est le correctif ? » Réponse attendue : <b>injection SQL — le correctif, ce sont les requêtes paramétrées</b>. Le piège : « échapper les caractères spéciaux à la main » — on oublie toujours un cas.",
  conseil:"À l'examen (SY0-701), ça tombe comme ça : « Après une attaque par rançongiciel, la direction hésite à payer la rançon pour récupérer les données. Quelle est la bonne réponse ? » Réponse attendue : <b>ne pas payer — restaurer depuis des sauvegardes testées</b>. Le piège : croire que payer garantit la récupération. Payer ne garantit rien, et finance la prochaine attaque.",
  cloud:"À l'examen (SY0-701), ça tombe comme ça : « Un stockage cloud contenant des sauvegardes est accessible publiquement sans authentification. Qui est responsable, et quelle est la première action ? » Réponse attendue : <b>responsabilité partagée — toi pour tes accès et tes données : restreindre l'accès immédiatement</b>. Le piège : « c'est au fournisseur de sécuriser le cloud » — le fournisseur sécurise l'infrastructure, pas tes partages."
};