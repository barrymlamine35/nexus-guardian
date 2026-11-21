"use strict";
/* ================= INIT ================= */
window.addEventListener("offline", function(){
  if(gameEntered && !offlineNoticed){
    offlineNoticed = true;
    toast("Connexion perdue : tu peux continuer à jouer — ta progression continue de s'enregistrer sur cet appareil.");
  } else if(!gameEntered){
    authShowErr("Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu.");
  }
});
window.addEventListener("online", function(){
  offlineNoticed = false;
  if(gameEntered) toast("Connexion rétablie.");
});
save();
show("auth");
initAuth();