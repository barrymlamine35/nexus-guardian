"use strict";
/* ---------- Terminal interactif DevOps ----------
   Le joueur tape lui-même les commandes : pas de chips, pas de transcript
   affiché — les sorties se révèlent en tapant. État séparé du terminal du
   Dojo (dvTerm, pas djTerm). La validation du terminal débloque l'exercice,
   elle ne donne pas la récompense : c'est l'exercice qui valide la leçon. */
var dvTerm = null, dvTypeFinish = null;
function dvTermParse(term){
  var clean = String(term).replace(/<none>/g, "\u0001none\u0002").replace(/<span class="tdim">[\s\S]*?<\/span>/g, "").replace(/<[^>]*>/g, "").replace(/\u0001none\u0002/g, "<none>");
  var lines = clean.split("\n"), cmds = [], cur = null;
  var promptRe = /^(?:\$|devops@nexus:~\$)\s+/;
  lines.forEach(function(raw){
    var line = raw.replace(/\s+$/, ""), m = line.match(promptRe);
    if(m){
      cur = { cmd: line.slice(m[0].length).trim(), out: [] };
      cmds.push(cur);
    } else if(cur){
      if(cur.cmd.slice(-1) === "\\" && cur.out.length === 0){ cur.cmd = cur.cmd.slice(0, -1) + " " + line.trim(); }
      else cur.out.push(line);
    }
  });
  cmds.forEach(function(c){ while(c.out.length && c.out[c.out.length-1] === "") c.out.pop(); });
  if(!cmds.length){
    lines.map(function(l){ return l.trim(); }).filter(function(l){ return l !== ""; }).slice(0, 2)
      .forEach(function(c){ cmds.push({ cmd: c, out: [] }); });
  }
  return cmds;
}
function dvTermNew(L){
  var cmds = dvTermParse(L.term), steps = [], seen = {}, files = {}, j, toks;
  cmds.forEach(function(c){
    var n = djNormCmd(c.cmd);
    if(n && !seen[n]){ seen[n] = 1; if(steps.length < 3) steps.push(c.cmd); }
    toks = (c.cmd + " " + c.out.join(" ")).split(/\s+/);
    for(j = 0; j < toks.length; j++){
      var tk = toks[j].replace(/^[("']+|[)"',;]+$/g, "");
      if(/^[\w.\/-]+$/.test(tk) && (tk.indexOf(".") >= 0 || tk.indexOf("/") >= 0)) files[tk] = 1;
    }
  });
  return { id: L.id, cmds: cmds, steps: steps, done: {}, entries: [], hist: [], histIdx: 0,
           validated: steps.length === 0, files: files };
}
function dvTermListing(st){
  for(var i = 0; i < st.cmds.length; i++){
    var n = djNormCmd(st.cmds[i].cmd);
    if(n === "ls" || n.indexOf("ls ") === 0) return st.cmds[i].out.join("\n");
  }
  var names = Object.keys(st.files).filter(function(f){ return f.charAt(0) !== "/" && f.indexOf("/") < 0; });
  return names.length ? names.join("  ") : "Dockerfile  mon-app";
}
function dvTermHelp(st){
  var out = ["Commandes de cette leçon :"], sn = {};
  st.cmds.forEach(function(c){ var n = djNormCmd(c.cmd); if(n && !sn[n]){ sn[n] = 1; out.push("  " + c.cmd); } });
  out.push("Commandes intégrées : pwd · ls · cd · echo · cat · history · help · clear · man · whoami");
  return out.join("\n");
}
function dvTermExec(st, raw){
  var cmd = djNormCmd(raw), i, hit = null;
  for(i = 0; i < st.cmds.length; i++){ if(djNormCmd(st.cmds[i].cmd) === cmd){ hit = st.cmds[i]; break; } }
  if(hit) return hit.out.join("\n");
  var parts = cmd.split(" "), base = parts[0], arg = parts.slice(1).join(" ");
  if(base === "pwd") return "/home/devops";
  if(base === "whoami") return "devops";
  if(base === "ls") return dvTermListing(st);
  if(base === "cd") return "";
  if(base === "echo") return arg;
  if(base === "history") return st.hist.map(function(h, k){ return "  " + (k + 1) + "  " + h; }).join("\n");
  if(base === "help") return dvTermHelp(st);
  if(base === "man") return arg ? "man — la page de manuel de « " + arg + " » n’est pas installée ici ; tape help pour les commandes de la leçon." : "man : quelle page ? Exemple : man docker";
  if(base === "cat"){
    if(!arg) return "cat : quel fichier ? Exemple : cat .gitlab-ci.yml";
    if(st.files[arg]) return "« " + arg + " » est bien là — son contenu se lit avec la commande de la leçon, tape help.";
    return "cat: " + arg + ": Aucun fichier ou dossier de ce type";
  }
  var knownBase = false;
  for(i = 0; i < st.cmds.length; i++){ if(djNormCmd(st.cmds[i].cmd).split(" ")[0] === base){ knownBase = true; break; } }
  if(knownBase) return "Sortie simulée : la version exacte de cette commande pour la leçon est dans les étapes ci-dessus.";
  return "commande introuvable : " + cmd + " — tape help";
}
function dvTermHTML(){
  var st = dvTerm, h = '<div class="iterm dj-enter" id="dvTermBox"><div class="iterm-steps">';
  st.steps.forEach(function(s, i){
    h += '<div class="istep' + (st.done[i] ? " done" : "") + '" data-dvistep="' + i + '"><span class="ick">✓</span><span>Étape ' + (i + 1) + ' · <code>' + esc(s) + '</code></span></div>';
  });
  h += '</div><div class="iterm-hist" id="dvTermHist"></div>';
  h += '<form class="iterm-form" id="dvTermForm" autocomplete="off"><span class="iterm-prompt">devops@nexus:~$</span><span class="iterm-cur" aria-hidden="true"></span>'
    + '<input class="iterm-input" id="dvTermInput" type="text" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" aria-label="Commande du terminal" /></form></div>';
  return h;
}
function dvTermLine(hist, e, instant){
  if(e.sys){
    var d = document.createElement("div");
    d.className = e.sys === "ok" ? "il-ok" : "il-dim";
    d.textContent = e.text;
    hist.appendChild(d);
    hist.scrollTop = hist.scrollHeight;
    return;
  }
  var cl = document.createElement("div");
  var p = document.createElement("span"); p.className = "il-p"; p.textContent = "devops@nexus:~$ ";
  var c = document.createElement("span"); c.className = "il-c"; c.textContent = e.cmd;
  cl.appendChild(p); cl.appendChild(c);
  hist.appendChild(cl);
  var out = document.createElement("div");
  hist.appendChild(out);
  hist.scrollTop = hist.scrollHeight;
  if(instant || DJ_REDUCED || !e.out){ out.textContent = e.out || ""; if(!instant && e.onDone) e.onDone(); return; }
  var txt = e.out, i = 0, step = txt.length > 220 ? 6 : 2, timer = null, finished = false;
  function finish(){ if(finished) return; finished = true; if(timer) clearInterval(timer); dvTypeFinish = null; out.textContent = txt; hist.scrollTop = hist.scrollHeight; if(e.onDone) e.onDone(); }
  dvTypeFinish = finish;
  out.addEventListener("click", finish);
  timer = setInterval(function(){
    i += step;
    out.textContent = txt.slice(0, i);
    hist.scrollTop = hist.scrollHeight;
    if(i >= txt.length) finish();
  }, 10);
}
function dvTermSubmit(L, raw){
  var st = dvTerm; if(!st || st.id !== L.id) return;
  var cmd = djNormCmd(raw);
  if(!cmd) return;
  if(dvTypeFinish) dvTypeFinish();
  var hist = $("dvTermHist"); if(!hist) return;
  if(cmd === "clear"){ st.entries = []; hist.innerHTML = ""; return; }
  st.hist.push(cmd); st.histIdx = st.hist.length;
  var stepHit = -1;
  st.steps.forEach(function(s, i){ if(djNormCmd(s) === cmd && !st.done[i]) stepHit = i; });
  var entry = { cmd: raw, out: dvTermExec(st, cmd) };
  st.entries.push(entry);
  entry.onDone = function(){
    if(stepHit < 0) return;
    st.done[stepHit] = 1;
    var box = document.querySelector('[data-dvistep="' + stepHit + '"]');
    if(box) box.classList.add("done");
    if(typeof sndTap === "function") sndTap();
    var okLine = { sys: "ok", text: "✓ Étape " + (stepHit + 1) + " validée : " + djNormCmd(raw) };
    st.entries.push(okLine); dvTermLine(hist, okLine, true);
    var all = st.steps.every(function(s, i){ return st.done[i]; });
    if(all && !st.validated){
      st.validated = true;
      if(typeof sndOk === "function") sndOk();
      var vLine = { sys: "ok", text: "Terminal validé ✓ — l’exercice est débloqué ci-dessous." };
      st.entries.push(vLine); dvTermLine(hist, vLine, true);
      setTimeout(function(){ var y = window.scrollY; renderDevOps(); window.scrollTo(0, y); }, 500);
    }
  };
  dvTermLine(hist, entry, false);
  var input = $("dvTermInput"); if(input){ try{ input.focus({ preventScroll: true }); }catch(e){ input.focus(); } }
}
function dvTermMount(L){
  var st = dvTerm; if(!st || st.id !== L.id) return;
  var hist = $("dvTermHist"), form = $("dvTermForm"), input = $("dvTermInput");
  if(!hist || !form || !input) return;
  if(st.entries.length){ st.entries.forEach(function(e){ dvTermLine(hist, e, true); }); }
  else dvTermLine(hist, { sys: "dim", text: "Terminal DevOps — tape les commandes des étapes ci-dessus, ou help pour la liste des commandes." }, true);
  hist.scrollTop = hist.scrollHeight;
  form.addEventListener("submit", function(ev){ ev.preventDefault(); var v = input.value; input.value = ""; dvTermSubmit(L, v); });
  input.addEventListener("keydown", function(ev){
    ev.stopPropagation();
    if(ev.key === "ArrowUp" || ev.key === "ArrowDown"){
      ev.preventDefault();
      if(!st.hist.length) return;
      st.histIdx = ev.key === "ArrowUp" ? Math.max(0, st.histIdx - 1) : Math.min(st.hist.length, st.histIdx + 1);
      input.value = st.histIdx < st.hist.length ? st.hist[st.histIdx] : "";
    }
  });
  input.addEventListener("keyup", function(ev){ ev.stopPropagation(); });
}