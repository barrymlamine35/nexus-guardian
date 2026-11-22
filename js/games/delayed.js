"use strict";
/* ================= EPREUVE DIFFEREE — CLINIQUE SAINT-ROCH ================= */
var DELAYED_Q = [
  { q:"Clinique Saint-Roch, 03h47. Le compte d'une infirmière enchaîne 280 échecs de connexion, puis une réussite depuis une adresse inconnue. Pas de MFA sur ce compte.",
    opts:["Faux positif : elle a oublié son mot de passe", "Vrai positif : une force brute qui vient de réussir", "On attend la relève sans rien noter"],
    ok:1, why:"Même schéma qu'à Atlas, autre décor : rafale d'échecs puis réussite depuis une IP inconnue, sans MFA. La notion a voyagé — c'est exactement ce que cette épreuve vérifie." },
  { q:"Un e-mail « Direction — mettez à jour vos identifiants » arrive de direction@clinique-saintroch.example. Le vrai domaine de la clinique est clinique-saint-roch.example. Quel indice décide ?",
    opts:["L'objet parle d'identifiants", "Le domaine expéditeur n'est pas celui de la clinique", "L'e-mail est arrivé la nuit"],
    ok:1, why:"Le domaine d'abord : un tiret et un mot en moins, et ce n'est plus la clinique. L'urgence et l'heure ne prouvent rien toutes seules." },
  { q:"À la clinique, les dossiers patients sont sur le même réseau que le Wi-Fi des visiteurs. La bonne décision ?",
    opts:["Tout bloquer : plus de Wi-Fi, plus de dossiers", "Ne rien changer : le Wi-Fi a un mot de passe", "Segmenter : isoler les dossiers patients dans leur propre zone (VLAN)"],
    ok:2, why:"La segmentation cloisonne sans casser le service : les visiteurs gardent leur Wi-Fi, les dossiers patients deviennent inaccessibles depuis ce réseau." }
];
var delayed = null;
function startDelayed(){
  if(isGuest()){ demoLockSheet("Épreuve différée"); return; }
  delayed = { idx:0, answers:[] };
  show("delayed");
  renderDelayed();
}
function renderDelayed(){
  var html = "";
  if(delayed.idx < DELAYED_Q.length){
    var q = DELAYED_Q[delayed.idx];
    html += '<div class="ghead"><div class="ttl">Épreuve différée — Clinique Saint-Roch</div></div>';
    html += '<div class="stepct">Situation '+(delayed.idx+1)+' / '+DELAYED_Q.length+' · aucun indice, aucune aide : c\'est le principe</div><div class="progressline"><i style="width:'+Math.round(100*delayed.idx/DELAYED_Q.length)+'%"></i></div>';
    html += '<div class="alertcard"><div class="body" style="font-size:15.5px">'+q.q+'</div><div class="jopts">';
    q.opts.forEach(function(o, oi){ html += '<button data-dq="'+oi+'">'+esc(o)+'</button>'; });
    html += '</div></div>';
  } else {
    var good = 0;
    DELAYED_Q.forEach(function(q, i){ if(delayed.answers[i]===q.ok) good++; });
    var score = Math.round(100 * good / DELAYED_Q.length);
    S.delayedDone = true; S.delayedScore = score; S.credits += 20; save();
    html += '<div class="ghead"><div class="ttl">Debrief — Épreuve différée</div></div>';
    html += '<div class="scorebig">'+score+'<small> / 100</small></div><div class="gradelbl">'+(score>=70 ? "Ce qui reste une semaine plus tard est acquis" : "Les notions sont encore fragiles — rejoue les missions, sans indice")+'</div>';
    html += '<div class="card"><h3>Le pourquoi</h3>';
    DELAYED_Q.forEach(function(q, i){
      var okc = delayed.answers[i]===q.ok;
      html += whyRow(okc, okc?"ok":"ko", "Situation "+(i+1), q.why);
    });
    html += '</div>';
    html += examBoxHtml("clinique");
    html += '<p class="sub">Cette épreuve ne rapporte pas d\'XP : elle mesure la maîtrise, dans un contexte différent, après un délai. <b style="color:var(--txt)">+20 crédits</b> pour la démarche.</p>';
    html += '<button class="btn primary big" id="dHome">Retour à Nexus City</button>';
  }
  $("view-delayed").innerHTML = html;
  document.querySelectorAll("#view-delayed [data-dq]").forEach(function(b){
    b.addEventListener("click", function(){ delayed.answers[delayed.idx] = +b.getAttribute("data-dq"); delayed.idx++; sndTap(); renderDelayed(); });
  });
  var dh = $("dHome"); if(dh) dh.addEventListener("click", function(){ show("hub"); });
}