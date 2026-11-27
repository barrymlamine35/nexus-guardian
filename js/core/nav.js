"use strict";
/* ================= NAVIGATION ================= */
var curView="hub";
var lampDragActive=false;
function moveNavLamp(){
  if(lampDragActive) return;
  if(document.body.classList.contains("gaming") || document.body.classList.contains("authing")) return;
  var nav=document.getElementById("bottomnav"), lamp=document.getElementById("navlamp");
  if(!nav || !lamp) return;
  var btn=nav.querySelector("button.on");
  if(!btn) return;
  var nr=nav.getBoundingClientRect(), br=btn.getBoundingClientRect();
  if(!nr.width) return;
  lamp.style.transform="translateX("+(((br.left-nr.left)+br.width/2)-lamp.offsetWidth/2)+"px)";
}
function show(view){
  if(view!=="pack" && typeof stopNetAnim==="function") stopNetAnim();
  curView=view;
  document.querySelectorAll(".view").forEach(function(v){ v.classList.remove("on"); });
  $("view-"+view).classList.add("on");
  var gaming = ["tri","phish","defense","briefing","debrief","cold","delayed","campaign"].indexOf(view)>=0;
  document.body.classList.toggle("gaming", gaming);
  document.body.classList.toggle("authing", view==="auth");
  document.querySelectorAll("#bottomnav button").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-nav")===view); });
  moveNavLamp();
  window.scrollTo(0,0);
  if(view==="hub") renderHub();
  if(view==="pack") renderPack();
  if(view==="dojo") renderDojo();
  if(view==="devops") renderDevOps();
  if(view==="soc") renderSoc();
  if(view==="missions") renderMissions();
  if(view==="profil") renderProfil();
  if(view==="menu") renderMenu();
}
document.querySelectorAll("#bottomnav button").forEach(function(b){
  b.addEventListener("click", function(){ sndTap(); show(b.getAttribute("data-nav")); });
});
window.addEventListener("resize", moveNavLamp);
window.addEventListener("orientationchange", moveNavLamp);
/* ---- Lampe déplaçable au doigt : maintenir et glisser depuis n'importe quel point de la pilule ----
   Tap (doigt levé sans bouger) = clic normal sur l'onglet. Au-delà de ~8 px horizontaux, c'est un
   drag : la lampe suit le doigt, l'onglet sous la lampe s'active au passage, snap au relâchement,
   et le clic de fin de geste est supprimé pour ne pas déclencher un tap par accident. */
(function(){
  var nav=document.getElementById("bottomnav"), lamp=document.getElementById("navlamp");
  if(!nav || !lamp) return;
  var THRESH=8;
  var pid=null, startX=0, startTx=0, dragging=false, downOnLamp=false, suppressClick=false, suppressT=null;
  function armSuppress(){
    suppressClick=true;
    clearTimeout(suppressT);
    suppressT=setTimeout(function(){ suppressClick=false; }, 350);
  }
  function tabCenters(){
    var nr=nav.getBoundingClientRect(), out=[];
    nav.querySelectorAll("button").forEach(function(b){
      var br=b.getBoundingClientRect();
      out.push({ view:b.getAttribute("data-nav"), x:(br.left-nr.left)+br.width/2 });
    });
    return out;
  }
  function lampTx(){
    var m=/translateX\((-?[\d.]+)px\)/.exec(lamp.style.transform||"");
    return m ? parseFloat(m[1]) : 0;
  }
  function nearestTab(x){
    var cs=tabCenters();
    if(!cs.length) return null;
    var best=cs[0];
    cs.forEach(function(c){ if(Math.abs(c.x-x)<Math.abs(best.x-x)) best=c; });
    return best;
  }
  nav.addEventListener("pointerdown", function(e){
    if(pid!==null) return;
    if(e.button!==undefined && e.button!==0) return;
    pid=e.pointerId; startX=e.clientX; startTx=lampTx();
    dragging=false;
    downOnLamp = (e.target===lamp) || lamp.contains(e.target);
  });
  nav.addEventListener("pointermove", function(e){
    if(pid===null || e.pointerId!==pid) return;
    var dx=e.clientX-startX;
    if(!dragging){
      if(Math.abs(dx)<=THRESH) return;
      dragging=true;
      lampDragActive=true;
      lamp.style.transition="none";
    }
    var cs=tabCenters();
    if(!cs.length) return;
    var half=lamp.offsetWidth/2;
    var tx=startTx+dx;
    var min=cs[0].x-half, max=cs[cs.length-1].x-half;
    if(tx<min) tx=min;
    if(tx>max) tx=max;
    lamp.style.transform="translateX("+tx+"px)";
    var cx=tx+half, best=cs[0];
    cs.forEach(function(c){ if(Math.abs(c.x-cx)<Math.abs(best.x-cx)) best=c; });
    if(best.view!==curView) show(best.view);
  });
  function finishDrag(){
    pid=null;
    dragging=false;
    downOnLamp=false;
    lampDragActive=false;
    lamp.style.transition="";
    armSuppress();
    moveNavLamp();
  }
  function endDrag(e){
    if(pid===null || (e && e.pointerId!==pid)) return;
    if(dragging){ finishDrag(); return; }
    if(downOnLamp){
      /* Tap sur la lampe ou sa zone tactile élargie (qui recouvre une partie de la pilule) :
         activer l'onglet le plus proche du point touché, comme un tap normal. */
      var nr=nav.getBoundingClientRect();
      var best=nearestTab(e.clientX-nr.left);
      pid=null; downOnLamp=false;
      armSuppress();
      if(best){ sndTap(); show(best.view); }
      return;
    }
    /* Tap simple sur un onglet : ne rien faire, le clic normal du bouton s'en charge. */
    pid=null; downOnLamp=false;
  }
  function cancelDrag(e){
    if(pid===null || (e && e.pointerId!==pid)) return;
    if(dragging){ finishDrag(); return; }
    pid=null; dragging=false; downOnLamp=false;
  }
  nav.addEventListener("pointerup", endDrag);
  nav.addEventListener("pointercancel", cancelDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", cancelDrag);
  nav.addEventListener("click", function(e){
    if(suppressClick){ suppressClick=false; e.preventDefault(); e.stopPropagation(); }
  }, true);
})();