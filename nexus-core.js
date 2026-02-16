/* NEXUS core helpers (HTML-only). Safe defaults; no-op unless pages opt-in. */
(function(){
  const ROLE_ORDER = ["viewer","tech","foreman","superintendent","admin"];
  function roleIndex(r){ return Math.max(0, ROLE_ORDER.indexOf((r||"viewer").toLowerCase())); }

  window.NEXUS = window.NEXUS || {};

  // ---------- Safe JSON helpers ----------
  function safeJSONParse(raw, fallback){
    try{ return JSON.parse(raw); }catch(e){ return (fallback===undefined)?null:fallback; }
  }
  window.NEXUS.safeJSONParse = function(raw, fallback){ return safeJSONParse(raw, fallback); };
  window.NEXUS.readJSON = function(key, fallback){
    try{
      var raw = localStorage.getItem(key);
      if(!raw) return (fallback===undefined)?{}:fallback;
      var v = safeJSONParse(raw, null);
      return (v && typeof v === "object") ? v : ((fallback===undefined)?{}:fallback);
    }catch(e){ return (fallback===undefined)?{}:fallback; }
  };
  function looksLikeUrl(v){
    v = (v||"").toString().trim();
    return /^https?:\/\//i.test(v);
  }
  function deepFindFirstUrl(obj, predicate){
    try{
      if(!obj || typeof obj!=="object") return "";
      for(const k in obj){
        if(!Object.prototype.hasOwnProperty.call(obj,k)) continue;
        const v = obj[k];
        if(typeof v==="string"){
          const s=v.trim();
          if(looksLikeUrl(s) && (!predicate || predicate(k,s))) return s;
        }else if(v && typeof v==="object"){
          const found = deepFindFirstUrl(v, predicate);
          if(found) return found;
        }
      }
    }catch(e){}
    return "";
  }
  // Resolve known tokens to URLs (e.g., PROCORE_PREFOD)
  window.NEXUS.resolveLinkToken = function(token, eq){
    token = (token||"").toString().trim();
    if(!token) return "";
    if(!/^PROCORE_/i.test(token)) return "";
    eq = (eq||window.NEXUS.getEq&&window.NEXUS.getEq()||"").toString().trim();
    // Prefer per-equipment meta
    if(eq){
      const meta = window.NEXUS.readJSON("nexus_meta_" + eq, {});
      // Most specific keys first
      const keyMap = {
        "PROCORE_PREFOD": ["prefodProcoreUrl","prefod_procore_url","prefodProcore","procorePrefodUrl","procore_prefod_url","procoreEquipUrl","procoreUrl","procore","procore_url"],
        "PROCORE_RIF": ["rifProcoreUrl","rif_procore_url","procoreRifUrl","procore_rif_url","procoreEquipUrl","procoreUrl","procore","procore_url"],
        "PROCORE_L2": ["l2ProcoreUrl","l2_procore_url","procoreL2Url","procore_l2_url","procoreEquipUrl","procoreUrl","procore","procore_url"],
        "PROCORE_ENERG": ["energizationProcoreUrl","energization_procore_url","procoreEnergizationUrl","procore_energization_url","procoreEquipUrl","procoreUrl","procore","procore_url"]
      };
      const keys = keyMap[token.toUpperCase()] || ["procoreEquipUrl","procoreUrl","procore","procore_url"];
      for(const k of keys){
        const v = (meta && meta[k]) ? String(meta[k]).trim() : "";
        if(looksLikeUrl(v)) return v;
      }
      const deep = deepFindFirstUrl(meta, (k,v)=>/procore/i.test(k)||/procore/i.test(v));
      if(deep) return deep;
      // Next, equipment record
      const rec = window.NEXUS.readJSON("nexus_equipment_" + eq, {});
      const direct = (rec.procore||rec.procoreUrl||rec.procore_url||"").toString().trim();
      if(looksLikeUrl(direct)) return direct;
      const deep2 = deepFindFirstUrl(rec, (k,v)=>/procore/i.test(k)||/procore/i.test(v));
      if(deep2) return deep2;
    }
    // Global fallbacks
    const globals = ["nexus_procore_url","nx_procore_url","procore_url","procoreUrl","procore"];
    for(const g of globals){
      try{
        const v = (localStorage.getItem(g)||"").trim();
        if(looksLikeUrl(v)) return v;
      }catch(e){}
    }
    return "https://login.procore.com/";
  };

  window.NEXUS.getEq = function(){
    const qs = new URLSearchParams(location.search);
    return (qs.get("eq") || "").trim();
  };
  window.NEXUS.getRole = function(){
    try{
      return ((localStorage.getItem("nexus_userRole") || localStorage.getItem("nexus_role") || "viewer")).toLowerCase();
    }catch(e){ return "viewer"; }
  };
  window.NEXUS.roleAtLeast = function(minRole){
    return roleIndex(window.NEXUS.getRole()) >= roleIndex(minRole);
  };
  window.NEXUS.setRole = function(r){
    try{ localStorage.setItem("nexus_userRole",(r||"viewer").toLowerCase());
      localStorage.setItem("nexus_role",(r||"viewer").toLowerCase()); }catch(e){}
    window.dispatchEvent(new CustomEvent("nexus:rolechange",{detail:{role:window.NEXUS.getRole()}}));
  };

  window.NEXUS.audit = function(type, payload){
    try{
      const eq = window.NEXUS.getEq() || "NO_EQ";
      const key = `nexus_audit_${eq}`;
      const arr = safeJSONParse(localStorage.getItem(key) || "[]", [] ) || [];
      arr.push({ type, payload: payload || {}, at: new Date().toISOString(), page: location.pathname.split("/").pop() });
      localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){}
  };

  // Dirty/autosave (only if page sets window.NEXUS_saveNow = function() Promise|void )
  let dirty = false;
  let lastSavedAt = null;

  window.NEXUS.markDirty = function(){
    dirty = true;
    window.dispatchEvent(new CustomEvent("nexus:dirty",{detail:{dirty:true}}));
  };
  window.NEXUS.markSaved = function(){
    dirty = false;
    lastSavedAt = new Date();
    window.dispatchEvent(new CustomEvent("nexus:saved",{detail:{dirty:false, lastSavedAt:lastSavedAt.toISOString()}}));
  };

  function fmtTime(d){
    try{ return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }catch(e){ return ""; }
  }

  function updateBanner(){
    const el = document.getElementById("nxSessionBanner");
    if(!el) return;
    const eq = window.NEXUS.getEq();
    const role = window.NEXUS.getRole();
    const roleEl = el.querySelector("[data-nx-role]");
    const eqEl = el.querySelector("[data-nx-eq]");
    const stEl = el.querySelector("[data-nx-status]");
    if(eqEl) eqEl.textContent = eq || "(none)";
    if(roleEl) roleEl.textContent = role;
    if(stEl){
      if(dirty) stEl.textContent = "Unsaved changes";
      else if(lastSavedAt) stEl.textContent = "Saved locally at " + fmtTime(lastSavedAt);
      else stEl.textContent = "Ready";
    }

    // role gating via data-min-role
    document.querySelectorAll("[data-min-role]").forEach(node=>{
      const need = (node.getAttribute("data-min-role")||"viewer").toLowerCase();
      const ok = window.NEXUS.roleAtLeast(need);
      if(node.hasAttribute("data-min-role-hide")){
        node.style.display = ok ? "" : "none";
      }else{
        node.disabled = !ok;
        node.setAttribute("aria-disabled", (!ok).toString());
        node.style.opacity = ok ? "" : "0.5";
        node.style.pointerEvents = ok ? "" : "none";
      }
    });
  }

  window.addEventListener("nexus:dirty", updateBanner);
  window.addEventListener("nexus:saved", updateBanner);
  window.addEventListener("nexus:rolechange", updateBanner);

  document.addEventListener("input", function(e){
    const t = e.target;
    if(!t) return;
    if(t.matches("input,select,textarea,[contenteditable='true']")){
      window.NEXUS.markDirty();
    }
  }, true);

  // Autosave: every 15s if dirty and save hook exists.
  setInterval(async function(){
    if(!dirty) return;
    if(typeof window.NEXUS_saveNow !== "function") return;
    try{
      await window.NEXUS_saveNow({ autosave:true });
      window.NEXUS.markSaved();
    }catch(e){
      // keep dirty
    }
  }, 15000);

  
  // Back routing helper (consistent across pages)
  // Behavior:
  // - If referrer is same-origin, use history.back()
  // - Else go to equipment.html (preserving ?eq=) and fall back to index.html
  window.NEXUS.equipmentUrl = function(){
    const qs = new URLSearchParams(location.search);
    const eq = (qs.get("eq") || "").trim();
    return eq ? `equipment.html?eq=${encodeURIComponent(eq)}` : "equipment.html";
  };
  window.NEXUS_back = function(){
    try{
      if (document.referrer){
        const ref = new URL(document.referrer);
        if (ref.origin === location.origin){
          history.back();
          return false;
        }
      }
    }catch(e){}
    try{
      location.href = window.NEXUS.equipmentUrl();
    }catch(e){
      location.href = "index.html";
    }
    return false;
  };

  document.addEventListener("DOMContentLoaded", function(){ updateBanner(); try{window.NEXUS_FIREBASE && typeof window.NEXUS_FIREBASE.syncRole==="function" && window.NEXUS_FIREBASE.syncRole();}catch(e){} });
  // ---------- Link patcher (adds eq/rif/jobId across internal links + resolves tokens) ----------
  function patchLinks(){
    try{
      if(!window.NEXUS || !window.NEXUS.getEq) return;
      const qs = new URLSearchParams(location.search);
      const eq = (qs.get("eq") || "").trim();
      const rif = (qs.get("rif") || "").trim();
      const jobId = (qs.get("jobId") || qs.get("building") || qs.get("job") || "").trim();

      document.querySelectorAll("a[href]").forEach(a=>{
        try{
          let href = a.getAttribute("href");
          if(!href) return;

          // Resolve tokens like PROCORE_PREFOD
          if(/^PROCORE_/i.test(href.trim())){
            const resolved = window.NEXUS.resolveLinkToken(href.trim(), eq);
            if(resolved){
              a.setAttribute("href", resolved);
              a.setAttribute("target","_blank");
              a.setAttribute("rel","noopener");
              return;
            }
          }

          // Skip anchors / external / mailto / js
          if(/^#/.test(href) || /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^javascript:/i.test(href)) return;

          const url = new URL(href, location.href);
          if(url.origin !== location.origin) return;

          if(eq && !url.searchParams.get("eq")) url.searchParams.set("eq", eq);
          if(rif && !url.searchParams.get("rif")) url.searchParams.set("rif", rif);
          if(jobId && !url.searchParams.get("jobId")) url.searchParams.set("jobId", jobId);

          a.setAttribute("href", url.pathname + url.search + url.hash);
        }catch(e){}
      });
    }catch(e){}
  }

  if(!window.NEXUS.__linkPatcherInstalled){
    window.NEXUS.__linkPatcherInstalled = true;
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", patchLinks);
    else patchLinks();
    try{
      const obs = new MutationObserver(patchLinks);
      obs.observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  }

})();