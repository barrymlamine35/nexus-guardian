"use strict";
/* ---------- Carte des dojos (effectifs relevés sur pwn.college/dojos, 18 nov. 2026) ---------- */
var DOJO_GS = [];
var DOJO_CORE = [];
var DOJO_COMM_A = [];
var DOJO_COMM_B = [];
var DOJO_COMM_C = [];
var dojoMapReg = [];
function dojoMapCard(name, mc, mods, note, beltCls, beltTxt){
  var idx = dojoMapReg.length;
  dojoMapReg.push({name:name, mc:mc, mods:mods, note:note, beltCls:beltCls, beltTxt:beltTxt});
  return '<button class="djtile lock" data-djmap="'+idx+'"><span class="dj-name">'+esc(name)+'</span>'
    + '<span class="dj-meta">'+esc(mc)+'</span>'
    + (beltTxt ? '<span class="belt '+beltCls+'">'+esc(beltTxt)+'</span>' : '')
    + '<span class="dj-foot">À venir · Détails</span></button>';
}
function dojoMapSheet(idx){
  var d = dojoMapReg[idx]; if(!d) return;
  sheet('<h3>'+esc(d.name)+'</h3><p>'+esc(d.mc)+(d.beltTxt ? ' · '+esc(d.beltTxt) : '')+' · <b style="color:var(--txt)">À venir</b></p><p><b style="color:var(--txt)">Modules :</b> '+esc(d.mods)+'</p>'+(d.note ? '<p>'+esc(d.note)+'</p>' : '')+'<div class="sbtns"><button class="btn primary big" onclick="closeSheet()">Compris</button></div>');
}
function dojoPlayTile(id, name, meta, done, total, extra){
  var pct = total ? Math.round(100*done/total) : 0, fin = total>0 && done>=total, prog = !fin && done>0;
  return '<button class="djtile'+(fin ? " done" : (prog ? " prog" : ""))+'" id="'+id+'"><span class="dj-name">'+esc(name)+'</span>'
    + '<span class="dj-meta">'+esc(meta)+'</span>'
    + '<span class="dj-meta">Ici : '+done+' / '+total+' leçons</span>'
    + (extra ? '<span class="dj-meta">'+esc(extra)+'</span>' : '')
    + '<span class="djbar"><i style="width:'+pct+'%"></i></span>'
    + '<span class="dj-prow"><span class="dj-pct">'+pct+' %</span><span class="dj-foot">'+(fin ? "Terminé ✓" : (prog ? "Continuer ›" : "Entrer ›"))+'</span></span></button>';
}
function dojoLessonTile(l, i){
  var done = !!S.dojo.done[l.id], best = S.dojo.best[l.id]||0;
  return '<button class="ljtile'+(done ? " done" : "")+'" data-djlesson="'+l.id+'">'
    + '<span class="lj-top"><span class="lj-id">'+esc(l.id)+'</span><span class="lj-st">'+(done ? (best>=100 ? "✓ 100 %" : best+" %") : "")+'</span></span>'
    + '<span class="lj-t">'+esc(l.t)+'</span>'
    + '<span class="lj-rw">'+(isGuest() && l.id!=="SH-01" ? "🔒 Compte requis" : "+20 XP · +10 crédits")+'</span>'
    + '<span class="lj-b">Leçon '+(i+1)+(done ? (best>=100 ? " · Réussie" : " · Terminée") : "")+'</span></button>';
}
function dojoFinishLesson(lesson, pct){
  S.dojo.done[lesson.id] = true;
  if(pct > (S.dojo.best[lesson.id]||0)) S.dojo.best[lesson.id] = pct;
  if(pct>=100){ S.xp.soc += 20; S.credits += 10; }
  save();
}