"use strict";
/* ---------- Terminal interactif du Dojo ----------
   État en mémoire seulement (réinitialisé à chaque ouverture de leçon, comme
   dojoAnswer / dojoOrder). Les sorties des commandes de la leçon reprennent
   EXACTEMENT le texte du champ term de la leçon — rien n'est inventé. */
var djTerm = null, djTypeFinish = null;
var DJ_REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function djNormCmd(s){ return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
function djTermParse(term){
  var clean = String(term).replace(/<span class="tdim">[\s\S]*?<\/span>/g, "").replace(/<[^>]*>/g, "");
  var lines = clean.split("\n"), cmds = [], cur = null;
  var promptRe = /^(?:\$|hacker@dojo:~\$|\(gdb\))\s+/;
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
function djTermNew(L){
  var cmds = djTermParse(L.term), steps = [], seen = {}, files = {}, i, j, toks;
  cmds.forEach(function(c){
    var n = djNormCmd(c.cmd);
    if(n && !seen[n]){ seen[n] = 1; if(steps.length < 2) steps.push(c.cmd); }
    toks = (c.cmd + " " + c.out.join(" ")).split(/\s+/);
    for(j = 0; j < toks.length; j++){
      var tk = toks[j].replace(/^[("']+|[)"',;]+$/g, "");
      if(/^[\w.\/-]+$/.test(tk) && (tk.indexOf(".") >= 0 || tk.indexOf("/") >= 0)) files[tk] = 1;
    }
  });
  return { id: L.id, cmds: cmds, steps: steps, done: {}, entries: [], hist: [], histIdx: 0,
           validated: steps.length === 0, files: files, chips: (function(){
             var out = [], sn = {};
             cmds.forEach(function(c){ var n = djNormCmd(c.cmd); if(n && !sn[n]){ sn[n] = 1; out.push(c.cmd); } });
             return out.slice(0, 5);
           })() };
}
function djTermListing(st){
  for(var i = 0; i < st.cmds.length; i++){
    var n = djNormCmd(st.cmds[i].cmd);
    if(n === "ls" || n.indexOf("ls ") === 0) return st.cmds[i].out.join("\n");
  }
  var names = Object.keys(st.files).filter(function(f){ return f.charAt(0) !== "/" && f.indexOf("/") < 0; });
  return names.length ? names.join("  ") : "notes.txt  travail";
}
function djTermHelp(st){
  var out = ["Commandes de cette leçon :"], sn = {};
  st.cmds.forEach(function(c){ var n = djNormCmd(c.cmd); if(n && !sn[n]){ sn[n] = 1; out.push("  " + c.cmd); } });
  out.push("Commandes intégrées : pwd · ls · cd · echo · cat · history · help · clear · man · whoami");
  return out.join("\n");
}
function djTermExec(st, raw){
  var cmd = djNormCmd(raw), i, hit = null;
  for(i = 0; i < st.cmds.length; i++){ if(djNormCmd(st.cmds[i].cmd) === cmd){ hit = st.cmds[i]; break; } }
  if(hit) return hit.out.join("\n");
  var parts = cmd.split(" "), base = parts[0], arg = parts.slice(1).join(" ");
  if(base === "pwd") return "/home/hacker";
  if(base === "whoami") return "hacker";
  if(base === "ls") return djTermListing(st);
  if(base === "cd") return "";
  if(base === "echo") return arg;
  if(base === "history") return st.hist.map(function(h, k){ return "  " + (k + 1) + "  " + h; }).join("\n");
  if(base === "help") return djTermHelp(st);
  if(base === "man") return arg ? "man — la page de manuel de « " + arg + " » est résumée dans l'aide-mémoire de la leçon, ci-dessus." : "man : quelle page ? Exemple : man ls";
  if(base === "cat"){
    if(!arg) return "cat : quel fichier ? Exemple : cat notes.txt";
    if(st.files[arg]) return "« " + arg + " » fait partie du décor de cette leçon — son contenu exact est dans l'aide-mémoire ci-dessus.";
    return "cat: " + arg + ": Aucun fichier ou dossier de ce type";
  }
  var knownBase = false;
  for(i = 0; i < st.cmds.length; i++){ if(djNormCmd(st.cmds[i].cmd).split(" ")[0] === base){ knownBase = true; break; } }
  if(knownBase) return "Sortie simulée : la version exacte de cette commande pour la leçon est dans l'aide-mémoire ci-dessus.";
  return "commande introuvable : " + cmd + " — tape help";
}
function djTermHTML(){
  var st = djTerm, h = '<div class="iterm dj-enter" id="djTermBox"><div class="iterm-steps">';
  st.steps.forEach(function(s, i){
    h += '<div class="istep' + (st.done[i] ? " done" : "") + '" data-istep="' + i + '"><span class="ick">✓</span><span>Étape ' + (i + 1) + ' · <code>' + esc(s) + '</code></span></div>';
  });
  h += '</div><div class="iterm-hist" id="djTermHist"></div>';
  if(st.chips.length){
    h += '<div class="itchips">';
    st.chips.forEach(function(c, i){ h += '<button type="button" class="itchip" data-djchip="' + i + '">' + esc(c) + '</button>'; });
    h += '</div>';
  }
  h += '<form class="iterm-form" id="djTermForm" autocomplete="off"><span class="iterm-prompt">hacker@dojo:~$</span><span class="iterm-cur" aria-hidden="true"></span>'
    + '<input class="iterm-input" id="djTermInput" type="text" autocapitalize="none" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" aria-label="Commande du terminal" /></form></div>';
  return h;
}
function djTermLine(hist, e, instant){
  if(e.sys){
    var d = document.createElement("div");
    d.className = e.sys === "ok" ? "il-ok" : "il-dim";
    d.textContent = e.text;
    hist.appendChild(d);
    hist.scrollTop = hist.scrollHeight;
    return;
  }
  var cl = document.createElement("div");
  var p = document.createElement("span"); p.className = "il-p"; p.textContent = "hacker@dojo:~$ ";
  var c = document.createElement("span"); c.className = "il-c"; c.textContent = e.cmd;
  cl.appendChild(p); cl.appendChild(c);
  hist.appendChild(cl);
  var out = document.createElement("div");
  hist.appendChild(out);
  hist.scrollTop = hist.scrollHeight;
  if(instant || DJ_REDUCED || !e.out){ out.textContent = e.out || ""; if(!instant && e.onDone) e.onDone(); return; }
  var txt = e.out, i = 0, step = txt.length > 220 ? 6 : 2, timer = null, finished = false;
  function finish(){ if(finished) return; finished = true; if(timer) clearInterval(timer); djTypeFinish = null; out.textContent = txt; hist.scrollTop = hist.scrollHeight; if(e.onDone) e.onDone(); }
  djTypeFinish = finish;
  out.addEventListener("click", finish);
  timer = setInterval(function(){
    i += step;
    out.textContent = txt.slice(0, i);
    hist.scrollTop = hist.scrollHeight;
    if(i >= txt.length) finish();
  }, 10);
}
function djTermSubmit(L, raw){
  var st = djTerm; if(!st || st.id !== L.id) return;
  var cmd = djNormCmd(raw);
  if(!cmd) return;
  if(djTypeFinish) djTypeFinish();
  var hist = $("djTermHist"); if(!hist) return;
  if(cmd === "clear"){ st.entries = []; hist.innerHTML = ""; return; }
  st.hist.push(cmd); st.histIdx = st.hist.length;
  var stepHit = -1;
  st.steps.forEach(function(s, i){ if(djNormCmd(s) === cmd && !st.done[i]) stepHit = i; });
  var entry = { cmd: raw, out: djTermExec(st, cmd) };
  st.entries.push(entry);
  entry.onDone = function(){
    if(stepHit < 0) return;
    st.done[stepHit] = 1;
    var box = document.querySelector('[data-istep="' + stepHit + '"]');
    if(box) box.classList.add("done");
    if(typeof sndTap === "function") sndTap();
    var okLine = { sys: "ok", text: "✓ Étape " + (stepHit + 1) + " validée : " + djNormCmd(raw) };
    st.entries.push(okLine); djTermLine(hist, okLine, true);
    var all = st.steps.every(function(s, i){ return st.done[i]; });
    if(all && !st.validated){
      st.validated = true;
      if(typeof sndOk === "function") sndOk();
      var vLine = { sys: "ok", text: "Terminal validé ✓ — l'exercice est débloqué ci-dessous." };
      st.entries.push(vLine); djTermLine(hist, vLine, true);
      setTimeout(function(){ var y = window.scrollY; renderDojo(); window.scrollTo(0, y); }, 500);
    }
  };
  djTermLine(hist, entry, false);
  var input = $("djTermInput"); if(input){ try{ input.focus({ preventScroll: true }); }catch(e){ input.focus(); } }
}
function djTermMount(L){
  var st = djTerm; if(!st || st.id !== L.id) return;
  var hist = $("djTermHist"), form = $("djTermForm"), input = $("djTermInput");
  if(!hist || !form || !input) return;
  if(st.entries.length){ st.entries.forEach(function(e){ djTermLine(hist, e, true); }); }
  else djTermLine(hist, { sys: "dim", text: "Terminal du dojo — tape les commandes des étapes ci-dessus, ou help pour la liste des commandes." }, true);
  hist.scrollTop = hist.scrollHeight;
  form.addEventListener("submit", function(ev){ ev.preventDefault(); var v = input.value; input.value = ""; djTermSubmit(L, v); });
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
  document.querySelectorAll("[data-djchip]").forEach(function(b){
    b.addEventListener("click", function(){ djTermSubmit(L, st.chips[+b.getAttribute("data-djchip")]); });
  });
}
function djCountUp(el){
  var m = String(el.textContent).match(/^(\+?)(\d+)(.*)$/); if(!m) return;
  var plus = m[1], target = parseInt(m[2], 10), suf = m[3] || "";
  if(DJ_REDUCED || target === 0) return;
  var t0 = null;
  function frame(ts){
    if(!t0) t0 = ts;
    var p = Math.min(1, (ts - t0) / 400);
    el.textContent = plus + Math.round(target * (1 - Math.pow(1 - p, 2))) + suf;
    if(p < 1) requestAnimationFrame(frame); else el.textContent = plus + target + suf;
  }
  requestAnimationFrame(frame);
}
/* Compte animé du gros score d'examen / simulation : l'élément porte data-pct. */
function pkScoreCount(el){
  if(!el) return;
  var target = parseInt(el.getAttribute("data-pct") || "0", 10);
  if(DJ_REDUCED || !target){ return; }
  var t0 = null;
  function frame(ts){
    if(!t0) t0 = ts;
    var p = Math.min(1, (ts - t0) / 500);
    var v = Math.round(target * (1 - Math.pow(1 - p, 2)));
    el.childNodes[0].nodeValue = String(v);
    if(p < 1) requestAnimationFrame(frame);
    else { el.childNodes[0].nodeValue = String(target); }
  }
  requestAnimationFrame(frame);
}
/* Machine à écrire générique (missions) : même rythme que le terminal du Dojo.
   Plusieurs frappes simultanées possibles ; msClearType() arrête tout. */
var msTypeTimers = [];
function msTypeEl(el, txt, onDone){
  if(!el) return;
  if(DJ_REDUCED || !txt){ el.textContent = txt || ""; el.classList.remove("typing"); if(onDone) onDone(); return; }
  var i = 0, step = txt.length > 220 ? 6 : 2, finished = false, timer = null;
  function finish(){ if(finished) return; finished = true;
    if(timer){ clearInterval(timer); }
    el.textContent = txt; el.classList.remove("typing"); if(onDone) onDone(); }
  el.addEventListener("click", finish);
  timer = setInterval(function(){
    i += step; el.textContent = txt.slice(0, i);
    if(i >= txt.length) finish();
  }, 10);
  msTypeTimers.push(timer);
}
function msClearType(){ msTypeTimers.forEach(function(t){ clearInterval(t); }); msTypeTimers = []; }
/* Compte animé du gros score des debriefs missions / campagne (premier nœud texte de .scorebig). */
function msScoreCount(root){
  if(!root) return;
  var el = root.querySelector(".scorebig"); if(!el || !el.childNodes[0]) return;
  var target = parseInt(el.childNodes[0].nodeValue, 10);
  if(isNaN(target) || DJ_REDUCED || target === 0) return;
  var t0 = null;
  function frame(ts){
    if(!t0) t0 = ts;
    var p = Math.min(1, (ts - t0) / 400);
    el.childNodes[0].nodeValue = String(Math.round(target * (1 - Math.pow(1 - p, 2))));
    if(p < 1) requestAnimationFrame(frame); else el.childNodes[0].nodeValue = String(target);
  }
  requestAnimationFrame(frame);
}
/* Apparition décalée des lignes du pourquoi dans un debrief. */
function msStaggerWhy(root){
  if(!root) return;
  root.querySelectorAll(".whyitem").forEach(function(w, i){
    w.classList.add("ms-stagger"); w.style.animationDelay = (i*60)+"ms";
  });
}