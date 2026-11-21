"use strict";
/* Suivi des erreurs global — Nexus Guardian.
   Fichier autonome : ne dépend d'aucun autre code du jeu (ni S, ni $,
   ni toast), car il doit fonctionner même si une erreur survient très tôt.
   Local uniquement : aucune donnée n'est envoyée sur le réseau. */
(function () {
  var KEY = "nexus-guardian-last-error";
  var BANNER_ID = "ng-error-banner";
  var shown = false;

  function safeString(v) {
    try {
      if (v === null || v === undefined) return "";
      if (typeof v === "string") return v;
      if (v && typeof v.message === "string") return v.message;
      return String(v);
    } catch (e) {
      return "";
    }
  }

  function saveError(info) {
    try {
      var rec = {
        message: info.message,
        source: info.source || "",
        line: info.line || 0,
        col: info.col || 0,
        time: new Date().toISOString()
      };
      window.localStorage.setItem(KEY, JSON.stringify(rec));
    } catch (e) {
      /* Stockage indisponible : on ignore, on ne lève jamais. */
    }
  }

  function techText(info) {
    var parts = [info.message];
    if (info.source) {
      parts.push(info.source + (info.line ? ":" + info.line : "") + (info.col ? ":" + info.col : ""));
    }
    if (info.time) parts.push(info.time);
    return parts.join("\n");
  }

  function showBanner(info) {
    try {
      var old = document.getElementById(BANNER_ID);
      if (old) {
        var pre = old.querySelector("pre");
        if (pre) pre.textContent = techText(info);
        return;
      }
      if (shown) return;
      shown = true;

      var bar = document.createElement("div");
      bar.id = BANNER_ID;
      bar.setAttribute("role", "alert");
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;background:#0B1220;color:#fff;border-bottom:2px solid #ff5d5d;padding:10px 12px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.4;text-align:left;box-shadow:0 2px 12px rgba(0,0,0,.5)";

      var msg = document.createElement("div");
      msg.textContent = "Une erreur est survenue. Ta progression est sauvegardée — ferme et rouvre le jeu. Si ça recommence, dis-le à Meckuine.";
      bar.appendChild(msg);

      var row = document.createElement("div");
      row.style.cssText = "margin-top:6px;display:flex;gap:8px";

      var detBtn = document.createElement("button");
      detBtn.type = "button";
      detBtn.textContent = "Détails";
      detBtn.style.cssText = "background:transparent;color:#9db4ff;border:1px solid #3a4a6b;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer";
      row.appendChild(detBtn);

      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.textContent = "Fermer";
      closeBtn.setAttribute("aria-label", "Fermer le message d'erreur");
      closeBtn.style.cssText = "background:transparent;color:#fff;border:1px solid #5b2330;border-radius:6px;padding:3px 10px;font-size:12px;cursor:pointer";
      closeBtn.addEventListener("click", function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
        shown = false;
      });
      row.appendChild(closeBtn);
      bar.appendChild(row);

      var pre = document.createElement("pre");
      pre.style.cssText = "display:none;margin:8px 0 0;padding:8px;background:#060a18;border:1px solid #22304f;border-radius:6px;color:#c8d4f0;font-size:11px;white-space:pre-wrap;word-break:break-word;max-height:120px;overflow:auto";
      pre.textContent = techText(info);
      bar.appendChild(pre);

      detBtn.addEventListener("click", function () {
        var open = pre.style.display !== "none";
        pre.style.display = open ? "none" : "block";
        detBtn.textContent = open ? "Détails" : "Masquer";
      });

      var place = function () {
        if (document.body) document.body.appendChild(bar);
        else document.documentElement.appendChild(bar);
      };
      if (document.body) place();
      else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", place);
      } else place();
    } catch (e) {
      /* Le bandeau ne doit jamais faire planter le jeu. */
    }
  }

  function handle(info) {
    try {
      if (!info || !info.message) return;
      try {
        if (window.console && window.console.error) {
          window.console.error("[Nexus Guardian] Erreur :", info.message, info.source || "", info.line || "", info.col || "");
        }
      } catch (e) {}
      saveError(info);
      showBanner(info);
    } catch (e) {
      /* Ne jamais lever depuis le gestionnaire d'erreurs. */
    }
  }

  window.addEventListener("error", function (e) {
    handle({
      message: safeString(e && e.message),
      source: (e && e.filename) || "",
      line: (e && e.lineno) || 0,
      col: (e && e.colno) || 0,
      time: new Date().toISOString()
    });
  });

  window.addEventListener("unhandledrejection", function (e) {
    var reason = e && e.reason;
    var msg = safeString(reason);
    if (reason && reason.stack && typeof reason.stack === "string") {
      msg = msg + " — " + reason.stack.split("\n")[0];
    }
    handle({
      message: msg,
      source: "",
      line: 0,
      col: 0,
      time: new Date().toISOString()
    });
  });
})();
