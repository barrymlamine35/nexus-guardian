"use strict";
/* ================= MINI-CAMPAGNE — LA NUIT D'ÉCLIPSE ================= */
var UPGRADES = [
  { id:"journalisation", name:"Journalisation renforcée", cost:40, txt:"Des journaux complets et conservés 90 jours dans les trois organisations. Pendant la finale, un indice supplémentaire apparaît dans les journaux." },
  { id:"mfa", name:"MFA partout", cost:40, txt:"La double authentification sur tous les comptes des trois organisations. Pendant la finale, la force brute d'ÉCLIPSE bute sur le second facteur." },
  { id:"sauvegardes", name:"Sauvegardes 3-2-1 testées", cost:40, txt:"3 copies, 2 supports, 1 hors site — et une restauration testée. Pendant la finale, la Clinique peut repartir d'un point sain." }
];
function atlasDone(){ return S.best.tri>0 || (S.m1 && S.m1.done); }
function campChaptersDone(){ var n=0; if(atlasDone()) n++; if(S.campaign.done.clinique) n++; if(S.campaign.done.mairie) n++; if(S.campaign.done.finale) n++; return n; }
function finaleUnlocked(){ return atlasDone() && S.campaign.done.clinique && S.campaign.done.mairie; }
var CAMP_SCENARIOS = {
  clinique:{ org:"clinique", orgName:"Clinique Saint-Roch", title:"Chapitre 2 — La Clinique Saint-Roch",
    intro:"Saint-Roch ne peut pas « éteindre et attendre » : les urgences tournent jour et nuit. Même console, mêmes réflexes qu'à Atlas — mais chaque décision pèse sur des soins en cours. Amara : « Là-bas, protéger ne veut jamais dire tout bloquer. »",
    questions:[
      { q:"Serveur d'imagerie, 21 h 40 : des centaines de fichiers se renomment en quelques minutes et une note de rançon apparaît sur le partage. Les urgences, elles, tournent sur un autre système.",
        opts:["Redémarrer le serveur d'imagerie pour « casser » le chiffrement", "Isoler le serveur d'imagerie du réseau, préserver les preuves et vérifier les sauvegardes avant tout", "Attendre la fin de la nuit : l'imagerie peut attendre"],
        ok:1, why:"Chiffrement massif + note de rançon : début de ransomware. Isoler contient sans détruire les preuves, et les urgences continuent sur leur système séparé. Redémarrer peut achever le chiffrement et effacer des traces.",
        impact:"Impact métier : isoler l'imagerie met les examens programmés en attente, mais les urgences tournent sur un système séparé — elles ne sont pas touchées. Ne pas isoler, c'est laisser le chiffrement atteindre le partage commun." },
      { q:"Le service informatique envoie aux soignants : « Votre session Dossier Patient expire ce soir — reconnectez-vous ici pour ne pas perdre vos notes. » Expéditeur : support@clinique-saint-roch.example. Le lien, lui, mène à dossiers-saintroch.example. Une aide-soignante hésite, entre deux patients.",
        opts:["Elle clique : perdre ses notes en pleine garde serait pire", "Elle signale l'e-mail et continue sur sa session déjà ouverte : le domaine du lien n'est pas celui de la clinique, et aucun service informatique ne demande de se reconnecter via un lien reçu par e-mail", "Elle transfère l'e-mail au groupe des soignants pour que tout le monde se reconnecte à temps"],
        ok:1, why:"Phishing ciblé sur le personnel soignant : il joue sur la peur de perdre des notes entre deux patients. L'expéditeur a l'air interne, mais le lien mène à dossiers-saintroch.example — un domaine qui n'appartient pas à la clinique. C'est la destination réelle du lien qui décide, pas l'apparence du message. Signaler protège toute l'équipe ; transférer diffuse le piège." },
      { q:"Constat d'audit : les appareils médicaux connectés — moniteurs, pompes à perfusion — partagent le même réseau plat que les postes administratifs et la borne d'accueil.",
        opts:["Éteindre les appareils connectés pendant la nuit", "Ne rien changer : ils fonctionnent, c'est l'essentiel", "Segmenter : placer les appareils médicaux dans leur propre zone (VLAN), joignable seulement depuis les systèmes de soins autorisés"],
        ok:2, why:"Un appareil médical atteint depuis un poste administratif compromis, c'est un risque patient, pas seulement informatique. La segmentation cloisonne sans arrêter les soins : chaque zone ne parle qu'à ce dont elle a besoin, et les données de santé restent hors de portée du réseau bureautique.",
        impact:"Impact métier : segmenter ne coupe aucun appareil en service — le chantier avance zone par zone, en commençant par les moins critiques, et les soins continuent pendant les travaux." },
      { q:"Garde de nuit : un médecin urgentiste doit ouvrir un dossier depuis un poste que le SOC ne connaît pas. Bloquer retarderait une prise en charge.",
        opts:["Bloquer sec : poste inconnu, règle appliquée", "Laisser passer sans rien vérifier : c'est une urgence", "Vérifier son identité par un canal connu (appel au standard, badge), ouvrir un accès temporaire tracé, puis refermer"],
        ok:2, why:"Ni blocage aveugle ni passe-droit : une vérification rapide par un canal indépendant, un accès temporaire et journalisé. La sécurité qui ignore le soin finit contournée par les soignants eux-mêmes.",
        impact:"Impact métier : bloquer le poste retarde une prise en charge aux urgences ; laisser passer sans vérification expose les dossiers patients. La vérification par le standard prend deux minutes." },
      { q:"Les sauvegardes des dossiers existent, paraît-il. Personne n'a testé une restauration depuis six mois.",
        opts:["Lancer un test de restauration sur un environnement isolé, dès cette semaine", "Augmenter la fréquence des sauvegardes, ça suffira", "Noter « sauvegardes OK » dans le rapport : elles n'ont jamais failli"],
        ok:0, why:"Une sauvegarde jamais testée est une hypothèse, pas une protection. Le test de restauration — sur un environnement isolé — est la seule preuve qu'elle servira le jour du ransomware." }
    ] },
  mairie:{ org:"mairie", orgName:"Mairie de Nexus City", title:"Chapitre 3 — La Mairie de Nexus City",
    intro:"Petite équipe, petit budget, et une obligation qu'Atlas n'a pas : informer les habitants. Ici, la confiance se joue autant dans ce que la mairie dit — et ne dit pas — que dans ses serveurs. Vendredi, 17 h 58.",
    questions:[
      { q:"Vendredi 17 h 58 : la page d'accueil du site de la mairie affiche un message d'ÉCLIPSE à la place des horaires d'ouverture.",
        opts:["Laisser le week-end passer : personne ne regarde le site le samedi", "Basculer le site sur une page statique saine, préserver les journaux du serveur, et publier un mot sobre sur les canaux officiels", "Tout éteindre, y compris l'état civil et les rendez-vous en ligne, jusqu'à lundi"],
        ok:1, why:"Défacement : on contient (page saine), on conserve les preuves (journaux), on informe sans dramatiser. Éteindre tous les services punit les habitants plus que l'attaquant.", t:[-12,8,-4] },
      { q:"La comptable reçoit : « De la part du maire — virement urgent au nouveau fournisseur, confidentiel, avant lundi. » Expéditeur : cabinet@mairie-nexuscity.example. Le vrai domaine : mairie-nexus-city.example.",
        opts:["Payer : un ordre du maire, un vendredi soir, ça s'exécute", "Refuser tout net et ne rien dire à personne", "Ne rien payer et vérifier par un canal connu — appeler le cabinet sur son numéro habituel : domaine faux, urgence et secret, c'est une fraude au président"],
        ok:2, why:"Fraude au président (BEC) version mairie : domaine presque identique, urgence fabriquée, secret exigé. Aucun virement ne part sur un simple e-mail ; on vérifie par le numéro qu'on connaît déjà.", t:[-15,-2,8] },
      { q:"Une association envoie « Subventions_2026.zip » à plusieurs agents, depuis une adresse presque identique à la sienne. Deux agents l'ont déjà téléchargé, pas encore ouvert.",
        opts:["Mettre l'e-mail et le fichier en quarantaine, demander aux agents de ne pas l'ouvrir, et vérifier l'adresse exacte de l'expéditeur", "Ouvrir le .zip sur un poste pour voir ce qu'il contient", "Répondre à l'expéditeur pour lui demander si c'est bien lui"],
        ok:0, why:"Quarantaine d'abord : un .zip inattendu se traite comme suspect tant que l'expéditeur n'est pas vérifié par un autre canal. Répondre, c'est parler à l'attaquant potentiel ; ouvrir « pour voir », c'est l'exécution qu'il attend.", t:[6,-12,-4] },
      { q:"Samedi matin, un journaliste de Nexus Infos appelle : « On nous dit que la mairie a perdu toutes les données des habitants. Vous confirmez ? » À ce stade, le SOC n'a confirmé qu'une chose : le défacement du site, vendredi soir.",
        opts:["Répondre : « Aucune donnée n'a été touchée, c'est une rumeur »", "Donner un point de situation vérifié — le site a été altéré vendredi, il est sécurisé, l'enquête sur les données est en cours — et annoncer le prochain point d'étape", "Refuser tout commentaire tant que l'enquête n'est pas terminée"],
        ok:1, why:"Un journaliste ne se nourrit pas de silence : sans réponse, la rumeur écrit l'article. On donne les faits vérifiés et un rendez-vous pour la suite — ni démenti sans preuve, qui exploserait si l'enquête le contredisait, ni confirmation de ce qu'on ne sait pas encore.", t:[-10,10,-8] },
      { q:"Lundi : le compte d'un agent d'accueil s'est connecté depuis deux pays en 20 minutes. L'agent est en poste, à son bureau, et n'a pas bougé.",
        opts:["Faux positif : l'agent est là, donc tout va bien", "Escalader et vérifier tout de suite : l'agent présent ne prouve pas que son compte n'est pas utilisé ailleurs", "Attendre de voir si ça se reproduit"],
        ok:1, why:"Voyage impossible : la présence de l'agent prouve seulement qu'il n'a pas voyagé — pas que son compte est sain. On escalade, on vérifie, on force la réinitialisation si besoin.", t:[-6,6,-8] }
    ] },
  finale:{ org:"finale", orgName:"Nexus City — les trois organisations", title:"Finale — La nuit d'ÉCLIPSE",
    intro:"Même nuit, même heure : Atlas, Saint-Roch et la Mairie s'allument en même temps sur la console d'Aegis. ÉCLIPSE frappe les trois organisations que tu as protégées — ou essayé de protéger. Amara : « On applique ce qu'on a appris. Organisation par organisation. »",
    questions:[
      { q:"22 h 03 : un scan massif bombarde les trois organisations en même temps. Beaucoup de bruit, partout. Pendant ce temps, un journal signale une unique connexion réussie, discrète, sur un compte de la mairie.",
        opts:["Concentrer toute l'équipe sur le scan : c'est le plus gros signal", "Traiter le scan à l'entrée, et regarder d'abord la connexion réussie discrète : le bruit sert souvent de diversion", "Éteindre les trois organisations par précaution"],
        ok:1, why:"ÉCLIPSE rejoue sa diversion d'Atlas, en triple. Le scan occupe les yeux ; la connexion réussie, elle, est une entrée possible. On filtre le bruit à l'entrée et on suit le signal faible." },
      { q:"22 h 21, Atlas : rafale d'échecs 4625 sur un compte d'exploitation, comme la nuit de j.martin. Puis… plus rien. Aucune connexion réussie.",
        opts:["Incident clos : rien n'est passé", "Rester vigilant et vérifier les journaux : pas de réussite ne veut pas dire pas de tentative — et noter ce qui a arrêté la rafale", "Réinitialiser tous les mots de passe d'Atlas en pleine nuit d'exploitation"],
        ok:1, why:"Une force brute qui échoue reste un incident à documenter : qu'est-ce qui l'a arrêtée, le compte est-il visé ailleurs ? La réponse dépend de ce que la ville avait mis en place — voir la mémoire de la ville, au debrief." },
      { q:"22 h 47, Saint-Roch : un poste d'accueil commence à chiffrer ses fichiers. Les urgences tournent, le poste est relié au partage commun.",
        opts:["Isoler le poste immédiatement, vérifier si le partage est touché, et préparer la restauration depuis la sauvegarde testée si elle existe", "Laisser le poste allumé pour « observer » l'attaque en direct", "Débrancher tout le réseau de la clinique"],
        ok:0, why:"Isoler le poste, pas l'hôpital : les soins continuent, la propagation s'arrête. La suite — restaurer vite ou reconstruire lentement — dépend des sauvegardes réellement en place, pas des intentions." },
      { q:"23 h 15 : ÉCLIPSE publie « nous avons les données des habitants et des patients ». À cette heure, le SOC n'a confirmé aucune exfiltration.",
        opts:["Payer ou négocier tout de suite pour éviter la fuite", "Affirmer publiquement qu'aucune donnée n'a été prise", "Communiquer les faits vérifiés, poursuivre la recherche d'exfiltration dans les journaux, et préparer les organisations à notifier si elle se confirme"],
        ok:2, why:"Ni panique ni démenti gratuit : on dit ce qui est établi, on cherche ce qui ne l'est pas encore. Une revendication d'attaquant n'est pas une preuve — un démenti sans vérification non plus." },
      { q:"23 h 52 : la pression monte, un élu propose de « tout couper jusqu'à lundi ». Les camions d'Atlas partent à 4 h, les urgences de Saint-Roch ne s'arrêtent jamais, l'état civil rouvre à 8 h.",
        opts:["Tout couper : c'est plus sûr", "Isoler uniquement les comptes et systèmes touchés, maintenir les services essentiels sous surveillance renforcée, et réévaluer à chaque fait nouveau", "Ne rien couper du tout : la nuit est presque finie"],
        ok:1, why:"La réponse proportionnée : isoler ce qui est compromis, garder debout ce qui fait vivre la ville, surveiller le reste. Tout couper, c'est finir le travail d'ÉCLIPSE à sa place." }
    ] }
};