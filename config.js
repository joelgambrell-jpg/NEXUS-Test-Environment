// config.js — FULL DROP-IN (NEXUS form renderer safe config)

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
   form.html auto-injects some buttons.
   DO NOT duplicate them here or you get double buttons.
-----------------------------------------------------------*/

window.FORMS = {

  /* ===================== RIF ===================== */
  rif: {
    title: "RIF",
    sectionTitle: "Receipt Inspection Form",
    completedKey: "rifCompleted",

    // Procore button is auto-created by form.html → DO NOT ADD HERE
    buttons: [
      { text: "RIF — No Procore", href: "rif_no_procore.html" }
    ]
  },


  /* ===================== MEG ===================== */
  meg: {
    title: "Megohmmeter Testing",
    sectionTitle: "Megohmmeter",
    completedKey: "megCompleted",

    // form.html already auto-adds:
    // - Megohmmeter SOP
    // - Fluke Connect Import (Optional)
    // Only include what you want shown in the tile list:
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
