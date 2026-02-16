import os, re, base64, pathlib

ROOT = pathlib.Path(".").resolve()

INJECT_SNIPPET = (
    '<script src="config/customer.config.js"></script>\n'
    '<script src="nexus-brand.js" defer></script>\n'
)

BLEND_BLOCK = r"""
/* =========================================================
   NEXUS Default Background (Blend Option A + C)
   Professional enterprise gradient + glass sheet
   ========================================================= */
:root{
  --brand-primary:#2f3e4f;
  --brand-accent:#4f6b88;
  --bg-gradient:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(0,0,0,0.18), transparent 50%),
    linear-gradient(135deg,
      #0f1720 0%,
      #2f3e4f 35%,
      #4f6b88 65%,
      #1c2836 100%
    );
  --sheet-bg: rgba(255,255,255,0.94);
  --sheet-blur: 10px;
}

body{
  background: var(--bg-gradient);
  background-attachment: fixed;
  background-size: cover;
  min-height:100vh;
}

/* Optional: apply glass style to common page panels if present */
.sheet, .paper, .panel, .container{
  background: var(--sheet-bg);
  backdrop-filter: blur(var(--sheet-blur));
  -webkit-backdrop-filter: blur(var(--sheet-blur));
  border-radius: 14px;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.35),
    0 4px 10px rgba(0,0,0,0.15);
}
""".strip()

CUSTOMER_CONFIG = """// ======================================================
// CUSTOMER CONFIG ONLY — SAFE TO EDIT
// ======================================================
window.NEXUS_BRAND = {
  companyName: "Your Company Name",
  logo: "assets/customer-logo.png",     // drop logo here
  background: "",                      // optional override image; leave blank to use default gradient
  theme: {
    primary: "#2f3e4f",
    accent: "#4f6b88"
  },
  links: {
    prefod: "",
    rif: "",
    torque: "",
    l2: ""
  }
};
"""

BRAND_LOADER = """// ======================================================
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
"""

TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2uQAAAAASUVORK5CYII="
)

def read_text(p: pathlib.Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        try:
            return p.read_text(encoding="utf-8-sig")
        except Exception:
            return p.read_text(encoding="latin-1", errors="ignore")

def write_text(p: pathlib.Path, s: str):
    p.write_text(s, encoding="utf-8")

def ensure_files():
    (ROOT / "config").mkdir(exist_ok=True)
    (ROOT / "assets").mkdir(exist_ok=True)

    cfg = ROOT / "config" / "customer.config.js"
    if not cfg.exists():
        write_text(cfg, CUSTOMER_CONFIG)

    brand = ROOT / "nexus-brand.js"
    if not brand.exists():
        write_text(brand, BRAND_LOADER)

    logo = ROOT / "assets" / "customer-logo.png"
    if not logo.exists():
        logo.write_bytes(TINY_PNG)

def update_css():
    css = ROOT / "nexus-core.css"
    if not css.exists():
        return
    s = read_text(css)
    if "NEXUS Default Background (Blend Option A + C)" in s:
        return
    write_text(css, s.rstrip() + "\n\n" + BLEND_BLOCK + "\n")

def inject_into_html():
    for p in ROOT.rglob("*.html"):
        s = read_text(p)
        if "config/customer.config.js" in s and "nexus-brand.js" in s:
            continue
        m = re.search(r"</head\s*>", s, flags=re.IGNORECASE)
        if not m:
            continue
        s2 = s[:m.start()] + INJECT_SNIPPET + s[m.start():]
        write_text(p, s2)

def de_ace():
    # Replace ACE tokens and ACE sharepoint URLs in text files
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        ext = p.suffix.lower()
        if ext in {".png",".jpg",".jpeg",".gif",".webp",".pdf",".zip",".ico"}:
            continue

        s = read_text(p)
        orig = s

        # Remove ACE sharepoint domain
        s = re.sub(r"https://aceelectricnet\.sharepoint\.com/[^\s\"']*",
                   "https://YOUR_COMPANY_DOCUMENT_PORTAL_URL_HERE",
                   s, flags=re.IGNORECASE)

        # Replace whole-word ACE in non-JS (safer)
        if ext == ".js":
            s = s.replace("ACE", "CUSTOMER").replace("Ace", "Customer")
        else:
            s = re.sub(r"\bACE\b", "CUSTOMER", s, flags=re.IGNORECASE)

        if s != orig:
            write_text(p, s)

def main():
    ensure_files()
    update_css()
    inject_into_html()
    de_ace()
    print("Done. Customer-ready updates applied.")

if __name__ == "__main__":
    main()
