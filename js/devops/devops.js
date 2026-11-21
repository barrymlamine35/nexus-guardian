"use strict";
function devopsListOf(section){ return section==="docker" ? DEVOPS_DOCKER : (section==="k8s" ? DEVOPS_K8S : (section==="gitlab" ? DEVOPS_GITLAB : DEVOPS_SECOPS)); }
function devopsSectionMeta(section){ for(var i=0;i<DEVOPS_SECTIONS.length;i++){ if(DEVOPS_SECTIONS[i].key===section) return DEVOPS_SECTIONS[i]; } return DEVOPS_SECTIONS[0]; }
function devopsCountOf(section){ var n=0; devopsListOf(section).forEach(function(l){ if(S.devops.done[l.id]) n++; }); return n; }
function devopsFind(id){
  for(var s=0;s<DEVOPS_SECTIONS.length;s++){
    var LIST = devopsListOf(DEVOPS_SECTIONS[s].key);
    for(var i=0;i<LIST.length;i++){ if(LIST[i].id===id) return { L:LIST[i], LIST:LIST, idx:i, section:DEVOPS_SECTIONS[s].key }; }
  }
  return null;
}
function devopsFinishLesson(lesson, pct){
  S.devops.done[lesson.id] = true;
  if(pct > (S.devops.best[lesson.id]||0)) S.devops.best[lesson.id] = pct;
  if(pct>=100){ S.xp.soc += 20; S.credits += 10; }
  save();
}
function devopsSectionTile(sec){
  var done = devopsCountOf(sec.key), total = devopsListOf(sec.key).length;
  var pct = total ? Math.round(100*done/total) : 0, fin = total>0 && done>=total, prog = !fin && done>0;
  return '<button class="djtile'+(fin ? " done" : (prog ? " prog" : ""))+'" data-dvsection="'+sec.key+'"><span class="dj-name">'+sec.icon+' '+esc(sec.name)+'</span>'
    + '<span class="dj-meta">'+total+' leçons · terminal</span>'
    + '<span class="dj-meta">'+done+' / '+total+' terminées</span>'
    + '<span class="djbar"><i style="width:'+pct+'%"></i></span>'
    + '<span class="dj-prow"><span class="dj-pct">'+pct+' %</span><span class="dj-foot">'+(fin ? "Terminé ✓" : (prog ? "Continuer ›" : "Entrer ›"))+'</span></span></button>';
}
function devopsLessonTile(l, i){
  var done = !!S.devops.done[l.id], best = S.devops.best[l.id]||0;
  return '<button class="ljtile'+(done ? " done" : "")+'" data-dvlesson="'+l.id+'">'
    + '<span class="lj-top"><span class="lj-id">'+esc(l.id)+'</span><span class="lj-st">'+(done ? (best>=100 ? "✓ 100 %" : best+" %") : "")+'</span></span>'
    + '<span class="lj-t">'+esc(l.t)+'</span>'
    + '<span class="lj-rw">+20 XP · +10 crédits</span>'
    + '<span class="lj-b">Leçon '+(i+1)+(done ? (best>=100 ? " · Réussie" : " · Terminée") : "")+'</span></button>';
}
function renderDevOps(){
  var root = $("view-devops");
  var html = "";
  if(devopsScreen!=="lesson") dvTerm = null;
  /* ---- écran leçon ---- */
  if(devopsScreen==="lesson" && devopsLessonId){
    var found = devopsFind(devopsLessonId);
    if(!found){ devopsScreen = "map"; devopsLessonId = null; }
    else {
      var L = found.L, LIST = found.LIST, li = found.idx, meta = devopsSectionMeta(found.section);
      if(!dvTerm || dvTerm.id!==L.id) dvTerm = dvTermNew(L);
      html += '<div class="ghead"><button class="quit" id="dvBack" aria-label="Retour">‹</button><div class="ttl">'+esc(meta.name)+' — leçon '+(li+1)+' / '+LIST.length+'</div></div>';
      html += '<div class="stepct">'+esc(meta.name)+(S.devops.done[L.id] ? ' · Terminée — meilleur : '+(S.devops.best[L.id]||0)+' %' : '')+'</div><div class="progressline"><i style="width:'+Math.round(100*devopsCountOf(found.section)/LIST.length)+'%"></i></div>';
      html += '<div class="card lessonread dj-enter"><span class="tag soc">'+L.id+'</span><h3 style="margin-top:8px">'+esc(L.t)+'</h3>';
      L.read.forEach(function(p){ html += '<p>'+esc(p)+'</p>'; });
      html += '</div>';
      html += dvTermHTML();
      var dvGate = !(dvTerm && dvTerm.validated);
      html += '<div class="alertcard dj-enter" id="dvExCard">';
      if(dvGate){
        html += '<div class="jq" style="margin-top:0">Exercice</div><div class="examoff">Termine d\'abord le terminal pour débloquer l\'exercice.</div>';
      } else {
        html += '<div class="jq" style="margin-top:0">Exercice — '+esc(L.ex.q)+'</div>';
        if(L.ex.type==="qcm"){
          if(devopsAnswer===null){
            html += '<div class="jopts">';
            L.ex.opts.forEach(function(o, oi){ html += '<button data-dvopt="'+oi+'">'+esc(o)+'</button>'; });
            html += '</div>';
          } else {
            var goodQ = devopsAnswer===L.ex.ok;
            html += '<div class="conseq" style="margin-top:12px"><b>'+(goodQ ? "Bonne réponse." : "Pas celle-là — la bonne réponse était : « "+esc(L.ex.opts[L.ex.ok])+" »")+'</b><br>'+esc(L.why)+'</div>';
            html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">'+(goodQ?"+20":"0")+'</div><div class="rl">XP SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">'+(goodQ?"+10":"0")+'</div><div class="rl">Crédits</div></div></div>';
            html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="dvList">Toutes les leçons</button>'
              + (li < LIST.length-1 ? '<button class="btn primary" style="flex:1" id="dvNext">Leçon suivante</button>' : '<button class="btn primary" style="flex:1" id="dvDone">Terminer la section</button>') + '</div>';
          }
        } else {
          if(!devopsOrderDone){
            L.ex.disp.forEach(function(itemIdx){
              var pos = devopsOrder.indexOf(itemIdx);
              html += '<button class="ruleitem" data-dvitem="'+itemIdx+'" '+(pos>=0?"disabled":"")+'>'+(pos>=0?'<span class="ord">'+(pos+1)+'</span>':'')+esc(L.ex.items[itemIdx])+'</button>';
            });
            html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="dvReset">Recommencer l’ordre</button><button class="btn primary" style="flex:1" id="dvGo" '+(devopsOrder.length>=L.ex.items.length?"":"disabled")+'>Valider</button></div>';
          } else {
            var posOk = 0;
            devopsOrder.forEach(function(itemIdx, pos){ if(itemIdx===pos) posOk++; });
            var pctO = Math.round(100*posOk/L.ex.items.length), goodO = pctO>=100;
            html += '<div class="conseq" style="margin-top:12px"><b>'+(goodO ? "Ordre parfait." : "Ordre correct à "+pctO+" %. Le bon ordre : "+L.ex.items.map(function(t, i){ return (i+1)+". "+t; }).join(" · "))+'</b><br>'+esc(L.why)+'</div>';
            html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">'+(goodO?"+20":"0")+'</div><div class="rl">XP SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">'+(goodO?"+10":"0")+'</div><div class="rl">Crédits</div></div></div>';
            html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="dvList">Toutes les leçons</button>'
              + (li < LIST.length-1 ? '<button class="btn primary" style="flex:1" id="dvNext">Leçon suivante</button>' : '<button class="btn primary" style="flex:1" id="dvDone">Terminer la section</button>') + '</div>';
          }
        }
      }
      html += '</div>';
      root.innerHTML = html;
      dvTermMount(L);
      root.querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
      $("dvBack").addEventListener("click", function(){ devopsScreen="list"; devopsLessonId=null; devopsAnswer=null; devopsOrder=[]; devopsOrderDone=false; renderDevOps(); });
      root.querySelectorAll("[data-dvopt]").forEach(function(b){
        b.addEventListener("click", function(){
          var oi = +b.getAttribute("data-dvopt");
          devopsAnswer = oi;
          devopsFinishLesson(L, oi===L.ex.ok ? 100 : 0);
          if(oi===L.ex.ok) sndOk(); else sndBad();
          renderDevOps();
        });
      });
      root.querySelectorAll("[data-dvitem]").forEach(function(b){
        b.addEventListener("click", function(){ devopsOrder.push(+b.getAttribute("data-dvitem")); sndTap(); renderDevOps(); });
      });
      var rs = $("dvReset"); if(rs) rs.addEventListener("click", function(){ devopsOrder = []; renderDevOps(); });
      var go = $("dvGo"); if(go) go.addEventListener("click", function(){
        var posOk2 = 0;
        devopsOrder.forEach(function(itemIdx, pos){ if(itemIdx===pos) posOk2++; });
        var pct2 = Math.round(100*posOk2/L.ex.items.length);
        devopsOrderDone = true;
        devopsFinishLesson(L, pct2);
        if(pct2>=100) sndOk(); else sndBad();
        renderDevOps(); window.scrollTo(0,0);
      });
      var nx = $("dvNext"); if(nx) nx.addEventListener("click", function(){ devopsLessonId = LIST[li+1].id; devopsAnswer = null; devopsOrder = []; devopsOrderDone = false; sndTap(); renderDevOps(); window.scrollTo(0,0); });
      var dn = $("dvDone"); if(dn) dn.addEventListener("click", function(){ devopsScreen="list"; devopsLessonId=null; devopsAnswer=null; devopsOrder=[]; devopsOrderDone=false; renderDevOps(); window.scrollTo(0,0); });
      var ls = $("dvList"); if(ls) ls.addEventListener("click", function(){ devopsScreen="list"; devopsLessonId=null; devopsAnswer=null; devopsOrder=[]; devopsOrderDone=false; renderDevOps(); });
      return;
    }
  }
  /* ---- écran liste des leçons d'une section ---- */
  if(devopsScreen==="list"){
    var meta2 = devopsSectionMeta(devopsSection), LIST2 = devopsListOf(devopsSection), done2 = devopsCountOf(devopsSection);
    html += '<div class="ghead"><button class="quit" id="dvBack" aria-label="Retour">‹</button><div class="ttl">'+esc(meta2.name)+'</div></div>';
    html += '<div class="stepct">'+done2+' / '+LIST2.length+' leçons terminées</div><div class="progressline"><i style="width:'+Math.round(100*done2/LIST2.length)+'%"></i></div>';
    html += '<div class="ljgrid">';
    LIST2.forEach(function(l, i){ html += devopsLessonTile(l, i); });
    html += '</div>';
    root.innerHTML = html;
    $("dvBack").addEventListener("click", function(){ devopsScreen="map"; renderDevOps(); });
    root.querySelectorAll("[data-dvlesson]").forEach(function(b){
      b.addEventListener("click", function(){ devopsLessonId = b.getAttribute("data-dvlesson"); devopsAnswer = null; devopsOrder = []; devopsOrderDone = false; devopsScreen = "lesson"; sndTap(); renderDevOps(); window.scrollTo(0,0); });
    });
    return;
  }
  /* ---- écran carte : les 3 sections ---- */
  devopsScreen = "map";
  html += '<h1>DevOps</h1>';
  html += '<p class="sub">Docker · Kubernetes · GitLab CI/CD · SecOps — 48 leçons, terminal en main.</p>';
  html += '<div class="djgrid">';
  DEVOPS_SECTIONS.forEach(function(sec){ html += devopsSectionTile(sec); });
  html += '</div>';
  root.innerHTML = html;
  root.querySelectorAll("[data-dvsection]").forEach(function(b){
    b.addEventListener("click", function(){ devopsSection = b.getAttribute("data-dvsection"); devopsScreen = "list"; sndTap(); renderDevOps(); window.scrollTo(0,0); });
  });
}