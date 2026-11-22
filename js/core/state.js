"use strict";
/* ================= ETAT ================= */
var KEY = "nexus-guardian-v1";
function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function ydayStr(){ var d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function defState(){ return {
  alias:"Recrue", credits:0, xp:{soc:0, reseau:0},
  streak:0, lastDay:"",
  plays:{tri:0, phish:0, defense:0, forensics:0, banque:0, rouge:0, dev:0, conseil:0, cloud:0}, best:{tri:0, phish:0, defense:0, forensics:0, banque:0, rouge:0, dev:0, conseil:0, cloud:0},
  badges:[], dex:[], fpTotal:0,
  dailyDate:"", dailyDone:false, kevinDone:false, kevinFailed:false,
  sound:false, examMode:false, inProgress:null, seenIntro:false,
  coldDone:false, kevinStage:0,
  coverage:{tri:[], phish:[], defense:[], forensics:[], banque:[], rouge:[], dev:[], conseil:[], cloud:[]},
  mastery:{tri:{clean:0,total:0}, phish:{clean:0,total:0}, defense:{clean:0,total:0}, forensics:{clean:0,total:0}, banque:{clean:0,total:0}, rouge:{clean:0,total:0}, dev:{clean:0,total:0}, conseil:{clean:0,total:0}, cloud:{clean:0,total:0}},
  seenVariants:{tri:[], phish:[], defense:[], forensics:[], banque:[], rouge:[], dev:[], conseil:[], cloud:[]},
  delayedDue:0, delayedDone:false, delayedScore:0,
  m1:{ done:false, best:{A:0, B:0, C:0}, plays:{A:0, B:0, C:0} },
  campaign:{ done:{clinique:false, mairie:false, finale:false}, best:{clinique:0, mairie:0, finale:0}, plays:{clinique:0, mairie:0, finale:0},
    trust:{atlas:50, clinique:50, mairie:50}, upgrades:[], finished:false },
  pack:{ scen:{}, scenBest:{}, cards:{}, examBest:0, examPlays:0, fwBest:0, sims:{} },
  dojo:{ done:{}, best:{} },
  devops:{ done:{}, best:{} }
};}
var DEMO_KEY = "nexus-guardian-demo";
var guestMode = false;
function isGuest(){ return guestMode; }
/* Remplit les clés manquantes d'une sauvegarde (ancienne version, démo,
   import) et applique la logique du jour et de la série. */
function normalizeState(s){
  if(!s || typeof s !== "object" || Array.isArray(s)) s = defState();
  ["alias","credits","xp","streak","lastDay","plays","best","badges","dex","fpTotal","dailyDate","dailyDone","kevinDone","kevinFailed","sound","examMode","inProgress","coldDone","kevinStage","coverage","mastery","seenVariants","delayedDue","delayedDone","delayedScore","campaign","m1","pack","dojo","devops"].forEach(function(k){ if(s[k]===undefined) s[k]=defState()[k]; });
  if(!s.dojo || !s.dojo.done || !s.dojo.best) s.dojo = defState().dojo;
  if(!s.devops || !s.devops.done || !s.devops.best) s.devops = defState().devops;
  if(!s.pack || !s.pack.cards || !s.pack.scen) s.pack = defState().pack;
  if(!s.pack.sims) s.pack.sims = {};
  if(!s.m1 || !s.m1.best || !s.m1.plays) s.m1 = defState().m1;
  if(!s.campaign || !s.campaign.trust || !s.campaign.done) s.campaign = defState().campaign;
  if(!s.campaign.upgrades) s.campaign.upgrades = [];
  if(!s.coverage || !s.coverage.tri) s.coverage = defState().coverage;
  if(!s.mastery || !s.mastery.tri) s.mastery = defState().mastery;
  if(!s.seenVariants || !s.seenVariants.tri) s.seenVariants = defState().seenVariants;
  if(s.plays.forensics===undefined) s.plays.forensics = 0;
  if(s.best.forensics===undefined) s.best.forensics = 0;
  if(!s.coverage.forensics) s.coverage.forensics = [];
  if(!s.mastery.forensics) s.mastery.forensics = {clean:0,total:0};
  if(!s.seenVariants.forensics) s.seenVariants.forensics = [];
  ["banque","rouge","dev","conseil","cloud"].forEach(function(id){
    if(s.plays[id]===undefined) s.plays[id] = 0;
    if(s.best[id]===undefined) s.best[id] = 0;
    if(!s.coverage[id]) s.coverage[id] = [];
    if(!s.mastery[id]) s.mastery[id] = {clean:0,total:0};
    if(!s.seenVariants[id]) s.seenVariants[id] = [];
  });
  if(s.dailyDate !== todayStr()){ s.dailyDate = todayStr(); s.dailyDone = false; }
  if(s.lastDay !== todayStr()){
    s.streak = (s.lastDay === ydayStr()) ? s.streak + 1 : 1;
    s.lastDay = todayStr();
  }
  return s;
}
function loadRealState(){
  var s = null;
  try{ s = JSON.parse(localStorage.getItem(KEY)); }catch(e){ s = null; }
  return normalizeState(s);
}
var S = loadRealState();
var saveFailed = false, offlineNoticed = false;
function save(){
  try{ localStorage.setItem(guestMode ? DEMO_KEY : KEY, JSON.stringify(S)); if(saveFailed){ saveFailed = false; } }
  catch(e){
    /* Stockage plein ou indisponible : le jeu ne plante jamais sur une sauvegarde.
       La progression reste en mémoire pour la session, et le joueur est prévenu. */
    if(!saveFailed){ saveFailed = true; setTimeout(function(){ toast("Progression non enregistrée sur cet appareil — stockage indisponible. Elle reste en mémoire pour cette session."); }, 60); }
  }
  renderTop();
}
function saveStateText(){
  return saveFailed ? "Progression non enregistrée sur cet appareil — stockage indisponible. Elle reste en mémoire pour cette session, mais peut se perdre si tu fermes le jeu."
    : "Progression enregistrée sur cet appareil.";
}
/* Export / import de la sauvegarde — local uniquement, jamais de cloud.
   Export : partage du fichier d'abord (iPhone : feuille de partage, puis
   « Enregistrer dans Fichiers »), téléchargement sinon. Import : le fichier
   est validé avant tout, puis remplacé seulement après confirmation. */
function exportSave(){
  var data;
  try{ data = JSON.stringify(S); }
  catch(e){ toast("Export impossible sur cet appareil."); return; }
  var fname = "nexus-guardian-sauvegarde-" + todayStr() + ".json";
  var file = null;
  try{ file = new File([data], fname, {type:"application/json"}); }catch(e){ file = null; }
  if(file && navigator.canShare && navigator.canShare({files:[file]})){
    try{
      var p = navigator.share({files:[file], title:"Sauvegarde Nexus Guardian"});
      if(p && p.then){
        p.then(function(){ toast("Sauvegarde partagée — garde le fichier précieusement."); })
         .catch(function(err){
           if(err && err.name === "AbortError") return; /* partage annulé : on ne fait rien */
           downloadSaveFile(data, fname);
         });
        return;
      }
    }catch(e){ /* partage indisponible : on passe au téléchargement */ }
  }
  downloadSaveFile(data, fname);
}
function downloadSaveFile(data, fname){
  try{
    var blob = new Blob([data], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    toast("Sauvegarde exportée — enregistre le fichier dans Fichiers.");
  }catch(e){ toast("Export impossible sur cet appareil."); }
}
function validateSave(obj){
  if(!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if(typeof obj.alias !== "string" || !obj.alias) return false;
  if(typeof obj.credits !== "number") return false;
  if(!obj.xp || typeof obj.xp !== "object" || Array.isArray(obj.xp)) return false;
  if(typeof obj.xp.soc !== "number" || typeof obj.xp.reseau !== "number") return false;
  if(!obj.plays || typeof obj.plays !== "object" || Array.isArray(obj.plays)) return false;
  if(!obj.best || typeof obj.best !== "object" || Array.isArray(obj.best)) return false;
  var ids = Object.keys(obj.plays), i;
  for(i=0;i<ids.length;i++){ if(typeof obj.plays[ids[i]] !== "number") return false; }
  ids = Object.keys(obj.best);
  for(i=0;i<ids.length;i++){ if(typeof obj.best[ids[i]] !== "number") return false; }
  return true;
}
/* ================= MODE DÉMO (sans compte) =================
   Un avant-goût : la Mission 1 et la première leçon du Dojo sont jouables
   sans compte. La progression démo vit dans sa propre clé locale
   (nexus-guardian-demo) et ne touche jamais la vraie sauvegarde. Aucun
   appel Firebase : la démo marche même hors ligne. */
function demoLockSheet(what){
  sheet('<h3>Crée ton compte pour continuer</h3><p>La démo s\'arrête ici — '+esc(what)+' et tout le reste t\'attendent derrière un compte gratuit. Ta progression démo sera gardée si tu crées ton compte.</p><div class="sbtns"><button class="btn primary big" id="dlGo">Créer mon compte</button><button class="btn big" onclick="closeSheet()">Plus tard</button></div>');
  $("dlGo").addEventListener("click", function(){ closeSheet(); exitDemoToAuth("signup"); });
}
function demoCanPlayDistrict(){ return !guestMode; }
function demoCanOpenLesson(id){ return !guestMode || id === "SH-01"; }
function demoCanOpenPackSection(){ return !guestMode; }
function demoCanOpenDevOpsLesson(){ return !guestMode; }
function enterDemo(){
  var raw = null;
  try{ raw = JSON.parse(localStorage.getItem(DEMO_KEY)); }catch(e){ raw = null; }
  var snd = S.sound;
  S = normalizeState(raw);
  S.sound = snd;
  guestMode = true;
  save();
  gameEntered = true;
  enterGame();
  toast("Mode démo — Mission 1 et première leçon du Dojo, sans compte.");
}
function exitDemoToAuth(mode){
  if(guestMode){ try{ localStorage.setItem(DEMO_KEY, JSON.stringify(S)); }catch(e){} }
  guestMode = false;
  gameEntered = false;
  var snd = S.sound;
  S = loadRealState();
  S.sound = snd;
  save();
  authSetMode(mode || "signup");
  show("auth");
}
function demoSaveExists(){
  var d = null;
  try{ d = JSON.parse(localStorage.getItem(DEMO_KEY)); }catch(e){ d = null; }
  return validateSave(d) ? d : null;
}
function hasRealProgress(s){
  if(!s) return false;
  if((((s.xp && s.xp.soc)||0) + ((s.xp && s.xp.reseau)||0)) > 0) return true;
  if(s.credits > 0) return true;
  if(s.m1 && s.m1.done) return true;
  if(s.dojo && s.dojo.done && Object.keys(s.dojo.done).length) return true;
  if(s.devops && s.devops.done && Object.keys(s.devops.done).length) return true;
  if(s.pack && s.pack.scen && Object.keys(s.pack.scen).length) return true;
  if(s.campaign && s.campaign.finished) return true;
  var ids = ["tri","phish","defense","forensics","banque","rouge","dev","conseil","cloud"], i;
  for(i=0;i<ids.length;i++){ if(s.plays && s.plays[ids[i]]>0) return true; }
  return false;
}
function applyDemoMigration(demo){
  var snd = S.sound;
  S = normalizeState(demo);
  S.sound = snd;
  guestMode = false;
  save();
  try{ localStorage.removeItem(DEMO_KEY); }catch(e){}
}
function maybeOfferDemoMigration(){
  var d = demoSaveExists();
  if(!d) return;
  if(hasRealProgress(S)) return; /* un compte avec une progression ne se fait jamais écraser */
  var xp = (d.xp.soc||0) + (d.xp.reseau||0);
  sheet('<h3>Garder ma progression démo ?</h3><p>Tu as déjà joué en démo sur cet appareil.</p><p><b>'+esc(d.alias)+'</b> · XP total : <b>'+xp+'</b> · Crédits : <b>'+d.credits+'</b></p><div class="sbtns"><button class="btn primary big" id="dmYes">Oui, garder ma progression</button><button class="btn big" id="dmNo">Non, repartir de zéro</button></div>');
  $("dmYes").addEventListener("click", function(){
    applyDemoMigration(d);
    closeSheet();
    toast("Progression démo récupérée.");
    renderHub();
  });
  $("dmNo").addEventListener("click", function(){
    try{ localStorage.removeItem(DEMO_KEY); }catch(e){}
    closeSheet();
  });
}
function levelOf(xp){ return Math.min(10, Math.floor(xp/100)+1); }
function levelPct(xp){ return xp>=1000 ? 100 : (xp%100); }
function totalXP(){ return S.xp.soc + S.xp.reseau; }
/* Plus de dégressivité anti-farming : chaque partie rapporte plein pot, ses paramètres changent à la place (variantes). */
function dailyGame(){ var games=["tri","phish","defense","forensics","banque","rouge","dev","conseil","cloud"]; var d=new Date(); var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/86400000); return games[n%9]; }