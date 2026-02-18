/* app.js (FULL FILE — COMPLETE REPLACEMENT)
   Fixes:
   - Eliminates double Torque import buttons by filtering + de-duping at render time.
   - Forces Torque import link to the correct location: "snapon_import.html" (no /torque/ folder).
   - Removes unwanted Torque buttons (per your request): "Tilt Test" and "Snap-on Import (Optional)".
   - FIX: Meg Fluke Import path: "meg/fluke_import.html" -> "fluke_import.html" (folder doesn't exist)
   - FIX: Optional Fluke Export Embed path: "meg/fluke_export_embed.html" -> "fluke_export_embed.html"
   - NEW: Meg button filtering to hide red-circled items:
       * "LVT Meg Cover Sheet"
       * "Meg Report PDF"
       * "Fluke Export Embed (Optional)" (hidden by default)

   Keeps existing behavior:
   - form.html rendering + eq/rif query propagation + Step Complete persistence.
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
          // FIXED paths (no /meg/ folder in your repo)
          { text: "Fluke Connect Import (Optional)", href: "fluke_import.html" },
          { text: "Fluke Export Embed (Optional)", href: "fluke_export_embed.html" }
        ]
      },
      torque: {
        title: "Torque Application",
        sectionTitle: "Torque Application",
        completedKey: "torqueCompleted",
        buttons: [
          { text: "Torque Log (Fillable)", href: "torque_log.html" },
          { text: "Torque SOP", href: "torque_sop.html" },
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

  // ---------------------------------------------------------
  // Button sanitization to prevent duplicates / wrong links
  // ---------------------------------------------------------

  function normText(s) {
    return String(s || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function normHref(href) {
    const raw = String(href || "").trim();
    if (!raw) return "";

    // Keep special tokens intact (e.g., PROCORE_PREFOD)
    if (/^[A-Z0-9_]+$/.test(raw) && !/\.html/i.test(raw)) return raw;

    try {
      const u = new URL(raw, location.href);

      // normalize known bad torque import path (folder doesn't exist)
      // - .../torque/snapon_import.html -> .../snapon_import.html
      if (/\/torque\/snapon_import\.html$/i.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/torque\/snapon_import\.html$/i, "/snapon_import.html");
      }

      // normalize known bad meg/fluke paths (folder doesn't exist)
      if (/\/meg\/fluke_import\.html$/i.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/meg\/fluke_import\.html$/i, "/fluke_import.html");
      }
      if (/\/meg\/fluke_export_embed\.html$/i.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/meg\/fluke_export_embed\.html$/i, "/fluke_export_embed.html");
      }

      // For internal links, store only pathname + search + hash
      if (u.origin === location.origin) return u.pathname + u.search + u.hash;

      // For external, return full
      return u.href;
    } catch (e) {
      // If it wasn't a valid URL, return as-is
      return raw;
    }
  }

  function sanitizeButtons(formId, buttons) {
    const src = Array.isArray(buttons) ? buttons.slice() : [];
    const out = [];
    const seen = new Set();

    const formIdLc = String(formId || "").toLowerCase();

    // TORQUE: remove unwanted buttons and force a single correct import button.
    if (formIdLc === "torque") {
      const killTexts = new Set([
        normText("Tilt Test"),
        normText("Snap-on Import (Optional)")
      ]);

      for (const b of src) {
        if (!b) continue;
        const t = normText(b.text);
        if (killTexts.has(t)) continue; // remove
        out.push(b);
      }

      // Ensure ConnecTorq import exists once and points to correct file
      const wantText = "Snap-on ConnecTorq Import (Optional)";
      const wantTextNorm = normText(wantText);

      let hasConnecTorq = false;

      // Normalize any existing ConnecTorq button (if present) to correct href
      for (let i = 0; i < out.length; i++) {
        const b = out[i];
        if (!b) continue;
        const t = normText(b.text);
        if (t === wantTextNorm) {
          hasConnecTorq = true;
          out[i] = { text: wantText, href: "snapon_import.html" };
        }
      }

      if (!hasConnecTorq) {
        // Insert near bottom (before SOP if present, otherwise at end)
        const sopIdx = out.findIndex((b) => normText(b && b.text) === normText("Torque SOP"));
        const insertAt = sopIdx >= 0 ? sopIdx : out.length;
        out.splice(insertAt, 0, { text: wantText, href: "snapon_import.html" });
      }
    }

    // MEG: hide the red-circled items + ensure fluke paths are correct
    else if (formIdLc === "meg") {
      const killTexts = new Set([
        normText("LVT Meg Cover Sheet"),
        normText("Meg Report PDF"),
        normText("Fluke Export Embed (Optional)"),
        normText("Fluke Export Embed") // safety
      ]);

      for (const b of src) {
        if (!b) continue;
        const t = normText(b.text);
        if (killTexts.has(t)) continue; // remove
        out.push(b);
      }

      // Also normalize Fluke Import label variants to correct href
      for (let i = 0; i < out.length; i++) {
        const b = out[i];
        if (!b) continue;
        const t = normText(b.text);
        if (t === normText("Fluke Connect Import (Optional)") || t === normText("Fluke Connect Import")) {
          out[i] = { text: b.text || "Fluke Connect Import (Optional)", href: "fluke_import.html" };
        }
      }
    }

    // Others: keep as-is
    else {
      for (const b of src) out.push(b);
    }

    // De-dupe by normalized text + normalized href
    const finalButtons = [];
    for (const b of out) {
      if (!b) continue;
      const text = String(b.text || "Open");
      const href = String(b.href || "#");

      const key = normText(text) + "||" + normHref(href);
      if (seen.has(key)) continue;
      seen.add(key);

      finalButtons.push({ text, href });
    }

    return finalButtons;
  }

  // Render buttons
  const buttonsWrap = document.getElementById("buttons");
  if (buttonsWrap) {
    const sanitized = sanitizeButtons(id, cfg && cfg.buttons);

    buttonsWrap.innerHTML = "";
    sanitized.forEach((b) => {
      const a = document.createElement("a");
      a.className = "btn";
      a.textContent = b.text || "Open";
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

        // Keep tokens intact (PROCORE_PREFOD etc.)
        if (/^[A-Z0-9_]+$/.test(href) && !/\.html/i.test(href)) return;

        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;

        // Normalize bad torque import folder path (safety net)
        if (/\/torque\/snapon_import\.html$/i.test(url.pathname)) {
          url.pathname = url.pathname.replace(/\/torque\/snapon_import\.html$/i, "/snapon_import.html");
        }

        // Normalize bad meg/fluke folder paths (safety net)
        if (/\/meg\/fluke_import\.html$/i.test(url.pathname)) {
          url.pathname = url.pathname.replace(/\/meg\/fluke_import\.html$/i, "/fluke_import.html");
        }
        if (/\/meg\/fluke_export_embed\.html$/i.test(url.pathname)) {
          url.pathname = url.pathname.replace(/\/meg\/fluke_export_embed\.html$/i, "/fluke_export_embed.html");
        }

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
     STEP COMPLETE (WORKING)
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

    btn.style.display = "block";
    btn.style.pointerEvents = "auto";

    if (!cfg || !cfg.completedKey) {
      btn.style.display = "none";
      return;
    }

    if (btn.__nxBound) {
      setStepBtnLabel(btn);
      return;
    }
    btn.__nxBound = true;

    setStepBtnLabel(btn);

    btn.addEventListener("click", function (e) {
      try { e.preventDefault(); e.stopPropagation(); } catch(_) {}

      const next = !readCompleted();
      writeCompleted(next);
      setStepBtnLabel(btn);

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
