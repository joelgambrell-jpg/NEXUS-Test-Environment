/* app.js (FULL FILE — COMPLETE REPLACEMENT)
   Fix:
   - Fix ConnecTorq button 404 by correcting href:
       "torque/snapon_import.html" -> "snapon_import.html"
   - form.html "Step Complete" button now WORKS and SAVES.
   - Writes completion to localStorage using existing scheme:
       nexus_${eq}_${completedKey} = "true"/"false"
     with fallback to global key if eq is missing.
   Notes:
   - Preserves existing form.html rendering behavior.
*/

(function () {
  const params = new URLSearchParams(location.search);
  const id = (params.get("id") || "").trim();
  const eq = (params.get("eq") || "").trim();
  const rif = (params.get("rif") || "").trim();

  const isFormPage = /(^|\/)(form\.html)$/i.test(location.pathname);
  if (!isFormPage) return;

  function fallbackForms() {
    return {
      rif: {
        title: "Receipt Inspection Form",
        sectionTitle: "Receipt Inspection Form",
        completedKey: "rifCompleted",
        buttons: [
          { text: "RIF – No Procore (Fillable)", href: "rif_no_procore.html" },
          { text: "RIF – Fillable", href: "RIF.html" }
        ]
      },
      meg: {
        title: "Megohmmeter Testing",
        sectionTitle: "Megohmmeter Testing",
        completedKey: "megCompleted",
        buttons: [
          { text: "Megohmmeter Test Log (Fillable)", href: "meg_log.html" },
          { text: "Megohmmeter SOP", href: "megohmmeter_sop.html" },
          { text: "Fluke Connect Import (Optional)", href: "meg/fluke_import.html" },
          { text: "Fluke Export Embed (Optional)", href: "meg/fluke_export_embed.html" }
        ]
      },
      torque: {
        title: "Torque Application",
        sectionTitle: "Torque Application",
        completedKey: "torqueCompleted",
        buttons: [
          { text: "Torque Log (Fillable)", href: "torque_log.html" },
          { text: "Torque SOP", href: "torque_sop.html" },
          // FIX: remove incorrect "torque/" prefix (caused /torque/snapon_import.html 404)
          { text: "Snap-on ConnecTorq Import (Optional)", href: "snapon_import.html" }
        ]
      },
      l2: {
        title: "L2 Installation Verification Form",
        sectionTitle: "L2 Installation Verification Form",
        completedKey: "l2Completed",
        buttons: [
          { text: "L2 Form (Fillable)", href: "l2.html" },
          { text: "L2 – No Procore", href: "l2_no_procore.html" }
        ]
      },
      prefod: {
        title: "Pre- Foreign Object and Debris",
        sectionTitle: "Pre- Foreign Object and Debris",
        completedKey: "prefodCompleted",
        buttons: [
          { text: "Pre-FOD Checklist (Fillable)", href: "prefod_checklist.html" },
          { text: "Pre-FOD SOP", href: "prefod_sop.html" },
          { text: "Inspection Link to Procore (Live after updated by customer)", href: "PROCORE_PREFOD" }
        ]
      }
    };
  }

  // If config.js failed to load for any reason, self-heal
  if (!window.FORMS || typeof window.FORMS !== "object") {
    window.FORMS = fallbackForms();
  }

  // If id is missing OR unknown, show the red banner
  if (!id || !window.FORMS[id]) {
    document.body.innerHTML =
      '<div style="background:#b60000;color:white;padding:40px;font-family:Arial,sans-serif">' +
      "<h2>Invalid or missing form ID</h2>" +
      "<p>Example: <code>form.html?id=rif</code></p>" +
      "</div>";
    return;
  }

  const cfg = window.FORMS[id];

  // Titles
  document.title = cfg.title || "Form";
  const pageTitle = document.getElementById("page-title");
  const sectionTitle = document.getElementById("section-title");
  if (pageTitle) pageTitle.textContent = cfg.title || "";
  if (sectionTitle) sectionTitle.textContent = cfg.sectionTitle || "";

  // EQ label
  try {
    const eqLabel = document.getElementById("eqLabel");
    if (eqLabel) eqLabel.textContent = eq ? `Equipment: ${eq}` : "";
  } catch (e) {}

  // Render buttons
  const buttonsWrap = document.getElementById("buttons");
  if (buttonsWrap && Array.isArray(cfg.buttons)) {
    buttonsWrap.innerHTML = "";
    cfg.buttons.forEach((b) => {
      if (!b) return;

      const a = document.createElement("a");
      a.className = "btn";
      a.textContent = b.text || "Open";

      // Resolve token links (Procore etc) later; keep placeholders intact
      a.href = b.href || "#";

      buttonsWrap.appendChild(a);
    });
  }

  // Keep eq/rif on internal links
  function patchLinks() {
    document.querySelectorAll("a[href]").forEach((a) => {
      try {
        const href = a.getAttribute("href");
        if (!href) return;

        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;

        if (eq) url.searchParams.set("eq", eq);
        if (rif) url.searchParams.set("rif", rif);

        a.setAttribute("href", url.pathname + url.search + url.hash);
      } catch (e) {}
    });
  }

  patchLinks();
  const obs = new MutationObserver(patchLinks);
  obs.observe(document.body, { childList: true, subtree: true });

  /* =========================================================
     STEP COMPLETE (FIX)
     - This is what makes the button actually do something.
     - Equipment dashboard reads: nexus_${eq}_${k} OR k
     ========================================================= */

  function completionStorageKey() {
    const k = cfg && cfg.completedKey ? String(cfg.completedKey).trim() : "";
    if (!k) return null;
    return eq ? `nexus_${eq}_${k}` : k;
  }

  function readCompleted() {
    const k = completionStorageKey();
    if (!k) return false;
    try {
      return localStorage.getItem(k) === "true";
    } catch (e) {
      return false;
    }
  }

  function writeCompleted(v) {
    const k = completionStorageKey();
    if (!k) return;
    try {
      localStorage.setItem(k, v ? "true" : "false");
    } catch (e) {}
  }

  function setStepBtnLabel(btn) {
    const done = readCompleted();
    btn.textContent = done ? "STEP COMPLETE ✓" : "STEP COMPLETE";
    btn.classList.toggle("complete", done);
  }

  function wireStepCompleteBtn() {
    const btn = document.getElementById("stepCompleteBtn");
    if (!btn) return;

    // form.html hides it by default; force it visible if present.
    btn.style.display = "block";
    btn.style.pointerEvents = "auto";

    // If a form somehow has no completedKey, don’t allow writing an unknown key.
    if (!cfg || !cfg.completedKey) {
      btn.style.display = "none";
      return;
    }

    // IMPORTANT:
    // form.html also includes a canonical Step Complete handler. If both handlers bind,
    // the click can toggle twice and appear to "do nothing".
    // We mark the button as already bound so only ONE handler exists.
    if (btn.__nxBound) {
      setStepBtnLabel(btn);
      return;
    }
    btn.__nxBound = true;

    // Initialize label/state
    setStepBtnLabel(btn);

    // Attach handler ONCE
    btn.addEventListener("click", function (e) {
      try { e.preventDefault(); e.stopPropagation(); } catch(_) {}

      const next = !readCompleted();
      writeCompleted(next);
      setStepBtnLabel(btn);

      // Optional: notify other pages/listeners
      try {
        window.dispatchEvent(
          new CustomEvent("nexus:completionChanged", {
            detail: { eq, key: cfg.completedKey, storageKey: completionStorageKey(), value: next }
          })
        );
      } catch (e) {}
    });
  }

  wireStepCompleteBtn();
})();
