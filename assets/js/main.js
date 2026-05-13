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
          <a class="brand-sisu" href="https://www.shisu.edu.cn" target="_blank" rel="noopener" aria-label="SISU">
            <img src="assets/images/logos/sisu.svg" alt="SISU">
          </a>
          <div class="brand-divider"></div>
          <div class="brand-lab">
            <span data-i18n="brand.lab_name">语言科学研究院 · 蒋晓鸣课题组</span>
            <span class="en" data-i18n="brand.lab_name_sub">Institute of Language Sciences · Jiang Lab</span>
          </div>
          <div class="brand-controls">
            <button class="theme-toggle" type="button" onclick="toggleTheme()"
                    title="Toggle SISU Blue / Mono" aria-label="Toggle color theme">
              <span class="theme-dot theme-dot-blue"></span>
              <span class="theme-dot theme-dot-mono"></span>
            </button>
            <button class="dark-toggle" type="button" onclick="toggleDark()"
                    title="Toggle dark mode" aria-label="Toggle dark mode">🌙</button>
            <a class="brand-lang" href="#" onclick="event.preventDefault(); toggleLang(); return false;" data-i18n="lang_switch_to">EN</a>
          </div>
        </div>
      </div>

      <nav id="nav-bar" aria-label="Primary">
        <div class="nav-inner">
          <ul id="nav-links">
            <li${activePage === "home" ? ' class="active"' : ""}><a href="index.html"><span class="home-icon">🏠</span><span data-i18n="nav.home">首页</span></a></li>
            <li${activePage === "people" ? ' class="active"' : ""}><a href="people.html" data-i18n="nav.people">团队成员</a></li>
            <li${activePage === "projects" ? ' class="active"' : ""}><a href="projects.html" data-i18n="nav.projects">研究方向</a></li>
            <li${activePage === "publications" ? ' class="active"' : ""}><a href="publications.html" data-i18n="nav.publications">发表论文</a></li>
            <li${activePage === "mentorship" ? ' class="active"' : ""}><a href="mentorship.html" data-i18n="nav.mentorship">指导学生</a></li>
            <li${activePage === "facilities" ? ' class="active"' : ""}><a href="facilities.html" data-i18n="nav.facilities">实验平台</a></li>
            <li${activePage === "news" ? ' class="active"' : ""}><a href="news.html" data-i18n="nav.news">新闻动态</a></li>
            <li${activePage === "contact" ? ' class="active"' : ""}><a href="contact.html" data-i18n="nav.contact">联系我们</a></li>
          </ul>
          <button id="nav-hamburger" onclick="document.getElementById('nav-links').classList.toggle('open')" aria-label="Menu">☰</button>
        </div>
      </nav>

      <div id="breadcrumb">
        <div class="breadcrumb-inner">
          <a href="https://www.shisu.edu.cn" target="_blank" rel="noopener" data-i18n="breadcrumb.sisu">上海外国语大学</a>
          &nbsp;/&nbsp;
          <a href="index.html" data-i18n="breadcrumb.lab">语言科学研究院 · 蒋晓鸣课题组</a>
        </div>
      </div>
    `;
  }

  function buildFooter() {
    return `
      <div id="footer">
        <div class="footer-inner">
          <div class="footer-school">
            <h2 data-i18n="footer.school_name">上海外国语大学 语言科学研究院</h2>
            <p data-i18n="footer.school_address">
              中国 上海市 虹口区 大连西路 550 号<br>
              邮编 200083<br>
              Tel.: +86-21-3537-XXXX
            </p>
            <p style="margin-top:8px;">
              <a href="mailto:xiaoming.jiang@shisu.edu.cn">xiaoming.jiang@shisu.edu.cn</a>
            </p>
          </div>
          <div class="footer-logos">
            <img src="assets/images/logos/sisu-white.svg" alt="SISU"
                 onerror="this.style.display='none'">
          </div>
        </div>
      </div>
      <div id="subfooter">
        <div class="subfooter-inner">
          <span data-i18n="footer.copyright">© 2026 蒋晓鸣课题组 · 上海外国语大学语言科学研究院</span>
          <a href="https://www.shisu.edu.cn" target="_blank" rel="noopener" data-i18n="footer.sisu_link">SISU 官网</a>
        </div>
      </div>
    `;
  }

  /* ── Sidebar (home) ───────────────────────────────────── */
  async function renderSidebar() {
    const root = $("#sidebar");
    if (!root) return;
    await ensureAuthorPatterns();

    let listHtml = "";
    try {
      const pubs = await loadJSON("assets/data/publications.json");
      const recent = pubs.slice(0, 5);
      listHtml = recent.map(p => {
        const authors = boldLabAuthors(p.authors || "", "me");
        const titleHtml = p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>` : p.title;
        return `<li>
          ${authors ? `<div>${authors} <span class="pub-year">(${p.year || "?"})</span></div>` : ""}
          <div>${titleHtml}${p.journal ? `. <em>${p.journal}</em>` : ""}.</div>
        </li>`;
      }).join("");
    } catch { listHtml = ""; }

    let announceHtml = "";
    try {
      const news = await loadJSON("assets/data/news.json");
      const featured = (news.items || []).find(n => n.featured) || (news.items || [])[0];
      if (featured) {
        const lang = I18N.current;
        const title   = lang === "zh" ? featured.title_zh   : featured.title_en;
        const summary = lang === "zh" ? featured.summary_zh : featured.summary_en;
        const tag     = lang === "zh" ? featured.tag_zh     : featured.tag_en;
        announceHtml = `
          <div class="announce-card">
            <h3 data-i18n="home.announce_title">最新公告</h3>
            ${tag ? `<div class="ann-tag">${tag}</div>` : ""}
            <p><strong>${title || ""}</strong></p>
            ${summary ? `<p>${summary}</p>` : ""}
            <p style="margin:0;"><a href="news.html" data-i18n="home.announce_more">查看全部 →</a></p>
          </div>
        `;
      }
    } catch { /* no news.json */ }

    root.innerHTML = `
      <h3 data-i18n="home.sidebar_title">近期论文</h3>
      <ul class="sidebar-list">${listHtml || '<li style="color:#888;">暂无</li>'}</ul>
      <a class="full-link" href="publications.html" data-i18n="home.sidebar_full">查看完整论文列表</a>
      ${announceHtml}
    `;
    $$("[data-i18n]", root).forEach(el => {
      const v = get(I18N.data, el.getAttribute("data-i18n"));
      if (v != null) el.innerHTML = v;
    });
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
      const name  = lang === "zh" ? (p.name_zh  || p.name_en) : (p.name_en || p.name_zh);
      const title = lang === "zh" ? (p.title_zh || "")        : (p.title_en || "");
      const affil = lang === "zh" ? (p.affil_zh || "")        : (p.affil_en || "");
      const bio   = lang === "zh" ? (p.bio_zh   || "")        : (p.bio_en   || "");

      const photoSrc = p.photo ? `assets/images/people/${p.photo}` : "";
      const initial = (name || "?").charAt(0);
      const photoEl = photoSrc
        ? `<img src="${photoSrc}" alt="${name}" onerror="this.outerHTML='<div class=&quot;photo-placeholder&quot;>${initial}</div>'">`
        : `<div class="photo-placeholder">${initial}</div>`;

      // Links: orcid / scholar / homepage / email
      const links = [];
      if (p.orcid) links.push(`<a href="https://orcid.org/${p.orcid}" target="_blank" rel="noopener">ORCID</a>`);
      if (p.scholar) links.push(`<a href="${p.scholar}" target="_blank" rel="noopener">Google Scholar</a>`);
      if (p.homepage) links.push(`<a href="${p.homepage}" target="_blank" rel="noopener">${lang === "zh" ? "个人主页" : "Homepage"}</a>`);
      if (p.email) links.push(`<a href="mailto:${p.email}">${p.email}</a>`);

      const educationLabel = lang === "zh" ? "学业背景" : "Education";
      const researchLabel  = lang === "zh" ? "研究方向" : "Research areas";
      const nowLabel       = lang === "zh" ? "现在"     : "Currently";

      return `
        <div class="person-card" data-id="${p.id || ""}">
          <button class="person-avatar-btn" type="button"
                  onclick="this.closest('.person-card').classList.toggle('expanded')"
                  aria-expanded="false">
            <div class="person-photo">${photoEl}</div>
            <div class="person-meta">
              <div class="person-name">${name}</div>
              ${title ? `<div class="person-title">${title}</div>` : ""}
              ${affil ? `<div class="person-affil">${affil}</div>` : ""}
            </div>
            <div class="person-toggle-hint" aria-hidden="true">▾</div>
          </button>
          <div class="person-details">
            ${bio ? `<p class="person-bio">${bio}</p>` : ""}
            ${p.education ? `<div class="person-row-label">${educationLabel}</div><p>${(p.education || "").replace(/\|/g, " · ")}</p>` : ""}
            ${p.research_areas ? `<div class="person-row-label">${researchLabel}</div><p>${p.research_areas}</p>` : ""}
            ${p.now ? `<div class="person-row-label">${nowLabel}</div><p>${p.now}${p.period ? ` <span style="opacity:0.6;">(${p.period})</span>` : ""}</p>` : ""}
            ${links.length ? `<div class="person-links">${links.join("")}</div>` : ""}
          </div>
        </div>
      `;
    }

    // Group current members by role
    const ROLES = ["pi", "postdoc", "phd", "master", "undergrad", "ra", "visiting"];
    const byRole = {};
    (data.current || []).forEach(p => {
      const r = (p.role || "other").toLowerCase();
      (byRole[r] = byRole[r] || []).push(p);
    });

    const sections = [];
    ROLES.forEach(role => {
      if (!byRole[role] || !byRole[role].length) return;
      const label = roleLabel(role);
      sections.push(`
        <h2 class="people-group-heading">${label}</h2>
        <div class="people-grid">${byRole[role].map(personCard).join("")}</div>
      `);
    });

    // Alumni
    if (data.alumni && data.alumni.length) {
      const alumniLabel = lang === "zh" ? "毕业生 / 离任成员" : "Alumni / Former members";
      sections.push(`
        <h2 class="people-group-heading alumni-heading">${alumniLabel}</h2>
        <div class="people-grid">${data.alumni.map(personCard).join("")}</div>
      `);
    }

    root.innerHTML = sections.join("");
  }

  /* ── Mentorship ───────────────────────────────────────── */
  async function renderMentorship() {
    const root = $("#mentorship-content");
    if (!root) return;
    let items;
    try {
      items = await loadJSON("assets/data/mentorship.json");
    } catch {
      root.innerHTML = '<p style="color:#888;">No data.</p>';
      return;
    }
    if (!items.length) {
      root.innerHTML = '<p style="color:#888;font-style:italic;">' +
        (I18N.current === "zh" ? "暂无记录。" : "No entries yet.") + '</p>';
      return;
    }
    const lang = I18N.current;
    const GROUP_LABELS = {
      undergraduate: { zh: "本科生", en: "Undergraduate students" },
      master:        { zh: "硕士研究生", en: "Master's students" },
      phd:           { zh: "博士研究生", en: "PhD students" },
      other:         { zh: "其他", en: "Other" },
    };
    const ORDER = ["undergraduate", "master", "phd", "other"];

    const groups = {};
    items.forEach(m => {
      const g = m.group || "other";
      (groups[g] = groups[g] || []).push(m);
    });

    const sections = [];
    ORDER.forEach(g => {
      if (!groups[g]) return;
      const label = (GROUP_LABELS[g] || GROUP_LABELS.other)[lang];
      const cards = groups[g].map(m => {
        const meta = [m.at_the_time, m.period].filter(Boolean).join(" · ");
        const workLink = m.url && m.work
          ? `<a href="${m.url}" target="_blank" rel="noopener">${m.work}</a>`
          : (m.work || "");
        return `
          <div class="mentee-block">
            <div class="mentee-name">${m.name || ""}</div>
            ${meta ? `<div class="mentee-meta">${meta}</div>` : ""}
            ${workLink ? `<div class="mentee-work">${workLink}</div>` : ""}
            ${m.now ? `<div class="mentee-now">${m.now}</div>` : ""}
          </div>
        `;
      }).join("");
      sections.push(`
        <h2 class="mentorship-group-title">${label}</h2>
        ${cards}
      `);
    });

    root.innerHTML = sections.join("");
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

    const html = items.map(p => {
      const title = lang === "zh" ? (p.title_zh || p.title_en) : (p.title_en || p.title_zh);
      const body  = lang === "zh" ? (p.body_zh  || p.body_en)  : (p.body_en  || p.body_zh);
      return `
        <div class="project-block" id="${p.id || ""}">
          <h3>${title || ""}</h3>
          <p>${body || ""}</p>
        </div>
      `;
    }).join("");
    root.innerHTML = html;
  }

  /* ── Publications ─────────────────────────────────────── */
  // Category metadata: color-coded badges + button label per type.
  // Matches the wenjunchen29.github.io scheme so the two sites feel related.
  const PUB_CAT = {
    journal:    { label_zh:"期刊论文",    label_en:"Journal article",  cls:"cat-journal",    btn_zh:"原文",      btn_en:"Article"  },
    preprint:   { label_zh:"预印本",      label_en:"Preprint",         cls:"cat-preprint",   btn_zh:"预印本",     btn_en:"Preprint" },
    chinese:    { label_zh:"中文期刊",    label_en:"Chinese journal",  cls:"cat-chinese",    btn_zh:"原文",      btn_en:"Article"  },
    conference: { label_zh:"会议论文",    label_en:"Conference paper", cls:"cat-conference", btn_zh:"论文",      btn_en:"Paper"    },
    other:      { label_zh:"其他",        label_en:"Other",            cls:"cat-other",      btn_zh:"查看",      btn_en:"View"     }
  };
  let ALL_PUBS = [];
  const PREPRINT_HOSTS = ["biorxiv.org", "preprints.org", "psyarxiv.com",
                          "arxiv.org", "medrxiv.org", "osf.io"];
  function resolveCat(p) {
    if (p.category) return p.category.toLowerCase().trim();
    const u = (p.url || "").toLowerCase();
    if (PREPRINT_HOSTS.some(h => u.includes(h))) return "preprint";
    const t = (p.type || "").toLowerCase();
    if (t === "journal-article" || t === "journal_article") return "journal";
    if (t === "conference-paper" || t === "conference_paper") return "conference";
    if (t === "preprint")         return "preprint";
    return "other";
  }
  function renderPubsList(pubs) {
    const root = $("#pub-list");
    if (!root) return;
    if (!pubs.length) {
      root.innerHTML = '<p style="color:#888;font-style:italic;">' +
        (I18N.current === "zh" ? "本类别无论文。" : "No publications in this category.") + '</p>';
      return;
    }
    const lang = I18N.current;
    root.innerHTML = pubs.map(p => {
      const cat = resolveCat(p);
      const cfg = PUB_CAT[cat] || PUB_CAT.other;
      const yearEl = p.year
        ? `<span class="pub-year">${p.year}</span>`
        : `<span class="pub-year inpress">${lang === "zh" ? "在审" : "In press"}</span>`;
      const catLabel = lang === "zh" ? cfg.label_zh : cfg.label_en;
      const btnLabel = lang === "zh" ? cfg.btn_zh : cfg.btn_en;
      const authors = boldLabAuthors(p.authors || "", "me");
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
          ${authors ? `<div class="pub-authors">${authors}</div>` : ""}
          ${p.journal ? `<div class="pub-journal">${p.journal}</div>` : ""}
          ${actions ? `<div class="pub-actions">${actions}</div>` : ""}
        </div>
      `;
    }).join("");
  }
  function updateCounts(pubs) {
    const counts = { journal: 0, preprint: 0, chinese: 0, conference: 0 };
    pubs.forEach(p => { const c = resolveCat(p); if (c in counts) counts[c]++; });
    const all = $("#cnt-all"); if (all) all.textContent = pubs.length;
    Object.keys(counts).forEach(k => {
      const el = document.getElementById("cnt-" + k);
      if (el) el.textContent = counts[k];
      const btn = document.querySelector(`[data-cat="${k}"]`);
      if (btn) btn.style.display = counts[k] === 0 ? "none" : "";
    });
  }
  window.filterPubs = function (cat, btn) {
    $$(".pub-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPubsList(cat === "all" ? ALL_PUBS : ALL_PUBS.filter(p => resolveCat(p) === cat));
  };
  async function renderPublications() {
    const root = $("#pub-list");
    if (!root) return;
    await ensureAuthorPatterns();
    try {
      ALL_PUBS = await loadJSON("assets/data/publications.json");
      updateCounts(ALL_PUBS);
      renderPubsList(ALL_PUBS);
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
      return `
        <div class="facility-card">
          ${f.icon ? `<div class="facility-icon">${f.icon}</div>` : ""}
          <h3>${name}</h3>
          <p>${desc || ""}</p>
        </div>
      `;
    }).join("");
    root.innerHTML = `<div class="facilities-grid">${html}</div>`;
  }

  /* ── News ─────────────────────────────────────────────── */
  async function renderNews() {
    const root = $("#news-content");
    if (!root) return;
    const data = await loadJSON("assets/data/news.json");
    const lang = I18N.current;
    const items = (data.items || []).map(n => {
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
            ${n.link ? `<p style="margin-top:8px;"><a href="${n.link}" target="_blank" rel="noopener" data-i18n="news.read_more">阅读详情 →</a></p>` : ""}
          </div>
        </li>
      `;
    }).join("");
    root.innerHTML = `<ul class="news-list">${items}</ul>`;
    $$("[data-i18n]", root).forEach(el => {
      const v = get(I18N.data, el.getAttribute("data-i18n"));
      if (v != null) el.innerHTML = v;
    });
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

    const page = document.body.getAttribute("data-page");
    if (page === "home")              await renderSidebar();
    else if (page === "people")       await renderPeople();
    else if (page === "projects")     await renderProjects();
    else if (page === "publications") await renderPublications();
    else if (page === "facilities")   await renderFacilities();
    else if (page === "news")         await renderNews();
    else if (page === "mentorship")   await renderMentorship();

    document.addEventListener("langchange", async () => {
      if (page === "home")              await renderSidebar();
      else if (page === "people")       await renderPeople();
      else if (page === "projects")     await renderProjects();
      else if (page === "publications") renderPubsList(ALL_PUBS);
      else if (page === "facilities")   await renderFacilities();
      else if (page === "news")         await renderNews();
      else if (page === "mentorship")   await renderMentorship();
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
    const btns = document.querySelectorAll(".dark-toggle");
    btns.forEach(b => b.textContent = isDark ? "☀️" : "🌙");
  }
  window.toggleDark = function () {
    const isDark = !document.body.classList.contains("dark");
    localStorage.setItem("jianglab_theme", isDark ? "dark" : "light");
    applyDark(isDark);
  };

  // Accent: "blue" (SISU Blue) or "mono" (grayscale)
  function applyAccent(mode) {
    document.body.classList.toggle("mono-accent", mode === "mono");
    document.querySelectorAll(".theme-toggle").forEach(b => {
      b.setAttribute("data-mode", mode);
    });
  }
  window.toggleTheme = function () {
    const cur = localStorage.getItem("jianglab_accent") || "blue";
    const next = cur === "blue" ? "mono" : "blue";
    localStorage.setItem("jianglab_accent", next);
    applyAccent(next);
  };

  // Apply saved prefs on first paint
  function applySaved() {
    applyDark(localStorage.getItem("jianglab_theme") === "dark");
    applyAccent(localStorage.getItem("jianglab_accent") || "blue");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySaved);
  } else {
    applySaved();
  }
  // Re-apply on every dynamic header injection (after init runs)
  document.addEventListener("langchange", () => setTimeout(applySaved, 50));
})();
