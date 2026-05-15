/* =========================================================================
   Jiang Lab @ SISU — main.js
   - i18n (zh/en), default zh
   - Header/footer injection
   - Page renderers: home, people, projects, publications, facilities, news
   ========================================================================= */

(function () {
  "use strict";

  const I18N = {
    current: localStorage.getItem("jianglab_lang") || "zh",
    data: null,
    cache: { zh: null, en: null }
  };

  // Patterns to bold across pub author strings. Loaded from people.json
  // (`author_patterns` array of regex source strings) so adding a member
  // = one JSON entry, no code change.
  let LAB_AUTHOR_PATTERNS = null;

  function $(s, el = document) { return el.querySelector(s); }
  function $$(s, el = document) { return Array.from(el.querySelectorAll(s)); }
  function get(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  async function loadJSON(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error("Fetch failed: " + path);
    return r.json();
  }

  async function ensureAuthorPatterns() {
    if (LAB_AUTHOR_PATTERNS) return LAB_AUTHOR_PATTERNS;
    try {
      const data = await loadJSON("assets/data/people.json");
      const patterns = (data.author_patterns || []).map(p => new RegExp(p, "g"));
      LAB_AUTHOR_PATTERNS = patterns.length ? patterns : [
        /(Jiang,\s?X\.?(\s?M\.?)?|Jiang,\s?Xiaoming|X\.?\s?M?\.?\s?Jiang|Xiaoming Jiang)/g
      ];
    } catch {
      LAB_AUTHOR_PATTERNS = [
        /(Jiang,\s?X\.?(\s?M\.?)?|Jiang,\s?Xiaoming|X\.?\s?M?\.?\s?Jiang|Xiaoming Jiang)/g
      ];
    }
    return LAB_AUTHOR_PATTERNS;
  }

  function boldLabAuthors(s, cls) {
    if (!s || !LAB_AUTHOR_PATTERNS) return s;
    let out = s;
    LAB_AUTHOR_PATTERNS.forEach(re => {
      out = out.replace(re, `<span class="${cls || "me"}">$&</span>`);
    });
    return out;
  }

  /* ── Language ─────────────────────────────────────────── */
  async function loadLang(lang) {
    if (I18N.cache[lang]) return I18N.cache[lang];
    const data = await loadJSON(`assets/data/i18n-${lang}.json`);
    I18N.cache[lang] = data;
    return data;
  }
  async function applyLang(lang) {
    I18N.current = lang;
    localStorage.setItem("jianglab_lang", lang);
    I18N.data = await loadLang(lang);
    $$("[data-i18n]").forEach(el => {
      const val = get(I18N.data, el.getAttribute("data-i18n"));
      if (val != null) el.innerHTML = val;
    });
    $$("[data-i18n-attr]").forEach(el => {
      const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
      const val = get(I18N.data, key);
      if (val != null) el.setAttribute(attr, val);
    });
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }
  function toggleLang() { applyLang(I18N.current === "zh" ? "en" : "zh"); }
  window.toggleLang = toggleLang;

  /* ── Header / footer ──────────────────────────────────── */
  function buildHeader(activePage) {
    return `
      <div id="brand-strip">
        <div class="brand-inner">
          <a class="brand-sisu" href="https://en.shisu.edu.cn/" target="_blank" rel="noopener noreferrer" aria-label="Shanghai International Studies University">
            <img src="assets/images/logos/sisu-brand.png" alt="上海外国语大学 Shanghai International Studies University">
          </a>
          <div class="brand-divider"></div>
          <a class="brand-lab" href="index.html">
            <span data-i18n="brand.lab_name">心理与神经语言学研究中心</span>
          </a>
          <div class="brand-controls">
            <button class="dark-toggle" type="button" onclick="toggleDark()"
                    title="Toggle dark mode" aria-label="Toggle dark mode">
              <i class="ph-light ph-moon"></i>
            </button>
            <a class="brand-lang" href="#" onclick="event.preventDefault(); toggleLang(); return false;" data-i18n="lang_switch_to">EN</a>
          </div>
        </div>
      </div>

      <nav id="nav-bar" aria-label="Primary">
        <div class="nav-inner">
          <ul id="nav-links">
            <li${activePage === "home" ? ' class="active"' : ""}><a href="index.html"><i class="ph-light ph-house home-icon"></i><span data-i18n="nav.home">首页</span></a></li>
            <li${activePage === "people" ? ' class="active"' : ""}><a href="people.html" data-i18n="nav.people">团队与合作</a></li>
            <li${activePage === "projects" ? ' class="active"' : ""}><a href="projects.html" data-i18n="nav.projects">研究方向</a></li>
            <li${activePage === "publications" ? ' class="active"' : ""}><a href="publications.html" data-i18n="nav.publications">发表论文</a></li>
            <li${activePage === "facilities" ? ' class="active"' : ""}><a href="facilities.html" data-i18n="nav.facilities">实验平台</a></li>
            <li${activePage === "contact" ? ' class="active"' : ""}><a href="contact.html" data-i18n="nav.contact">联系我们</a></li>
          </ul>
          <button id="nav-hamburger" onclick="document.getElementById('nav-links').classList.toggle('open')" aria-label="Menu"><i class="ph-light ph-list"></i></button>
        </div>
      </nav>

    `;
  }

  function buildFooter() {
    return `
      <div id="footer">
        <div class="footer-banner">
          <a href="https://ilas-en.shisu.edu.cn/" target="_blank" rel="noopener noreferrer"
             aria-label="Institute of Language Sciences (English site)">
            <img src="assets/images/logos/ilas-foot.svg" alt="Institute of Language Sciences"
                 onerror="this.style.display='none'">
          </a>
        </div>
        <div class="footer-inner">
          <div class="footer-school">
            <p class="footer-school-address" data-i18n="footer.school_address">5 教楼 101 室<br>文翔路 1550 号<br>上海市 松江区<br>中国 201620</p>
          </div>
          <ul class="footer-links">
            <li>
              <a href="https://www.shisu.edu.cn/"
                 data-i18n="footer.link_sisu_label"
                 data-i18n-attr="href:footer.link_sisu_url"
                 target="_blank" rel="noopener noreferrer">SISU 官网</a>
            </li>
            <li>
              <a href="https://ilas.shisu.edu.cn/"
                 data-i18n="footer.link_ilas_label"
                 data-i18n-attr="href:footer.link_ilas_url"
                 target="_blank" rel="noopener noreferrer">ILAS 院网</a>
            </li>
            <li>
              <a href="https://github.com/xmjiang-lab/xmjiang-lab.github.io"
                 data-i18n="footer.link_github_label"
                 target="_blank" rel="noopener noreferrer">网站源码 →</a>
            </li>
          </ul>
        </div>
      </div>
      <div id="subfooter">
        <div class="subfooter-inner">
          <span class="subfooter-copyright" data-i18n="footer.copyright">© 2026 蒋晓鸣课题组 · 上海外国语大学 · 保留所有权利</span>
          <span id="footer-last-updated" class="footer-last-updated"></span>
        </div>
      </div>
    `;
  }

  /* ── Sidebar (home) - News cards ─────────────────────── */
  async function renderSidebar() {
    const root = $("#sidebar");
    if (!root) return;

    let cards = "";
    try {
      const news = await loadJSON("assets/data/news.json");
      const items = (news.items || []).slice(0, 3);   // top-3 newest
      const lang = I18N.current;

      cards = items.map(n => {
        const title   = lang === "zh" ? (n.title_zh   || n.title_en) : (n.title_en   || n.title_zh);
        const summary = lang === "zh" ? (n.summary_zh || n.summary_en) : (n.summary_en || n.summary_zh);
        const tag     = lang === "zh" ? (n.tag_zh     || n.tag_en) : (n.tag_en     || n.tag_zh);
        const readLabel = lang === "zh" ? "阅读全文" : "Read more";
        // Use the dedicated news link if present, else point at news.html
        const href = n.link || "news.html";
        return `
          <article class="news-mini-card${n.featured ? ' featured' : ''}">
            ${tag ? `<div class="news-mini-tag">${tag}</div>` : ""}
            <div class="news-mini-title">${title || ""}</div>
            ${summary ? `<p class="news-mini-summary">${summary}</p>` : ""}
            <a class="news-mini-more" href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${readLabel} →</a>
          </article>
        `;
      }).join("");
    } catch { /* no news.json - leave empty */ }

    const headingTitle = I18N.current === "zh" ? "焦点动态" : "Spotlight";
    const allLinkLabel = I18N.current === "zh" ? "全部 →" : "View all →";

    root.innerHTML = `
      <h3 class="sidebar-news-heading">${headingTitle}</h3>
      ${cards || `<p style="color:#888;font-style:italic;font-size:0.875rem;">${I18N.current === "zh" ? "暂无动态。" : "No updates yet."}</p>`}
      <a class="full-link" href="news.html">${allLinkLabel}</a>
    `;
  }

  /* ── People ───────────────────────────────────────────── */
  async function renderPeople() {
    const root = $("#people-content");
    if (!root) return;
    const data = await loadJSON("assets/data/people.json");
    const lang = I18N.current;

    function roleLabel(role) {
      return get(I18N.data, `people.${role}`) || role;
    }

    function personCard(p) {
      const role = (p.role || "").toLowerCase();
      const isPI = role === "pi";
      const isAlumni = (p.status || "").toLowerCase() === "alumni";

      const name      = lang === "zh" ? (p.name_zh             || p.name_en)             : (p.name_en             || p.name_zh);
      const title     = lang === "zh" ? (p.title_zh            || "")                    : (p.title_en            || "");
      const secondary = lang === "zh" ? (p.secondary_title_zh  || "")                    : (p.secondary_title_en  || "");
      const affil     = lang === "zh" ? (p.affil_zh            || "")                    : (p.affil_en            || "");
      const bio       = lang === "zh" ? (p.bio_zh              || "")                    : (p.bio_en              || "");

      const photoSrc = p.photo ? `assets/images/people/${p.photo}` : "";
      const initial = (name || "?").charAt(0);
      const photoEl = photoSrc
        ? `<img src="${photoSrc}" alt="${name}" onerror="this.outerHTML='<div class=&quot;photo-placeholder&quot;>${initial}</div>'">`
        : `<div class="photo-placeholder">${initial}</div>`;

      // Links: only show what's filled in; one badge per link.
      // PI's email link is intentionally suppressed — email is reachable only
      // via the contact page (parallel to footer + homepage email stripping).
      const links = [];
      if (p.homepage)     links.push(`<a class="ln-home"    href="${p.homepage}" target="_blank" rel="noopener noreferrer">${lang === "zh" ? "个人主页" : "Homepage"}</a>`);
      if (p.orcid)        links.push(`<a class="ln-orcid"   href="https://orcid.org/${p.orcid}" target="_blank" rel="noopener noreferrer">ORCID</a>`);
      if (p.scholar)      links.push(`<a class="ln-scholar" href="${p.scholar}" target="_blank" rel="noopener noreferrer">Google Scholar</a>`);
      if (p.researchgate) links.push(`<a class="ln-rg"      href="${p.researchgate}" target="_blank" rel="noopener noreferrer">ResearchGate</a>`);
      if (p.email && !isPI) links.push(`<a class="ln-mail"    href="mailto:${p.email}">${p.email}</a>`);

      const educationLabel = lang === "zh" ? "学业与履历" : "Education & career";
      const researchLabel  = lang === "zh" ? "研究方向"   : "Research areas";
      const nowLabel       = lang === "zh" ? "现在"      : "Currently";
      const periodLabel    = lang === "zh" ? "在课题组时间" : "Period in lab";

      // Role badge for student-tier members (top-right of card)
      const badgeMap = lang === "zh"
        ? { phd: "博士", master: "硕士", undergrad: "本科" }
        : { phd: "PhD", master: "MA", undergrad: "Undergrad" };
      const roleBadge = badgeMap[role]
        ? `<span class="role-badge role-${role}">${badgeMap[role]}</span>`
        : "";

      // Education / research_areas: prefer the _zh variant when language is
      // Chinese, fall back to the English string if the _zh field is empty.
      // (Members migrated before the i18n bio columns existed will have only
      // the English string — the fallback keeps them readable.)
      const eduText = lang === "zh"
        ? (p.education_zh || p.education || "")
        : (p.education || "");
      const researchText = lang === "zh"
        ? (p.research_areas_zh || p.research_areas || "")
        : (p.research_areas || "");

      // Compact details for alumni: just period + current position
      const detailsHtml = isAlumni
        ? `
            ${p.period ? `<div class="person-row-label">${periodLabel}</div><p>${p.period}</p>` : ""}
            ${p.now ? `<div class="person-row-label">${nowLabel}</div><p>${p.now}</p>` : ""}
            ${links.length ? `<div class="person-links">${links.join("")}</div>` : ""}
          `
        : `
            ${bio ? `<p class="person-bio">${bio}</p>` : ""}
            ${eduText ? `<div class="person-row-label">${educationLabel}</div><div class="person-education">${formatEducation(eduText)}</div>` : ""}
            ${researchText ? `<div class="person-row-label">${researchLabel}</div><p>${researchText}</p>` : ""}
            ${p.now ? `<div class="person-row-label">${nowLabel}</div><p>${p.now}${p.period ? ` <span style="opacity:0.6;">(${p.period})</span>` : ""}</p>` : ""}
            ${links.length ? `<div class="person-links">${links.join("")}</div>` : ""}
          `;

      // PI: card is always-expanded (no button), wider layout, no role badge
      if (isPI) {
        return `
          <div class="person-card person-pi expanded">
            <div class="person-pi-header">
              <div class="person-photo">${photoEl}</div>
              <div class="person-meta">
                <div class="person-name">${name}</div>
                ${title ? `<div class="person-title">${title}</div>` : ""}
                ${secondary ? `<div class="person-title person-title-secondary">${secondary}</div>` : ""}
                ${affil ? `<div class="person-affil">${affil}</div>` : ""}
              </div>
            </div>
            <div class="person-details">${detailsHtml}</div>
          </div>
        `;
      }

      // Non-PI: clickable to expand. Role badge top-right for students.
      return `
        <div class="person-card${isAlumni ? ' person-alumni' : ''}" data-id="${p.id || ""}">
          ${roleBadge}
          <button class="person-avatar-btn" type="button"
                  onclick="this.closest('.person-card').classList.toggle('expanded')"
                  aria-expanded="false">
            <div class="person-photo">${photoEl}</div>
            <div class="person-meta">
              <div class="person-name">${name}</div>
              ${title ? `<div class="person-title">${title}</div>` : ""}
              ${secondary ? `<div class="person-title person-title-secondary">${secondary}</div>` : ""}
              ${affil ? `<div class="person-affil">${affil}</div>` : ""}
            </div>
            <div class="person-toggle-hint" aria-hidden="true">▾</div>
          </button>
          <div class="person-details">${detailsHtml}</div>
        </div>
      `;
    }

    // Format education as a clean list. Input: "BA, X | MA, Y | PhD, Z"
    function formatEducation(edu) {
      if (!edu) return "";
      const lines = edu.split("|").map(s => s.trim()).filter(Boolean);
      if (lines.length <= 1) return `<p>${edu}</p>`;
      return `<ul class="person-education-list">${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
    }

    // Group current members by role
    const ROLES_PRESENT = ["pi", "postdoc", "ra", "visiting"];           // show only if non-empty
    // Students (phd / master / undergrad) are merged into a single
    // "Current students" section below.
    const byRole = {};
    (data.current || []).forEach(p => {
      const r = (p.role || "other").toLowerCase();
      (byRole[r] = byRole[r] || []).push(p);
    });

    // Build a placeholder card: avatar with role-specific initial, "Student N", grey muted
    function placeholderCard(role, idx) {
      const labelByRole = {
        phd:       lang === "zh" ? "博士研究生" : "Ph.D. Student",
        master:    lang === "zh" ? "硕士研究生" : "M.A. Student",
        undergrad: lang === "zh" ? "本科生"     : "Undergraduate",
      };
      const tbd = lang === "zh" ? "招生中" : "Recruiting";
      const tip = lang === "zh" ? "成员信息更新中" : "Profile coming soon";
      const badgeMap = lang === "zh"
        ? { phd: "博士", master: "硕士", undergrad: "本科" }
        : { phd: "PhD", master: "MA", undergrad: "Undergrad" };
      const roleBadge = badgeMap[role]
        ? `<span class="role-badge role-${role}">${badgeMap[role]}</span>`
        : "";
      return `
        <div class="person-card person-placeholder" aria-hidden="true">
          ${roleBadge}
          <div class="person-placeholder-inner">
            <div class="person-photo"><div class="photo-placeholder placeholder-dim">${idx}</div></div>
            <div class="person-meta">
              <div class="person-name placeholder-dim-text">${labelByRole[role] || role} ${idx}</div>
              <div class="person-title placeholder-tag">${tbd}</div>
              <div class="person-affil placeholder-dim-text" style="font-size:0.75rem;">${tip}</div>
            </div>
          </div>
        </div>
      `;
    }

    // Past-member placeholder — same visual style as student placeholder, no role badge.
    function alumniPlaceholderCard(idx) {
      const label = lang === "zh" ? "过往成员" : "Past member";
      const tag   = lang === "zh" ? "等待登记" : "To be added";
      const tip   = lang === "zh" ? "成员去向信息更新中" : "Record to be added";
      return `
        <div class="person-card person-placeholder person-alumni" aria-hidden="true">
          <div class="person-placeholder-inner">
            <div class="person-photo"><div class="photo-placeholder placeholder-dim">${idx}</div></div>
            <div class="person-meta">
              <div class="person-name placeholder-dim-text">${label} ${idx}</div>
              <div class="person-title placeholder-tag">${tag}</div>
              <div class="person-affil placeholder-dim-text" style="font-size:0.75rem;">${tip}</div>
            </div>
          </div>
        </div>
      `;
    }

    const sections = [];
    // First: PI / postdoc / RA / visiting — only if actually present
    ROLES_PRESENT.forEach(role => {
      if (!byRole[role] || !byRole[role].length) return;
      const label = roleLabel(role);
      sections.push(`
        <h2 class="people-group-heading">${label}</h2>
        <div class="people-grid">${byRole[role].map(personCard).join("")}</div>
      `);
    });
    // Then: single "Current students" section, merging phd / master / undergrad.
    // Real members sorted PhD > MA > Undergrad; placeholders (when empty) are
    // 3 of each role so the badge variety is preserved.
    const studentLabel = lang === "zh" ? "在读学生" : "Current students";
    const studentRoles = ["phd", "master", "undergrad"];
    const roleOrder = { phd: 0, master: 1, undergrad: 2 };
    const allStudents = studentRoles.flatMap(r => byRole[r] || []);
    allStudents.sort((a, b) =>
      (roleOrder[(a.role || "").toLowerCase()] ?? 99) -
      (roleOrder[(b.role || "").toLowerCase()] ?? 99)
    );
    const studentCards = allStudents.length
      ? allStudents.map(personCard).join("")
      : [
          placeholderCard("phd", 1), placeholderCard("phd", 2), placeholderCard("phd", 3),
          placeholderCard("master", 4), placeholderCard("master", 5), placeholderCard("master", 6),
          placeholderCard("undergrad", 7), placeholderCard("undergrad", 8), placeholderCard("undergrad", 9),
        ].join("");
    sections.push(`
      <h2 class="people-group-heading">${studentLabel}</h2>
      <div class="people-grid">${studentCards}</div>
    `);

    // Past lab members — always show heading; 3 placeholder cards when no entries yet
    const alumniLabel = lang === "zh" ? "过往成员" : "Past lab members";
    const alumniCards = (data.alumni && data.alumni.length)
      ? data.alumni.map(personCard).join("")
      : [1, 2, 3].map(i => alumniPlaceholderCard(i)).join("");
    sections.push(`
      <h2 class="people-group-heading alumni-heading">${alumniLabel}</h2>
      <div class="people-grid">${alumniCards}</div>
    `);

    // ── Collaborators (Key + Emerging) ──
    try {
      const collabs = await loadJSON("assets/data/collaborators.json");
      if (collabs && collabs.length) {
        const keyLabel      = lang === "zh" ? "重要合作者" : "Key Collaborators";
        const emergingLabel = lang === "zh" ? "青年合作者" : "Emerging Researchers";
        const keyIntro      = lang === "zh"
          ? "课题组与全球多所机构的资深学者保持长期、富有成效的合作。"
          : "Long-standing, impactful partnerships with leading scholars worldwide.";
        const emergingIntro = lang === "zh"
          ? "课题组也很自豪能与一批活跃在学术前沿的青年学者保持合作（多为课题组毕业生）。"
          : "We take pride in collaborating with promising emerging researchers, many of them lab alumni.";

        const key      = collabs.filter(c => c.type === "senior");
        const emerging = collabs.filter(c => c.type === "early_career");

        function collabCard(c) {
          const nameLink = c.url
            ? `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`
            : c.name;
          return `
            <div class="collab-card">
              <div class="collab-name">${nameLink}</div>
              ${c.affiliation ? `<div class="collab-affil">${c.affiliation}</div>` : ""}
              ${c.bio ? `<p class="collab-bio">${c.bio}</p>` : ""}
            </div>
          `;
        }

        if (key.length) {
          sections.push(`
            <h2 class="people-group-heading collab-heading">${keyLabel}</h2>
            <p class="collab-intro">${keyIntro}</p>
            <div class="collab-list">${key.map(collabCard).join("")}</div>
          `);
        }
        if (emerging.length) {
          sections.push(`
            <h2 class="people-group-heading collab-heading emerging-heading">${emergingLabel}</h2>
            <p class="collab-intro">${emergingIntro}</p>
            <div class="collab-list emerging-list">${emerging.map(collabCard).join("")}</div>
          `);
        }
      }
    } catch { /* no collaborators.json yet, skip */ }

    root.innerHTML = sections.join("");
  }

  /* ── Funders strip (home page) ────────────────────────── */
  async function renderFunders() {
    const root = $("#funders-row");
    if (!root) return;
    let items;
    try {
      items = await loadJSON("assets/data/funders.json");
    } catch { return; }
    if (!items || !items.length) return;

    const cards = items.map(f => {
      const tooltip = f.tooltip || f.name || "";
      const inner = f.logo_path
        ? `<img src="assets/images/logos/${f.logo_path}" alt="${f.name || ''}"
               onerror="this.outerHTML='<span class=&quot;funder-text&quot;>${f.name || ''}</span>'">`
        : `<span class="funder-text">${f.name || ''}</span>`;
      const wrapped = f.url
        ? `<a href="${f.url}" target="_blank" rel="noopener noreferrer" title="${tooltip}">${inner}</a>`
        : `<span title="${tooltip}">${inner}</span>`;
      return `<div class="funder-card">${wrapped}</div>`;
    }).join("");

    // Marquee: render the set twice so the loop is seamless (translateX
    // from 0 to -50% lands the duplicate set where the original started).
    // The duplicate is hidden via CSS on mobile + when prefers-reduced-motion
    // is set, so users without animation only see each funder once.
    const trackInner = `${cards}<span class="funders-dup" aria-hidden="true">${cards}</span>`;
    const trackClass = "funders-track funders-track-animated";

    // Keep the label, replace everything after it
    const label = root.querySelector(".label");
    root.innerHTML = "";
    if (label) root.appendChild(label);
    const marquee = document.createElement("div");
    marquee.className = "funders-marquee";
    marquee.setAttribute("aria-label", I18N.current === "zh" ? "资助来源" : "Funders");
    marquee.innerHTML = `<div class="${trackClass}">${trackInner}</div>`;
    root.appendChild(marquee);

    // Re-apply i18n for the label
    if (label) {
      const key = label.getAttribute("data-i18n");
      const val = get(I18N.data, key);
      if (val != null) label.innerHTML = val;
    }
  }

  /* ── Projects ─────────────────────────────────────────── */
  async function renderProjects() {
    const root = $("#projects-content");
    if (!root) return;
    let data;
    try {
      data = await loadJSON("assets/data/projects.json");
    } catch {
      // Fallback to old filename for back-compat
      data = await loadJSON("assets/data/projects-data.json");
    }
    const lang = I18N.current;
    // Both shapes: array (new) or {projects:[...]} (old)
    const items = Array.isArray(data) ? data : (data.projects || []);

    const cards = items.map(p => {
      const title = lang === "zh" ? (p.title_zh || p.title_en) : (p.title_en || p.title_zh);
      const body  = lang === "zh" ? (p.body_zh  || p.body_en)  : (p.body_en  || p.body_zh);
      const iconHtml = p.icon
        ? `<span class="theme-icon"><i class="ph-light ${p.icon}" aria-hidden="true"></i></span>`
        : "";
      return `
        <article class="theme-card" id="${p.id || ""}">
          ${iconHtml}
          <h3>${title || ""}</h3>
          <div class="theme-sep" aria-hidden="true"></div>
          <p>${body || ""}</p>
        </article>
      `;
    }).join("");
    root.innerHTML = `<div class="themes-grid">${cards}</div>`;
  }

  /* ── Publications ─────────────────────────────────────── */
  // Color-coded category badges + per-type button labels.
  const PUB_CAT = {
    journal:      { label_zh:"期刊论文",   label_en:"Journal article",  cls:"cat-journal",       btn_zh:"原文",      btn_en:"Article"  },
    preprint:     { label_zh:"预印本",     label_en:"Preprint",         cls:"cat-preprint",      btn_zh:"预印本",    btn_en:"Preprint" },
    chinese:      { label_zh:"中文期刊",   label_en:"Chinese journal",  cls:"cat-chinese",       btn_zh:"原文",      btn_en:"Article"  },
    conference:   { label_zh:"会议论文",   label_en:"Conference paper", cls:"cat-conference",    btn_zh:"论文",      btn_en:"Paper"    },
    book:         { label_zh:"书著",       label_en:"Book",             cls:"cat-book",          btn_zh:"原文",      btn_en:"Book"     },
    book_chapter: { label_zh:"书籍章节",   label_en:"Book chapter",     cls:"cat-book-chapter",  btn_zh:"原文",      btn_en:"Chapter"  },
    other:      { label_zh:"其他",        label_en:"Other",            cls:"cat-other",      btn_zh:"查看",      btn_en:"View"     }
  };
  let ALL_PUBS = [];
  let FILTER_STATE = { cats: new Set(), years: new Set(), search: "" };   // empty = show all
  const AUTHOR_FOLD_THRESHOLD = 10;     // > this many authors → fold
  const PREPRINT_HOSTS = ["biorxiv.org", "preprints.org", "psyarxiv.com",
                          "arxiv.org", "medrxiv.org", "osf.io"];

  function resolveCat(p) {
    if (p.category) return p.category.toLowerCase().trim();
    const u = (p.url || "").toLowerCase();
    if (PREPRINT_HOSTS.some(h => u.includes(h))) return "preprint";
    const t = (p.type || "").toLowerCase();
    if (t === "journal-article" || t === "journal_article") return "journal";
    if (t === "conference-paper" || t === "conference_paper") return "conference";
    if (t === "book")                                          return "book";
    if (t === "book-chapter" || t === "book_chapter")          return "book_chapter";
    if (t === "preprint")         return "preprint";
    return "other";
  }

  // Render author list, folding long lists to "first 3 + count more" with reveal.
  function renderAuthors(authorsRaw, pubIdx) {
    if (!authorsRaw) return "";
    const bolded = boldLabAuthors(authorsRaw, "me");
    // Split on ";" but careful — already-bolded HTML must stay intact
    const parts = bolded.split(/;\s?/);
    if (parts.length <= AUTHOR_FOLD_THRESHOLD) return bolded;
    const head = parts.slice(0, 3).join("; ");
    const tail = parts.slice(3).join("; ");
    const more = parts.length - 3;
    const showLabel  = (I18N.current === "zh" ? "显示全部 " : "show all ") + parts.length + (I18N.current === "zh" ? " 位作者" : " authors");
    const hideLabel  = (I18N.current === "zh" ? "收起作者" : "hide authors");
    return `
      ${head};
      <span class="authors-tail" data-pub="${pubIdx}" hidden>${tail}</span>
      <button class="authors-toggle" type="button" data-pub="${pubIdx}"
              onclick="toggleAuthors('${pubIdx}', this)"
              data-show="${showLabel}" data-hide="${hideLabel}">
        … +${more} ${I18N.current === "zh" ? "位作者" : "authors"}
      </button>
    `;
  }
  window.toggleAuthors = function (pubIdx, btn) {
    const tail = document.querySelector(`.authors-tail[data-pub="${pubIdx}"]`);
    if (!tail) return;
    const showing = !tail.hasAttribute("hidden");
    if (showing) {
      tail.setAttribute("hidden", "");
      btn.innerHTML = btn.dataset.show.replace(/^show all /, "… +").replace(/^显示全部 /, "… +");
    } else {
      tail.removeAttribute("hidden");
      btn.innerHTML = btn.dataset.hide;
    }
  };

  function filterPubsList() {
    const q = (FILTER_STATE.search || "").toLowerCase().trim();
    return ALL_PUBS.filter(p => {
      const cat = resolveCat(p);
      const year = String(p.year || "");
      const catOk  = FILTER_STATE.cats.size  === 0 || FILTER_STATE.cats.has(cat);
      const yearOk = FILTER_STATE.years.size === 0 || FILTER_STATE.years.has(year);
      let searchOk = true;
      if (q) {
        const hay = `${p.title || ""} ${p.authors || ""} ${p.journal || ""} ${p.year || ""}`.toLowerCase();
        searchOk = hay.includes(q);
      }
      return catOk && yearOk && searchOk;
    });
  }

  function renderPubsList() {
    const root = $("#pub-list");
    if (!root) return;
    const pubs = filterPubsList();
    if (!pubs.length) {
      root.innerHTML = '<p class="pub-empty">' +
        (I18N.current === "zh" ? "没有符合筛选条件的论文。" : "No publications match the selected filters.") + '</p>';
      updateCountDisplay(pubs.length);
      return;
    }
    const lang = I18N.current;
    root.innerHTML = pubs.map((p, i) => {
      const cat = resolveCat(p);
      const cfg = PUB_CAT[cat] || PUB_CAT.other;
      const yearEl = p.year
        ? `<span class="pub-year">${p.year}</span>`
        : `<span class="pub-year inpress">${lang === "zh" ? "在审" : "In press"}</span>`;
      const catLabel = lang === "zh" ? cfg.label_zh : cfg.label_en;
      const btnLabel = lang === "zh" ? cfg.btn_zh : cfg.btn_en;
      const authorsHtml = renderAuthors(p.authors, "p" + i);
      const titleHtml = p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>` : p.title;
      const viewBtn  = p.url       ? `<a class="btn-view"  href="${p.url}"       target="_blank" rel="noopener">${btnLabel}</a>` : "";
      const pdfBtn   = p.pdf_url   ? `<a class="btn-pdf"   href="${p.pdf_url}"   target="_blank" rel="noopener">PDF</a>` : "";
      const codeBtn  = p.code_url  ? `<a class="btn-code"  href="${p.code_url}"  target="_blank" rel="noopener">Code</a>` : "";
      const videoBtn = p.video_url ? `<a class="btn-video" href="${p.video_url}" target="_blank" rel="noopener">Video</a>` : "";
      const actions = [viewBtn, pdfBtn, codeBtn, videoBtn].filter(Boolean).join("");
      const noteBadge = p.notes ? `<span class="pub-note">${p.notes}</span>` : "";
      return `
        <div class="pub-item" data-cat="${cat}">
          <div class="pub-header">${yearEl}<span class="pub-cat ${cfg.cls}">${catLabel}</span>${noteBadge}</div>
          <div class="pub-title">${titleHtml}</div>
          ${authorsHtml ? `<div class="pub-authors">${authorsHtml}</div>` : ""}
          ${p.journal ? `<div class="pub-journal">${p.journal}</div>` : ""}
          ${actions ? `<div class="pub-actions">${actions}</div>` : ""}
        </div>
      `;
    }).join("");
    updateCountDisplay(pubs.length);
  }

  function updateCountDisplay(showing) {
    const el = $("#pub-shown-count");
    if (el) el.textContent = showing;
    const tot = $("#pub-total-count");
    if (tot) tot.textContent = ALL_PUBS.length;
  }

  function buildCategoryFilters() {
    const root = $("#cat-filters");
    if (!root) return;
    const counts = { journal: 0, preprint: 0, chinese: 0, conference: 0, other: 0 };
    ALL_PUBS.forEach(p => { const c = resolveCat(p); if (c in counts) counts[c]++; });
    const lang = I18N.current;
    const chips = Object.keys(PUB_CAT).filter(k => k !== "other" && counts[k] > 0).map(k => {
      const label = lang === "zh" ? PUB_CAT[k].label_zh : PUB_CAT[k].label_en;
      const isOn = FILTER_STATE.cats.has(k);
      return `
        <button class="filter-chip ${PUB_CAT[k].cls} ${isOn ? 'active' : ''}"
                type="button"
                data-cat="${k}"
                onclick="toggleCatFilter('${k}', this)">
          <span class="filter-chip-label">${label}</span>
          <span class="filter-chip-count">${counts[k]}</span>
          ${isOn ? '<i class="ph-light ph-x filter-chip-x"></i>' : ''}
        </button>
      `;
    }).join("");
    root.innerHTML = chips;
  }

  function buildYearFilters() {
    const root = $("#year-filters");
    if (!root) return;
    // collect all unique years sorted desc
    const years = Array.from(new Set(ALL_PUBS.map(p => String(p.year || "")).filter(Boolean)))
      .sort((a, b) => b.localeCompare(a));
    const lang = I18N.current;
    const chips = years.map(y => {
      const count = ALL_PUBS.filter(p => String(p.year) === y).length;
      const isOn = FILTER_STATE.years.has(y);
      return `
        <button class="filter-chip year-chip ${isOn ? 'active' : ''}"
                type="button"
                data-year="${y}"
                onclick="toggleYearFilter('${y}', this)">
          <span class="filter-chip-label">${y}</span>
          <span class="filter-chip-count">${count}</span>
          ${isOn ? '<i class="ph-light ph-x filter-chip-x"></i>' : ''}
        </button>
      `;
    }).join("");
    root.innerHTML = chips;
  }

  window.toggleCatFilter = function (cat) {
    if (FILTER_STATE.cats.has(cat)) FILTER_STATE.cats.delete(cat);
    else FILTER_STATE.cats.add(cat);
    buildCategoryFilters();
    renderPubsList();
  };
  window.toggleYearFilter = function (year) {
    if (FILTER_STATE.years.has(year)) FILTER_STATE.years.delete(year);
    else FILTER_STATE.years.add(year);
    buildYearFilters();
    renderPubsList();
  };
  window.clearAllFilters = function () {
    FILTER_STATE.cats.clear();
    FILTER_STATE.years.clear();
    FILTER_STATE.search = "";
    const input = $("#pub-search");
    if (input) input.value = "";
    buildCategoryFilters();
    buildYearFilters();
    renderPubsList();
  };

  function setupPubSearch() {
    const input = $("#pub-search");
    if (!input) return;
    // Keep current FILTER_STATE.search in the input on lang/render re-runs
    input.value = FILTER_STATE.search || "";
    // Avoid double-binding if renderPublications runs again (lang switch)
    if (input.dataset.bound === "1") return;
    input.addEventListener("input", (e) => {
      FILTER_STATE.search = e.target.value;
      renderPubsList();
    });
    input.dataset.bound = "1";
  }

  async function renderPublications() {
    const root = $("#pub-list");
    if (!root) return;
    await ensureAuthorPatterns();
    try {
      ALL_PUBS = await loadJSON("assets/data/publications.json");
      buildCategoryFilters();
      buildYearFilters();
      setupPubSearch();
      renderPubsList();
    } catch {
      root.innerHTML = '<p style="color:#c00;">无法载入论文列表 / Could not load publications.</p>';
    }
  }

  /* ── Facilities ───────────────────────────────────────── */
  async function renderFacilities() {
    const root = $("#facilities-content");
    if (!root) return;
    const data = await loadJSON("assets/data/facilities.json");
    const lang = I18N.current;
    const html = data.facilities.map(f => {
      const name = lang === "zh" ? f.name_zh : f.name_en;
      const desc = lang === "zh" ? f.desc_zh : f.desc_en;
      // Icon: phosphor class string like "ph-brain", or emoji fallback
      const iconHtml = f.icon
        ? (f.icon.startsWith("ph-")
            ? `<i class="ph-light ${f.icon} facility-icon"></i>`
            : `<div class="facility-icon">${f.icon}</div>`)
        : "";
      return `
        <div class="facility-card">
          ${iconHtml}
          <h3>${name}</h3>
          <p>${desc || ""}</p>
        </div>
      `;
    }).join("");
    root.innerHTML = `<div class="facilities-grid">${html}</div>`;
  }

  /* ── News ─────────────────────────────────────────────── */
  // Tag groups for ?tag= URL filter. Matches against the news item's
  // tag_zh + tag_en (case-insensitive) so the same alias hits multiple
  // legacy tag spellings without changing the source data.
  const NEWS_TAG_GROUPS = {
    join_us: /加入我们|join.?us|招聘|招募|招生|recruitment|admissions?/i
  };

  async function renderNews() {
    const root = $("#news-content");
    if (!root) return;
    const data = await loadJSON("assets/data/news.json");
    const lang = I18N.current;
    const allItems = data.items || [];

    // Parse ?tag= filter from URL. join_us is the canonical group; raw
    // tag substrings also work as a fallback.
    const params = new URLSearchParams(window.location.search);
    const tagFilter = (params.get("tag") || "").trim().toLowerCase();
    const filterRe = tagFilter ? (NEWS_TAG_GROUPS[tagFilter] || new RegExp(tagFilter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")) : null;
    const items = filterRe
      ? allItems.filter(n => filterRe.test(`${n.tag_zh || ""} ${n.tag_en || ""}`))
      : allItems;

    const joinUsView = tagFilter === "join_us";

    function newsItem(n) {
      const title = lang === "zh" ? n.title_zh : n.title_en;
      const body  = lang === "zh" ? n.body_zh  : n.body_en;
      const tag   = lang === "zh" ? n.tag_zh   : n.tag_en;
      return `
        <li class="news-item">
          <div class="news-date">${n.date || ""}</div>
          <div>
            ${tag ? `<div class="news-tag">${tag}</div>` : ""}
            <h3>${title || ""}</h3>
            <p>${body || ""}</p>
            ${n.link ? `<p style="margin-top:8px;"><a href="${n.link}" target="_blank" rel="noopener noreferrer" data-i18n="news.read_more">阅读详情 →</a></p>` : ""}
          </div>
        </li>
      `;
    }

    function joinUsCard(n) {
      const title   = lang === "zh" ? (n.title_zh   || n.title_en)   : (n.title_en   || n.title_zh);
      const summary = lang === "zh" ? (n.summary_zh || n.summary_en) : (n.summary_en || n.summary_zh);
      const body    = lang === "zh" ? (n.body_zh    || n.body_en)    : (n.body_en    || n.body_zh);
      const readLabel = lang === "zh" ? "阅读详情 →" : "Read more →";
      const moreHref = n.link || "#";
      return `
        <article class="join-us-card">
          <div class="join-us-tag">${lang === "zh" ? (n.tag_zh || "加入我们") : (n.tag_en || "Join us")}</div>
          <h3>${title || ""}</h3>
          ${summary ? `<p class="join-us-summary">${summary}</p>` : ""}
          ${body ? `<p class="join-us-body">${body}</p>` : ""}
          ${n.link ? `<p class="join-us-more-wrap"><a class="join-us-more" href="${moreHref}" target="_blank" rel="noopener noreferrer">${readLabel}</a></p>` : ""}
        </article>
      `;
    }

    let bodyHtml;
    if (filterRe) {
      const headLabel = (lang === "zh"
        ? (get(I18N.data, "news.filter_join_us_h") || (joinUsView ? "加入我们" : tagFilter))
        : (get(I18N.data, "news.filter_join_us_h") || (joinUsView ? "Join us" : tagFilter)));
      const clearLabel = get(I18N.data, "news.filter_clear") || (lang === "zh" ? "← 显示全部新闻" : "← Show all news");
      const emptyLabel = get(I18N.data, "news.filter_empty") || (lang === "zh" ? "暂无符合筛选条件的内容。" : "No matching items.");
      const header = `
        <div class="news-filter-header">
          <h2 class="news-filter-title">${headLabel}</h2>
          <a class="news-filter-clear" href="news.html">${clearLabel}</a>
        </div>
      `;
      if (!items.length) {
        bodyHtml = `${header}<p class="news-filter-empty">${emptyLabel}</p>`;
      } else if (joinUsView) {
        bodyHtml = `${header}<div class="join-us-grid">${items.map(joinUsCard).join("")}</div>`;
      } else {
        bodyHtml = `${header}<ul class="news-list">${items.map(newsItem).join("")}</ul>`;
      }
    } else {
      bodyHtml = `<ul class="news-list">${items.map(newsItem).join("")}</ul>`;
    }

    root.innerHTML = bodyHtml;
    $$("[data-i18n]", root).forEach(el => {
      const v = get(I18N.data, el.getAttribute("data-i18n"));
      if (v != null) el.innerHTML = v;
    });
  }

  /* ── SEO: inject JSON-LD structured data on each page ─── */
  // The schema.org payload differs per page; this runs once at init()
  // and appends a <script type="application/ld+json"> to <head>.
  async function injectJsonLd(page) {
    const ORG = {
      "@type": "ResearchOrganization",
      "name": "Research Center of Psycholinguistics & Neurolinguistics",
      "alternateName": "心理与神经语言学研究中心",
      "url": "https://xmjiang-lab.github.io/",
      "logo": "https://xmjiang-lab.github.io/assets/images/logos/sisu-brand.png",
      "parentOrganization": {
        "@type": "EducationalOrganization",
        "name": "Institute of Language Sciences, Shanghai International Studies University",
        "url": "https://ilas.shisu.edu.cn/"
      }
    };
    const PI = {
      "@type": "Person",
      "name": "Xiaoming Jiang",
      "alternateName": "蒋晓鸣",
      "jobTitle": "Professor and Doctoral Supervisor",
      "affiliation": ORG,
      "url": "https://ilas.shisu.edu.cn/21/0f/c18209a205071/page.htm",
      "sameAs": [
        "https://orcid.org/0000-0002-5171-9774",
        "https://scholar.google.com/citations?user=iF2CM7sAAAAJ"
      ]
    };

    let payload = null;
    if (page === "home") {
      payload = { "@context": "https://schema.org", ...ORG, "member": PI };
    } else if (page === "people") {
      try {
        const d = await loadJSON("assets/data/people.json");
        const all = [...(d.current || []), ...(d.alumni || [])];
        payload = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Members and alumni of the Research Center of Psycholinguistics & Neurolinguistics",
          "itemListElement": all.map((p, i) => {
            const item = {
              "@type": "Person",
              "position": i + 1,
              "name": p.name_en || p.name_zh,
              "affiliation": ORG
            };
            if (p.name_zh && p.name_en) item.alternateName = p.name_zh;
            if (p.orcid) item.identifier = `https://orcid.org/${p.orcid}`;
            if (p.scholar) item.sameAs = [p.scholar];
            if (p.homepage) item.url = p.homepage;
            return item;
          })
        };
      } catch { /* people.json missing */ }
    } else if (page === "publications") {
      try {
        const pubs = await loadJSON("assets/data/publications.json");
        payload = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Publications of the Research Center of Psycholinguistics & Neurolinguistics",
          "itemListElement": pubs.slice(0, 50).map((p, i) => {
            const item = {
              "@type": "ScholarlyArticle",
              "position": i + 1,
              "headline": p.title,
              "datePublished": String(p.year || "")
            };
            if (p.journal) item.isPartOf = { "@type": "Periodical", "name": p.journal };
            if (p.authors) item.author = p.authors.split(/[,;]\s*/).filter(Boolean).map(n => ({ "@type": "Person", "name": n }));
            if (p.doi) item.identifier = `https://doi.org/${p.doi}`;
            if (p.url) item.url = p.url;
            return item;
          })
        };
      } catch { /* publications.json missing */ }
    } else {
      // contact / projects / facilities / news — just declare the org
      payload = { "@context": "https://schema.org", ...ORG, "member": PI };
    }

    if (!payload) return;
    // Remove any stale JSON-LD this function added (re-runs on lang change)
    document.querySelectorAll('script[type="application/ld+json"][data-injected="1"]').forEach(el => el.remove());
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-injected", "1");
    s.textContent = JSON.stringify(payload);
    document.head.appendChild(s);
  }

  /* ── Floating back-to-top button (all pages) ─────────── */
  function setupBackToTop() {
    let btn = document.getElementById("back-to-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "back-to-top";
      btn.type = "button";
      btn.innerHTML = '<i class="ph-light ph-arrow-up" aria-hidden="true"></i>';
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      document.body.appendChild(btn);
    }
    btn.setAttribute("aria-label", I18N.current === "zh" ? "回到顶部" : "Back to top");
    if (btn.dataset.bound !== "1") {
      const onScroll = () => {
        if (window.scrollY > 400) btn.classList.add("visible");
        else btn.classList.remove("visible");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      btn.dataset.bound = "1";
    }
  }

  /* ── Build metadata (last-updated stamp in footer) ────── */
  async function applyLastUpdated() {
    try {
      const info = await loadJSON("assets/data/build-info.json");
      if (!info || !info.last_updated) return;
      const el = $("#footer-last-updated");
      if (!el) return;
      const lbl = I18N.current === "zh" ? "最近更新" : "Last updated";
      el.textContent = `${lbl}: ${info.last_updated}`;
    } catch { /* no build-info.json — local dev */ }
  }

  /* ── Bootstrap ────────────────────────────────────────── */
  async function init() {
    const headerSlot = $("#header-slot");
    const footerSlot = $("#footer-slot");
    if (headerSlot) {
      const activePage = document.body.getAttribute("data-page") || "home";
      headerSlot.outerHTML = buildHeader(activePage);
    }
    if (footerSlot) footerSlot.outerHTML = buildFooter();

    await applyLang(I18N.current);
    await applyLastUpdated();
    setupBackToTop();
    const seoPage = document.body.getAttribute("data-page") || "home";
    await injectJsonLd(seoPage);

    const page = document.body.getAttribute("data-page");
    if (page === "home")              { await renderSidebar(); await renderFunders(); }
    else if (page === "people")       await renderPeople();
    else if (page === "projects")     await renderProjects();
    else if (page === "publications") await renderPublications();
    else if (page === "facilities")   await renderFacilities();
    else if (page === "news")         await renderNews();

    document.addEventListener("langchange", async () => {
      await applyLastUpdated();
      if (page === "home")              { await renderSidebar(); await renderFunders(); }
      else if (page === "people")       await renderPeople();
      else if (page === "projects")     await renderProjects();
      else if (page === "publications") { buildCategoryFilters(); buildYearFilters(); renderPubsList(); }
      else if (page === "facilities")   await renderFacilities();
      else if (page === "news")         await renderNews();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ── Theme controls (lives outside IIFE so onclick can find them) ─── */
(function () {
  "use strict";

  // Dark mode
  function applyDark(isDark) {
    document.body.classList.toggle("dark", isDark);
    const btns = document.querySelectorAll(".dark-toggle i");
    btns.forEach(icon => {
      icon.className = isDark ? "ph-light ph-sun" : "ph-light ph-moon";
    });
  }
  window.toggleDark = function () {
    const isDark = !document.body.classList.contains("dark");
    localStorage.setItem("jianglab_theme", isDark ? "dark" : "light");
    applyDark(isDark);
  };

  // Apply saved prefs on first paint
  function applySaved() {
    applyDark(localStorage.getItem("jianglab_theme") === "dark");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySaved);
  } else {
    applySaved();
  }
  // Re-apply on every dynamic header injection (after init runs)
  document.addEventListener("langchange", () => setTimeout(applySaved, 50));
})();
