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
var S;
try{ S = JSON.parse(localStorage.getItem(KEY)) || defState(); }catch(e){ S = defState(); }
["alias","credits","xp","streak","lastDay","plays","best","badges","dex","fpTotal","dailyDate","dailyDone","kevinDone","kevinFailed","sound","examMode","inProgress","coldDone","kevinStage","coverage","mastery","seenVariants","delayedDue","delayedDone","delayedScore","campaign","m1","pack","dojo","devops"].forEach(function(k){ if(S[k]===undefined) S[k]=defState()[k]; });
if(!S.dojo || !S.dojo.done || !S.dojo.best) S.dojo = defState().dojo;
if(!S.devops || !S.devops.done || !S.devops.best) S.devops = defState().devops;
if(!S.pack || !S.pack.cards || !S.pack.scen) S.pack = defState().pack;
if(!S.pack.sims) S.pack.sims = {};
if(!S.m1 || !S.m1.best || !S.m1.plays) S.m1 = defState().m1;
if(!S.campaign || !S.campaign.trust || !S.campaign.done) S.campaign = defState().campaign;
if(!S.campaign.upgrades) S.campaign.upgrades = [];
if(!S.coverage || !S.coverage.tri) S.coverage = defState().coverage;
if(!S.mastery || !S.mastery.tri) S.mastery = defState().mastery;
if(!S.seenVariants || !S.seenVariants.tri) S.seenVariants = defState().seenVariants;
if(S.plays.forensics===undefined) S.plays.forensics = 0;
if(S.best.forensics===undefined) S.best.forensics = 0;
if(!S.coverage.forensics) S.coverage.forensics = [];
if(!S.mastery.forensics) S.mastery.forensics = {clean:0,total:0};
if(!S.seenVariants.forensics) S.seenVariants.forensics = [];
["banque","rouge","dev","conseil","cloud"].forEach(function(id){
  if(S.plays[id]===undefined) S.plays[id] = 0;
  if(S.best[id]===undefined) S.best[id] = 0;
  if(!S.coverage[id]) S.coverage[id] = [];
  if(!S.mastery[id]) S.mastery[id] = {clean:0,total:0};
  if(!S.seenVariants[id]) S.seenVariants[id] = [];
});
if(S.dailyDate !== todayStr()){ S.dailyDate = todayStr(); S.dailyDone = false; }
if(S.lastDay !== todayStr()){
  S.streak = (S.lastDay === ydayStr()) ? S.streak + 1 : 1;
  S.lastDay = todayStr();
}
var saveFailed = false, offlineNoticed = false;
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S)); if(saveFailed){ saveFailed = false; } }
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
function levelOf(xp){ return Math.min(10, Math.floor(xp/100)+1); }
function levelPct(xp){ return xp>=1000 ? 100 : (xp%100); }
function totalXP(){ return S.xp.soc + S.xp.reseau; }
/* Plus de dégressivité anti-farming : chaque partie rapporte plein pot, ses paramètres changent à la place (variantes). */
function dailyGame(){ var games=["tri","phish","defense","forensics","banque","rouge","dev","conseil","cloud"]; var d=new Date(); var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/86400000); return games[n%9]; }