"use strict";
/* ================= Outils SOC — terminal interactif =================
   Même mécanique que le terminal DevOps (js/devops/terminal.js) :
   l'utilisateur TAPE les vraies commandes (SPL, KQL, RTR…), les sorties
   sont simulées à partir du transcript de la leçon. Les sorties ne sont
   jamais affichées à l'avance : valider les étapes débloque l'exercice. */
var socSteps = [], socIdx = 0, socCmd = "", socTermDone = false, socCur = null;
function socTermParse(L) {
  var lines = L.term.split("\n"), steps = [], cmd = "", out = [];
  lines.forEach(function(ln) {
    var m = ln.match(/^(?:\$|soc@nexus:~\$)\s+(.*)$/);
    if (m) {
      if (cmd) {
        if (cmd.slice(-1) === "\\" && out.length === 0) { cmd = cmd.slice(0, -1) + m[1]; return; }
        steps.push({ cmd: cmd.trim(), out: out.slice() });
      }
      cmd = m[1]; out = [];
    } else if (cmd) out.push(ln);
  });
  if (cmd) steps.push({ cmd: cmd.trim(), out: out.slice() });
  return steps.slice(0, 3);
}
function socTermNew(L) {
  socCur = L; socSteps = socTermParse(L); socIdx = 0; socCmd = ""; socTermDone = false;
  var c = $("socTermIn"); if (c) { c.value = ""; c.disabled = false; c.focus(); }
  var b = $("socTermBtn"); if (b) b.disabled = false;
  var st = $("socTermStatus"); if (st) st.innerHTML = "Étape 1 sur " + socSteps.length + " — tape la commande ci-dessous, puis Entrée.";
  var h = $("socTermHist"); if (h) h.innerHTML = "";
  socTermRenderCmd();
}
function socTermRenderCmd() {
  var el = $("socTermCmd"); if (!el || socIdx >= socSteps.length) { if (el) el.innerHTML = ""; return; }
  el.innerHTML = esc(socSteps[socIdx].cmd) + ' <span style="color:var(--muted)">· ' + (socIdx + 1) + '/' + socSteps.length + '</span>';
}
function socTermSubmit() {
  var c = $("socTermIn"); if (!c || c.disabled || !socCur || socTermDone) return;
  var raw = c.value, typed = djNormCmd(raw);
  var h = $("socTermHist"); if (h) h.innerHTML += '<div class="itermline"><span style="color:var(--cy)">soc@nexus:~$</span> ' + esc(raw) + '</div>';
  if (!typed) { socTermStatus('Tape une commande, puis Entrée.'); c.value = ""; return; }
  if (typed === "help") { socTermExecBuiltIn("help", h); c.value = ""; return; }
  if (typed === "clear") { if (h) h.innerHTML = ""; c.value = ""; return; }
  var step = socSteps[socIdx];
  var expected = step ? djNormCmd(step.cmd) : "";
  if (typed === expected) {
    if (h) h.innerHTML += socTermOutHtml(step.out);
    socIdx++;
    if (socIdx >= socSteps.length) {
      socTermDone = true;
      socTermStatus("Terminal validé — l'exercice est débloqué ci-dessous.");
      var b = $("socTermBtn"); if (b) b.disabled = true;
      if (c) c.disabled = true;
      var ex = $("socEx"); if (ex) ex.style.display = "block";
      if (typeof sndOk === "function") sndOk();
      toast("Bien vu — exercice débloqué");
    } else {
      socTermStatus("Étape " + (socIdx + 1) + " sur " + socSteps.length + " — tape la commande ci-dessous, puis Entrée.");
      socTermRenderCmd();
    }
  } else {
    var hint = socTermExec(typed);
    if (h) h.innerHTML += '<div class="itermline" style="color:var(--bad)">✕ ' + esc(hint) + '</div>';
    socTermStatus("Ce n'est pas la commande attendue — regarde bien l'étape ci-dessus. Tape « help » pour revoir les commandes.");
    if (typeof sndBad === "function") sndBad();
  }
  c.value = "";
  var box = $("socTermHist"); if (box) box.scrollTop = box.scrollHeight;
}
function socTermStatus(txt) { var st = $("socTermStatus"); if (st) st.innerHTML = esc(txt); }
function socTermOutHtml(out) {
  if (!out || !out.length) return '<div class="itermline" style="color:var(--mut)">(aucune sortie)</div>';
  return out.map(function(l) { return '<div class="itermline">' + esc(l) + '</div>'; }).join("");
}
function socTermHelpHtml() {
  var out = "<b>Commandes de cette leçon :</b><br>";
  socSteps.forEach(function(s, i) {
    out += (i + 1) + ". " + esc(s.cmd) + "<br>";
  });
  out += "<br><b>Et aussi :</b> help · clear · pwd · whoami · ls · cd · echo · history · man · cat";
  return out;
}
function socTermExecBuiltIn(cmd, h) {
  if (cmd === "help") {
    if (h) h.innerHTML += '<div class="itermline">' + socTermHelpHtml() + '</div>';
    return;
  }
  if (h) h.innerHTML += '<div class="itermline">' + esc(socTermExec(cmd)) + '</div>';
}
function socTermExec(cmd) {
  var toks = cmd.split(/\s+/).filter(Boolean), base = toks[0] || "";
  if (["pwd", "whoami", "ls", "cd", "echo", "history", "man", "cat"].indexOf(base) < 0) {
    var knownBase = socSteps.some(function(s) {
      return s.cmd.replace(/^[^ ]+\s+/, "").split(/\s+/)[0] === base || s.cmd.split(/\s+/)[0] === base;
    });
    if (knownBase) return "Sortie simulée : la version exacte de cette commande est affichée dans l'étape ci-dessus.";
    return "commande introuvable : " + base + " — tape « help » pour revoir les commandes de la leçon.";
  }
  if (base === "pwd") return "/home/soc";
  if (base === "whoami") return "soc";
  if (base === "history") return socSteps.map(function(s, i) { return (i + 1) + "  " + s.cmd; }).join("\n");
  if (base === "man") return "Usage : man <commande> — pas de manuel ici, les étapes sont affichées ci-dessus.";
  if (base === "echo") return toks.slice(1).join(" ");
  if (base === "cd") return "";
  if (base === "cat") {
    var f = toks[1] || "";
    var found = socSteps.map(function(s) { return s.cmd; }).join(" ").match(/[^\s]+\.(?:csv|log|txt|json|conf)/g);
    if (f && found && found.indexOf(f) >= 0) return "Fichier de la leçon : " + f + " — son contenu apparaît dans les étapes ci-dessus.";
    return "cat: " + (f || "fichier") + " : aucun fichier de ce nom ici.";
  }
  var files = [];
  socSteps.forEach(function(s) {
    (s.cmd.match(/[^\s]+\.(?:csv|log|txt|json|conf)/g) || []).forEach(function(f) { if (files.indexOf(f) < 0) files.push(f); });
    (s.out.join(" ").match(/[^\s]+\.(?:csv|log|txt|json|conf)/g) || []).forEach(function(f) { if (files.indexOf(f) < 0) files.push(f); });
  });
  return files.length ? files.join("  ") : "alertes.csv  rapport-soc.txt";
}
function socTermEnter(e) { if (e && e.key === "Enter") { e.preventDefault(); socTermSubmit(); } }
