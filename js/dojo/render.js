"use strict";
function renderDojo(){
  var root = $("view-dojo");
  var html = "";
  if(dojoScreen!=="lesson") djTerm = null;
  /* ---- écran leçon ---- */
  if(dojoScreen==="lesson" && dojoLessonId){
    var course = dojoCourseOf(dojoLessonId), LIST = dojoListOf(course), listScreen = dojoListScreen(course);
    if(isGuest() && dojoLessonId!=="SH-01"){
      dojoScreen = listScreen; dojoLessonId = null; dojoAnswer = null; dojoOrder = []; dojoOrderDone = false;
      renderDojo();
      demoLockSheet("Cette leçon");
      return;
    }
    var li = LIST.map(function(l, i){ return l.id===dojoLessonId ? i : -1; }).filter(function(i){ return i>=0; })[0];
    var L = LIST[li];
    if(L.term){ if(!djTerm || djTerm.id!==L.id) djTerm = djTermNew(L); }
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">'+dojoCourseName(course)+' — leçon '+(li+1)+' / '+LIST.length+'</div></div>';
    html += '<div class="stepct">Module · '+esc(L.mod || "Using the Dojo")+(S.dojo.done[L.id] ? ' · Terminée — meilleur : '+(S.dojo.best[L.id]||0)+' %' : '')+'</div><div class="progressline"><i style="width:'+Math.round(100*dojoCountOf(course)/LIST.length)+'%"></i></div>';
    html += '<div class="card lessonread dj-enter"><span class="tag soc">'+L.id+'</span><h3 style="margin-top:8px">'+esc(L.t)+'</h3>';
    L.read.forEach(function(p){ html += '<p>'+esc(p)+'</p>'; });
    html += '</div>';
    if(L.term) html += '<div class="term">'+L.term+'</div>' + djTermHTML();
    var djGate = !!L.term && !(djTerm && djTerm.validated);
    html += '<div class="alertcard dj-enter" id="djExCard">';
    if(djGate){
      html += '<div class="jq" style="margin-top:0">Exercice</div><div class="examoff">Termine d\'abord le terminal pour débloquer l\'exercice.</div>';
    } else {
    html += '<div class="jq" style="margin-top:0">Exercice — '+esc(L.ex.q)+'</div>';
    if(L.ex.type==="qcm"){
      if(dojoAnswer===null){
        html += '<div class="jopts">';
        L.ex.opts.forEach(function(o, oi){ html += '<button data-djopt="'+oi+'">'+esc(o)+'</button>'; });
        html += '</div>';
      } else {
        var goodQ = dojoAnswer===L.ex.ok;
        html += '<div class="conseq" style="margin-top:12px"><b>'+(goodQ ? "Bonne réponse." : "Pas celle-là — la bonne réponse était : « "+esc(L.ex.opts[L.ex.ok])+" »")+'</b><br>'+esc(L.why)+'</div>';
        html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">'+(goodQ?"+20":"0")+'</div><div class="rl">XP SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">'+(goodQ?"+10":"0")+'</div><div class="rl">Crédits</div></div></div>';
        html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="djList">Toutes les leçons</button>'
          + (li < LIST.length-1 ? '<button class="btn primary" style="flex:1" id="djNext">Leçon suivante</button>' : '<button class="btn primary" style="flex:1" id="djDone">Terminer le dojo</button>') + '</div>';
      }
    } else {
      if(!dojoOrderDone){
        L.ex.disp.forEach(function(itemIdx){
          var pos = dojoOrder.indexOf(itemIdx);
          html += '<button class="ruleitem" data-djitem="'+itemIdx+'" '+(pos>=0?"disabled":"")+'>'+(pos>=0?'<span class="ord">'+(pos+1)+'</span>':'')+esc(L.ex.items[itemIdx])+'</button>';
        });
        html += '<div class="row" style="gap:9px;margin-top:10px"><button class="btn" style="flex:1" id="djReset">Recommencer l’ordre</button><button class="btn primary" style="flex:1" id="djGo" '+(dojoOrder.length>=L.ex.items.length?"":"disabled")+'>Valider</button></div>';
      } else {
        var posOk = 0;
        dojoOrder.forEach(function(itemIdx, pos){ if(itemIdx===pos) posOk++; });
        var pctO = Math.round(100*posOk/L.ex.items.length), goodO = pctO>=100;
        html += '<div class="conseq" style="margin-top:12px"><b>'+(goodO ? "Ordre parfait." : "Ordre correct à "+pctO+" %. Le bon ordre : "+L.ex.items.map(function(t, i){ return (i+1)+". "+t; }).join(" · "))+'</b><br>'+esc(L.why)+'</div>';
        html += '<div class="reward djpop"><div class="rw"><div class="rv" style="color:var(--cyan)">'+(goodO?"+20":"0")+'</div><div class="rl">XP SOC</div></div><div class="rw"><div class="rv" style="color:var(--orange)">'+(goodO?"+10":"0")+'</div><div class="rl">Crédits</div></div></div>';
        html += '<div class="row" style="gap:9px"><button class="btn" style="flex:1" id="djList">Toutes les leçons</button>'
          + (li < LIST.length-1 ? '<button class="btn primary" style="flex:1" id="djNext">Leçon suivante</button>' : '<button class="btn primary" style="flex:1" id="djDone">Terminer le dojo</button>') + '</div>';
      }
    }
    }
    html += '</div>';
    root.innerHTML = html;
    if(L.term) djTermMount(L);
    root.querySelectorAll(".reward .rv").forEach(function(el){ djCountUp(el); });
    $("djBack").addEventListener("click", function(){ dojoScreen=listScreen; dojoLessonId=null; dojoAnswer=null; dojoOrder=[]; dojoOrderDone=false; renderDojo(); });
    root.querySelectorAll("[data-djopt]").forEach(function(b){
      b.addEventListener("click", function(){
        var oi = +b.getAttribute("data-djopt");
        dojoAnswer = oi;
        dojoFinishLesson(L, oi===L.ex.ok ? 100 : 0);
        if(oi===L.ex.ok) sndOk(); else sndBad();
        renderDojo();
      });
    });
    root.querySelectorAll("[data-djitem]").forEach(function(b){
      b.addEventListener("click", function(){ dojoOrder.push(+b.getAttribute("data-djitem")); sndTap(); renderDojo(); });
    });
    var rs = $("djReset"); if(rs) rs.addEventListener("click", function(){ dojoOrder = []; renderDojo(); });
    var go = $("djGo"); if(go) go.addEventListener("click", function(){
      var posOk2 = 0;
      dojoOrder.forEach(function(itemIdx, pos){ if(itemIdx===pos) posOk2++; });
      var pct2 = Math.round(100*posOk2/L.ex.items.length);
      dojoOrderDone = true;
      dojoFinishLesson(L, pct2);
      if(pct2>=100) sndOk(); else sndBad();
      renderDojo(); window.scrollTo(0,0);
    });
    var nx = $("djNext"); if(nx) nx.addEventListener("click", function(){ dojoLessonId = LIST[li+1].id; dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; sndTap(); renderDojo(); window.scrollTo(0,0); });
    var dn = $("djDone"); if(dn) dn.addEventListener("click", function(){ dojoScreen=listScreen; dojoLessonId=null; dojoAnswer=null; dojoOrder=[]; dojoOrderDone=false; renderDojo(); window.scrollTo(0,0); });
    var ls = $("djList"); if(ls) ls.addEventListener("click", function(){ dojoScreen=listScreen; dojoLessonId=null; dojoAnswer=null; dojoOrder=[]; dojoOrderDone=false; renderDojo(); });
    return;
  }
  /* ---- écran Start Here : liste des leçons ---- */
  if(dojoScreen==="start"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Start Here</div></div>';
    html += '<div class="stepct">Premier dojo du parcours · '+dojoDoneCount()+' / '+DOJO_LESSONS.length+' leçons terminées · Sur le site : 2 modules · 10 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDoneCount()/DOJO_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Prise en main de la plateforme : terminal, /challenge, /flag et règles du jeu. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    html += '<h2>Module · Using the Dojo</h2>';
    html += '<div class="ljgrid">';
    DOJO_LESSONS.forEach(function(l, i){ html += dojoLessonTile(l, i); });
    html += '</div>';
    html += '<h2>Module · Joining the Discord</h2>';
    html += '<div class="card"><h3>La communauté, sans exercice</h3><p>Sur le site, ce module sert à rejoindre le Discord de pwn.college — aucun challenge. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDoneCount()>=DOJO_LESSONS.length){
      html += '<div class="card"><h3>Start Here terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToLum">Entrer dans Linux Luminarium</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tl = $("djToLum"); if(tl) tl.addEventListener("click", function(){ dojoScreen="lum"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Linux Luminarium : liste des leçons ---- */
  if(dojoScreen==="lum"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Linux Luminarium</div></div>';
    html += '<div class="stepct">Deuxième dojo du parcours · '+dojoLLCount()+' / '+DOJO_LL_LESSONS.length+' leçons terminées · Sur le site : 17 modules · 128 challenges · Récompense : Pingouin blanc</div><div class="progressline"><i style="width:'+Math.round(100*dojoLLCount()/DOJO_LL_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Maîtriser la ligne de commande Linux en partant de zéro. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    html += '<div class="ljgrid">';
    DOJO_LL_LESSONS.forEach(function(l, i){ html += dojoLessonTile(l, i); });
    html += '</div>';
    if(dojoLLCount()>=DOJO_LL_LESSONS.length){
      html += '<div class="card"><h3>Linux Luminarium terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPwp">Entrer dans Playing With Programs</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tp0 = $("djToPwp"); if(tp0) tp0.addEventListener("click", function(){ dojoScreen="pwp"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Playing With Programs : liste des leçons ---- */
  if(dojoScreen==="pwp"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Playing With Programs</div></div>';
    html += '<div class="stepct">Troisième dojo du parcours · '+dojoPWPCount()+' / '+DOJO_PWP_LESSONS.length+' leçons terminées · Sur le site : 4 modules · 116 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPWPCount()/DOJO_PWP_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Dialoguer avec les programmes : encodages, HTTP parlé à la main, SUID et SQL. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastMod = "";
    DOJO_PWP_LESSONS.forEach(function(l, i){
      if(l.mod !== lastMod){ if(lastMod) html += '</div>'; lastMod = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastMod) html += '</div>';
    if(dojoPWPCount()>=DOJO_PWP_LESSONS.length){
      html += '<div class="card"><h3>Playing With Programs terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToC101">Entrer dans Computing 101</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tc3 = $("djToC101"); if(tc3) tc3.addEventListener("click", function(){ dojoScreen="c101"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Computing 101 : liste des leçons ---- */
  if(dojoScreen==="c101"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Computing 101</div></div>';
    html += '<div class="stepct">Quatrième dojo du parcours · '+dojoC101Count()+' / '+DOJO_C101_LESSONS.length+' leçons terminées · Sur le site : 13 modules · 132 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoC101Count()/DOJO_C101_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’informatique bas niveau : assembleur x86-64, mémoire, pile et débogage, jusqu’à un serveur web construit à la main. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModC = "";
    DOJO_C101_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModC){ if(lastModC) html += '</div>'; lastModC = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModC) html += '</div>';
    html += '<div class="card"><h3>Deux défis non disponibles</h3><p>2 défis du module Debugging Refresher sont verrouillés sur le site ; ils sont signalés dans la leçon C101-25. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoC101Count()>=DOJO_C101_LESSONS.length){
      html += '<div class="card"><h3>Computing 101 terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToIcs">Entrer dans Intro to Cybersecurity</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm4 = $("djToIcs"); if(tm4) tm4.addEventListener("click", function(){ dojoScreen="ics"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Intro to Cybersecurity : liste des leçons ---- */
  if(dojoScreen==="ics"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Intro to Cybersecurity</div></div>';
    html += '<div class="stepct">Cinquième dojo du parcours · Premier du parcours principal · '+dojoICSCount()+' / '+DOJO_ICS_LESSONS.length+' leçons terminées · Sur le site : 7 modules · 183 challenges · <span class="belt orange">Ceinture orange</span></div><div class="progressline"><i style="width:'+Math.round(100*dojoICSCount()/DOJO_ICS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le cœur du parcours (cours CSE 365) : web, réseaux, crypto, contrôle d’accès, rétro-ingénierie et exploitation binaire. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModI = "";
    DOJO_ICS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModI){ if(lastModI) html += '</div>'; lastModI = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModI) html += '</div>';
    html += '<div class="card"><h3>Cinq défis non disponibles : Secure Chat 1 à 5</h3><p>Ces 5 défis n’ont aucune description sur le site : signalés non disponibles. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoICSCount()>=DOJO_ICS_LESSONS.length){
      html += '<div class="card"><h3>Intro to Cybersecurity terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPs3">Entrer dans Program Security</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm5 = $("djToPs3"); if(tm5) tm5.addEventListener("click", function(){ dojoScreen="progsec"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Web Security : liste des leçons ---- */
  if(dojoScreen==="ws"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Web Security</div></div>';
    html += '<div class="stepct">Dojo communautaire · « The Art of Web » · '+dojoWSCount()+' / '+DOJO_WS_LESSONS.length+' leçons terminées · Sur le site : 6 modules · 57 défis</div><div class="progressline"><i style="width:'+Math.round(100*dojoWSCount()/DOJO_WS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Casser des applications web — et comprendre leurs défenses : XSS, authentification, injection de commande, traversée de chemin. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModW = "";
    DOJO_WS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModW){ if(lastModW) html += '</div>'; lastModW = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModW) html += '</div>';
    html += '<div class="card"><h3>56 ou 57 défis ?</h3><p>Le site annonce 56 défis ; 57 ont été lus et sont couverts par les leçons. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoWSCount()>=DOJO_WS_LESSONS.length){
      html += '<div class="card"><h3>Web Security terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToCrypto">Entrer dans Cryptographic Exploitation</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm6 = $("djToCrypto"); if(tm6) tm6.addEventListener("click", function(){ dojoScreen="crypto"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Cryptographic Exploitation : liste des leçons ---- */
  if(dojoScreen==="crypto"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Cryptographic Exploitation</div></div>';
    html += '<div class="stepct">Dojo communautaire · Open source · '+dojoCECount()+' / '+DOJO_CE_LESSONS.length+' leçons terminées · Sur le site : 10 modules · 49 défis</div><div class="progressline"><i style="width:'+Math.round(100*dojoCECount()/DOJO_CE_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">La cryptographie attaquée par ses implémentations : XOR, CBC, RSA, hachage, PRNG et courbes elliptiques. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModCE = "";
    DOJO_CE_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModCE){ if(lastModCE) html += '</div>'; lastModCE = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModCE) html += '</div>';
    html += '<div class="card"><h3>49 ou 59 défis ?</h3><p>Le site annonce 59 défis ; 49 sont visibles et couverts par les leçons. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Défis non disponibles</h3><p>3 défis verrouillés et 13 défis à titre seul sur le site : signalés dans les leçons, sans contenu inventé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoCECount()>=DOJO_CE_LESSONS.length){
      html += '<div class="card"><h3>Cryptographic Exploitation terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap5">Voir la carte des dojos</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm7 = $("djToMap5"); if(tm7) tm7.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Intro to Reverse Engineering & Binary Exploitation : liste des leçons ---- */
  if(dojoScreen==="ire"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Intro RE & Binary Exploitation</div></div>';
    html += '<div class="stepct">Dojo communautaire · Pour débutants · '+dojoIRECount()+' / '+DOJO_IRE_LESSONS.length+' leçons terminées · Sur le site : 8 modules · 33 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoIRECount()/DOJO_IRE_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Lire des programmes Linux et comprendre les bugs mémoire, sans expérience préalable. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModIRE = "";
    DOJO_IRE_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModIRE){ if(lastModIRE) html += '</div>'; lastModIRE = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModIRE) html += '</div>';
    html += '<div class="card"><h3>Des variantes, pas des valeurs à recopier</h3><p>Chaque défi existe en plusieurs variantes sur le site : les leçons enseignent la méthode, pas des valeurs. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoIRECount()>=DOJO_IRE_LESSONS.length){
      html += '<div class="card"><h3>Intro to Reverse Engineering & Binary Exploitation terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPs2">Entrer dans Program Security</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm8 = $("djToPs2"); if(tm8) tm8.addEventListener("click", function(){ dojoScreen="progsec"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Program Security : liste des leçons ---- */
  if(dojoScreen==="progsec"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Program Security</div></div>';
    html += '<div class="stepct">Parcours principal · Ceinture jaune · '+dojoPSCount()+' / '+DOJO_PS_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 159 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPSCount()/DOJO_PS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">La sécurité des programmes : shellcode, rétro-ingénierie, ROP, tas et seccomp. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPS = "";
    DOJO_PS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPS){ if(lastModPS) html += '</div>'; lastModPS = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPS) html += '</div>';
    html += '<div class="card"><h3>La ceinture jaune, en un dojo</h3><p>Deuxième dojo du parcours principal, après la ceinture orange. Fil rouge : la lecture précède l’écriture. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPSCount()>=DOJO_PS_LESSONS.length){
      html += '<div class="card"><h3>Program Security terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToSs">Entrer dans System Security</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm9 = $("djToSs"); if(tm9) tm9.addEventListener("click", function(){ dojoScreen="syssec"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran System Security : liste des leçons ---- */
  if(dojoScreen==="syssec"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">System Security</div></div>';
    html += '<div class="stepct">Parcours principal · Ceinture verte · '+dojoSSCount()+' / '+DOJO_SS_LESSONS.length+' leçons terminées · Sur le site : 6 modules · 93 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoSSCount()/DOJO_SS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Du programme au système entier : sandboxing, race conditions, noyau et attaques par le cache. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModSS = "";
    DOJO_SS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModSS){ if(lastModSS) html += '</div>'; lastModSS = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModSS) html += '</div>';
    html += '<div class="card"><h3>93 défis, pas 95</h3><p>2 défis du module Microarchitecture sont optionnels sur le site et ne comptent pas : 93 défis au total. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>La ceinture verte, en un dojo</h3><p>Troisième dojo du parcours principal, après la ceinture jaune. Fil rouge : chaque frontière a ses exceptions. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoSSCount()>=DOJO_SS_LESSONS.length){
      html += '<div class="card"><h3>System Security terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToSe">Entrer dans Software Exploitation</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm10 = $("djToSe"); if(tm10) tm10.addEventListener("click", function(){ dojoScreen="softexp"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Software Exploitation : liste des leçons ---- */
  if(dojoScreen==="softexp"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Software Exploitation</div></div>';
    html += '<div class="stepct">Parcours principal · Ceinture bleue · '+dojoSECount()+' / '+DOJO_SE_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 90 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoSECount()/DOJO_SE_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Prendre le contrôle de logiciels durcis : chaînes de format, structures FILE, primitives, allocateur et noyau. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModSE = "";
    DOJO_SE_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModSE){ if(lastModSE) html += '</div>'; lastModSE = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModSE) html += '</div>';
    html += '<div class="card"><h3>Des conseils généraux, jamais des solutions</h3><p>Seuls les conseils généraux du site sont adaptés ici : aucune solution de défi n’est publiée. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>La ceinture bleue, en un dojo</h3><p>Dernier dojo du parcours principal. Fil rouge : l’exploit est une composition de primitives — lire, écrire, appeler. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoSECount()>=DOJO_SE_LESSONS.length){
      html += '<div class="card"><h3>Software Exploitation terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToDsu">Entrer dans DSU Cyber Camps</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm11 = $("djToDsu"); if(tm11) tm11.addEventListener("click", function(){ dojoScreen="dsucamp"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran DSU Cyber Camps : liste des leçons ---- */
  if(dojoScreen==="dsucamp"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">DSU Cyber Camps</div></div>';
    html += '<div class="stepct">Dojo communautaire · Dakota State University · Premier dojo communautaire jouable · '+dojoDSUCount()+' / '+DOJO_DSU_LESSONS.length+' leçons terminées · Sur le site : 8 modules · 104 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDSUCount()/DOJO_DSU_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le camp d’initiation de la Dakota State University : Linux, Python, encodages, OSINT, web et forensique, en douceur. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModDSU = "";
    DOJO_DSU_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModDSU){ if(lastModDSU) html += '</div>'; lastModDSU = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModDSU) html += '</div>';
    html += '<div class="card"><h3>104 défis lus sur 104 annoncés — dojo complet</h3><p>Le module PWN/RE (6 défis) et le défi OSINT n°02 ont été récupérés le 19 novembre 2026 via l’API publique du site. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDSUCount()>=DOJO_DSU_LESSONS.length){
      html += '<div class="card"><h3>DSU Cyber Camps terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPe">Entrer dans Privilege Escalation</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm12 = $("djToPe"); if(tm12) tm12.addEventListener("click", function(){ dojoScreen="privilege"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Privilege Escalation : liste des leçons ---- */
  if(dojoScreen==="privilege"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Privilege Escalation</div></div>';
    html += '<div class="stepct">Dojo communautaire · Deuxième dojo communautaire jouable · '+dojoPECount()+' / '+DOJO_PE_LESSONS.length+' leçons terminées · Sur le site : 4 modules · 557 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPECount()/DOJO_PE_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’élévation de privilèges sous Linux : bit SUID, sudo et capabilities — côté attaque et côté défense. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPE = "";
    DOJO_PE_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPE){ if(lastModPE) html += '</div>'; lastModPE = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPE) html += '</div>';
    html += '<div class="card"><h3>557 défis comptés, 625 annoncés</h3><p>Écart signalé, pas comblé : le compteur du site est en avance sur ce dojo encore en développement. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Les CVE : optionnelles, en machine virtuelle</h3><p>Le module CVEs est optionnel sur le site et ne compte pas dans la progression ; la leçon PE-11 le présente en exemples historiques. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPECount()>=DOJO_PE_LESSONS.length){
      html += '<div class="card"><h3>Privilege Escalation terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToIpl">Entrer dans Intro to Programming Languages</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm13 = $("djToIpl"); if(tm13) tm13.addEventListener("click", function(){ dojoScreen="proglang"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Intro to Programming Languages : liste des leçons ---- */
  if(dojoScreen==="proglang"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Intro to Programming Languages</div></div>';
    html += '<div class="stepct">Dojo communautaire · Cours CSE240 de l’Arizona State University · Troisième dojo communautaire jouable · '+dojoIPLCount()+' / '+DOJO_IPL_LESSONS.length+' leçons terminées · Sur le site : 25 modules · 252 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoIPLCount()/DOJO_IPL_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le socle de programmation (cours CSE240) : Linux, C, C++, Scheme et Prolog. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModIPL = "";
    DOJO_IPL_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModIPL){ if(lastModIPL) html += '</div>'; lastModIPL = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModIPL) html += '</div>';
    html += '<div class="card"><h3>252 défis listés, 253 annoncés</h3><p>Un seul écart : le défi n°10 du module Structures and Makefiles manque sur le site (voir la leçon IPL-10). Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Ce qui n’a pas pu être lu est signalé, pas inventé</h3><p>Défis vidéo seule, consignes dans l’extension du cours ou verrouillés : chacun est signalé à sa place dans les leçons. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoIPLCount()>=DOJO_IPL_LESSONS.length){
      html += '<div class="card"><h3>Intro to Programming Languages terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToAos">Entrer dans The Art of the Shell</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm14 = $("djToAos"); if(tm14) tm14.addEventListener("click", function(){ dojoScreen="shellart"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran The Art of the Shell : liste des leçons ---- */
  if(dojoScreen==="shellart"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">The Art of the Shell</div></div>';
    html += '<div class="stepct">Dojo communautaire · Open source (BSD-2-Clause) · Quatrième dojo communautaire jouable · '+dojoAOSCount()+' / '+DOJO_AOS_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 55 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoAOSCount()/DOJO_AOS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">La sécurité du shell bash : expansions, filtres et entrées piégées, vus côté défense. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModAOS = "";
    DOJO_AOS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModAOS){ if(lastModAOS) html += '</div>'; lastModAOS = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModAOS) html += '</div>';
    html += '<div class="card"><h3>55 défis lus, 55 annoncés</h3><p>Aucun écart, aucun défi verrouillé ; les variantes d’un même mécanisme sont regroupées par concept. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Des descriptions d’une ligne</h3><p>Sur le site, chaque défi tient en une phrase-énigme : les leçons décrivent le concept enseigné, sans solution pas à pas. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoAOSCount()>=DOJO_AOS_LESSONS.length){
      html += '<div class="card"><h3>The Art of the Shell terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToFluffy">Entrer dans Fluffy’s Adventure</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm15 = $("djToFluffy"); if(tm15) tm15.addEventListener("click", function(){ dojoScreen="fluffyadv"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Fluffy’s Adventure : liste des leçons ---- */
  if(dojoScreen==="fluffyadv"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Fluffy’s Adventure</div></div>';
    html += '<div class="stepct">Dojo communautaire · Narratif · Cinquième dojo communautaire jouable · '+dojoFLCount()+' / '+DOJO_FL_LESSONS.length+' leçons terminées · Sur le site : 8 modules · 28 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoFLCount()/DOJO_FL_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo-conte : Fluffy le renard traverse web, crypto, OSINT et forensique en histoires. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModFL = "";
    DOJO_FL_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModFL){ if(lastModFL) html += '</div>'; lastModFL = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModFL) html += '</div>';
    html += '<div class="card"><h3>28 défis annoncés, 20 descriptions lisibles</h3><p>Les 8 autres défis (verrouillés, à titre seul ou sans description) sont signalés dans les leçons, jamais inventés. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Ce qui est inféré est écrit « inféré »</h3><p>Les thèmes déduits des titres sont présentés comme des inférences, pas comme des contenus du site. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoFLCount()>=DOJO_FL_LESSONS.length){
      html += '<div class="card"><h3>Fluffy’s Adventure terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToCi">Entrer dans Content Injection</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm16 = $("djToCi"); if(tm16) tm16.addEventListener("click", function(){ dojoScreen="contentinj"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Content Injection : liste des leçons ---- */
  if(dojoScreen==="contentinj"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Content Injection</div></div>';
    html += '<div class="stepct">Dojo communautaire · Open source (BSD 2-Clause) · Sixième dojo communautaire jouable · '+dojoCICount()+' / '+DOJO_CI_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 10 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoCICount()/DOJO_CI_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’injection de contenu : quand une entrée devient structure, puis code — CSV, YAML, JSON, XML et XSS. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModCI = "";
    DOJO_CI_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModCI){ if(lastModCI) html += '</div>'; lastModCI = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModCI) html += '</div>';
    html += '<div class="card"><h3>10 défis lus, 10 annoncés</h3><p>Aucun écart, aucun défi verrouillé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Un dojo open source, deux séries, un seul principe</h3><p>Sept défis « Teacher Login » (la donnée devient structure), puis trois « Class Cancellation » (la donnée devient code). Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoCICount()>=DOJO_CI_LESSONS.length){
      html += '<div class="card"><h3>Content Injection terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPw">Entrer dans Pwndamentals</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm17 = $("djToPw"); if(tm17) tm17.addEventListener("click", function(){ dojoScreen="pwndamentals"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Pwndamentals : liste des leçons ---- */
  if(dojoScreen==="pwndamentals"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Pwndamentals</div></div>';
    html += '<div class="stepct">Dojo communautaire · Révision · Septième dojo communautaire jouable · '+dojoPWCount()+' / '+DOJO_PW_LESSONS.length+' leçons terminées · Sur le site : 7 modules · 38 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPWCount()/DOJO_PW_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo de révision : pile, ROP, GOT, noyau, Spectre — puis l’exploitation sous Windows. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPW = "";
    DOJO_PW_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPW){ if(lastModPW) html += '</div>'; lastModPW = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPW) html += '</div>';
    html += '<div class="card"><h3>38 défis lus, 38 annoncés</h3><p>Aucun défi verrouillé ; les deux modules Windows ont été lus sur le site principal. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Deux modules Windows en développement</h3><p>Mention « en développement » sur le site ; les leçons enseignent les concepts, sans les cours vidéo. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Windows Warzone : le même contenu, sous un autre nom</h3><p>Doublon exact des modules Windows de Pwndamentals : ses 17 défis sont ceux des leçons PW-10 à PW-13, comptés une seule fois. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPWCount()>=DOJO_PW_LESSONS.length){
      html += '<div class="card"><h3>Pwndamentals terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToPt">Entrer dans Pwntools Tutorials</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm18 = $("djToPt"); if(tm18) tm18.addEventListener("click", function(){ dojoScreen="pwntools"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Pwntools Tutorials : liste des leçons ---- */
  if(dojoScreen==="pwntools"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Pwntools Tutorials</div></div>';
    html += '<div class="stepct">Dojo communautaire · Outillage · Huitième dojo communautaire jouable · '+dojoPTCount()+' / '+DOJO_PT_LESSONS.length+' leçons terminées · Sur le site : 1 module · 12 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPTCount()/DOJO_PT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’atelier pwntools, la bibliothèque Python d’exploitation : dialoguer, empaqueter, assembler, mesurer un débordement. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPT = "";
    DOJO_PT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPT){ if(lastModPT) html += '</div>'; lastModPT = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPT) html += '</div>';
    html += '<div class="card"><h3>12 défis lus, 12 annoncés</h3><p>Aucun écart, aucun défi verrouillé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Un dojo open source</h3><p>Le dojo se joue sur pwn.college, avec un compte gratuit. Prérequis : Python, terminal Linux, bases d’assembleur. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPTCount()>=DOJO_PT_LESSONS.length){
      html += '<div class="card"><h3>Pwntools Tutorials terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToQq">Entrer dans The Quarterly Quiz</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm19 = $("djToQq"); if(tm19) tm19.addEventListener("click", function(){ dojoScreen="quarterly"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran The Quarterly Quiz : liste des leçons ---- */
  if(dojoScreen==="quarterly"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">The Quarterly Quiz</div></div>';
    html += '<div class="stepct">Dojo communautaire · Expert · Neuvième dojo communautaire jouable · '+dojoQQCount()+' / '+DOJO_QQ_LESSONS.length+' leçons terminées · Sur le site : 2 modules · 13 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoQQCount()/DOJO_QQ_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo expert, trimestriel : exploitation du noyau (KylebotFS) et du moteur JavaScript V8. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModQQ = "";
    DOJO_QQ_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModQQ){ if(lastModQQ) html += '</div>'; lastModQQ = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModQQ) html += '</div>';
    html += '<div class="card"><h3>13 défis lus, 13 annoncés</h3><p>Aucun écart, aucun défi verrouillé ; les descriptions du site tiennent en une ligne, les leçons enseignent les concepts. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Un dojo vivant, à aborder en dernier</h3><p>Un nouveau module tous les trois mois sur le site ; règle des 72 heures pour les modules fraîchement sortis. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoQQCount()>=DOJO_QQ_LESSONS.length){
      html += '<div class="card"><h3>The Quarterly Quiz terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToDcs">Entrer dans Desert CodeSprouts</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm20 = $("djToDcs"); if(tm20) tm20.addEventListener("click", function(){ dojoScreen="codesprouts"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Desert CodeSprouts : liste des leçons ---- */
  if(dojoScreen==="codesprouts"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Desert CodeSprouts</div></div>';
    html += '<div class="stepct">Dojo communautaire · Grand public · Dixième dojo communautaire jouable · '+dojoDCSCount()+' / '+DOJO_DCS_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 7 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDCSCount()/DOJO_DCS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’atelier ASU pour collégiens, sans aucun prérequis : sécurité web, mission ninja et Pac-Man à entraîner. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModDCS = "";
    DOJO_DCS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModDCS){ if(lastModDCS) html += '</div>'; lastModDCS = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModDCS) html += '</div>';
    html += '<div class="card"><h3>7 défis lus, 7 annoncés</h3><p>Aucun écart, aucun défi verrouillé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Un atelier d’université, joué dans le navigateur</h3><p>Sur le site, les défis se jouent dans une application web ou un bureau VNC, guidés pas à pas. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDCSCount()>=DOJO_DCS_LESSONS.length){
      html += '<div class="card"><h3>Desert CodeSprouts terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap19">Voir la carte des dojos</button><button class="btn big" id="djToXnu" style="margin-top:8px">Entrer dans XNU Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm21 = $("djToMap19"); if(tm21) tm21.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm22 = $("djToXnu"); if(tm22) tm22.addEventListener("click", function(){ dojoScreen="xnudojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran XNU Dojo : liste des leçons ---- */
  if(dojoScreen==="xnudojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">XNU Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Expert · Onzième dojo communautaire jouable · '+dojoXNUCount()+' / '+DOJO_XNU_LESSONS.length+' leçons terminées · Sur le site : 6 modules · 61 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoXNUCount()/DOJO_XNU_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le noyau XNU (macOS/iOS) et ARM64 : assembleur, ROP, Mach IPC, ports Mach, IOKit et PAC. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModXNU = "";
    DOJO_XNU_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModXNU){ if(lastModXNU) html += '</div>'; lastModXNU = l.mod; html += '<h2>Module · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModXNU) html += '</div>';
    html += '<div class="card"><h3>61 défis lus, 61 annoncés</h3><p>Aucun écart, aucun défi verrouillé ; les leçons enseignent les concepts, sans solution pas à pas. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Des machines éphémères, un accès SSH</h3><p>Sur le site, les modules 3 à 6 tournent sur des machines éphémères, en SSH uniquement : ici, tout est adapté en concepts. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>ARM Architecture et ARM Dojo : les mêmes modules</h3><p>Doublons exacts des modules ARM de ce dojo : ils renvoient aux leçons XNU, défis comptés une seule fois. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoXNUCount()>=DOJO_XNU_LESSONS.length){
      html += '<div class="card"><h3>XNU Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap20">Voir la carte des dojos</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm23 = $("djToMap20"); if(tm23) tm23.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Fuzz Dojo : liste des leçons de concepts ---- */
  if(dojoScreen==="fuzzdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Fuzz Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Concepts · Douzième dojo communautaire jouable · '+dojoFZCount()+' / '+DOJO_FZ_LESSONS.length+' leçons terminées · Leçons de concepts</div><div class="progressline"><i style="width:'+Math.round(100*dojoFZCount()/DOJO_FZ_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le fuzzing en leçons de concepts : fuzz drivers, couverture, libFuzzer, AFL++, OSS-Fuzz et triage de crash. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModFZ = "";
    DOJO_FZ_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModFZ){ if(lastModFZ) html += '</div>'; lastModFZ = l.mod; html += '<h2>Concepts · '+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModFZ) html += '</div>';
    html += '<div class="card"><h3>0 défi lu sur 80 annoncés : la limite, en clair</h3><p>Les modules de ce dojo ne sont pas lisibles publiquement (étude de recherche) : leçons de concepts uniquement. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Ce que l’introduction du dojo décrit</h3><p>Concevoir des fuzz drivers sur de vrais projets open source, objectif +5 % de couverture par driver. Prérequis : lire du C++. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoFZCount()>=DOJO_FZ_LESSONS.length){
      html += '<div class="card"><h3>Fuzz Dojo — leçons de concepts terminées</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap21">Voir la carte des dojos</button><button class="btn big" id="djToAml" style="margin-top:8px">Entrer dans Adversarial ML</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm24 = $("djToMap21"); if(tm24) tm24.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm25 = $("djToAml"); if(tm25) tm25.addEventListener("click", function(){ dojoScreen="amldojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Adversarial ML : liste des leçons ---- */
  if(dojoScreen==="amldojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Adversarial ML</div></div>';
    html += '<div class="stepct">Dojo communautaire · ML adversarial · Treizième dojo communautaire jouable · '+dojoAMLCount()+' / '+DOJO_AML_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 3 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoAMLCount()/DOJO_AML_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le ML adversarial : tromper les modèles au moment de la décision (évasion) et fausser leur apprentissage (empoisonnement). Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModAML = "";
    DOJO_AML_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModAML){ if(lastModAML) html += '</div>'; lastModAML = l.mod; html += '<h2>'+((l.mod==="Model Evasion" || l.mod==="Data Poisoning") ? "Module · " : "Concepts · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModAML) html += '</div>';
    html += '<h2>Modules du site — à venir</h2>';
    html += '<div class="card"><h3>Module · Prompt Injection — à venir</h3><p>0 challenge sur le site pour l’instant : présenté à venir, sans contenu inventé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Module · Model Inversion — à venir</h3><p>0 challenge sur le site pour l’instant : présenté à venir, sans contenu inventé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>Module · Model Extraction — à venir</h3><p>0 challenge sur le site pour l’instant : présenté à venir, sans contenu inventé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    html += '<div class="card"><h3>3 défis lus, 3 annoncés</h3><p>Le compte est complet ; le dojo, lui, est encore en développement sur le site (3 modules vides). Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoAMLCount()>=DOJO_AML_LESSONS.length){
      html += '<div class="card"><h3>Adversarial ML terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap22">Voir la carte des dojos</button><button class="btn big" id="djToHanto" style="margin-top:8px">Entrer dans Hanto Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm26 = $("djToMap22"); if(tm26) tm26.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm28 = $("djToHanto"); if(tm28) tm28.addEventListener("click", function(){ dojoScreen="hantodojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Hanto Dojo : liste des leçons ---- */
  if(dojoScreen==="hantodojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Hanto Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Python, web et IA · Quatorzième dojo communautaire jouable · '+dojoHTCount()+' / '+DOJO_HT_LESSONS.length+' leçons terminées · Sur le site : 7 modules · 44 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoHTCount()/DOJO_HT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Prisons Python, SSTI, pickle et injection de prompt — sur un ton humoristique. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModHT = "";
    DOJO_HT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModHT){ if(lastModHT) html += '</div>'; lastModHT = l.mod; html += '<h2>'+((l.mod==="Présentation" || l.mod==="Miscellaneous et bilan") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModHT) html += '</div>';
    html += '<div class="card"><h3>40 défis lus, 44 annoncés</h3><p>Les 4 défis restants sont ceux du module Lectures, un module-blague dont les titres ne sont pas lisibles : aucun n’a été inventé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoHTCount()>=DOJO_HT_LESSONS.length){
      html += '<div class="card"><h3>Hanto Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap23">Voir la carte des dojos</button><button class="btn big" id="djToAturt" style="margin-top:8px">Entrer dans aturt13 Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm27 = $("djToMap23"); if(tm27) tm27.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm29 = $("djToAturt"); if(tm29) tm29.addEventListener("click", function(){ dojoScreen="aturt13"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran aturt13 Dojo : liste des leçons ---- */
  if(dojoScreen==="aturt13"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">aturt13 Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Exploitation avancée · Quinzième dojo communautaire jouable · '+dojoATCount()+' / '+DOJO_AT_LESSONS.length+' leçons terminées · Sur le site : 5 modules · 23 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoATCount()/DOJO_AT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’exploitation avancée en aveugle : chaînes de format, tas, fuzzing AFL++, primitives limitées et C++. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModAT = "";
    DOJO_AT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModAT){ if(lastModAT) html += '</div>'; lastModAT = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModAT) html += '</div>';
    html += '<div class="card"><h3>23 défis lus, 23 annoncés</h3><p>Le compte est exact ; 2 défis sont signalés par l’auteur comme non testés et susceptibles de changer (leçons AT-06 et AT-13). Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoATCount()>=DOJO_AT_LESSONS.length){
      html += '<div class="card"><h3>aturt13 Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap24">Voir la carte des dojos</button><button class="btn big" id="djToForensics" style="margin-top:8px">Entrer dans Intro to Forensics</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm30 = $("djToMap24"); if(tm30) tm30.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm31 = $("djToForensics"); if(tm31) tm31.addEventListener("click", function(){ dojoScreen="forensics"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Intro to Forensics : liste des leçons ---- */
  if(dojoScreen==="forensics"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Intro to Forensics</div></div>';
    html += '<div class="stepct">Dojo communautaire · Forensique numérique · Seizième dojo communautaire jouable · '+dojoIFCount()+' / '+DOJO_IF_LESSONS.length+' leçons terminées · Sur le site : 1 module · 8 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoIFCount()/DOJO_IF_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">La forensique numérique, un outil par défi : file, strings, xxd, exiftool, zsteg, binwalk, steghide, foremost. Aucune expérience requise. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModIF = "";
    DOJO_IF_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModIF){ if(lastModIF) html += '</div>'; lastModIF = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModIF) html += '</div>';
    html += '<div class="card"><h3>8 défis lus, 8 annoncés</h3><p>Le compte est exact, aucun défi verrouillé ; certains outils recommandés ne sont pas dans le Dojo et les images s’inspectent en local (scp ou VS Code). Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoIFCount()>=DOJO_IF_LESSONS.length){
      html += '<div class="card"><h3>Intro to Forensics terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap25">Voir la carte des dojos</button><button class="btn big" id="djToLord" style="margin-top:8px">Entrer dans Lord of OSINT</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm32 = $("djToMap25"); if(tm32) tm32.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm33 = $("djToLord"); if(tm33) tm33.addEventListener("click", function(){ dojoScreen="lordosint"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Lord of OSINT : liste des leçons ---- */
  if(dojoScreen==="lordosint"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Lord of OSINT</div></div>';
    html += '<div class="stepct">Dojo communautaire · OSINT géographique (GeoSINT) · Dix-septième dojo communautaire jouable · '+dojoLOCount()+' / '+DOJO_LO_LESSONS.length+' leçons terminées · Sur le site : 1 module · 12 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoLOCount()/DOJO_LO_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Géolocaliser un lieu à partir d’une image : lecture d’image, indices géographiques, recherche inversée, EXIF, cartes. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModLO = "";
    DOJO_LO_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModLO){ if(lastModLO) html += '</div>'; lastModLO = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModLO) html += '</div>';
    html += '<div class="card"><h3>12 défis lus, 12 annoncés</h3><p>Le compte est exact, aucun défi verrouillé ; sur le site, chaque défi tient en une phrase d’ambiance et le contenu est visuel — aucun lieu, aucune consigne, aucune solution inventés ici. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoLOCount()>=DOJO_LO_LESSONS.length){
      html += '<div class="card"><h3>Lord of OSINT terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap26">Voir la carte des dojos</button><button class="btn big" id="djToHacker" style="margin-top:8px">Entrer dans Hacker History</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm34 = $("djToMap26"); if(tm34) tm34.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm35 = $("djToHacker"); if(tm35) tm35.addEventListener("click", function(){ dojoScreen="hackerhistory"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Hacker History : liste des leçons ---- */
  if(dojoScreen==="hackerhistory"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Hacker History</div></div>';
    html += '<div class="stepct">Dojo communautaire · Histoire et culture hacker · Dix-huitième dojo communautaire jouable · '+dojoHHCount()+' / '+DOJO_HH_LESSONS.length+' leçons terminées · Sur le site : 2 modules · 8 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoHHCount()/DOJO_HH_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’histoire du hacking des années 90 : les BBS, internes et externes, puis l’IRC — connexion brute, pseudo, canal, et usurpation. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModHH = "";
    DOJO_HH_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModHH){ if(lastModHH) html += '</div>'; lastModHH = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModHH) html += '</div>';
    html += '<div class="card"><h3>8 défis lus, 8 annoncés</h3><p>Le compte est exact, aucun défi verrouillé. Deux limites dites en clair : le défi External BBS dépend d’un service externe réel — le BBS « 20 For Beers », en ligne depuis les années 90 — et son mot de passe s’obtient en direct, sans être reproduit ici ; et le crochetage et le phreaking, cités dans le cours, n’ont aucun défi — aucune leçon ne les invente. Le Honors Dojo reprend ce même module IRC : il renvoie vers ces leçons en alias — aucun défi compté en double. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoHHCount()>=DOJO_HH_LESSONS.length){
      html += '<div class="card"><h3>Hacker History terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap27">Voir la carte des dojos</button><button class="btn big" id="djToDos" style="margin-top:8px">Entrer dans DOS Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm36 = $("djToMap27"); if(tm36) tm36.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm37 = $("djToDos"); if(tm37) tm37.addEventListener("click", function(){ dojoScreen="dosdojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran DOS Dojo : liste des leçons ---- */
  if(dojoScreen==="dosdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">DOS Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Rétro · MS-DOS début des années 1990 · Dix-neuvième dojo communautaire jouable · '+dojoDOSCount()+' / '+DOJO_DOS_LESSONS.length+' leçons terminées · Sur le site : 2 modules · 10 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDOSCount()/DOJO_DOS_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le système PC dominant du début des années 90 : type, dir, lettres de lecteur, disquettes, installation de MS-DOS 6.22, autoexec.bat, doskey, réseau d’époque — puis la mémoire sans protection. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModDOS = "";
    DOJO_DOS_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModDOS){ if(lastModDOS) html += '</div>'; lastModDOS = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModDOS) html += '</div>';
    html += '<div class="card"><h3>10 défis lus, 10 annoncés</h3><p>Le compte est exact, aucun défi verrouillé. Deux limites dites en clair : sur le site, la machine DOS est émulée sous QEMU et l’interaction passe par l’interface bureau du workspace — pas de sélection de texte directement dans DOS ; et le module DOS Memory demande du développement C, avec TurboC++ installé dans C:\\TC. Le défi DOS Networking dérive du Jour 11 de l’Advent of Pwn 2025, qui a inspiré tout le dojo. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDOSCount()>=DOJO_DOS_LESSONS.length){
      html += '<div class="card"><h3>DOS Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap28">Voir la carte des dojos</button><button class="btn big" id="djToLfr" style="margin-top:8px">Entrer dans Linux Firmware Rehosting</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm38 = $("djToMap28"); if(tm38) tm38.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm39 = $("djToLfr"); if(tm39) tm39.addEventListener("click", function(){ dojoScreen="firmrehost"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Linux Firmware Rehosting : liste des leçons ---- */
  if(dojoScreen==="firmrehost"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Linux Firmware Rehosting</div></div>';
    html += '<div class="stepct">Dojo communautaire · Rehosting de firmware · IoT émulé · Vingtième dojo communautaire jouable · '+dojoLFRCount()+' / '+DOJO_LFR_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 13 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoLFRCount()/DOJO_LFR_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Faire tourner un firmware Linux d’appareil IoT dans un environnement émulé, pour l’analyser sans le matériel : fw2tar et penguin (outils IGLOO), console, shell root, plugins, pseudo-fichiers, NVRAM — puis de vrais firmwares OpenIPC. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModLFR = "";
    DOJO_LFR_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModLFR){ if(lastModLFR) html += '</div>'; lastModLFR = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModLFR) html += '</div>';
    html += '<div class="card"><h3>13 défis lus, 13 annoncés</h3><p>Le compte est exact, aucun défi verrouillé. Trois limites dites en clair : les défis se jouent dans un workspace pwn.college avec Docker et l’interface bureau — notamment pour les interfaces web OpenIPC — et ce jeu enseigne les concepts et la démarche, pas l’émulation elle-même ; les cours du site sont des diapositives sans transcription, les leçons sont construites à partir des descriptions des défis ; et le défi Networking - Address n’a qu’une description d’une ligne sur le site — sa leçon enseigne le concept, sans consigne ni solution inventées. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoLFRCount()>=DOJO_LFR_LESSONS.length){
      html += '<div class="card"><h3>Linux Firmware Rehosting terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap29">Voir la carte des dojos</button><button class="btn big" id="djToLun" style="margin-top:8px">Entrer dans Linux Lunacy</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm40 = $("djToMap29"); if(tm40) tm40.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm41 = $("djToLun"); if(tm41) tm41.addEventListener("click", function(){ dojoScreen="lunacy"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Linux Lunacy : liste des leçons ---- */
  if(dojoScreen==="lunacy"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Linux Lunacy</div></div>';
    html += '<div class="stepct">Dojo communautaire · Les étrangetés de Linux · Ton cirque · Vingt et unième dojo communautaire jouable · '+dojoLUNCount()+' / '+DOJO_LUN_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 13 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoLUNCount()/DOJO_LUN_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">La folie de Linux sous le chapiteau : descripteurs de fichiers qui survivent à leur fichier, bombes de décompression, sed qui fait semblant, terminal volé, passe-passe de mv et appels système en numéros de clown. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModLUN = "";
    DOJO_LUN_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModLUN){ if(lastModLUN) html += '</div>'; lastModLUN = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModLUN) html += '</div>';
    html += '<div class="card"><h3>13 défis lus, 13 annoncés</h3><p>Le compte est exact, aucun défi verrouillé. Trois limites dites en clair : chaque défi n’a qu’une phrase d’ambiance sur le site, sans consigne technique détaillée — les leçons enseignent les concepts, sans inventer ni consigne, ni solution, ni flag ; « Mo Regex, Mo Problems » n’est pas résoluble avec ce seul défi, le site demande de penser en dehors du workspace ; et « Moving on from Move... » casse légèrement l’infrastructure du site — le mode Terminal y est recommandé. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoLUNCount()>=DOJO_LUN_LESSONS.length){
      html += '<div class="card"><h3>Linux Lunacy terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap30">Voir la carte des dojos</button><button class="btn big" id="djToKec" style="margin-top:8px">Entrer dans Kernel Exercise Collection</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm42 = $("djToMap30"); if(tm42) tm42.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm43 = $("djToKec"); if(tm43) tm43.addEventListener("click", function(){ dojoScreen="kernelexercise"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Kernel Exercise Collection : liste des leçons ---- */
  if(dojoScreen==="kernelexercise"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Kernel Exercise Collection</div></div>';
    html += '<div class="stepct">Dojo communautaire · Kernel pwn · Expert · Vingt-deuxième dojo communautaire jouable · '+dojoKECCount()+' / '+DOJO_KEC_LESSONS.length+' leçons terminées · Sur le site : 1 module · 6 challenges annoncés, 5 visibles</div><div class="progressline"><i style="width:'+Math.round(100*dojoKECCount()/DOJO_KEC_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">L’exploitation du noyau Linux au niveau expert : des défis d’anciens CTF réunis en un seul module — msg_msg et son off-by-one, une région mémoire isolée à quitter, un pilote vulnérable sous FG-KASLR, des objets élastiques et RetSpill, une format string dans le noyau. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModKEC = "";
    DOJO_KEC_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModKEC){ if(lastModKEC) html += '</div>'; lastModKEC = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModKEC) html += '</div>';
    html += '<div class="card"><h3>5 défis lus, 6 annoncés</h3><p>Le site annonce 6 défis, 5 seulement sont visibles : le module est « still under construction » et le 6e défi est introuvable — aucun 6e défi inventé ici. Prérequis affichés par le site : avoir terminé les modules Kernel Security et Kernel Exploitation. Les défis se jouent dans un workspace pwn.college avec émulation QEMU du noyau ; ce jeu enseigne les concepts et la démarche, pas l’émulation elle-même. Les indices du site sont encodés en base64 : seuls leurs thèmes sont cités ici. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoKECCount()>=DOJO_KEC_LESSONS.length){
      html += '<div class="card"><h3>Kernel Exercise Collection terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap31">Voir la carte des dojos</button><button class="btn big" id="djToKp" style="margin-top:8px">Entrer dans Kitten Playground</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm44 = $("djToMap31"); if(tm44) tm44.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm45 = $("djToKp"); if(tm45) tm45.addEventListener("click", function(){ dojoScreen="kittenplayground"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Kitten Playground : liste des leçons ---- */
  if(dojoScreen==="kittenplayground"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Kitten Playground</div></div>';
    html += '<div class="stepct">Dojo communautaire · Matériel · FPGA et VHDL · Vingt-troisième dojo communautaire jouable · '+dojoKPCount()+' / '+DOJO_KP_LESSONS.length+' leçons terminées · Sur le site : 1 module · 1 challenge</div><div class="progressline"><i style="width:'+Math.round(100*dojoKPCount()/DOJO_KP_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le plus petit dojo du parcours, encore en construction sur le site : un seul défi, Rijndael — une implémentation AES 100 % conforme au standard, en VHDL pour FPGA, sans module de déchiffrement et avec une clé perdue, vérifiée par un testbench GHDL contre un vecteur de test. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModKP = "";
    DOJO_KP_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModKP){ if(lastModKP) html += '</div>'; lastModKP = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModKP) html += '</div>';
    html += '<div class="card"><h3>1 défi lu, 1 annoncé — et des limites nettes</h3><p>Le compte est exact : un module, un défi, dojo affiché « currently under construction » sur le site, sans aucune ressource de cours. Les fichiers VHDL (rijndael.vhd, encrypter.vhd, testbench.vhd) et le vecteur de test sont fournis dans le workspace du défi, mais leur contenu n’est pas lisible depuis les descriptions publiques : les leçons enseignent les concepts et la démarche, sans inventer ni code source, ni vecteur de test, ni solution. Le défi se joue sur pwn.college, avec un compte. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoKPCount()>=DOJO_KP_LESSONS.length){
      html += '<div class="card"><h3>Kitten Playground terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap32">Voir la carte des dojos</button><button class="btn big" id="djToRii" style="margin-top:8px">Entrer dans RII Router Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm46 = $("djToMap32"); if(tm46) tm46.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm47 = $("djToRii"); if(tm47) tm47.addEventListener("click", function(){ dojoScreen="riirouter"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran RII Router Dojo : liste des leçons ---- */
  if(dojoScreen==="riirouter"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">RII Router Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Émulation · Firmware et exploitation · Vingt-quatrième dojo communautaire jouable · '+dojoRIICount()+' / '+DOJO_RII_LESSONS.length+' leçons terminées · Sur le site : 1 module · 2 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoRIICount()/DOJO_RII_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Un vrai routeur en fin de vie, le D-Link DIR-868L : d’abord émuler complètement son firmware v1.12b04 sous QEMU et prouver la fidélité de l’émulation, puis exploiter la CVE-2017-14948 à distance et livrer un C2 — le défi 1 débloque le défi 2. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModRII = "";
    DOJO_RII_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModRII){ if(lastModRII) html += '</div>'; lastModRII = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModRII) html += '</div>';
    html += '<div class="card"><h3>2 défis lus, 2 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, deux défis, aucun verrouillé. Les limites, en clair : l’émulation complète ne se joue pas dans ce jeu — elle demande le firmware réel, QEMU, un réseau TAP et le workspace pwn.college ; les instructions complètes sont dans le blog RII (researchinnovations.com/post/introducing-the-rii-pwn-college-dojo), ressource primaire du dojo ; le vérificateur SLA est volontairement caché et le contrôle heuristique de la CVE est décrit comme capricieux ; et pwn.college comme RII demandent de ne pas publier de solutions — aucun payload, aucun code C2, aucune commande d’émulation complète n’est reproduit ici. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoRIICount()>=DOJO_RII_LESSONS.length){
      html += '<div class="card"><h3>RII Router Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap33">Voir la carte des dojos</button><button class="btn big" id="djToRt" style="margin-top:8px">Entrer dans Red Team Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm48 = $("djToMap33"); if(tm48) tm48.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm49 = $("djToRt"); if(tm49) tm49.addEventListener("click", function(){ dojoScreen="redteam"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Red Team Dojo : liste des leçons ---- */
  if(dojoScreen==="redteam"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Red Team Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Red team · Chaînes d’attaque · Vingt-cinquième dojo communautaire jouable · '+dojoRTCount()+' / '+DOJO_RT_LESSONS.length+' leçons terminées · Sur le site : 1 module · 3 challenges · Dojo en construction</div><div class="progressline"><i style="width:'+Math.round(100*dojoRTCount()/DOJO_RT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Simuler des chaînes d’attaque réalistes dans des environnements isolés : reconnaissance systématique, hôtes compromis, récupération d’artefacts sensibles, et mouvement latéral dans des réseaux segmentés — un module, Infiltration Basics, et trois défis guidés par des indices. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModRT = "";
    DOJO_RT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModRT){ if(lastModRT) html += '</div>'; lastModRT = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModRT) html += '</div>';
    html += '<div class="card"><h3>3 défis lus, 3 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, trois défis, aucun verrouillé. Les limites, en clair : le dojo est affiché « en construction » sur le site — une première version, publiée pour mesurer l’intérêt, et d’autres défis pourraient suivre sans être promis ; chaque défi n’a qu’une ou deux phrases d’ambiance, sans consigne technique — les leçons enseignent les concepts, sans inventer ni consigne, ni solution, ni flag ; le numéro de CVE du défi 3 est volontairement masqué sur le site et n’est pas deviné ici ; et il n’y a ni vidéo, ni diapositives, ni aucune ressource de cours. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoRTCount()>=DOJO_RT_LESSONS.length){
      html += '<div class="card"><h3>Red Team Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap34">Voir la carte des dojos</button><button class="btn big" id="djToX86" style="margin-top:8px">Entrer dans x86 Exploitation</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm50 = $("djToMap34"); if(tm50) tm50.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm51 = $("djToX86"); if(tm51) tm51.addEventListener("click", function(){ dojoScreen="x86exploitation"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran x86 Exploitation : liste des leçons ---- */
  if(dojoScreen==="x86exploitation"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">x86 Exploitation</div></div>';
    html += '<div class="stepct">Dojo communautaire · ROP 32 bits · ELF32 · Vingt-sixième dojo communautaire jouable · '+dojoX86Count()+' / '+DOJO_X86_LESSONS.length+' leçons terminées · Sur le site : 1 module · 8 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoX86Count()/DOJO_X86_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le ROP dans l’ancien royaume du 32 bits : déborder des binaires ELF32, passer les arguments sur la pile, nettoyer la pile entre les appels, enchaîner setuid et system jusqu’au shell, puis contourner l’ASLR par la PLT et affronter le PIE. Prérequis affiché par le site : avoir terminé le ROP ELF64 avant (module Return-Oriented Programming de Program Security). Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModX86 = "";
    DOJO_X86_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModX86){ if(lastModX86) html += '</div>'; lastModX86 = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModX86) html += '</div>';
    html += '<div class="card"><h3>8 défis lus, 8 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, ELF32 ROP, huit défis, aucun verrouillé. Les limites, en clair : le prérequis est réel — le site suppose le ROP sur ELF64 déjà pratiqué (module Return-Oriented Programming de Program Security, jouable dans ce jeu) ; les descriptions des défis sont courtes, une à trois phrases, mais complètes — les leçons enseignent les concepts (ELF32, ROP, gadgets, pile, appels système) sans inventer ni consigne, ni solution, ni flag ; et le module n’a aucune ressource de cours : ni vidéo, ni diapositives. Le dojo est open source : github.com/milrn/x86-exploitation. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoX86Count()>=DOJO_X86_LESSONS.length){
      html += '<div class="card"><h3>x86 Exploitation terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap35">Voir la carte des dojos</button><button class="btn big" id="djToHn" style="margin-top:8px">Entrer dans Honors Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm52 = $("djToMap35"); if(tm52) tm52.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm53 = $("djToHn"); if(tm53) tm53.addEventListener("click", function(){ dojoScreen="honorsdojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Honors Dojo : liste des leçons ---- */
  if(dojoScreen==="honorsdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Honors Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Étudiants honors de l’ASU · Web3 et intégration continue · Vingt-septième dojo communautaire jouable · '+dojoHNCount()+' / '+DOJO_HN_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 17 challenges, dont 6 déjà dans Hacker History</div><div class="progressline"><i style="width:'+Math.round(100*dojoHNCount()/DOJO_HN_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Des modules écrits par les étudiants du Barrett Honors College (ASU) sur des sujets que pwn.college ne couvrait pas : la sécurité des portefeuilles Web3 avec la seule ligne de commande Linux, et l’intégration continue avec GitHub Actions — simulée localement. Le module IRC du dojo est déjà dans ce jeu, dans Hacker History : il n’est pas reconstruit ici. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModHN = "";
    DOJO_HN_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModHN){ if(lastModHN) html += '</div>'; lastModHN = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModHN) html += '</div>';
    html += '<div class="card"><h3>Module IRC : déjà dans le jeu — alias, sans double comptage</h3><p>Le premier module du Honors Dojo sur le site, Introduction to IRC Servers (6 défis, par Journey Hancock), est un doublon exact du module IRC de Hacker History : mêmes défis, mêmes titres, mêmes descriptions — netcat, le client sic, le pseudo « pwn », le canal #flag et le message piégé. Il n’est donc ni reconstruit ni compté ici : ses leçons sont les leçons HH-04 à HH-09 de Hacker History.</p><button class="btn primary big" id="djHnToHh">Ouvrir les leçons IRC dans Hacker History</button></div>';
    html += '<div class="card"><h3>11 défis nouveaux, 17 annoncés — et des limites nettes</h3><p>Le compte est exact : 3 modules, 17 défis lus sur le site, aucun verrouillé — mais seuls 11 sont nouveaux (5 Web3 + 6 CI), les 6 défis IRC étant déjà couverts par Hacker History. Les limites, en clair : les défis CI ne tournent pas sur les vrais runners GitHub — l’accès internet du dojo est restreint, ils sont simulés localement par l’outil act, et l’upload d’artefact utilise une action locale au lieu de l’action réelle ; les vidéos du site (6 pour l’IRC, 5 pour la CI) existent sur YouTube mais ne sont pas transcrites ici, et le module Web3 n’a aucune vidéo ; le port du serveur IRC varie selon les instances du dojo (667 ou 6667), sans incidence ici puisque le module est en alias. Les leçons enseignent les concepts sans inventer ni consigne, ni solution, ni flag. Dépôt public du dojo : github.com/pwncollege/honors-dojo. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoHNCount()>=DOJO_HN_LESSONS.length){
      html += '<div class="card"><h3>Honors Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap36">Voir la carte des dojos</button><button class="btn big" id="djToHu" style="margin-top:8px">Entrer dans Hunter Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm54 = $("djToMap36"); if(tm54) tm54.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm55 = $("djHnToHh"); if(tm55) tm55.addEventListener("click", function(){ dojoScreen="hackerhistory"; renderDojo(); window.scrollTo(0,0); });
    var tm56 = $("djToHu"); if(tm56) tm56.addEventListener("click", function(){ dojoScreen="hunterdojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Hunter Dojo : liste des leçons ---- */
  if(dojoScreen==="hunterdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Hunter Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Découverte automatique de vulnérabilités · Nostalgie de l’ancien cursus · Vingt-huitième dojo communautaire jouable · '+dojoHUCount()+' / '+DOJO_HU_LESSONS.length+' leçons terminées · Sur le site : 1 module · 4 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoHUCount()/DOJO_HU_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">D’anciens défis babyauto de pwn.college, réunis par m0nst3r : écrire des scripts qui déclenchent automatiquement des crashs, au lieu d’exploiter à la main — fuzzing, exécution symbolique, analyse statique. Prérequis affichés par le site : avoir terminé le module YAN85, et le module Reverse Engineering de Program Security est recommandé avant de commencer. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModHU = "";
    DOJO_HU_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModHU){ if(lastModHU) html += '</div>'; lastModHU = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModHU) html += '</div>';
    html += '<div class="card"><h3>4 défis lus, 4 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, babyauto, quatre défis, aucun verrouillé, aucun illisible. Les limites, en clair : les prérequis sont réels — quelques niveaux exigent une bonne compréhension de YAN85, et le site conseille fortement de terminer d’abord le module Reverse Engineering de Program Security (jouable dans ce jeu) ; les descriptions des défis tiennent en une ou deux phrases d’ambiance, sans aucune consigne technique — les leçons enseignent les concepts (découverte automatique de vulnérabilités, fuzzing, exécution symbolique, analyse statique, triage de crash, binaires strippés) sans inventer ni consigne, ni solution, ni flag ; les 5 conférences vidéo du cours « Automatic Vulnerability Discovery » existent sur YouTube mais ne sont pas transcrites ici. Le dojo recoupe thématiquement aturt13 (fuzzing AFL++), Fuzz Dojo (concepts de fuzzing) et Program Security (YAN85) — défis différents partout, aucun doublon exact, aucun double comptage. Le dojo est open source : github.com/m0nst3r-ctf/Hunter-Dojo. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoHUCount()>=DOJO_HU_LESSONS.length){
      html += '<div class="card"><h3>Hunter Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap37">Voir la carte des dojos</button><button class="btn big" id="djToHy" style="margin-top:8px">Entrer dans Hydra Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm57 = $("djToMap37"); if(tm57) tm57.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm58 = $("djToHy"); if(tm58) tm58.addEventListener("click", function(){ dojoScreen="hydradojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Hydra Dojo : liste des leçons ---- */
  if(dojoScreen==="hydradojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Hydra Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Les classiques de l’exploitation binaire en version « baby » · Vingt-neuvième dojo communautaire jouable · '+dojoHYCount()+' / '+DOJO_HY_LESSONS.length+' leçons terminées · Sur le site : 1 module · 8 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoHYCount()/DOJO_HY_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Huit défis d’initiation réunis par Zeeshan1234, un par grande technique : le heap (Babyspirit), le ROP contre un binaire à protections complètes (Babyrop), le SROP en assembleur pur (Babysig), ret2csu (Babycsu), le format ELF (Babyelf), les primitives du noyau en mode guidé (Babykernel), la chaîne de format (BabyPrintf) et le ROP sous Windows (BabyWindows). Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModHY = "";
    DOJO_HY_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModHY){ if(lastModHY) html += '</div>'; lastModHY = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModHY) html += '</div>';
    html += '<div class="card"><h3>BabyWindows : les bases Windows sont déjà dans le jeu — renvoi, pas de double contenu</h3><p>La description de BabyWindows renvoie, pour les bases, aux instructions « Getting Started » du cours Windows Crash Course du dojo Windows Warzone. Ce cours est déjà couvert ici : Windows Warzone est l’alias des modules Windows de Pwndamentals — Windows Crash Course et Injection and Hijacking, leçons PW-10 à PW-13 — comptés une seule fois, dans Pwndamentals. La leçon HY-09 fait ce renvoi, elle ne reconstruit pas le cours.</p><button class="btn primary big" id="djHyToPw">Ouvrir les leçons Windows dans Pwndamentals</button></div>';
    html += '<div class="card"><h3>8 défis lus, 8 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, Hydra, huit défis, aucun verrouillé, aucun illisible. Les limites, en clair : le module n’a aucune ressource de cours — ni vidéo, ni diapositives, ni texte au-delà d’un en-tête « Challenges » — et les descriptions des défis tiennent en une phrase chacune, au ton familier, sans aucune consigne technique détaillée — les leçons enseignent les concepts (heap, ROP, SROP, ret2csu, format ELF, primitives noyau, chaîne de format, ROP Windows) sans inventer ni consigne, ni solution, ni flag ; Babykernel est un walkthrough d’initiation aux primitives du noyau, à distinguer des défis kernel pwn experts de Kernel Exercise Collection ; BabyWindows s’appuie sur le Windows Crash Course, déjà dans le jeu via Pwndamentals (voir la carte ci-dessus). Le dojo recoupe thématiquement Program Security, Software Exploitation, System Security et x86 Exploitation — défis différents partout, aucun doublon exact, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoHYCount()>=DOJO_HY_LESSONS.length){
      html += '<div class="card"><h3>Hydra Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap38">Voir la carte des dojos</button><button class="btn big" id="djToKal" style="margin-top:8px">Entrer dans Kalevala</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm59 = $("djToMap38"); if(tm59) tm59.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm61 = $("djToKal"); if(tm61) tm61.addEventListener("click", function(){ dojoScreen="kalevala"; renderDojo(); window.scrollTo(0,0); });
    var tm60 = $("djHyToPw"); if(tm60) tm60.addEventListener("click", function(){ dojoScreen="pwndamentals"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Kalevala : liste des leçons ---- */
  if(dojoScreen==="kalevala"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Kalevala</div></div>';
    html += '<div class="stepct">Dojo communautaire · L’épopée finlandaise de Idanhurja : reverse, noyau et scripting · Trentième dojo communautaire jouable · '+dojoKACount()+' / '+DOJO_KA_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 20 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoKACount()/DOJO_KA_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo de Idanhurja, hacker finlandais, nommé d’après le Kalevala, l’épopée de la mythologie finlandaise ancienne : reverse (deviner un nombre par script, désassembleur ou GDB, des programmes qui jouent avec le temps, et Idan23, un langage interprété fictif inventé par l’auteur), kernel (modules noyau, sys_call_table détournée pour cacher des fichiers à ls, KASLR — sans level.05 ni level.08, qui n’existent pas), miscellaneous (brute-forcer /flag octet par octet en scriptant les redémarrages). Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModKA = "";
    DOJO_KA_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModKA){ if(lastModKA) html += '</div>'; lastModKA = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModKA) html += '</div>';
    html += '<div class="card"><h3>20 défis lus, 20 annoncés — et des limites nettes</h3><p>Le compte est exact : trois modules, reverse (9 défis), kernel (10 défis), miscellaneous (1 défi), aucun verrouillé, aucun illisible. Les limites, en clair : aucun module n’a de ressource de cours — ni vidéo, ni diapositives, ni texte au-delà d’un en-tête « Challenges » — et les descriptions des défis tiennent en une à trois phrases d’ambiance, sans consigne technique détaillée — les leçons enseignent les concepts (reverse engineering, GDB, brute force par script, modules noyau, sys_call_table, KASLR, hotpatching) sans inventer ni consigne, ni solution, ni flag ; la numérotation du module kernel saute level.05 et level.08, qui n’existent pas sur le site : ils ne sont ni inventés, ni comblés, les leçons suivent la numérotation réelle ; Idan23 est un langage interprété fictif, inventé par l’auteur pour ce dojo, et il est présenté comme tel. Le dojo recoupe thématiquement Intro to Reverse Engineering & Binary Exploitation et Program Security (reverse, Yan85), System Security et Kernel Exercise Collection (noyau, KASLR) — défis différents partout, aucun doublon exact, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoKACount()>=DOJO_KA_LESSONS.length){
      html += '<div class="card"><h3>Kalevala terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap39">Voir la carte des dojos</button><button class="btn big" id="djToPtw" style="margin-top:8px">Entrer dans PwnTeras</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm62 = $("djToMap39"); if(tm62) tm62.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm63 = $("djToPtw"); if(tm63) tm63.addEventListener("click", function(){ dojoScreen="pwnteras"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran PwnTeras : liste des leçons ---- */
  if(dojoScreen==="pwnteras"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">PwnTeras</div></div>';
    html += '<div class="stepct">Dojo communautaire · Escape room d’initiation, en espagnol · Stéganographie de base et codecs classiques · Trente et unième dojo communautaire jouable · '+dojoPTWCount()+' / '+DOJO_PTW_LESSONS.length+' leçons terminées · Sur le site : 1 module · 9 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoPTWCount()/DOJO_PTW_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Un cours accéléré en format escape room, entièrement en espagnol — les leçons ici sont en français : d’abord « Algo de stegno », fouiller un fichier avec strings, file et exiftool ; puis « Nuestra herramienta magica, codecs.py », six codecs classiques — César, rev, ROT13, hex, Base64, XOR — manipulés avec l’outil maison du site, /challenge/codecs.py. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPTW = "";
    DOJO_PTW_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPTW){ if(lastModPTW) html += '</div>'; lastModPTW = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPTW) html += '</div>';
    html += '<div class="card"><h3>9 défis lus, 9 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, Escape Room Crash Course, neuf défis, aucun verrouillé, aucun illisible. Les limites, en clair : le dojo est entièrement en espagnol — c’est le seul rencontré dans cette langue — et ces leçons sont des adaptations françaises des concepts, pas des traductions mot à mot ; le module n’a aucune ressource de cours — ses deux seules ressources sont des en-têtes au contenu vide (« Algo de stegno » et « Nuestra herramienta magica, codecs.py ») et la description du module est vide ; le contenu exact de l’outil codecs.py n’est pas lisible en texte — il est fourni dans l’espace de travail des défis — donc les leçons enseignent les concepts et les commandes telles que le site les décrit, sans reproduire le code source de l’outil, et sans inventer ni consigne, ni solution, ni flag ; les exemples du site (686f6c61 pour « hola », dGV4dG8= en Base64) sont des exemples pédagogiques, pas des flags. Le dojo recoupe thématiquement Intro to Forensics (file, strings, exiftool) et Cryptographic Exploitation (César, ROT13, hex, Base64, XOR) — défis différents, en format escape room et via codecs.py : aucun doublon exact, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPTWCount()>=DOJO_PTW_LESSONS.length){
      html += '<div class="card"><h3>PwnTeras terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap40">Voir la carte des dojos</button><button class="btn big" id="djToThaw" style="margin-top:8px">Entrer dans The House Always Wins</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm64 = $("djToMap40"); if(tm64) tm64.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm65 = $("djToThaw"); if(tm65) tm65.addEventListener("click", function(){ dojoScreen="housewins"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran The House Always Wins : liste des leçons ---- */
  if(dojoScreen==="housewins"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">The House Always Wins</div></div>';
    html += '<div class="stepct">Dojo communautaire · PRNG et prédiction d’état · Pile ou face contre les générateurs · Trente-deuxième dojo communautaire jouable · '+dojoTHAWCount()+' / '+DOJO_THAW_LESSONS.length+' leçons terminées · Sur le site : 1 module · 9 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoTHAWCount()/DOJO_THAW_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo des générateurs pseudo-aléatoires, par CyanBun96 : un pile ou face où il faut enchaîner les victoires — 10 pour le tutoriel, 777 ensuite — en prédisant le générateur plutôt qu’en espérant le hasard. Graines fixe et prévisible, LFSR de 7 puis 31 bits, le vrai rand() de la glibc, Mersenne Twister et son untempering, jusqu’à xoroshiro128+ et ses limites. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModTHAW = "";
    DOJO_THAW_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModTHAW){ if(lastModTHAW) html += '</div>'; lastModTHAW = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModTHAW) html += '</div>';
    html += '<div class="card"><h3>9 défis lus, 9 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, Main, neuf défis, aucun verrouillé, aucun illisible. Les limites, en clair : les descriptions des défis sur le site sont chiffrées en base64 (« encrypted hints ») — elles ont été décodées pour préparer ces leçons, qui enseignent les concepts sans les recopier mot pour mot, et sans inventer ni consigne, ni solution, ni flag ; la chaîne hexadécimale de contrôle présente dans la note finale du niveau 7 n’est pas reproduite ; le module n’a aucune ressource de cours — ni vidéo, ni diapositives ; les statistiques du site (joueurs, résolutions) n’étaient pas lisibles et ne sont pas affirmées. Thème inédit dans le parcours : aucun doublon exact ; recoupements thématiques seulement avec Cryptographic Exploitation (l’aléatoire) et les dojos de reverse engineering — défis différents, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoTHAWCount()>=DOJO_THAW_LESSONS.length){
      html += '<div class="card"><h3>The House Always Wins terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap41">Voir la carte des dojos</button><button class="btn big" id="djToTyler" style="margin-top:8px">Entrer dans Tyler’s Terrific Trials</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm66 = $("djToMap41"); if(tm66) tm66.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm67 = $("djToTyler"); if(tm67) tm67.addEventListener("click", function(){ dojoScreen="tylertrials"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Tyler's Terrific Trials : liste des leçons ---- */
  if(dojoScreen==="tylertrials"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Tyler’s Terrific Trials</div></div>';
    html += '<div class="stepct">Dojo communautaire · Démonstration de résolution · Module 3 du cours CSE365 · Trente-troisième dojo communautaire jouable · '+dojoTTTCount()+' / '+DOJO_TTT_LESSONS.length+' leçons terminées · Sur le site : 3 modules · 4 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoTTTCount()/DOJO_TTT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le « demo solve dojo » de Tyler pour le module 3 de CSE365 : suivre la vidéo « Demo Solve », puis refaire la résolution soi-même. Quatre défis en trois modules — Zero Wing (traversée de chemin, SQLi, XSS), Character Cryptography (la cryptographie par caractères), et le chiffre par décalage à inverser en Python puis en C. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModTTT = "";
    DOJO_TTT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModTTT){ if(lastModTTT) html += '</div>'; lastModTTT = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModTTT) html += '</div>';
    html += '<div class="card"><h3>4 défis lus, 4 annoncés — et des limites nettes</h3><p>Le compte est exact : 3 modules, 4 défis, aucun verrouillé. La limite majeure, en clair : les descriptions des 4 défis sont absentes — nulles — sur le site comme dans son API publique, et la page individuelle d’un défi redirige vers la page du module ; il n’existe donc aucune consigne écrite pour aucun défi. Ces leçons sont construites à partir des titres des défis et des descriptions des modules seulement, et enseignent les concepts sans inventer ni consigne, ni solution, ni flag. La seule ressource de cours du dojo est la vidéo « Demo Solve » du module Path Traversal + SQLi + XSS : non transcrite, elle n’est pas incluse dans ce jeu — sur le site, c’est elle qui montre les résolutions. Le nombre de résolutions (solves) n’était pas lisible et n’est pas affirmé. Aucun doublon exact avec les dojos déjà présents ; recoupements thématiques seulement avec Web Security (traversée de chemin, SQLi, XSS), Cryptographic Exploitation (chiffres par décalage) et Intro to Reverse Engineering & Binary Exploitation — défis différents, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoTTTCount()>=DOJO_TTT_LESSONS.length){
      html += '<div class="card"><h3>Tyler’s Terrific Trials terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap42">Voir la carte des dojos</button><button class="btn big" id="djToWest" style="margin-top:8px">Entrer dans Westworld</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm68 = $("djToMap42"); if(tm68) tm68.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm69 = $("djToWest"); if(tm69) tm69.addEventListener("click", function(){ dojoScreen="westworld"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Westworld : liste des leçons ---- */
  if(dojoScreen==="westworld"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Westworld</div></div>';
    html += '<div class="stepct">Dojo communautaire · Suite de babyfmt · Chaînes de format · Trente-quatrième dojo communautaire jouable · '+dojoWWCount()+' / '+DOJO_WW_LESSONS.length+' leçons terminées · Sur le site : 1 module · 2 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoWWCount()/DOJO_WW_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo de kylebot, un bot de Shellphish : deux défis qui prolongent le module babyfmt de Program Security — Bossfmt, le boss retiré qui explique pourquoi le niveau 12 interdit le $, et BossfmtRevenge, sa version durcie contre la solution non prévue. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModWW = "";
    DOJO_WW_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModWW){ if(lastModWW) html += '</div>'; lastModWW = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModWW) html += '</div>';
    html += '<div class="card"><h3>2 défis lus, 2 annoncés — et des limites nettes</h3><p>Le compte est exact : un module, 01 Westworld, deux défis — Bossfmt et BossfmtRevenge — tous deux obligatoires, aucun verrouillé, aucun illisible. Les limites, en clair : chaque défi n’a qu’une phrase de description sur le site, une phrase d’ambiance sans aucune consigne technique, et le dojo n’a aucune ressource de cours — ni vidéo, ni diapositives. Ces leçons enseignent donc les concepts — chaîne de format et spécificateurs de printf, rôle du $ dans les spécificateurs positionnels, solutions prévues et non prévues, durcissement d’un défi — sans inventer ni consigne, ni solution, ni flag. Le nombre de résolutions (solves) n’était pas lisible et n’est pas affirmé. Lien direct avec Program Security : les deux défis sont la suite du module babyfmt, déjà jouable dans le jeu — ils forment ici un dojo à part, sans fusion ni double comptage ; recoupements thématiques seulement avec Cryptographic Exploitation et Intro to RE & Binary Exploitation. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoWWCount()>=DOJO_WW_LESSONS.length){
      html += '<div class="card"><h3>Westworld terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap43">Voir la carte des dojos</button><button class="btn big" id="djToPancake" style="margin-top:8px">Entrer dans Pancake House</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm70 = $("djToMap43"); if(tm70) tm70.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm71 = $("djToPancake"); if(tm71) tm71.addEventListener("click", function(){ dojoScreen="pancakehouse"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Pancake House : liste des leçons ---- */
  if(dojoScreen==="pancakehouse"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Pancake House</div></div>';
    html += '<div class="stepct">Dojo communautaire · Le plus petit du parcours · PIN d’administrateur et flag caché · Trente-cinquième dojo communautaire jouable · '+dojoPHCount()+' / '+DOJO_PH_LESSONS.length+' leçons terminées · Sur le site : 1 module · 1 challenge</div><div class="progressline"><i style="width:'+Math.round(100*dojoPHCount()/DOJO_PH_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Un dojo minimal : sa présentation tient en une phrase — « A collection of challenges » —, son unique module Cheese n’a aucune description, et son unique défi, Return of the Admin Pin, demande de trouver le flag caché sur un serveur. Les leçons enseignent les concepts — PIN d’administrateur, énumération et découverte — depuis le titre et cette phrase seulement. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModPH = "";
    DOJO_PH_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModPH){ if(lastModPH) html += '</div>'; lastModPH = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModPH) html += '</div>';
    html += '<div class="card"><h3>1 défi lu, 1 annoncé — et des limites nettes</h3><p>Le compte est exact : un module, Cheese, un défi — Return of the Admin Pin — obligatoire, aucun verrouillé, aucun illisible. Les limites, en clair : la présentation du dojo tient en une phrase (« A collection of challenges »), la description du module est nulle, celle du défi tient en une phrase — « Can you find the flag hidden on my server? » — et le dojo n’a aucune ressource de cours : ni vidéo, ni diapositives, ni texte. Ces leçons sont donc construites à partir du titre du défi et de sa phrase seulement, et enseignent les concepts — authentification par PIN, flag caché sur un serveur, énumération et découverte — sans inventer ni consigne, ni mécanique, ni type de serveur, ni solution, ni flag. Le titre dit « Return of », ce qui suggère une suite, mais aucun défi antérieur n’est référencé sur la page : ce n’est pas affirmé ici. Le nombre de résolutions (solves) n’était pas lisible et n’est pas affirmé. Aucun doublon exact ; recoupement thématique seulement avec Web Security (un serveur, un flag caché) — défi différent, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoPHCount()>=DOJO_PH_LESSONS.length){
      html += '<div class="card"><h3>Pancake House terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap44">Voir la carte des dojos</button><button class="btn big" id="djToImattas" style="margin-top:8px">Entrer dans imattas dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm72 = $("djToMap44"); if(tm72) tm72.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm73 = $("djToImattas"); if(tm73) tm73.addEventListener("click", function(){ dojoScreen="imattasdojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran imattas dojo : liste des leçons ---- */
  if(dojoScreen==="imattasdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">imattas dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Minimal · Crackme et exploitation binaire · Trente-sixième dojo communautaire jouable · '+dojoIMCount()+' / '+DOJO_IM_LESSONS.length+' leçons terminées · Sur le site : 1 module · 1 challenge</div><div class="progressline"><i style="width:'+Math.round(100*dojoIMCount()/DOJO_IM_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Un dojo minimal et presque désert — 1 solve au total sur le site. Son unique module, « PWN and Binary Explotiation » (faute du site conservée), n’a aucune description, et son unique défi, crackme, n’en a pas non plus : les leçons enseignent les concepts généraux du crackme et du PWN depuis le titre et le nom du module seulement. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModIM = "";
    DOJO_IM_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModIM){ if(lastModIM) html += '</div>'; lastModIM = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModIM) html += '</div>';
    html += '<div class="card"><h3>1 défi lu, 1 annoncé — et des limites nettes</h3><p>Le compte est exact : un module, « PWN and Binary Explotiation » — le nom du site, avec sa faute : il manque le « i » de Exploitation —, un défi, crackme, obligatoire, aucun verrouillé, aucun illisible. Les limites, en clair : le dojo n’a aucun texte de présentation, la description du module est nulle, celle du défi est vide — aucune consigne, aucun détail technique — et il n’y a aucune ressource de cours : ni vidéo, ni diapositives, ni texte. Ces leçons sont donc construites à partir du titre du défi et du nom du module seulement, et enseignent les concepts généraux — ce qu’est un crackme et sa condition de validation cachée, les outils de base de l’analyse d’un binaire (file, strings, désassembleur, débogueur), ce qu’est le PWN et l’exploitation binaire — sans inventer ni consigne, ni mécanique précise, ni solution, ni flag. Fréquentation relevée sur le site : 1 solve au total, 1 hacker unique, 0 en train de hacker. Aucun doublon exact ; recoupements thématiques seulement avec Intro to Reverse Engineering & Binary Exploitation, Program Security et Software Exploitation — défi différent, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoIMCount()>=DOJO_IM_LESSONS.length){
      html += '<div class="card"><h3>imattas dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap45">Voir la carte des dojos</button><button class="btn big" id="djToAmnesia" style="margin-top:8px">Entrer dans Amnesia’s Dojo</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm74 = $("djToMap45"); if(tm74) tm74.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm75 = $("djToAmnesia"); if(tm75) tm75.addEventListener("click", function(){ dojoScreen="amnesiadojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Amnesia's Dojo : liste des leçons ---- */
  if(dojoScreen==="amnesiadojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Amnesia’s Dojo</div></div>';
    html += '<div class="stepct">Dojo communautaire · Live uniquement · Memory Grid et prédiction de PRNG · Trente-septième dojo communautaire jouable · '+dojoAMCount()+' / '+DOJO_AM_LESSONS.length+' leçons terminées · Sur le site : 2 modules · 3 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoAMCount()/DOJO_AM_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo de Amnesia, membre de l’équipe Shellphish, écrit pour le cours CSE 365 — et un dojo live uniquement : il n’existe que sur le site public de pwn.college, absent de staging. Son module Welcome installe la Memory Grid, une grille interactive de 50×50 : un tribut de 5 pièces à ramasser, 10 anomalies létales à éviter, et un Oracle dont il faut prédire le nombre en déduisant l’état interne de son PRNG, code source à l’appui. La grille elle-même n’est pas rejouable ici : concepts et démarche seulement, c’est dit en clair. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModAM = "";
    DOJO_AM_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModAM){ if(lastModAM) html += '</div>'; lastModAM = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModAM) html += '</div>';
    html += '<div class="card"><h3>Vault Runner · Vault Runner II: Lockdown — alias System Security</h3><p>Les deux défis du module 365 Demo sont des doublons exacts des deux derniers défis du module Advanced de System Security, déjà jouables dans ce jeu : ils ne sont ni reconstruits ni comptés ici, et leurs leçons sont celles de System Security. La leçon AM-04 explique l’alias en détail.</p><button class="btn primary big" id="djAmnToSS">Ouvrir System Security</button></div>';
    html += '<div class="card"><h3>3 défis lus, 3 annoncés — 1 nouveau, 2 en alias, et des limites nettes</h3><p>Le compte est exact : 2 modules — Welcome (1 défi) et 365 Demo (2 défis) —, 3 défis, tous obligatoires, aucun verrouillé, aucun illisible. Un seul défi nouveau : Amnesia’s Oracle. Vault Runner et Vault Runner II: Lockdown sont des doublons exacts de System Security : alias, aucun double comptage. Les limites, en clair : le dojo est live uniquement, absent de l’environnement de staging ; il n’a aucune ressource de cours — ni vidéo, ni diapositives, ni texte, seulement des en-têtes « Challenges » vides ; la grille interactive de la Memory Grid n’est pas rejouable dans Nexus Guardian — les leçons enseignent la carte, les déplacements, la collecte et le danger comme concepts et comme démarche, sans reproduire la grille ; le code source de l’Oracle n’est ni reproduit ni révélé, et la mécanique exacte du tirage n’est pas décrite sur le site — les leçons enseignent le PRNG, la prédiction d’état et l’analyse de code source, sans inventer ni mécanique, ni solution, ni flag. Fréquentation relevée sur le site : 9 solves au total, 3 hackers uniques. Recoupement thématique avec The House Always Wins (PRNG, prédiction d’état) — défis différents, aucun doublon. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoAMCount()>=DOJO_AM_LESSONS.length){
      html += '<div class="card"><h3>Amnesia’s Dojo terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap46">Voir la carte des dojos</button><button class="btn big" id="djToDefcon" style="margin-top:8px">Entrer dans Defcon 33</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm76 = $("djAmnToSS"); if(tm76) tm76.addEventListener("click", function(){ dojoScreen="syssec"; renderDojo(); window.scrollTo(0,0); });
    var tm77 = $("djToMap46"); if(tm77) tm77.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm78 = $("djToDefcon"); if(tm78) tm78.addEventListener("click", function(){ dojoScreen="defcon33"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran Defcon 33 : liste des leçons ---- */
  if(dojoScreen==="defcon33"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">Defcon 33</div></div>';
    html += '<div class="stepct">Dojo communautaire · DEF CON 33 · Spectre/Meltdown, TOCTOU et bases du terminal · Trente-huitième dojo communautaire jouable · '+dojoDCCount()+' / '+DOJO_DC_LESSONS.length+' leçons terminées · Sur le site : 4 modules · 7 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDCCount()/DOJO_DC_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo de la Defcon Academy, conçu pour la DEF CON 33 — la conférence de hackers de Las Vegas : « Pas besoin de permission pour devenir hacker, juste un endroit pour commencer. » Deux sessions riches ouvrent le dojo — Race Against the Machine (exécution spéculative, Spectre et Meltdown, mémoire privilégiée qui fuite) et Deceit by Design (race conditions et TOCTOU, l’écart entre contrôle et usage gagné à la microseconde) — puis Linux Legion aligne 4 exercices de terminal, et Byte-Sized-Basics ferme avec un défi de flag lancé au débogueur GDB, via auto_gdb. Les descriptions des défis tiennent en une phrase d’ambiance sur le site : les leçons enseignent les concepts, sans inventer ni consigne, ni solution, ni flag — et la faute du site, « cybesecurity », est conservée telle quelle. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModDC = "";
    DOJO_DC_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModDC){ if(lastModDC) html += '</div>'; lastModDC = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModDC) html += '</div>';
    html += '<div class="card"><h3>7 défis lus, 7 annoncés — et des limites nettes</h3><p>Le compte est exact : 4 modules — 01 Race Against the Machine (Banana), 02 Deceit by Design (Earth), 03 Linux Legion (Terminal Basics, Managing Files, Networking, Exporting Is Fun), 04 Byte-Sized-Basics (Byte-Sized-Basics) —, 7 défis, tous obligatoires, aucun verrouillé, aucun illisible. Les limites, en clair : les descriptions des défis sont réduites à une phrase chacune — « This is banana. », « This is earth. », « type `start` and press enter », « managing files is important », « there is something suspicious », « make sure the export works » — sans aucune consigne technique, à l’exception de la commande du défi Byte-Sized-Basics (« ./challenge/auto_gdb ./challenge/challenge », fichiers squelettes dans /tmp/challenge) ; les modules 01 et 02 se présentent comme des talks avec démonstrations en direct, mais aucune vidéo n’est liée sur le site ; le dojo n’a aucune ressource de cours — ni vidéo, ni diapositives, ni texte, seulement des en-têtes « Challenges » vides ; le nombre de solves n’était pas lisible et n’est pas affirmé. Ces leçons sont donc construites depuis les descriptions des modules — riches pour les modules 01 et 02 : exécution spéculative et hors-ordre, Spectre, Meltdown, lecture de mémoire privilégiée, contournement d’isolation, fuite de secrets ; race conditions, TOCTOU, détection et exploitation, timing à la microseconde — et depuis les titres et phrases des défis, sans inventer ni consigne, ni solution, ni flag. Aucun doublon exact ; recoupements thématiques seulement avec Start Here et Linux Luminarium (bases Linux), System Security et Kernel Exercise Collection (Spectre, Meltdown, canaux auxiliaires) et Program Security (TOCTOU, race conditions) — défis différents, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDCCount()>=DOJO_DC_LESSONS.length){
      html += '<div class="card"><h3>Defcon 33 terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap47">Voir la carte des dojos</button><button class="btn big" id="djToDistrict" style="margin-top:8px">Entrer dans DistrictCon</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm79 = $("djToMap47"); if(tm79) tm79.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm80 = $("djToDistrict"); if(tm80) tm80.addEventListener("click", function(){ dojoScreen="districtcon"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran DistrictCon : liste des leçons ---- */
  if(dojoScreen==="districtcon"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">DistrictCon</div></div>';
    html += '<div class="stepct">Dojo communautaire · DistrictCon · Corruption mémoire sous DOS et sanitizer de script shell · Trente-neuvième dojo communautaire jouable · '+dojoDTCount()+' / '+DOJO_DT_LESSONS.length+' leçons terminées · Sur le site : 1 module · 2 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoDTCount()/DOJO_DT_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">Le dojo du village pwn.college, préparé pour le DistrictCon de Washington D.C. : les défis level3 et level4 de la conférence, dans un seul module, 2025. Level3 ramène la corruption mémoire à son état d’origine — un programme vulnérable sous DOS, sans aucune mitigation, parce que les protections modernes n’existaient pas à l’époque : VM lancée par /challenge/launch, mode privilégié pour éditer VULN.C et AUTOEXEC.BAT, flag dans C:\\FLAG.TXT. Level4 oppose un script shell au « sanitizer ultime » de /challenge/run, à contourner. La VM DOS n’est pas jouable ici : concepts et démarche seulement, c’est dit en clair. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModDT = "";
    DOJO_DT_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModDT){ if(lastModDT) html += '</div>'; lastModDT = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : "Module · ")+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModDT) html += '</div>';
    html += '<div class="card"><h3>Les renvois du site : DOS Dojo et The Art of the Shell</h3><p>Le dojo renvoie lui-même vers deux dojos déjà jouables dans ce jeu : « NEW TO DOS? Check out The DOS Dojo » pour les débutants sous DOS — le terrain d’entraînement de Level3 — et « WANT MORE? Check out The Art of the Shell » pour prouver sa maîtrise du shell — celle que Level4 suppose. Recoupements thématiques seulement : les défis de DistrictCon sont différents, aucun doublon, aucun double comptage.</p><div class="row" style="gap:9px"><button class="btn primary" style="flex:1" id="djDtToDos">Ouvrir le DOS Dojo</button><button class="btn primary" style="flex:1" id="djDtToShell">Ouvrir The Art of the Shell</button></div></div>';
    html += '<div class="card"><h3>2 défis lus, 2 annoncés — et des limites nettes</h3><p>Le compte est exact : 1 module — 2025 (Level3, Level4) —, 2 défis, tous deux obligatoires, aucun verrouillé, aucun illisible. Les limites, en clair : la VM DOS de Level3 n’est pas jouable dans Nexus Guardian — ni la VM lancée par /challenge/launch, ni le programme LEVEL3 ; son code source VULN.C n’est pas lisible en texte sur le site et n’est ni reproduit ni décrit ici — les leçons enseignent la corruption mémoire sans mitigations et la démarche complète donnée par le site (mode privilégié, édition de /challenge/c_files, lecteur D: synchronisé, flag dans C:\\FLAG.TXT) ; le sanitizer de Level4 n’a que deux phrases sur le site — il se trouve dans /challenge/run, peux-tu le contourner ? — et son fonctionnement exact comme son contournement ne sont décrits nulle part : les leçons enseignent le concept du filtre à contourner, sans inventer ni consigne, ni mécanique, ni solution, ni flag ; le dojo n’a aucune ressource de cours — ni vidéo, ni diapositives, ni texte, seulement un en-tête « Challenges » vide ; le nombre de solves n’était pas lisible (« — solves », sans chiffre) et n’est pas affirmé. Aucun doublon exact ; recoupements thématiques seulement avec le DOS Dojo (Level3) et The Art of the Shell (Level4) — défis différents, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoDTCount()>=DOJO_DT_LESSONS.length){
      html += '<div class="card"><h3>DistrictCon terminé</h3><p>Dojo terminé — bravo. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap48">Voir la carte des dojos</button><button class="btn big" id="djToArchives" style="margin-top:8px">Entrer dans pwn.college Archives</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm81 = $("djDtToDos"); if(tm81) tm81.addEventListener("click", function(){ dojoScreen="dosdojo"; renderDojo(); window.scrollTo(0,0); });
    var tm82 = $("djDtToShell"); if(tm82) tm82.addEventListener("click", function(){ dojoScreen="shellart"; renderDojo(); window.scrollTo(0,0); });
    var tm83 = $("djToMap48"); if(tm83) tm83.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    var tm84 = $("djToArchives"); if(tm84) tm84.addEventListener("click", function(){ dojoScreen="archivesdojo"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran pwn.college Archives : liste des leçons ---- */
  if(dojoScreen==="archivesdojo"){
    html += '<div class="ghead"><button class="quit" id="djBack" aria-label="Retour">‹</button><div class="ttl">pwn.college Archives</div></div>';
    html += '<div class="stepct">Dojo communautaire · Archives · Versions anciennes du cursus, automne 2022 → automne 2025 · Quarantième dojo communautaire jouable — le dernier de la liste · '+dojoARCount()+' / '+DOJO_AR_LESSONS.length+' leçons terminées · Sur le site : 9 modules · 232 challenges</div><div class="progressline"><i style="width:'+Math.round(100*dojoARCount()/DOJO_AR_LESSONS.length)+'%"></i></div>';
    html += '<p class="sub">« Where all of the lost and forgotten challenges go » — là où vont les défis perdus et oubliés. Ce dojo est le grenier de pwn.college : les anciennes versions du cursus, archivées au lieu d’être jetées. Program Interaction y aligne 139 niveaux sans une seule description ; Assembly Crash Course, au contraire, y conserve le cours d’assembleur le plus détaillé du parcours, 30 défis entièrement décrits. Entre les deux : du HTTP parlé à la main, du shellcode sous contraintes, des clés de licence tordues, un triple déréférencement, et de l’exploitation avancée de 2022. Forts recoupements avec les dojos actuels — ce sont leurs ancêtres — mais aucun doublon exact : rien n’est fusionné, rien n’est compté deux fois. Lecture courte, exercice, debrief — 20 XP SOC et 10 crédits par exercice réussi.</p>';
    var lastModAR = "";
    DOJO_AR_LESSONS.forEach(function(l, i){
      if(l.mod !== lastModAR){ if(lastModAR) html += '</div>'; lastModAR = l.mod; html += '<h2>'+((l.mod==="Présentation") ? "Concepts · " : (l.mod==="Bilan" ? "" : "Module · "))+esc(l.mod)+'</h2><div class="ljgrid">'; }
      html += dojoLessonTile(l, i);
    });
    if(lastModAR) html += '</div>';
    html += '<div class="card"><h3>232 défis lus, 232 annoncés — et des limites nettes</h3><p>Le compte est exact : 9 modules — Program Interaction (139), Talking Web (16), Program Security Challenges (5), Reverse Engineering Challenges (14), Computing 101 (1), Web Security (1), Memory Errors (2), Advanced Exploitation (24), Assembly Crash Course (30) —, 232 défis, tous obligatoires, aucun verrouillé, aucun illisible. Les limites, en clair : 180 défis n’ont aucune description sur le site (Program Interaction 139, Talking Web 16, Web Security 1, Advanced Exploitation 24) — leurs leçons sont construites depuis les titres et les descriptions de modules, sans inventer ni consigne, ni solution, ni flag ; les niveaux 69, 75 et 81 de Program Interaction et le niveau 9 d’Advanced Exploitation sont absents du site, retirés, et ne sont ni inventés ni comblés ; les 18 vidéos de cours (Program Interaction 4, Advanced Exploitation 6, Assembly Crash Course 8) et leurs diapositives ne sont pas transcrites ; le schéma de Triple Dereference est reformulé, pas reproduit. Les 52 défis avec description permettent, eux, des leçons précises — surtout Assembly Crash Course, le module le plus riche du dojo. Statistiques du site au 18 novembre 2026 : 835 889 solves, 25 064 hackers uniques. Dépôt source public : github.com/pwncollege/archive-dojo. Aucun doublon exact ; forts recoupements thématiques avec Playing With Programs, Web Security, Program Security, Computing 101, System Security, Kernel Exercise Collection et Intro to Programming Languages — versions anciennes présentées comme telles, aucun double comptage. Détails complets : Menu → Fonctionnement du jeu.</p></div>';
    if(dojoARCount()>=DOJO_AR_LESSONS.length){
      html += '<div class="card"><h3>pwn.college Archives terminé</h3><p>Dojo terminé — bravo. C’était le dernier dojo de la liste : le parcours pwn.college adapté dans ce jeu est complet. Détails complets : Menu → Fonctionnement du jeu.</p><button class="btn primary big" id="djToMap49">Voir la carte des dojos</button></div>';
    }
    root.innerHTML = html;
    $("djBack").addEventListener("click", function(){ dojoScreen="map"; renderDojo(); });
    root.querySelectorAll("[data-djlesson]").forEach(function(b){
      b.addEventListener("click", function(){ dojoLessonId = b.getAttribute("data-djlesson"); dojoAnswer = null; dojoOrder = []; dojoOrderDone = false; dojoScreen = "lesson"; sndTap(); renderDojo(); window.scrollTo(0,0); });
    });
    var tm85 = $("djToMap49"); if(tm85) tm85.addEventListener("click", function(){ dojoScreen="map"; renderDojo(); window.scrollTo(0,0); });
    return;
  }
  /* ---- écran carte ---- */
  dojoMapReg = [];
  html += '<h1>Le Dojo</h1>';
  html += '<p class="sub">Parcours pwn.college adapté en français. Présentation du parcours et parcours conseillé : Menu → Fonctionnement du jeu.</p>';
  html += '<div class="djgrid">'
    + dojoPlayTile("djStart", "Start Here", "2 modules · 10 challenges", dojoDoneCount(), DOJO_LESSONS.length, "Premier dojo")
    + dojoPlayTile("djLum", "Linux Luminarium", "17 modules · 128 challenges", dojoLLCount(), DOJO_LL_LESSONS.length, "Récompense : Pingouin blanc")
    + dojoPlayTile("djPwp", "Playing With Programs", "4 modules · 116 challenges", dojoPWPCount(), DOJO_PWP_LESSONS.length, "")
    + dojoPlayTile("djC101", "Computing 101", "13 modules · 132 challenges", dojoC101Count(), DOJO_C101_LESSONS.length, "")
    + dojoPlayTile("djIcs", "Intro to Cybersecurity", "7 modules · 183 challenges", dojoICSCount(), DOJO_ICS_LESSONS.length, "Ceinture orange")
    + dojoPlayTile("djWs", "Web Security", "6 modules · 57 défis", dojoWSCount(), DOJO_WS_LESSONS.length, "« The Art of Web » · Communautaire")
    + dojoPlayTile("djCrypto", "Cryptographic Exploitation", "10 modules · 49 défis", dojoCECount(), DOJO_CE_LESSONS.length, "Communautaire · Open source")
    + dojoPlayTile("djIre", "Intro to Reverse Engineering & Binary Exploitation", "8 modules · 33 challenges", dojoIRECount(), DOJO_IRE_LESSONS.length, "Communautaire · Pour débutants")
    + dojoPlayTile("djPs", "Program Security", "5 modules · 159 challenges", dojoPSCount(), DOJO_PS_LESSONS.length, "Ceinture jaune")
    + dojoPlayTile("djSs", "System Security", "6 modules · 93 challenges", dojoSSCount(), DOJO_SS_LESSONS.length, "Ceinture verte")
    + dojoPlayTile("djSe", "Software Exploitation", "5 modules · 90 challenges", dojoSECount(), DOJO_SE_LESSONS.length, "Ceinture bleue")
    + dojoPlayTile("djDsu", "DSU Cyber Camps", "8 modules · 104 défis", dojoDSUCount(), DOJO_DSU_LESSONS.length, "Communautaire · Dakota State University · Initiation")
    + dojoPlayTile("djPe", "Privilege Escalation", "4 modules · 557 défis", dojoPECount(), DOJO_PE_LESSONS.length, "Communautaire · En développement sur le site")
    + dojoPlayTile("djIpl", "Intro to Programming Languages", "25 modules · 252 défis", dojoIPLCount(), DOJO_IPL_LESSONS.length, "Communautaire · Cours CSE240")
    + dojoPlayTile("djShell", "The Art of the Shell", "5 modules · 55 challenges", dojoAOSCount(), DOJO_AOS_LESSONS.length, "Communautaire · Open source · La sécurité du shell")
    + dojoPlayTile("djFluffy", "Fluffy’s Adventure", "8 modules · 28 challenges", dojoFLCount(), DOJO_FL_LESSONS.length, "Communautaire · Narratif")
    + dojoPlayTile("djCi", "Content Injection", "5 modules · 10 challenges", dojoCICount(), DOJO_CI_LESSONS.length, "Communautaire · Open source")
    + dojoPlayTile("djPw", "Pwndamentals", "7 modules · 38 challenges", dojoPWCount(), DOJO_PW_LESSONS.length, "Communautaire · Révision")
    + dojoPlayTile("djWw", "Windows Warzone", "2 modules · 17 challenges", dojoPWWinCount(), dojoPWWinLessons().length, "Alias de Pwndamentals")
    + dojoPlayTile("djPt", "Pwntools Tutorials", "1 module · 12 challenges", dojoPTCount(), DOJO_PT_LESSONS.length, "Communautaire · Open source")
    + dojoPlayTile("djQq", "The Quarterly Quiz", "2 modules · 13 challenges", dojoQQCount(), DOJO_QQ_LESSONS.length, "Communautaire · Expert")
    + dojoPlayTile("djDcs", "Desert CodeSprouts", "3 modules · 7 challenges", dojoDCSCount(), DOJO_DCS_LESSONS.length, "Communautaire · Sans prérequis")
    + dojoPlayTile("djXnu", "XNU Dojo", "6 modules · 61 challenges", dojoXNUCount(), DOJO_XNU_LESSONS.length, "Communautaire · Expert · Noyau XNU")
    + dojoPlayTile("djArmArch", "ARM Architecture", "2 modules · 28 challenges", dojoXNUArmCount(), dojoXNUArmLessons().length, "Alias de XNU Dojo")
    + dojoPlayTile("djArmDojo", "ARM Dojo", "1 module · 15 challenges", dojoXNUIntroCount(), dojoXNUIntroLessons().length, "Alias de XNU Dojo")
    + dojoPlayTile("djFuzz", "Fuzz Dojo", "Leçons de concepts", dojoFZCount(), DOJO_FZ_LESSONS.length, "Communautaire · Leçons de concepts")
    + dojoPlayTile("djAml", "Adversarial ML", "5 modules · 3 challenges", dojoAMLCount(), DOJO_AML_LESSONS.length, "Communautaire · ML adversarial")
    + dojoPlayTile("djHt", "Hanto Dojo", "7 modules · 44 challenges", dojoHTCount(), DOJO_HT_LESSONS.length, "Communautaire · Python, web et IA")
    + dojoPlayTile("djAt", "aturt13 Dojo", "5 modules · 23 challenges", dojoATCount(), DOJO_AT_LESSONS.length, "Communautaire · Expert · Exploitation en aveugle")
    + dojoPlayTile("djIf", "Intro to Forensics", "1 module · 8 challenges", dojoIFCount(), DOJO_IF_LESSONS.length, "Communautaire · Forensique · Sans prérequis")
    + dojoPlayTile("djLo", "Lord of OSINT", "1 module · 12 challenges", dojoLOCount(), DOJO_LO_LESSONS.length, "Communautaire · GeoSINT · OSINT géographique")
    + dojoPlayTile("djHh", "Hacker History", "2 modules · 8 challenges", dojoHHCount(), DOJO_HH_LESSONS.length, "Communautaire · Histoire · BBS et IRC")
    + dojoPlayTile("djDos", "DOS Dojo", "2 modules · 10 challenges", dojoDOSCount(), DOJO_DOS_LESSONS.length, "Communautaire · Rétro · MS-DOS")
    + dojoPlayTile("djLfr", "Linux Firmware Rehosting", "3 modules · 13 challenges", dojoLFRCount(), DOJO_LFR_LESSONS.length, "Communautaire · Rehosting · Firmware IoT")
    + dojoPlayTile("djLun", "Linux Lunacy", "3 modules · 13 challenges", dojoLUNCount(), DOJO_LUN_LESSONS.length, "Communautaire · Cirque · Étrangetés de Linux")
    + dojoPlayTile("djKec", "Kernel Exercise Collection", "1 module · 5 challenges", dojoKECCount(), DOJO_KEC_LESSONS.length, "Communautaire · Expert · Kernel pwn")
    + dojoPlayTile("djKp", "Kitten Playground", "1 module · 1 challenge", dojoKPCount(), DOJO_KP_LESSONS.length, "Communautaire · Matériel · AES sur FPGA")
    + dojoPlayTile("djRii", "RII Router Dojo", "1 module · 2 challenges", dojoRIICount(), DOJO_RII_LESSONS.length, "Communautaire · Émulation · Routeur DIR-868L")
    + dojoPlayTile("djRt", "Red Team Dojo", "1 module · 3 challenges", dojoRTCount(), DOJO_RT_LESSONS.length, "Communautaire · Red team · En construction")
    + dojoPlayTile("djX86", "x86 Exploitation", "1 module · 8 challenges", dojoX86Count(), DOJO_X86_LESSONS.length, "Communautaire · ROP · ELF32")
    + dojoPlayTile("djHn", "Honors Dojo", "3 modules · 17 challenges", dojoHNCount(), DOJO_HN_LESSONS.length, "Communautaire · ASU Honors · Web3 et CI · IRC en alias")
    + dojoPlayTile("djHu", "Hunter Dojo", "1 module · 4 challenges", dojoHUCount(), DOJO_HU_LESSONS.length, "Communautaire · Automatisation · babyauto")
    + dojoPlayTile("djHyd", "Hydra Dojo", "1 module · 8 challenges", dojoHYCount(), DOJO_HY_LESSONS.length, "Communautaire · Baby · Exploitation binaire")
    + dojoPlayTile("djKal", "Kalevala", "3 modules · 20 challenges", dojoKACount(), DOJO_KA_LESSONS.length, "Communautaire · Reverse · Kernel · Finlande")
    + dojoPlayTile("djPtw", "PwnTeras", "1 module · 9 challenges", dojoPTWCount(), DOJO_PTW_LESSONS.length, "Communautaire · Escape room · Espagnol · Codecs")
    + dojoPlayTile("djThaw", "The House Always Wins", "1 module · 9 challenges", dojoTHAWCount(), DOJO_THAW_LESSONS.length, "Communautaire · PRNG · Pile ou face · Prédiction")
    + dojoPlayTile("djTyler", "Tyler’s Terrific Trials", "3 modules · 4 challenges", dojoTTTCount(), DOJO_TTT_LESSONS.length, "Communautaire · Démo CSE365 · Web, crypto, reverse")
    + dojoPlayTile("djWest", "Westworld", "1 module · 2 challenges", dojoWWCount(), DOJO_WW_LESSONS.length, "Communautaire · Suite de babyfmt · Format string")
    + dojoPlayTile("djPancake", "Pancake House", "1 module · 1 challenge", dojoPHCount(), DOJO_PH_LESSONS.length, "Communautaire · Minimal · PIN d’administrateur")
    + dojoPlayTile("djImattas", "imattas dojo", "1 module · 1 challenge", dojoIMCount(), DOJO_IM_LESSONS.length, "Communautaire · Minimal · Crackme · PWN")
    + dojoPlayTile("djAmnesia", "Amnesia’s Dojo", "2 modules · 3 challenges", dojoAMCount(), DOJO_AM_LESSONS.length, "Communautaire · Live uniquement · Memory Grid · PRNG · Vault Runner en alias")
    + dojoPlayTile("djDefcon", "Defcon 33 Defcon Academy Dojo", "4 modules · 7 challenges", dojoDCCount(), DOJO_DC_LESSONS.length, "Communautaire · DEF CON 33 · Spectre · TOCTOU · Terminal")
    + dojoPlayTile("djDistrict", "DistrictCon pwn.college Challenges", "1 module · 2 challenges", dojoDTCount(), DOJO_DT_LESSONS.length, "Communautaire · DistrictCon · DOS sans mitigations · Sanitizer shell")
    + dojoPlayTile("djArchives", "pwn.college Archives", "9 modules · 232 challenges", dojoARCount(), DOJO_AR_LESSONS.length, "Communautaire · Archives · Versions anciennes du cursus · Assembly Crash Course · Dernier dojo")
    + '</div>';
  html += '<h2>Getting Started — les bases</h2><p class="sub">4 dojos · 376 challenges · Tous jouables ci-dessus.</p>';
  html += '<div class="djgrid">';
  DOJO_GS.forEach(function(d){ html += dojoMapCard(d.name, d.mc, d.mods, d.note, d.belt, d.beltTxt); });
  html += '</div>';
  html += '<h2>Parcours principal — les ceintures</h2><p class="sub">4 dojos · 525 challenges · Ceintures : orange, jaune, verte, bleue · Tous jouables ci-dessus.</p>';
  html += '<div class="djgrid">';
  DOJO_CORE.forEach(function(d){ html += dojoMapCard(d.name, d.mc, d.mods, d.note, d.belt, d.beltTxt); });
  html += '</div>';
  root.innerHTML = html;
  $("djStart").addEventListener("click", function(){ dojoScreen="start"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djLum").addEventListener("click", function(){ dojoScreen="lum"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPwp").addEventListener("click", function(){ dojoScreen="pwp"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djC101").addEventListener("click", function(){ dojoScreen="c101"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djIcs").addEventListener("click", function(){ dojoScreen="ics"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djWs").addEventListener("click", function(){ dojoScreen="ws"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djCrypto").addEventListener("click", function(){ dojoScreen="crypto"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djIre").addEventListener("click", function(){ dojoScreen="ire"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPs").addEventListener("click", function(){ dojoScreen="progsec"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djSs").addEventListener("click", function(){ dojoScreen="syssec"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djSe").addEventListener("click", function(){ dojoScreen="softexp"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djDsu").addEventListener("click", function(){ dojoScreen="dsucamp"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPe").addEventListener("click", function(){ dojoScreen="privilege"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djIpl").addEventListener("click", function(){ dojoScreen="proglang"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djShell").addEventListener("click", function(){ dojoScreen="shellart"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djFluffy").addEventListener("click", function(){ dojoScreen="fluffyadv"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djCi").addEventListener("click", function(){ dojoScreen="contentinj"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPw").addEventListener("click", function(){ dojoScreen="pwndamentals"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djWw").addEventListener("click", function(){ dojoScreen="pwndamentals"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPt").addEventListener("click", function(){ dojoScreen="pwntools"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djQq").addEventListener("click", function(){ dojoScreen="quarterly"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djDcs").addEventListener("click", function(){ dojoScreen="codesprouts"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djXnu").addEventListener("click", function(){ dojoScreen="xnudojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djArmArch").addEventListener("click", function(){ dojoScreen="xnudojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djArmDojo").addEventListener("click", function(){ dojoScreen="xnudojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djFuzz").addEventListener("click", function(){ dojoScreen="fuzzdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djAml").addEventListener("click", function(){ dojoScreen="amldojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djHt").addEventListener("click", function(){ dojoScreen="hantodojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djAt").addEventListener("click", function(){ dojoScreen="aturt13"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djIf").addEventListener("click", function(){ dojoScreen="forensics"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djLo").addEventListener("click", function(){ dojoScreen="lordosint"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djHh").addEventListener("click", function(){ dojoScreen="hackerhistory"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djDos").addEventListener("click", function(){ dojoScreen="dosdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djLfr").addEventListener("click", function(){ dojoScreen="firmrehost"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djLun").addEventListener("click", function(){ dojoScreen="lunacy"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djKec").addEventListener("click", function(){ dojoScreen="kernelexercise"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djKp").addEventListener("click", function(){ dojoScreen="kittenplayground"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djRii").addEventListener("click", function(){ dojoScreen="riirouter"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djRt").addEventListener("click", function(){ dojoScreen="redteam"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djX86").addEventListener("click", function(){ dojoScreen="x86exploitation"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djHn").addEventListener("click", function(){ dojoScreen="honorsdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djHu").addEventListener("click", function(){ dojoScreen="hunterdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djHyd").addEventListener("click", function(){ dojoScreen="hydradojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djKal").addEventListener("click", function(){ dojoScreen="kalevala"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPtw").addEventListener("click", function(){ dojoScreen="pwnteras"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djThaw").addEventListener("click", function(){ dojoScreen="housewins"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djTyler").addEventListener("click", function(){ dojoScreen="tylertrials"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djWest").addEventListener("click", function(){ dojoScreen="westworld"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djPancake").addEventListener("click", function(){ dojoScreen="pancakehouse"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djImattas").addEventListener("click", function(){ dojoScreen="imattasdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djAmnesia").addEventListener("click", function(){ dojoScreen="amnesiadojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djDefcon").addEventListener("click", function(){ dojoScreen="defcon33"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djDistrict").addEventListener("click", function(){ dojoScreen="districtcon"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  $("djArchives").addEventListener("click", function(){ dojoScreen="archivesdojo"; sndTap(); renderDojo(); window.scrollTo(0,0); });
  root.querySelectorAll("[data-djmap]").forEach(function(b){ b.addEventListener("click", function(){ sndTap(); dojoMapSheet(+b.getAttribute("data-djmap")); }); });
}