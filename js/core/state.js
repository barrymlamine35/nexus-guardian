"use strict";
/* ================= ETAT ================= */
var KEY = "nexus-guardian-v1";
function todayStr(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function ydayStr(){ var d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function defState(){ return {
  alias:"Recrue", credits:0, xp:{soc:0, reseau:0},
  streak:0, lastDay:"",
  plays:{tri:0, phish:0, defense:0}, best:{tri:0, phish:0, defense:0},
  badges:[], dex:[], fpTotal:0,
  dailyDate:"", dailyDone:false, kevinDone:false, kevinFailed:false,
  sound:false, examMode:false, inProgress:null, seenIntro:false,
  coldDone:false, kevinStage:0,
  coverage:{tri:[], phish:[], defense:[]},
  mastery:{tri:{clean:0,total:0}, phish:{clean:0,total:0}, defense:{clean:0,total:0}},
  seenVariants:{tri:[], phish:[], defense:[]},
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
function levelOf(xp){ return Math.min(10, Math.floor(xp/100)+1); }
function levelPct(xp){ return xp>=1000 ? 100 : (xp%100); }
function totalXP(){ return S.xp.soc + S.xp.reseau; }
/* Plus de dégressivité anti-farming : chaque partie rapporte plein pot, ses paramètres changent à la place (variantes). */
function dailyGame(){ var games=["tri","phish","defense"]; var d=new Date(); var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())/86400000); return games[n%3]; }