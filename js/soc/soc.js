"use strict";
/* ================= Outils SOC — Splunk, CrowdStrike Falcon, Microsoft Sentinel =================
   Même flux que DevOps (js/devops/devops.js) : carte → liste des leçons →
   leçon (briefing d'Amara + terminal tapé à la main qui débloque l'exercice
   + QCM / remise en ordre avec le pourquoi). +20 XP SOC et +10 crédits à
   100 %. Progression dans S.soc. En démo, les leçons sont verrouillées. */
function socData() {
  return {
    splunk: SOC_SPLUNK,
    falcon: SOC_FALCON,
    sentinel: SOC_SENTINEL
  };
}
function socDone(L) { return !!(S.soc && S.soc.done && S.soc.done[L.id]); }
function socDoneCount(section) {
  var d = socData()[section] || [], n = 0;
  d.forEach(function(L) { if (socDone(L)) n++; });
  return n;
}
function renderSoc() {
  var v = $("view-soc");
  if (!v) return;
  var d = socData();
  if (socScreen === "map") {
    var tiles = SOC_SECTIONS.map(function(sec) {
      var list = d[sec.key] || [], done = socDoneCount(sec.key), total = list.length;
      return '<button class="djtile" onclick="socOpenList(\'' + sec.key + '\')"><span class="djic">' + sec.icon + '</span><b>' + esc(sec.name) + '</b><span class="djsub">' + done + ' / ' + total + ' leçons · terminal</span></button>';
    }).join("");
    v.innerHTML = '<div class="screen"><div class="secttl">Outils SOC <span style="color:var(--muted);font-size:12px">· Splunk, Falcon, Sentinel</span></div>' +
      '<p class="sub">Les outils qui reviennent dans les offres SOC — tu les apprends en tapant les vraies commandes, comme un analyste.</p>' +
      '<div class="djgrid">' + tiles + '</div></div>';
  } else if (socScreen === "list") {
    var sec = SOC_SECTIONS.find(function(s) { return s.key === socSection; });
    var list = d[socSection] || [];
    var rows = list.map(function(L) {
      var done = socDone(L), best = (S.soc && S.soc.best && S.soc.best[L.id]) || 0;
      var tag = done ? '<span class="pillok">Réussie' + (best ? ' · ' + best + '%' : '') + '</span>' : '';
      return '<div class="ljtile" onclick="socOpenLesson(\'' + L.id + '\')"><div class="ljmain"><b>' + esc(L.id) + ' — ' + esc(L.t) + '</b><span class="ljsub">terminal + exercice · +20 XP · +10 crédits</span></div>' + tag + '</div>';
    }).join("");
    v.innerHTML = '<div class="screen"><div class="secttl">' + sec.icon + ' ' + esc(sec.name) + '</div>' +
      '<p class="sub">' + (socSection === "splunk" ? "Requêtes SPL et Enterprise Security : chercher, compter, corréler." : socSection === "falcon" ? "Détections, tri, isolement et Real Time Response sur Falcon." : "Requêtes KQL, incidents et automatisations dans Microsoft Sentinel.") + '</p>' +
      '<button class="btn ghost" onclick="socScreen=\'map\';renderSoc()">← Toutes les sections</button>' +
      '<div class="ljlist">' + rows + '</div></div>';
  } else if (socScreen === "lesson") {
    var L = socData()[socSection].find(function(x) { return x.id === socLessonId; });
    if (!L) { socScreen = "map"; renderSoc(); return; }
    if (isGuest()) {
      socScreen = "map";
      renderSoc();
      demoLockSheet("Outils SOC");
      return;
    }
    var reads = (L.read || []).map(function(p) { return '<p class="lessonread">' + esc(p) + '</p>'; }).join("");
    var exHtml = "";
    if (socAnswer === null) {
      if (L.ex.type === "qcm") {
        exHtml = '<div class="jq">' + esc(L.ex.q) + '</div><div class="jopts">' + L.ex.opts.map(function(o, i) { return '<button class="btn ghost" onclick="socAnswerQcm(' + i + ')">' + esc(o) + '</button>'; }).join("") + '</div>';
      } else {
        exHtml = '<div class="jq">' + esc(L.ex.q) + '</div><div class="jopts" id="socOrderBox">' + socOrder.map(function(idx, i) { return '<button class="btn ghost" onclick="socOrderMove(' + i + ')">' + (i + 1) + '. ' + esc(L.ex.items[idx]) + '</button>'; }).join("") + '</div>' +
          '<button class="btn" id="socValidate" onclick="socAnswerOrder()">Valider l\'ordre</button>';
      }
    } else {
      var pct = socAnswer;
      exHtml = '<div class="conseq">' + (pct >= 100 ? 'Bien vu — leçon validée. +20 XP SOC, +10 crédits.' : 'Pas encore ça — relis le briefing et réessaie.') + '<br><span style="color:var(--muted)">' + esc(L.why || "") + '</span></div>' +
        '<button class="btn ghost" onclick="socRetry()">Rejouer la leçon</button>';
    }
    var done = socDone(L);
    var doneTag = done ? '<span class="pillok">Réussie</span>' : '';
    v.innerHTML = '<div class="screen"><div class="secttl">' + esc(L.id) + ' — ' + esc(L.t) + ' ' + doneTag + '</div>' +
      '<button class="btn ghost" onclick="socScreen=\'list\';renderSoc()">← Leçons</button>' +
      reads +
      '<div class="iterm"><div class="itermhead"><b>Terminal Outils SOC</b><span style="color:var(--muted)">tape les commandes toi-même</span></div>' +
      '<div class="itermhist" id="socTermHist"></div>' +
      '<div class="istep"><span style="color:var(--mut)">À taper :</span> <code id="socTermCmd"></code></div>' +
      '<div class="itermin"><span style="color:var(--cy)">soc@nexus:~$</span><input id="socTermIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="socTermEnter(event)" placeholder="ta commande…"><button class="btn sm" id="socTermBtn" onclick="socTermSubmit()">Entrée</button></div>' +
      '<div class="itermstatus" id="socTermStatus"></div></div>' +
      '<div id="socEx" style="display:' + (done ? "block" : "none") + '">' + exHtml + '</div></div>';
    socTermNew(L);
    if (done) {
      socTermDone = true;
      var b = $("socTermBtn"); if (b) b.disabled = true;
      var c = $("socTermIn"); if (c) c.disabled = true;
      var st = $("socTermStatus"); if (st) st.innerHTML = "Terminal déjà validé — exercice ouvert.";
      socTermRenderCmd();
    }
  }
}
function socOpenList(key) { socSection = key; socScreen = "list"; renderSoc(); }
function socOpenLesson(id) {
  var d = socData();
  for (var k in d) { var L = d[k].find(function(x) { return x.id === id; }); if (L) { socSection = k; break; } }
  socLessonId = id; socAnswer = null;
  var L2 = d[socSection].find(function(x) { return x.id === id; });
  if (L2 && L2.ex.type === "order") { socOrder = (L2.ex.disp || [0, 1, 2, 3]).slice(); socOrderDone = false; }
  socScreen = "lesson";
  renderSoc();
}
function socRetry() {
  socAnswer = null;
  var L = socData()[socSection].find(function(x) { return x.id === socLessonId; });
  if (L && L.ex.type === "order") { socOrder = (L.ex.disp || [0, 1, 2, 3]).slice(); socOrderDone = false; }
  renderSoc();
}
function socFinishLesson(L, pct) {
  if (!S.soc) S.soc = { done: {}, best: {} };
  if (pct >= 100) S.soc.done[L.id] = true;
  var prev = S.soc.best[L.id] || 0;
  if (pct > prev) S.soc.best[L.id] = pct;
  if (pct >= 100) { S.xp.soc += 20; S.credits += 10; }
  save();
}
function socAnswerQcm(i) {
  var L = socData()[socSection].find(function(x) { return x.id === socLessonId; });
  var pct = (i === L.ex.ok) ? 100 : 0;
  socAnswer = pct;
  socFinishLesson(L, pct);
  if (pct >= 100) { if (typeof sndOk === "function") sndOk(); } else if (typeof sndBad === "function") sndBad();
  renderSoc();
}
function socOrderMove(i) {
  if (socOrderDone) return;
  if (i > 0) { var t = socOrder[i - 1]; socOrder[i - 1] = socOrder[i]; socOrder[i] = t; }
  renderSoc();
}
function socAnswerOrder() {
  var L = socData()[socSection].find(function(x) { return x.id === socLessonId; });
  var pct = socOrder.every(function(v, i) { return v === i; }) ? 100 : 0;
  socAnswer = pct;
  socOrderDone = true;
  socFinishLesson(L, pct);
  if (pct >= 100) { if (typeof sndOk === "function") sndOk(); } else if (typeof sndBad === "function") sndBad();
  renderSoc();
}
