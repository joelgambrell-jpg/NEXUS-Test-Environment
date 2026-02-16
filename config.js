// config.js (FULL REPLACEMENT — completion keys aligned to equipment.html + safe defaults)
// NOTE: Preserves your existing structure and adds missing items so the dashboard + form.html stay consistent.

window.NEXUS_CONFIG = window.NEXUS_CONFIG || {};

window.NEXUS_CONFIG.BUTTONS = [
  { id: "rifBtn", label: "Receipt Inspection Form", href: "RIF.html" },
  { id: "megBtn", label: "Megohmmeter Testing", href: "meg.html" },              // added (dashboard has megBtn)
  { id: "torqueBtn", label: "Torque Application", href: "torque.html" },
  { id: "l2Btn", label: "L2 Installation Verification Form", href: "l2.html" },
  { id: "prefodBtn", label: "Pre- Foreign Object and Debris", href: "prefod.html" },
  { id: "fpvBtn", label: "Finished Product Verification Photo", href: "fpv_photo_capture.html" } // added (dashboard has fpvBtn)
];

window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS = window.NEXUS_CONFIG.SUPPORTING_DOCUMENTS || [];

/* CRITICAL — MUST MATCH equipment.html KEYS EXACTLY */
window.FORMS = {
  rif:    { completedKey: "rifCompleted" },
  meg:    { completedKey: "megCompleted" },
  torque: { completedKey: "torqueCompleted" },
  l2:     { completedKey: "l2Completed" },
  prefod: { completedKey: "prefodCompleted" },
  fpv:    { completedKey: "fpvCompleted" }
};
