"use strict";
/* ================= MINI-JEU 2 : CHASSE AU PHISHING ================= */
var PH_JUST = {
  1:{ q:"Quel indice justifie ton choix ?", opts:["Le domaine expéditeur : atlas-l0gistics, avec un zéro à la place du o", "L'e-mail est arrivé tôt le matin", "L'objet contient le mot URGENT"], jok:0 },
  3:{ q:"Quel indice justifie ton choix ?", opts:["Le message est très court", "Le PDG écrit depuis un domaine qui n'existe pas chez Atlas et exige un virement secret", "Le PDG ne signe pas de son prénom"], jok:1 },
  4:{ q:"Quel indice justifie ton choix ?", opts:["Karim écrit d'habitude le lundi", "Le ton est familier, donc suspect", "L'adresse est atlas-logistic, sans le s final, et la pièce jointe est un .zip inattendu"], jok:2 }
};
var ph = null;
function startPhish(resume){
  ph = resume && resume.data ? resume.data : { results:{}, cur:null, linkSeen:{}, hdrSeen:{}, clicked:{}, hintUsed:{}, just:{}, hintCount:0, variant:(S.plays.phish % 3), start:Date.now() };
  if(!ph.just) ph.just = {};
  if(ph.hintCount===undefined) ph.hintCount = 0;
  if(ph.variant===undefined) ph.variant = 0;
  if(!ph.start) ph.start = Date.now();
  ph.emails = emailsForVariant(ph.variant);
  /* Justifications alignées sur les domaines de la variante en cours */
  if(ph.variant===1){
    PH_JUST[1] = { q:"Quel indice justifie ton choix ?", opts:["Le domaine expéditeur : atlas-log1stics, avec un 1 à la place du i", "L'e-mail est arrivé tôt le matin", "L'objet contient le mot URGENT"], jok:0 };
    PH_JUST[3] = { q:"Quel indice justifie ton choix ?", opts:["Le message est très court", "Le PDG écrit depuis un domaine qui n'existe pas chez Atlas et exige un virement secret de 18 400 €", "Le PDG ne signe pas de son prénom"], jok:1 };
    PH_JUST[4] = { q:"Quel indice justifie ton choix ?", opts:["Yanis écrit d'habitude le lundi", "Le ton est familier, donc suspect", "L'adresse est atlas-logistcs, lettres inversées, et la pièce jointe est un .zip inattendu"], jok:2 };
  } else if(ph.variant===2){
    PH_JUST[1] = { q:"Quel indice justifie ton choix ?", opts:["Le domaine expéditeur : atlas-l0gistcs, avec un zéro et des lettres inversées", "L'e-mail est arrivé tôt le matin", "L'objet contient le mot URGENT"], jok:0 };
    PH_JUST[3] = { q:"Quel indice justifie ton choix ?", opts:["Le message est très court", "Le PDG écrit depuis un domaine qui n'existe pas chez Atlas et exige un virement secret de 24 900 €", "Le PDG ne signe pas de son prénom"], jok:1 };
    PH_JUST[4] = { q:"Quel indice justifie ton choix ?", opts:["Nadia écrit d'habitude le lundi", "Le ton est familier, donc suspect", "L'adresse est atIas-logistics, avec un I majuscule, et la pièce jointe est un .zip inattendu"], jok:2 };
  } else {
    PH_JUST[1] = { q:"Quel indice justifie ton choix ?", opts:["Le domaine expéditeur : atlas-l0gistics, avec un zéro à la place du o", "L'e-mail est arrivé tôt le matin", "L'objet contient le mot URGENT"], jok:0 };
    PH_JUST[3] = { q:"Quel indice justifie ton choix ?", opts:["Le message est très court", "Le PDG écrit depuis un domaine qui n'existe pas chez Atlas et exige un virement secret", "Le PDG ne signe pas de son prénom"], jok:1 };
    PH_JUST[4] = { q:"Quel indice justifie ton choix ?", opts:["Karim écrit d'habitude le lundi", "Le ton est familier, donc suspect", "L'adresse est atlas-logistic, sans le s final, et la pièce jointe est un .zip inattendu"], jok:2 };
  }
  S.inProgress = { game:"phish", data:ph }; save();
  show("phish");
  renderInbox();
}
function phSave(){ S.inProgress = { game:"phish", data:ph }; save(); }
function renderInbox(){
  var mails = ph.emails || EMAILS;
  var done = Object.keys(ph.results).length;
  var html = '<div class="ghead"><button class="quit" id="phQuit" aria-label="Quitter">✕</button><div class="ttl">Chasse au phishing</div>'+examClockHtml()+'</div>';
  html += '<div class="stepct">Examinés : '+done+' / '+mails.length+' · '+PHISH_VARIANTS[ph.variant||0].label+'</div><div class="progressline"><i style="width:'+Math.round(100*done/mails.length)+'%"></i></div>';
  examStartClock(function(){ return ph && ph.start; });
  mails.forEach(function(m, i){
    html += '<button class="mailitem'+(ph.results[i]!==undefined?' read':'')+'" data-mail="'+i+'"><span class="mf"><span>'+esc(m.from)+'</span><time>'+m.time+'</time></span><span class="ms">'+esc(m.subj)+'</span>'
      + (ph.results[i]!==undefined ? '<div class="mdone">Traité</div>' : '') + '</button>';
  });
  if(done >= mails.length) html += '<button class="btn primary big" id="phEnd" style="margin-top:10px">Voir le debrief</button>';
  $("view-phish").innerHTML = html;
  $("phQuit").addEventListener("click", quitGame);
  document.querySelectorAll("#view-phish [data-mail]").forEach(function(b){
    b.addEventListener("click", function(){ ph.cur = +b.getAttribute("data-mail"); phSave(); renderMail(); });
  });
  var end = $("phEnd"); if(end) end.addEventListener("click", finishPhish);
}
function renderMail(){
  var i = ph.cur, m = (ph.emails || EMAILS)[i];
  var html = '<div class="ghead"><button class="quit" id="mBack" aria-label="Retour">‹</button><div class="ttl">E-mail '+(i+1)+' / '+EMAILS.length+'</div></div>';
  html += '<div class="card mailview"><div class="from">De : <b>'+esc(m.from)+'</b><br>'+esc(m.addr)+' · '+m.time+'</div>'
    + '<div class="subj">'+esc(m.subj)+'</div><div class="body">'+esc(m.body)+'</div>';
  if(m.link){
    html += '<button class="linkchip" id="mLink">'+ICONS.link+'<span>'+esc(m.link.label)+'<br><small style="color:var(--mut);font-weight:500">'+esc(m.link.shown)+'</small></span></button>';
    html += '<div class="destbar'+(ph.linkSeen[i]?' on':'')+(m.legit?' ok':'')+'" id="mDest"><span class="dl">Destination réelle</span>'+esc(m.link.real)+'</div>';
    html += '<button class="detbtn" id="mShowLink" style="margin-top:2px">Voir le lien — afficher sa destination réelle</button>';
    html += '<div style="font-size:12px;color:var(--mut);margin-top:2px">Le bouton « Voir le lien » et l\'appui long font la même chose. Toucher le lien lui-même : l\'ouvrir.</div>';
  }
  if(m.attach){
    html += '<button class="attachchip" id="mAttach">'+ICONS.clip+esc(m.attach)+'</button>';
  }
  html += '<button class="detbtn hdrbtn" id="mHdr">En-têtes d\'authentification '+(ph.hdrSeen[i]?'▴':'▾')+'</button>'
    + '<div class="hdrs'+(ph.hdrSeen[i]?' on':'')+'" id="mHdrs">'
    + '<div class="hrow"><span>SPF</span><span class="'+(m.spf==="Réussi"?"pass":"fail")+'">'+m.spf+'</span></div>'
    + '<div class="hrow"><span>DKIM</span><span class="'+(m.dkim==="Réussi"?"pass":"fail")+'">'+m.dkim+'</span></div>'
    + '<div class="hrow"><span>DMARC</span><span class="'+(m.dmarc==="Réussi"?"pass":"fail")+'">'+m.dmarc+'</span></div></div>';
  html += '</div>';
  if(ph.results[i]!==undefined){
    html += '<div class="card"><p style="margin:0">E-mail déjà traité.</p></div><button class="btn big" id="mRetour">Retour à la boîte</button>';
  } else {
    html += '<div class="quad">'
      + '<button class="a-legit" data-mact="legit">'+ICONS.check+'Légitime</button>'
      + '<button class="a-sign" data-mact="signaler">'+ICONS.flag+'Signaler</button>'
      + '<button class="a-suppr" data-mact="supprimer">'+ICONS.trash+'Supprimer</button>'
      + '<button class="a-quar" data-mact="quarantaine">'+ICONS.box+'Quarantaine</button></div>';
    if(S.examMode){
      html += '<div class="examoff">Mode Examen actif — indices désactivés pour cette mission.</div>';
    } else {
      html += '<button class="hintbtn" id="mHint">Indice d\'Amara — '+((ph.hintCount||0)===0 ? '<b>aide essentielle gratuite</b>' : '<b>15 crédits</b>')+'</button><div class="hintbox" id="mHintBox">« <span class="ms-tw" id="mHintTw">'+(ph.hintUsed[i]?m.hint:'')+'</span> »</div>';
    }
  }
  $("view-phish").innerHTML = html;
  $("mBack").addEventListener("click", function(){ renderInbox(); });
  $("mHdr").addEventListener("click", function(){
    ph.hdrSeen[i] = true; phSave();
    $("mHdrs").classList.add("on"); this.textContent = "En-têtes d'authentification ▴";
  });
  var rb = $("mRetour"); if(rb) rb.addEventListener("click", renderInbox);
  var sl = $("mShowLink");
  if(sl) sl.addEventListener("click", function(){
    ph.linkSeen[i] = true; phSave();
    var db = $("mDest"); if(db) db.classList.add("on"); sndTap();
  });
  var lk = $("mLink");
  if(lk){
    var pressT = null, longDone = false, lastHandled = 0;
    lk.addEventListener("pointerdown", function(e){
      e.preventDefault(); longDone = false;
      pressT = setTimeout(function(){
        longDone = true; ph.linkSeen[i] = true; phSave();
        $("mDest").classList.add("on"); sndTap();
      }, 550);
    });
    lk.addEventListener("pointerup", function(){
      clearTimeout(pressT);
      lastHandled = Date.now();
      if(!longDone) clickTrappedLink(i, m);
    });
    lk.addEventListener("pointerleave", function(){ clearTimeout(pressT); });
    lk.addEventListener("click", function(){
      if(Date.now() - lastHandled < 600) return;
      lastHandled = Date.now();
      clickTrappedLink(i, m);
    });
    lk.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  }
  var at = $("mAttach");
  if(at){
    at.addEventListener("click", function(){
      if(!m.legit && !ph.clicked[i]){
        ph.clicked[i] = true; phSave(); sndBad();
        sheet('<h3>Pièce jointe ouverte…</h3><p>Le fichier « '+esc(m.attach)+' » se lance. L\'antivirus hurle, le poste est isolé du réseau. C\'est exactement ce que l\'attaquant voulait.</p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Compris</button></div>');
      } else if(!m.legit){
        toast("Ce poste est déjà isolé. Décide du sort de l'e-mail.");
      }
    });
  }
  var hb = $("mHint");
  if(hb) hb.addEventListener("click", function(){
    if(ph.hintUsed[i]){ $("mHintBox").classList.add("on"); return; }
    if((ph.hintCount||0)>0 && S.credits < 15){ toast("Pas assez de crédits (15 requis)."); sndBad(); return; }
    if((ph.hintCount||0)>0) S.credits -= 15;
    ph.hintUsed[i] = true; ph.hintCount = (ph.hintCount||0)+1; phSave();
    $("mHintBox").classList.add("on"); sndTap();
    var mtw = $("mHintTw"); if(mtw){ mtw.classList.add("typing"); msTypeEl(mtw, m.hint); }
  });
  if(ph.hintUsed && ph.hintUsed[i]){ var bx=$("mHintBox"); if(bx) bx.classList.add("on"); }
  document.querySelectorAll("#view-phish [data-mact]").forEach(function(b){
    b.addEventListener("click", function(){
      ph.results[i] = b.getAttribute("data-mact"); phSave();
      sndTap();
      if(PH_JUST[i] && ph.just[i]===undefined){ askPhJust(i); return; }
      renderInbox();
    });
  });
}
function askPhJust(i){
  var j = PH_JUST[i];
  var html = '<h3>Raisonnement</h3><p>'+j.q+'</p><div class="sbtns">';
  j.opts.forEach(function(o, oi){ html += '<button class="btn big" style="text-align:left;justify-content:flex-start" onclick="phJustAnswer('+i+','+oi+')">'+esc(o)+'</button>'; });
  html += '</div>';
  sheet(html);
}
function phJustAnswer(i, oi){
  ph.just[i] = (oi === PH_JUST[i].jok);
  phSave(); closeSheet(); sndTap(); renderInbox();
}
function clickTrappedLink(i, m){
  if(m.legit){
    toast("Portail interne officiel : aucun risque.");
    return;
  }
  if(ph.clicked[i]){ toast("Compte déjà compromis sur cet e-mail."); return; }
  ph.clicked[i] = true; phSave(); sndBad();
  sheet('<h3>Compte compromis</h3><p>Tu viens de saisir tes identifiants sur un faux site. Le compte d\'Atlas Logistics est aux mains de l\'attaquant. Signale l\'e-mail pour protéger les autres.</p><div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Compris</button></div>');
}
function finishPhish(){
  var mails = ph.emails || EMAILS;
  var reflexPts = 0, legitKept = 0;
  mails.forEach(function(m, i){
    var r = ph.results[i];
    if(m.legit){
      if(r==="legit") { reflexPts += 1; legitKept += 1; }
      else if(r==="supprimer") { reflexPts += 0.25; }
      else { /* signalé ou quarantaine : faux positif */ }
    } else {
      if(ph.clicked[i]) { /* réflexe annulé */ }
      else if(r==="signaler" || r==="quarantaine") reflexPts += 1;
      else if(r==="supprimer") reflexPts += 0.5;
    }
  });
  var reflex = Math.round(50 * reflexPts / mails.length);
  var idxSeen = 0;
  mails.forEach(function(m, i){ if(ph.linkSeen[i] || ph.hdrSeen[i]) idxSeen++; });
  var jKeys = Object.keys(PH_JUST), jGood = 0;
  jKeys.forEach(function(k){ if(ph.just && ph.just[k]) jGood++; });
  var indices = Math.round(20 * idxSeen / mails.length) + Math.round(10 * jGood / jKeys.length);
  var fauxpos = Math.round(20 * legitKept / 3);
  var score = reflex + indices + fauxpos;
  var why = "";
  mails.forEach(function(m, i){
    var r = ph.results[i];
    var lbl = r==="legit" ? "Légitime" : r==="signaler" ? "Signalé" : r==="supprimer" ? "Supprimé" : r==="quarantaine" ? "En quarantaine" : "Non traité";
    var good, cls;
    if(m.legit){ good = (r==="legit"); cls = good ? "ok" : (r==="supprimer" ? "mid" : "ko"); }
    else { good = !ph.clicked[i] && (r==="signaler"||r==="quarantaine"); cls = ph.clicked[i] ? "ko" : (good ? "ok" : (r==="supprimer" ? "mid" : "ko")); }
    var extra = "";
    if(PH_JUST[i]) extra = (ph.just && ph.just[i]) ? " Justification : la preuve décisive a été citée." : " Justification : la preuve citée n'était pas la décisive.";
    why += whyRow(good, cls, (i+1)+". « "+m.subj+" » — toi : "+lbl+(ph.clicked[i] && !m.legit ? " (lien cliqué !)" : ""), m.why + extra);
  });
  finishMission._newDex = [];
  finishMission._covered = mails.map(function(m,i){ return i; }).filter(function(i){ return ph.results[i]!==undefined; });
  finishMission._hintsUsed = S.examMode ? 0 : Math.max(0, (ph.hintCount||0) - 1);
  finishMission._variant = ph.variant||0;
  finishMission._evalHtml =
    '<p style="margin:4px 0"><b>Décisions :</b> '+Math.round(reflexPts*10)/10+' / '+mails.length+' e-mails traités au mieux.</p>'
    + '<p style="margin:4px 0"><b>Preuves utilisées :</b> '+jGood+' / '+jKeys.length+' justifications décisives sur les e-mails piégés.</p>'
    + '<p style="margin:4px 0"><b>Vérifications :</b> destination réelle ou en-têtes examinés sur '+idxSeen+' / '+mails.length+' e-mails.</p>'
    + '<p style="margin:4px 0"><b>Conséquences métier :</b> '+legitKept+' / 3 e-mails légitimes laissés passer — bloquer un vrai e-mail de paie ou du service IT casse le travail des collègues.</p>';
  finishMission("phish", score, [
    { label:"Bons réflexes", got:reflex, max:50 },
    { label:"Indices repérés", got:indices, max:30 },
    { label:"Faux positifs évités", got:fauxpos, max:20 }
  ], why, function(){
    if(unlockDex("phishing")) finishMission._newDex.push("phishing");
    if(mails[1] && (ph.results[1]==="signaler"||ph.results[1]==="quarantaine") && !ph.clicked[1] && unlockDex("trojan")) finishMission._newDex.push("trojan");
  }, "Le pourquoi, e-mail par e-mail");
}