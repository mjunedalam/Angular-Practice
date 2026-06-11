const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "AI_ML_Engineering_Syllabus.md");
const outHtml = path.join(root, "AI_ML_Engineering_Syllabus.html");

const md = fs.readFileSync(input, "utf8");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function displayText(value) {
  return value
    .replace(/\bUnits\b/g, "Skill Sprints")
    .replace(/\bUnit\b/g, "Skill Sprint")
    .replace(/\bLessons\b/g, "Skill Sprints")
    .replace(/\bLesson\b/g, "Skill Sprint")
    .replace(/\blessons\b/g, "skill sprints")
    .replace(/\blesson\b/g, "skill sprint");
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function iconSvg(pathData, className = "inline-icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${pathData}</svg>`;
}

const iconPaths = {
  chapter: '<path d="M5 19V5"/><path d="M5 19h14"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-7"/>',
  sprint: '<path d="M13 2L5 14h6l-1 8 9-13h-6z"/>',
  project: '<path d="M5 19l5-14 4 7 7 4z"/><path d="M10 12l4 4"/><path d="M11 5l8-2-2 8"/>',
  lab: '<path d="M9 3v5l-4 8a4 4 0 0 0 3.6 5h6.8a4 4 0 0 0 3.6-5l-4-8V3"/><path d="M8 3h8"/><path d="M7 16h10"/>',
};

const lines = md.split(/\r?\n/);
const headings = [];
let htmlBody = "";
let listOpen = false;
let codeOpen = false;
let codeBuffer = [];
let moduleOpen = false;

function closeList() {
  if (listOpen) {
    htmlBody += "</ul>\n";
    listOpen = false;
  }
}

function closeModule() {
  if (moduleOpen) {
    closeList();
    htmlBody += "</section>\n";
    moduleOpen = false;
  }
}

function heading(level, rawText) {
  const text = rawText.replace(/^#+\s*/, "").trim();
  const cleanText = displayText(text.replace(/[📌]/g, "").trim());
  const id = slug(cleanText);
  headings.push({ level, text: cleanText, id });
  if (level === 1) {
    return "";
  }
  if (level === 2) {
    closeModule();
    moduleOpen = true;
    return `<section class="module" id="${id}"><div class="module-kicker">${iconSvg(iconPaths.chapter)}Learning Chapter</div><h2>${inline(cleanText)}</h2>\n`;
  }
  if (level === 3) {
    return `<div class="project-card" id="${id}"><div class="project-kicker">${iconSvg(iconPaths.project)}Build Milestone</div><h3>${inline(cleanText)}</h3>\n`;
  }
  return `<h${level} id="${id}">${inline(cleanText)}</h${level}>\n`;
}

for (const line of lines) {
  if (line.trim().startsWith("```")) {
    if (codeOpen) {
      htmlBody += `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>\n`;
      codeBuffer = [];
      codeOpen = false;
    } else {
      closeList();
      codeOpen = true;
    }
    continue;
  }

  if (codeOpen) {
    codeBuffer.push(line);
    continue;
  }

  if (/^---+\s*$/.test(line.trim())) {
    closeList();
    htmlBody += `<hr />\n`;
    continue;
  }

  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    closeList();
    htmlBody += heading(h[1].length, line);
    continue;
  }

  const bullet = line.match(/^\s*-\s+(.*)$/);
  if (bullet) {
    if (!listOpen) {
      htmlBody += "<ul>\n";
      listOpen = true;
    }
    htmlBody += `<li>${inline(displayText(bullet[1]))}</li>\n`;
    continue;
  }

  if (!line.trim()) {
    closeList();
    continue;
  }

  closeList();
  const visibleLine = displayText(line.trim());
  const sprintHeading = visibleLine.match(/^\*\*(Skill Sprint\s+[\d.]+\s+—\s+.*?)\*\*$/);
  if (sprintHeading) {
    htmlBody += `<div class="sprint-heading">${iconSvg(iconPaths.sprint)}<strong>${inline(sprintHeading[1])}</strong></div>\n`;
    continue;
  }

  const paragraphClass = line.startsWith("**Labs:**")
    ? " class=\"labs\""
    : line.startsWith("**Deliverables:**")
      ? " class=\"deliverables\""
      : "";
  const iconPrefix = line.startsWith("**Labs:**")
    ? iconSvg(iconPaths.lab)
    : line.startsWith("**Deliverables:**")
      ? iconSvg(iconPaths.project)
      : "";
  htmlBody += `<p${paragraphClass}>${iconPrefix}${inline(visibleLine)}</p>\n`;

  if (line.startsWith("**Deliverables:**")) {
    htmlBody += "</div>\n";
  }
}

closeList();
closeModule();

const title = "AI & ML Engineering";
const subtitle = "Complete Syllabus";
const skillSprintCount = lines.filter((line) => /^\*\*Unit\s/.test(line.trim())).length;
const moduleIcons = [
  '<path d="M8 15l7-7m-5 0h5v5"/><path d="M6 21h12"/><path d="M9 18h6"/>',
  '<path d="M9 6h6v4H9z"/><path d="M8 10h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8z"/><path d="M12 6V3"/><path d="M12 21v-3"/>',
  '<path d="M5 19L19 5"/><path d="M7 17h10"/><path d="M7 17V7"/><path d="M15 9l4 10"/>',
  '<path d="M5 19V5"/><path d="M5 19h14"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-7"/>',
  '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  '<path d="M7 11a5 5 0 0 1 10 0v4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M9 13h.01"/><path d="M15 13h.01"/><path d="M10 17h4"/><path d="M12 6V3"/>',
  '<path d="M12 3v18"/><path d="M7 8l10 10"/><path d="M17 8L7 18"/><circle cx="12" cy="12" r="8"/>',
  '<rect x="5" y="6" width="14" height="12" rx="2"/><path d="M8 15l3-3 2 2 3-4 3 5"/><circle cx="9" cy="9" r="1"/>',
  '<path d="M6 7h12v8H9l-3 3z"/><path d="M9 10h6"/><path d="M9 13h4"/>',
  '<path d="M8 8h8l2 7-3 2-3-3-3 3-3-2z"/><path d="M9 11h.01"/><path d="M15 11h.01"/>',
  '<path d="M13 2L5 14h6l-1 8 9-13h-6z"/>',
  '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 5V2"/><path d="M19 12h3"/><path d="M12 19v3"/><path d="M5 12H2"/>',
  '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14"/><path d="M9 10h6"/><path d="M10 14h.01"/><path d="M14 14h.01"/>',
  '<path d="M5 19l5-14 4 7 7 4z"/><path d="M10 12l4 4"/><path d="M11 5l8-2-2 8"/>',
  '<path d="M4 18h16"/><path d="M7 18V9l5-4 5 4v9"/><path d="M10 18v-5h4v5"/>',
  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
];
const moduleHeadings = headings.filter((h) => h.level === 2 && h.text.startsWith("MODULE"));
const projectHeadings = headings.filter((h) => h.level === 3);

function tocIcon(index) {
  return `<svg class="toc-icon-svg" viewBox="0 0 24 24" aria-hidden="true">${moduleIcons[index] || moduleIcons[0]}</svg>`;
}

const tocCards = moduleHeadings.map((module, index) => {
  const titleText = module.text.replace(/^MODULE\s+\d+\s+—\s+/, "");
  const project = projectHeadings[index]?.text.replace(/^Module Project\s+—\s+/, "") || "Module project";
  return `
    <a class="toc-card" href="#${module.id}">
      <span class="toc-icon">${tocIcon(index)}</span>
      <span class="toc-content">
        <strong>Chapter ${String(index + 1).padStart(2, "0")}</strong>
        <em>${escapeHtml(titleText)}</em>
        <small>Build milestone: ${escapeHtml(project)}</small>
      </span>
    </a>
  `;
});
const tocFoundation = tocCards.slice(0, 8).join("\n");
const tocEnterprise = tocCards.slice(8).join("\n");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI ML Engineering Syllabus</title>
  <style>
    @page { size: A4; margin: 15mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      color: #14243a;
      background: #f3f7fb;
      line-height: 1.5;
    }
    a { color: #1267a8; text-decoration: none; }
    .cover {
      min-height: 100vh;
      padding: 70px 58px;
      page-break-after: always;
      color: #fff;
      background:
        radial-gradient(circle at 12% 16%, rgba(39, 169, 138, .35), transparent 28%),
        radial-gradient(circle at 85% 20%, rgba(244, 154, 64, .25), transparent 26%),
        linear-gradient(135deg, #061a32 0%, #092f55 52%, #0e4d6c 100%);
      position: relative;
      overflow: hidden;
    }
    .cover:after {
      content: "";
      position: absolute;
      right: -180px;
      bottom: -220px;
      width: 560px;
      height: 560px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.18);
    }
    .cover-kicker {
      display: inline-block;
      padding: 7px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.35);
      color: #d8efff;
      font-size: 12px;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .cover h1 {
      max-width: 760px;
      margin: 44px 0 12px;
      color: #ffffff !important;
      font-size: 58px;
      line-height: 1.02;
      letter-spacing: -.055em;
    }
    .cover h2 {
      margin: 0 0 28px;
      color: #d8efff;
      font-size: 28px;
      font-weight: 500;
    }
    .cover p {
      max-width: 760px;
      color: #d7e9f9;
      font-size: 16px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 52px;
      max-width: 760px;
    }
    .cover-card {
      padding: 18px;
      border-radius: 18px;
      background: rgba(255,255,255,.09);
      border: 1px solid rgba(255,255,255,.18);
    }
    .cover-card b { display: block; font-size: 30px; }
    .cover-card span { color: #c9e3f7; font-size: 12px; }
    .toc-page {
      min-height: 100vh;
      padding: 20px 0 10px;
      page-break-after: always;
    }
    .eyebrow, .module-kicker, .project-kicker {
      color: #b96b12;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    .module-kicker, .project-kicker {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .inline-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      vertical-align: -3px;
    }
    h1, h2, h3 {
      color: #08284c;
      letter-spacing: -.035em;
      line-height: 1.12;
    }
    .toc-page h1 {
      font-size: 34px;
      margin: 0 0 8px;
    }
    .toc-subtitle {
      margin: 0 0 16px;
      color: #51677d;
      max-width: 790px;
    }
    .toc-band {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 14px;
      align-items: stretch;
      margin: 15px 0 18px;
    }
    .toc-band-card {
      padding: 16px 18px;
      border-radius: 20px;
      background: linear-gradient(135deg, #08284c 0%, #0e5a75 100%);
      color: #ffffff;
      box-shadow: 0 12px 28px rgba(8, 40, 76, .14);
    }
    .toc-band-card strong {
      display: block;
      font-size: 20px;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    .toc-band-card span {
      display: block;
      color: #d8efff;
      font-size: 12px;
    }
    .toc-band-note {
      padding: 16px 18px;
      border-radius: 20px;
      border: 1px solid #d8e7f2;
      background: #ffffff;
      color: #4f6680;
      font-size: 12px;
      box-shadow: 0 8px 22px rgba(12, 46, 80, .05);
    }
    .toc-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .toc-card {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 13px;
      align-items: start;
      min-height: 78px;
      padding: 13px 15px;
      border-radius: 18px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid #cfe1ee;
      box-shadow: 0 8px 22px rgba(12, 46, 80, .055);
      break-inside: avoid;
    }
    .toc-icon {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #0d6b8d;
      background: linear-gradient(135deg, #e9f8f3 0%, #eaf3ff 100%);
      border: 1px solid #cae3ef;
    }
    .toc-icon-svg {
      width: 25px;
      height: 25px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .toc-content strong {
      display: block;
      color: #b96b12;
      font-size: 10.5px;
      letter-spacing: .11em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .toc-content em {
      display: block;
      color: #092f55;
      font-style: normal;
      font-weight: 800;
      font-size: 14.2px;
      line-height: 1.25;
    }
    .toc-content small {
      display: block;
      color: #60758a;
      font-size: 11.3px;
      margin-top: 5px;
      line-height: 1.25;
    }
    .module {
      padding: 26px 0 18px;
      page-break-after: always;
    }
    .module h2 {
      font-size: 29px;
      margin: 0 0 12px;
      padding-bottom: 11px;
      border-bottom: 2px solid #d5e5f2;
    }
    p {
      margin: 8px 0 10px;
      color: #334b65;
      font-size: 13.2px;
    }
    p strong {
      color: #092f55;
    }
    ul {
      margin: 8px 0 14px;
      padding: 13px 18px 13px 30px;
      background: #fff;
      border: 1px solid #d9e6f1;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(12, 46, 80, .045);
    }
    li {
      margin: 4px 0;
      color: #253a51;
      font-size: 12.8px;
    }
    .sprint-heading {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 6px;
      padding: 8px 12px;
      border-radius: 999px;
      color: #08284c;
      background: linear-gradient(135deg, #eef7ff 0%, #f6fbff 100%);
      border: 1px solid #cfe3f2;
      font-size: 13.2px;
      page-break-after: avoid;
    }
    .sprint-heading .inline-icon {
      color: #0d6b8d;
      width: 15px;
      height: 15px;
    }
    .labs {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 13px 15px;
      border-left: 4px solid #1d9e75;
      border-radius: 13px;
      background: #f4fcf8;
      color: #254a3d;
    }
    .project-card {
      margin: 18px 0 4px;
      padding: 17px 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, #eef7ff 0%, #f8fbff 100%);
      border: 1px solid #c6dff2;
      box-shadow: 0 12px 28px rgba(12, 46, 80, .07);
      page-break-inside: avoid;
    }
    .project-card h3 {
      margin: 0 0 10px;
      font-size: 20px;
    }
    .project-card p {
      color: #314961;
      font-size: 13px;
    }
    .deliverables {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 10px;
      padding: 11px 13px;
      border-radius: 12px;
      background: #fffaf0;
      border: 1px solid #eccd91;
      color: #4c3a1f;
    }
    hr {
      border: 0;
      height: 1px;
      background: #d7e5f2;
      margin: 18px 0;
    }
    pre {
      padding: 14px;
      border-radius: 14px;
      background: #0b1e34;
      color: #d9efff;
      overflow: hidden;
      font-size: 11px;
    }
    .footer-note {
      color: #6b7d90;
      font-size: 11px;
      margin-top: 24px;
    }
    @media print {
      body { background: white; }
    }
  </style>
</head>
<body>
  <section class="cover">
    <div class="cover-kicker">Complete Syllabus</div>
    <h1>${title}</h1>
    <h2>${subtitle}</h2>
    <p>16 modules, ${skillSprintCount} skill sprints, and a project-first path from Linux shell and Python fundamentals to enterprise LLM platforms, MLOps, LLMOps, RAG, agents, multimodal AI and product-ready delivery.</p>
    <div class="cover-grid">
      <div class="cover-card"><b>16</b><span>Modules</span></div>
      <div class="cover-card"><b>${skillSprintCount}</b><span>Skill Sprints</span></div>
      <div class="cover-card"><b>16</b><span>Projects</span></div>
      <div class="cover-card"><b>1</b><span>Enterprise path</span></div>
    </div>
  </section>
  <section class="toc-page">
    <div class="eyebrow">Table of Contents</div>
    <h1>Foundation to Core ML</h1>
    <p class="toc-subtitle">Start with the engineering base, then move into the math, data, and classical ML skills that make the advanced AI chapters easier to learn.</p>
    <div class="toc-band">
      <div class="toc-band-card">
        <strong>Chapters 01-08</strong>
        <span>Engineering fundamentals, Python, math, data work, Scikit-learn, PyTorch, and computer vision.</span>
      </div>
      <div class="toc-band-note">Each chapter ends with a build milestone so the learning path stays practical instead of becoming theory-only.</div>
    </div>
    <div class="toc-grid">${tocFoundation}</div>
  </section>
  <section class="toc-page">
    <div class="eyebrow">Table of Contents</div>
    <h1>Advanced AI to Enterprise Delivery</h1>
    <p class="toc-subtitle">Continue into language models, agents, production ML, platform engineering, evaluation, observability, and the final capstone path.</p>
    <div class="toc-band">
      <div class="toc-band-card">
        <strong>Chapters 09-16</strong>
        <span>NLP, reinforcement learning, LLMs, RAG, agents, MLOps, LLMOps, multimodal AI, and enterprise delivery.</span>
      </div>
      <div class="toc-band-note">Use this second half as the enterprise-readiness track: every chapter connects modeling skill with production thinking.</div>
    </div>
    <div class="toc-grid">${tocEnterprise}</div>
  </section>
  ${htmlBody}
</body>
</html>`;

fs.writeFileSync(outHtml, html);
console.log(outHtml);
