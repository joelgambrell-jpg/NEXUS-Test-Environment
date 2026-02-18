// config.js — FULL DROP-IN (NEXUS form renderer safe config)
//
// SINGLE FIX ONLY:
// - Adds back the L2 — Procore button (does not remove anything else).

window.NEXUS_CONFIG = window.NEXUS_CONFIG || {};

/* ----------------------------------------------------------
   DASHBOARD BUTTONS (equipment.html)
   These route INTO form.html which then loads the task set
-----------------------------------------------------------*/
window.NEXUS_CONFIG.BUTTONS = [
  { id: "rifBtn",    label: "Receipt Inspection Form",             href: "form.html?id=rif" },
  { id: "megBtn",    label: "Megohmmeter Testing",                 href: "form.html?id=meg" },
  { id: "torqueBtn", label: "Torque Application",                  href: "form.html?id=torque" },
  { id: "l2Btn",     label: "L2 Installation Verification Form",   href: "form.html?id=l2" },
  { id: "prefodBtn", label: "Pre-Foreign Object & Debris",         href: "form.html?id=prefod" },
  { id: "fpvBtn",    label: "Finished Product Verification Photo", href: "form.html?id=fpv" }
];

window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS =
  window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS || [];


/* ----------------------------------------------------------
   FORM DEFINITIONS
   IMPORTANT:
   form.html/app.js auto-injects some buttons.
   DO NOT duplicate them here or you get double buttons.
-----------------------------------------------------------*/

window.FORMS = {

  /* ===================== RIF ===================== */
  rif: {
    title: "RIF",
    sectionTitle: "Receipt Inspection Form",
    completedKey: "rifCompleted",

    // NOTE:
    // - app.js/form.html already generates a working "RIF — Procore" button.
    // - If you add another Procore here, you will see 2, and one may 404 depending on href.
    // Therefore: keep only No-Procore + SOP here.
    buttons: [
      { text: "RIF — No Procore", href: "rif_no_procore.html" },
      { text: "RIF SOP", href: "rif_sop.html" }
    ]
  },


  /* ===================== MEG ===================== */
  meg: {
    title: "Megohmmeter Testing",
    sectionTitle: "Megohmmeter",
    completedKey: "megCompleted",

    // form.html/app.js already auto-adds:
    // - Megohmmeter SOP
    // - Fluke Connect Import (Optional)
    // Keep ONLY what you want shown from config:
    buttons: [
      { text: "Meg Log", href: "meg_log.html" }
    ]
  },


  /* ===================== TORQUE ===================== */
  torque: {
    title: "Torque",
    sectionTitle: "Torque Tools",
    completedKey: "torqueCompleted",
    buttons: [
      { text: "Torque Application Log",     href: "torque_log.html" },
      { text: "Tilt Test",                  href: "torque_log.html#tilt" },
      { text: "Snap-on Import (Optional)",  href: "snapon_import.html" },
      { text: "Torque SOP",                 href: "torque_sop.html" }
    ]
  },


  /* ===================== L2 ===================== */
  l2: {
    title: "L2 Verification",
    completedKey: "l2Completed",
    buttons: [
      // SINGLE FIX: add back Procore link
      { text: "L2 — Procore", href: "l2.html" },

      // existing button preserved
      { text: "L2 — No Procore", href: "l2_no_procore.html" }
    ]
  },


  /* ===================== PREFOD ===================== */
  prefod: {
    title: "Pre-FOD",
    completedKey: "prefodCompleted",
    buttons: [
      { text: "Pre-FOD Checklist", href: "prefod_checklist.html" },
      { text: "Pre-FOD SOP", href: "prefod_sop.html" }
    ]
  },


  /* ===================== FPV ===================== */
  fpv: {
    title: "Finished Product Verification",
    completedKey: "fpvCompleted",
    buttons: [
      { text: "Capture FPV Photo", href: "fpv_photo_capture.html" }
    ]
  }
};
