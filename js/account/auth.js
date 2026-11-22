"use strict";
/* ================= COMPTE (FIREBASE AUTH) ================= */
var firebaseConfig = {
  apiKey: "AIzaSyB8mll6zHkWJ4NCLiUuZJwNW4zUtc5Dv4c",
  authDomain: "nexus-guardian-1df69.firebaseapp.com",
  projectId: "nexus-guardian-1df69",
  storageBucket: "nexus-guardian-1df69.firebasestorage.app",
  messagingSenderId: "384706773747",
  appId: "1:384706773747:web:1027bd61135fdd7fc6ad86"
};
var FBUser = null, gameEntered = false, authMode = "login";
function fbErrMsg(e){
  var M = {
    "auth/invalid-email":"Cette adresse e-mail n'a pas l'air valide.",
    "auth/missing-email":"Entre ton adresse e-mail.",
    "auth/missing-password":"Entre ton mot de passe.",
    "auth/user-not-found":"Aucun compte avec cet e-mail — crée-en un avec « Créer mon compte ».",
    "auth/wrong-password":"E-mail ou mot de passe incorrect.",
    "auth/invalid-credential":"E-mail ou mot de passe incorrect.",
    "auth/invalid-login-credentials":"E-mail ou mot de passe incorrect.",
    "auth/email-already-in-use":"Un compte existe déjà avec cet e-mail — connecte-toi.",
    "auth/weak-password":"Mot de passe trop court : 6 caractères minimum.",
    "auth/network-request-failed":"Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu.",
    "auth/too-many-requests":"Trop d'essais d'un coup. Attends un moment, puis réessaie.",
    "auth/user-disabled":"Ce compte est désactivé.",
    "auth/operation-not-allowed":"La connexion par e-mail n'est pas activée pour ce jeu."
  };
  return M[(e && e.code) || ""] || "Quelque chose n'a pas marché. Réessaie.";
}
function authShowErr(msg){ var e = $("authErr"); if(e) e.textContent = msg || ""; }
var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 4l16 16"/><path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17.6 17.6 0 0 1-2.9 3.5M6.1 8A16.9 16.9 0 0 0 2.5 12S6 18.2 12 18.2c1.5 0 2.9-.4 4.1-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function authSetPassVisible(visible){
  var input = $("authPass"), btn = $("authTogglePass");
  if(!input || !btn) return;
  input.type = visible ? "text" : "password";
  btn.innerHTML = visible ? EYE_OFF : EYE_ON;
  btn.setAttribute("aria-label", visible ? "Masquer le mot de passe" : "Afficher le mot de passe");
  btn.setAttribute("aria-pressed", visible ? "true" : "false");
}
function authSetMode(mode){
  authMode = mode;
  $("tabLogin").classList.toggle("on", mode==="login");
  $("tabSignup").classList.toggle("on", mode==="signup");
  $("authGo").textContent = mode==="login" ? "Se connecter" : "Créer mon compte";
  $("authPass").setAttribute("autocomplete", mode==="login" ? "current-password" : "new-password");
  authSetPassVisible(false);
  authShowErr("");
}
function authBusy(b){
  var g = $("authGo"); if(!g) return;
  g.disabled = b;
  g.textContent = b ? "Un instant…" : (authMode==="login" ? "Se connecter" : "Créer mon compte");
}
function enterGame(){
  show("hub");
}
function initAuth(){
  if(typeof firebase==="undefined" || !firebase.auth){
    show("auth");
    authShowErr("Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu.");
    var m = $("authMsg");
    if(m){ m.innerHTML = '<button class="btn" id="authRetry" type="button">Réessayer</button>';
      $("authRetry").addEventListener("click", function(){ location.reload(); }); }
    return;
  }
  try{ if(!firebase.apps.length) firebase.initializeApp(firebaseConfig); }catch(e){
    show("auth");
    authShowErr("Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu.");
    return;
  }
  firebase.auth().onAuthStateChanged(function(user){
    FBUser = user;
    if(user){
      if(!gameEntered){ gameEntered = true; enterGame(); maybeOfferDemoMigration(); }
      else if(curView==="profil") renderProfil();
      else if(curView==="menu") renderMenu();
    } else {
      gameEntered = false;
      show("auth");
    }
  });
}
function doSignOut(){
  if(typeof firebase!=="undefined" && firebase.auth){ firebase.auth().signOut().catch(function(){}); }
}
$("tabLogin").addEventListener("click", function(){ authSetMode("login"); });
$("tabSignup").addEventListener("click", function(){ authSetMode("signup"); });
$("authTogglePass").addEventListener("click", function(){
  var input = $("authPass");
  authSetPassVisible(input.type === "password");
  input.focus();
});
$("authForm").addEventListener("submit", function(ev){
  ev.preventDefault();
  var email = $("authEmail").value.trim(), pw = $("authPass").value;
  if(!email){ authShowErr("Entre ton adresse e-mail."); return; }
  if(!pw){ authShowErr("Entre ton mot de passe."); return; }
  if(typeof firebase==="undefined" || !firebase.auth){ authShowErr("Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu."); return; }
  authShowErr(""); authBusy(true);
  var settled = false;
  var timer = setTimeout(function(){
    if(settled) return;
    settled = true;
    authBusy(false);
    authShowErr("La connexion ne répond pas. Vérifie ta connexion internet puis réessaie.");
  }, 15000);
  try{
    var auth = firebase.auth();
    var p = authMode==="signup" ? auth.createUserWithEmailAndPassword(email, pw) : auth.signInWithEmailAndPassword(email, pw);
    p.then(function(cred){
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      authBusy(false);
      if(authMode==="signup" && cred && cred.user){
        cred.user.sendEmailVerification().catch(function(){});
        toast("Compte créé. E-mail de vérification envoyé — tu peux jouer tout de suite.");
      }
    }).catch(function(e){
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      authBusy(false); authShowErr(fbErrMsg(e));
    });
  }catch(e){
    if(settled) return;
    settled = true;
    clearTimeout(timer);
    authBusy(false);
    authShowErr("La connexion n'a pas pu démarrer. Vérifie ta connexion internet puis réessaie.");
  }
});
$("authForgot").addEventListener("click", function(){
  var email = $("authEmail").value.trim();
  if(!email){ authShowErr("Entre d'abord ton e-mail ci-dessus, puis retouche « Mot de passe oublié ? »."); return; }
  if(typeof firebase==="undefined" || !firebase.auth){ authShowErr("Pas de connexion : la connexion demande internet. Ta progression est conservée sur cet appareil — reconnecte-toi pour entrer dans le jeu."); return; }
  firebase.auth().sendPasswordResetEmail(email).then(function(){
    authShowErr("");
    toast("E-mail de réinitialisation envoyé à " + email + ".");
  }).catch(function(e){ authShowErr(fbErrMsg(e)); });
});
/* Bouton démo sur l'écran de connexion : créé ici, en JS, pour ne pas
   toucher au shell — la démo ne demande ni Firebase ni connexion, elle
   marche même hors ligne. */
(function(){
  var msg = $("authMsg");
  if(!msg) return;
  var b = document.createElement("button");
  b.type = "button"; b.id = "authDemo"; b.className = "btn big";
  b.style.marginTop = "14px";
  b.textContent = "Essayer la démo — sans compte";
  msg.after(b);
  b.addEventListener("click", function(){ sndTap(); enterDemo(); });
})();