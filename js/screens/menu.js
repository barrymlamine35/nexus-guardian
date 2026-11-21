"use strict";
/* ================= MENU ================= */
function renderMenu(){
  var html = '<h1>Menu</h1>';
  if(FBUser){
    html += '<h2 style="margin-top:14px">Ton compte</h2><div class="card"><p style="margin-top:0">'+esc(FBUser.email)+'</p>'
      + (FBUser.emailVerified ? '<p>E-mail vérifié.</p>' : '<p>E-mail pas encore vérifié — tu peux jouer quand même.</p>')
      + '<button class="btn danger" id="mLogout">Se déconnecter</button></div>';
  }
  html += '<div class="card"><h3>Sauvegarde</h3><p style="margin:0" id="saveStateLine">'+(saveFailed ? "Progression non enregistrée sur cet appareil — stockage indisponible. Elle reste en mémoire pour cette session." : "Progression enregistrée sur cet appareil.")+'</p></div>';
  html += '<button class="menuitem gx-enter" style="animation-delay:0ms" id="mDojo">'+ICONS.flag+'Le Dojo — parcours pwn.college<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:40ms" id="mPack">'+ICONS.medal+'Pack Security+<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:80ms" id="mHelp">'+ICONS.shield+'Fonctionnement du jeu<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:120ms" id="mSound">'+(S.sound?ICONS.sndOn:ICONS.sndOff)+'Son : '+(S.sound?'activé':'coupé')+'<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" id="mReset" style="animation-delay:160ms;color:var(--red)">'+ICONS.trash+'Réinitialiser la progression<span class="chev">›</span></button>';
  $("view-menu").innerHTML = html;
  var ml = $("mLogout"); if(ml) ml.addEventListener("click", function(){ doSignOut(); });
  $("mDojo").addEventListener("click", function(){ dojoScreen="map"; show("dojo"); });
  $("mPack").addEventListener("click", function(){ packTab="home"; show("pack"); });
  $("mHelp").addEventListener("click", function(){ renderHelp(); show("help"); });
  $("mSound").addEventListener("click", function(){ S.sound=!S.sound; save(); renderMenu(); if(S.sound) sndTap(); });
  $("mReset").addEventListener("click", function(){
    sheet('<h3>Réinitialiser la progression ?</h3><p>XP, crédits, succès, Cyberdex et série de jours repartent de zéro. C\'est définitif.</p><div class="sbtns"><button class="btn big" style="color:var(--red);border-color:#5b2330" id="rstYes">Oui, tout effacer</button><button class="btn primary big" onclick="closeSheet()">Annuler</button></div>');
    $("rstYes").addEventListener("click", function(){
      var snd = S.sound;
      S = defState(); S.sound = snd; S.lastDay = todayStr(); S.streak = 1;
      save(); closeSheet(); toast("Progression réinitialisée."); show("hub");
    });
  });
}