"use strict";
/* ================= UI UTILS ================= */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
var toastT=null;
function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("on");},2600); }
function sheet(html){ $("sheet").innerHTML=html; $("overlay").classList.add("on"); }
function closeSheet(){ $("overlay").classList.remove("on"); }
$("overlay").addEventListener("click", function(e){ if(e.target===$("overlay")) closeSheet(); });
var ICONS = {
  coin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.2 9.6c.6-1 1.6-1.4 2.8-1.4 1.5 0 2.6.8 2.6 2 0 2.9-5.6 1.5-5.6 4.1 0 1.2 1.2 2 2.9 2 1.3 0 2.4-.5 3-1.5"/></svg>',
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8c.6 3.2-.7 5-2.2 6.8C8.4 11.3 7.4 13 7.4 15.2A4.9 4.9 0 0 0 12.3 20a4.9 4.9 0 0 0 4.9-4.9c0-1.9-.8-3.3-1.7-4.7-.3 1-.9 1.8-1.8 2.3.4-2.7-.4-6.9-1.7-9.9z"/></svg>',
  sndOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 9.5v5h3.5L12 18.6V5.4L7.5 9.5H4z" fill="currentColor" stroke="none"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>',
  sndOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 9.5v5h3.5L12 18.6V5.4L7.5 9.5H4z" fill="currentColor" stroke="none"/><path d="M15.5 9.8l5 5m0-5l-5 5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4.5 12.5 10 18 19.5 6.5"/></svg>',
  warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4 22 20.5H2z"/><path d="M12 10v4.5M12 17.4v.1"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20V5.5M6 11l6-6 6 6"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 5.8v5.4c0 4.6 3 7.7 7 9.3 4-1.6 7-4.7 7-9.3V5.8z"/></svg>',
  medal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 9.8 6 3.5h4l2 3.6 2-3.6h4l-2.5 6.3"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 13.5a4.2 4.2 0 0 0 6 0l3-3a4.24 4.24 0 1 0-6-6l-1.7 1.7"/><path d="M13.5 10.5a4.2 4.2 0 0 0-6 0l-3 3a4.24 4.24 0 1 0 6 6l1.7-1.7"/></svg>',
  clip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 11.5 12.6 18a5.3 5.3 0 0 1-7.4-7.4l7.6-7.4a3.5 3.5 0 0 1 4.9 4.9l-7.5 7.3a1.75 1.75 0 0 1-2.4-2.5l6.8-6.6"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21.5v-17"/><path d="M5 5c4-2.2 7 2 12 .3v8.9c-5 1.7-8-2.5-12-.3"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg>'
};
var pkPrevCredits = null;
function renderTop(){
  $("tbAlias").textContent = S.alias;
  var before = pkPrevCredits;
  $("tbCredits").innerHTML = ICONS.coin + S.credits;
  if(before !== null && S.credits > before){
    var chip = $("tbCredits");
    chip.classList.remove("pk-coin-pop");
    void chip.offsetWidth;
    chip.classList.add("pk-coin-pop");
  }
  pkPrevCredits = S.credits;
  $("tbStreak").innerHTML = ICONS.flame + S.streak + " j";
  $("soundBtn").innerHTML = S.sound ? ICONS.sndOn : ICONS.sndOff;
}
$("soundBtn").addEventListener("click", function(){ S.sound=!S.sound; save(); if(S.sound) sndTap(); toast(S.sound ? "Son activé" : "Son coupé"); });