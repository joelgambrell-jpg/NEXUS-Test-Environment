// config.js (FULL REPLACEMENT — completion keys aligned to equipment.html + safe defaults)

window.NEXUS_CONFIG = window.NEXUS_CONFIG || {};

window.NEXUS_CONFIG.BUTTONS = [
  { id: "rifBtn",    label: "Receipt Inspection Form",            href: "form.html?id=rif" },
  { id: "megBtn",    label: "Megohmmeter Testing",                href: "form.html?id=meg" },
  { id: "torqueBtn", label: "Torque Application",                 href: "form.html?id=torque" },
  { id: "l2Btn",     label: "L2 Installation Verification Form",  href: "form.html?id=l2" },
  { id: "prefodBtn", label: "Pre- Foreign Object and Debris",     href: "form.html?id=prefod" },
  { id: "fpvBtn",    label: "Finished Product Verification Photo",href: "form.html?id=fpv" }
];

window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS = window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS || [];

/* CRITICAL — MUST MATCH equipment.html KEYS EXACTLY */
window.FORMS = {
  rif: {
    title: "RIF",
    sectionTitle: "Receipt Inspection Form",
    completedKey: "rifCompleted",
    // Do NOT add a Procore button here because form.html already generates the working one.
    // Only include the additional No-Procore option.
    buttons: [
      { text: "RIF — No Procore", href: "rif_no_procore.html" }
    ]
  },

  meg:    { completedKey: "megCompleted" },

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

  l2:     { completedKey: "l2Completed" },
  prefod: { completedKey: "prefodCompleted" },
  fpv:    { completedKey: "fpvCompleted" }
};
