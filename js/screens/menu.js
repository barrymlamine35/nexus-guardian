"use strict";
/* ================= MENU ================= */
function renderMenu(){
  var html = '<h1>Menu</h1>';
  if(FBUser){
    html += '<h2 style="margin-top:14px">Ton compte</h2><div class="card"><p style="margin-top:0">'+esc(FBUser.email)+'</p>'
      + (FBUser.emailVerified ? '<p>E-mail vérifié.</p>' : '<p>E-mail pas encore vérifié — tu peux jouer quand même.</p>')
      + '<button class="btn danger" id="mLogout">Se déconnecter</button></div>';
  }
  if(isGuest()){
    html += '<h2 style="margin-top:14px">Mode démo</h2><div class="card"><p style="margin-top:0">Tu joues sans compte — ta progression démo reste sur cet appareil.</p><div class="row" style="flex-wrap:wrap"><button class="btn primary" id="mSignup">Créer mon compte</button><button class="btn" id="mQuitDemo">Quitter la démo</button></div></div>';
  }
  html += '<div class="card"><h3>Sauvegarde</h3><p style="margin:0" id="saveStateLine">'+(saveFailed ? "Progression non enregistrée sur cet appareil — stockage indisponible. Elle reste en mémoire pour cette session." : "Progression enregistrée sur cet appareil.")+'</p><p style="margin:8px 0 0">Garde une copie ailleurs, au cas où tu changes de téléphone.</p><div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn" id="mExport">Exporter ma sauvegarde</button><button class="btn" id="mImport">Importer une sauvegarde</button></div><input type="file" id="importFile" accept=".json,application/json" hidden></div>';
  html += '<button class="menuitem gx-enter" style="animation-delay:0ms" id="mDojo">'+ICONS.flag+'Le Dojo — parcours pwn.college<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:40ms" id="mPack">'+ICONS.medal+'Pack Security+<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:80ms" id="mHelp">'+ICONS.shield+'Fonctionnement du jeu<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" style="animation-delay:120ms" id="mSound">'+(S.sound?ICONS.sndOn:ICONS.sndOff)+'Son : '+(S.sound?'activé':'coupé')+'<span class="chev">›</span></button>';
  html += '<button class="menuitem gx-enter" id="mReset" style="animation-delay:160ms;color:var(--red)">'+ICONS.trash+'Réinitialiser la progression<span class="chev">›</span></button>';
  $("view-menu").innerHTML = html;
  var ml = $("mLogout"); if(ml) ml.addEventListener("click", function(){ doSignOut(); });
  var ms = $("mSignup"); if(ms) ms.addEventListener("click", function(){ exitDemoToAuth("signup"); });
  var mq = $("mQuitDemo"); if(mq) mq.addEventListener("click", function(){ exitDemoToAuth("login"); });
  $("mExport").addEventListener("click", function(){ exportSave(); });
  $("mImport").addEventListener("click", function(){ $("importFile").click(); });
  $("importFile").addEventListener("change", function(){
    var f = this.files && this.files[0];
    if(!f) return;
    var rd = new FileReader();
    rd.onload = function(){
      var obj = null;
      try{ obj = JSON.parse(rd.result); }catch(e){ obj = null; }
      if(!validateSave(obj)){
        toast("Ce fichier n'est pas une sauvegarde Nexus Guardian.");
        $("importFile").value = "";
        return;
      }
      var xp = (obj.xp.soc||0) + (obj.xp.reseau||0);
      var dateStr = "";
      try{ dateStr = new Date(f.lastModified).toLocaleDateString("fr-FR"); }catch(e){}
      sheet('<h3>Importer cette sauvegarde ?</h3><p>Ta progression actuelle sera remplacée par celle du fichier.</p>'
        + '<p><b>'+esc(obj.alias)+'</b> · XP total : <b>'+xp+'</b> · Crédits : <b>'+obj.credits+'</b>'
        + (dateStr ? '<br>Fichier du '+dateStr : '') + '</p>'
        + '<div class="sbtns"><button class="btn big" style="color:var(--red);border-color:#5b2330" id="impYes">Oui, remplacer ma progression</button><button class="btn primary big" onclick="closeSheet()">Annuler</button></div>');
      $("impYes").addEventListener("click", function(){
        var snd = S.sound;
        S = obj; S.sound = snd;
        save(); closeSheet(); toast("Sauvegarde importée."); location.reload();
      });
      $("importFile").value = "";
    };
    rd.onerror = function(){ toast("Impossible de lire ce fichier."); $("importFile").value = ""; };
    rd.readAsText(f);
  });
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