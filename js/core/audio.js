"use strict";
/* ================= AUDIO ================= */
var AC=null;
function beep(freq, dur, type, vol){
  if(!S.sound) return;
  try{
    if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    var o=AC.createOscillator(), g=AC.createGain();
    o.type=type||"sine"; o.frequency.value=freq;
    g.gain.setValueAtTime(vol||0.06, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime+(dur||0.12));
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+(dur||0.12));
  }catch(e){}
}
function sndOk(){ beep(660,.1,"sine"); setTimeout(function(){beep(880,.12,"sine");},90); }
function sndBad(){ beep(160,.22,"sawtooth",0.05); }
function sndTap(){ beep(440,.05,"sine",0.03); }