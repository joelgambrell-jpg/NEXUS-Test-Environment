// ======================================================
// NEXUS Brand Loader (Customer layer)
// - Keeps NEXUS platform branding
// - Allows customer-specific logo/name/theme/background
// ======================================================

(function(){
  const BRAND = window.NEXUS_BRAND || {};

  // Title (preserve NEXUS)
  if (BRAND.companyName) {
    document.title = BRAND.companyName + " | " + (document.title || "NEXUS");
  }

  // Customer name placeholders
  document.querySelectorAll('[data-customer-name]').forEach(el => {
    el.textContent = BRAND.companyName || el.textContent;
  });

  // Customer logo placeholders
  if (BRAND.logo) {
    document.querySelectorAll('img.customer-logo').forEach(img => {
      img.src = BRAND.logo;
      img.alt = (BRAND.companyName || "Customer") + " Logo";
    });
  }

  // Theme vars
  if (BRAND.theme && BRAND.theme.primary) {
    document.documentElement.style.setProperty('--brand-primary', BRAND.theme.primary);
  }
  if (BRAND.theme && BRAND.theme.accent) {
    document.documentElement.style.setProperty('--brand-accent', BRAND.theme.accent);
  }

  // Optional background override
  if (BRAND.background) {
    document.body.style.backgroundImage = `url(${BRAND.background})`;
  }
})();
