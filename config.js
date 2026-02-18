// config.js (FULL REPLACEMENT — restores missing task buttons for form.html + aligns dashboard hrefs)
// NOTE: Keeps your existing structure style; adds rif buttons so form.html can render them.

window.NEXUS_CONFIG = window.NEXUS_CONFIG || {};

window.NEXUS_CONFIG.BUTTONS = [
  // Dashboard buttons should route into the shared renderer (form.html) so tasks/buttons are consistent
  { id: "rifBtn",    label: "Receipt Inspection Form",                  href: "form.html?id=rif" },
  { id: "megBtn",    label: "Megohmmeter Testing",                      href: "form.html?id=meg" },
  { id: "torqueBtn", label: "Torque Application",                       href: "form.html?id=torque" },
  { id: "l2Btn",     label: "L2 Installation Verification Form",         href: "form.html?id=l2" },
  { id: "prefodBtn", label: "Pre- Foreign Object and Debris",            href: "form.html?id=prefod" },
  { id: "fpvBtn",    label: "Finished Product Verification Photo",       href: "form.html?id=fpv" }
];

window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS = window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS || [];

/* CRITICAL — MUST MATCH equipment.html KEYS EXACTLY */
window.FORMS = {
  rif: {
    title: "RIF",
    sectionTitle: "Receipt Inspection Form",
    completedKey: "rifCompleted",
    buttons: [
      // If your Procore URL is handled inside form.html/app.js, keep this as-is.
      // If form.html expects a hard URL, replace href with the full Procore link/token you use there.
      { text: "RIF — Procore",     href: "PROCORE_RIF" },

      // Standalone “No Procore” RIF page you added (supports ?eq=... and auto-generates ?rif=...)
      { text: "RIF — No Procore",  href: "rif_no_procore.html" }
    ]
  },

  meg: {
    title: "Meg",
    sectionTitle: "Megohmmeter Testing",
    completedKey: "megCompleted"
    // (leave buttons undefined if you want meg to use whatever your renderer already provides)
  },

  torque: {
    title: "Torque",
    sectionTitle: "Torque Tools",
    completedKey: "torqueCompleted",
    buttons: [
      { text: "Torque Application Log",     href: "torque_log.html" },
      { text: "Tilt Test",                 href: "torque_log.html#tilt" },
      { text: "Snap-on Import (Optional)", href: "torque/snapon_import.html" },
      { text: "Torque SOP",                href: "torque_sop.html" }
    ]
  },

  l2: {
    title: "L2",
    sectionTitle: "L2 Installation Verification",
    completedKey: "l2Completed"
  },

  prefod: {
    title: "Pre-FOD",
    sectionTitle: "Pre-FOD",
    completedKey: "prefodCompleted"
  },

  fpv: {
    title: "FPV",
    sectionTitle: "Finished Product Verification Photo",
    completedKey: "fpvCompleted"
  }
};
