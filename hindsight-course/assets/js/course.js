/* ============================================================
   Hindsight Source Deep-Dive — shared course logic (i18n-aware)
   - Builds the chapter sidebar from per-language COURSE data
   - Highlights the current page, builds prev/next pager
   - Renders code (highlight.js) and diagrams (mermaid)
   - Light/dark theme toggle (persisted), mobile nav, language switcher
   Two language trees share these assets: the Chinese pages live at the
   site root, the English pages live under ./en/. Adding a language means
   adding an entry to COURSE plus a folder of translated pages — nothing
   else changes. Diagrams always render on a light card with mermaid's
   'default' theme so they stay legible in both light and dark modes.
   ============================================================ */

const COURSE = {
  zh: {
    title: "Hindsight 源码精读",
    subtitle: "像读一门工程课程那样读懂一个 Agent 记忆系统",
    themeLabel: "🌗 主题",
    switchLabel: "EN",
    switchTitle: "Switch to English",
    prevLabel: "← 上一章",
    nextLabel: "下一章 →",
    diagramFail: "⚠️ 此图渲染失败,原始定义如下:\n",
    parts: [
      { part: "开始之前", chapters: [
        { id: "index", num: "", title: "课程导读", file: "index.html", desc: "这门课讲什么、怎么读、如何把系统跑起来" },
      ]},
      { part: "第一部分 · 认识系统", chapters: [
        { id: "ch01", num: "01", title: "全景与核心概念", file: "ch01-big-picture.html", desc: "它解决什么问题、三层架构、monorepo 地图" },
        { id: "ch02", num: "02", title: "数据模型:记忆长什么样", file: "ch02-data-model.html", desc: "表结构、ER 关系、pgvector、事实作为原子单位" },
      ]},
      { part: "第二部分 · 写入 Retain", chapters: [
        { id: "ch03", num: "03", title: "Retain 端到端", file: "ch03-retain-e2e.html", desc: "一次请求从 HTTP 走到落库,streaming 与事务设计" },
        { id: "ch04", num: "04", title: "事实抽取与切块", file: "ch04-extraction-chunking.html", desc: "chunk_text 的幂等、LLM 抽事实、prompt 设计" },
        { id: "ch05", num: "05", title: "实体解析与建边", file: "ch05-entities-links.html", desc: "实体归一、时序/语义/因果边、Phase1/2/3" },
      ]},
      { part: "第三部分 · 检索 Recall", chapters: [
        { id: "ch06", num: "06", title: "Recall 总览与查询分析", file: "ch06-recall-overview.html", desc: "整体流水线、时间约束抽取、并行与资源控制" },
        { id: "ch07", num: "07", title: "四路检索", file: "ch07-four-retrievers.html", desc: "语义 / BM25 / 图扩展 / 时间扩散,逐路拆解" },
        { id: "ch08", num: "08", title: "融合与重排", file: "ch08-fusion-rerank.html", desc: "RRF 融合、cross-encoder 重排、token 预算裁剪" },
      ]},
      { part: "第四部分 · 推理与巩固", chapters: [
        { id: "ch09", num: "09", title: "巩固:从事实到观察", file: "ch09-consolidation.html", desc: "observation 如何从 facts 合成、scopes 语义" },
        { id: "ch10", num: "10", title: "Reflect:带性格的推理", file: "ch10-reflect.html", desc: "agent 循环、工具、mental models、disposition" },
      ]},
      { part: "第五部分 · 横切支撑", chapters: [
        { id: "ch11", num: "11", title: "LLM 抽象层与 Embeddings", file: "ch11-llm-embeddings.html", desc: "provider 模型、structured output、层级配置" },
      ]},
      { part: "第六部分 · 生态概览", chapters: [
        { id: "ch12", num: "12", title: "生态全景", file: "ch12-ecosystem.html", desc: "control plane、CLI、集成模式、部署与基准" },
      ]},
      { part: "附录", chapters: [
        { id: "appendix", num: "A", title: "源码跳读地图与术语表", file: "appendix.html", desc: "按职责找文件、易混概念、运行调试、测试导读" },
      ]},
    ],
  },
  en: {
    title: "Hindsight Source Deep-Dive",
    subtitle: "Reading an agent memory system like an engineering course",
    themeLabel: "🌗 Theme",
    switchLabel: "中文",
    switchTitle: "切换到中文",
    prevLabel: "← Previous",
    nextLabel: "Next →",
    diagramFail: "⚠️ This diagram failed to render. Source definition below:\n",
    parts: [
      { part: "Before You Start", chapters: [
        { id: "index", num: "", title: "Course Guide", file: "index.html", desc: "What this course is, how to read it, running the system" },
      ]},
      { part: "Part 1 · Understanding the System", chapters: [
        { id: "ch01", num: "01", title: "Big Picture & Core Concepts", file: "ch01-big-picture.html", desc: "The problem it solves, the 3-layer architecture, the monorepo map" },
        { id: "ch02", num: "02", title: "The Data Model: What a Memory Looks Like", file: "ch02-data-model.html", desc: "Tables, ER relations, pgvector, the fact as the atomic unit" },
      ]},
      { part: "Part 2 · Writing (Retain)", chapters: [
        { id: "ch03", num: "03", title: "Retain End-to-End", file: "ch03-retain-e2e.html", desc: "One request from HTTP to storage; streaming & transaction design" },
        { id: "ch04", num: "04", title: "Fact Extraction & Chunking", file: "ch04-extraction-chunking.html", desc: "chunk_text idempotency, LLM extraction, prompt design" },
        { id: "ch05", num: "05", title: "Entity Resolution & Link Building", file: "ch05-entities-links.html", desc: "Entity normalization, temporal/semantic/causal edges, Phase1/2/3" },
      ]},
      { part: "Part 3 · Retrieval (Recall)", chapters: [
        { id: "ch06", num: "06", title: "Recall Overview & Query Analysis", file: "ch06-recall-overview.html", desc: "The pipeline, temporal-constraint extraction, parallelism & budgets" },
        { id: "ch07", num: "07", title: "The Four Retrievers", file: "ch07-four-retrievers.html", desc: "Semantic / BM25 / graph expansion / temporal spreading, arm by arm" },
        { id: "ch08", num: "08", title: "Fusion & Reranking", file: "ch08-fusion-rerank.html", desc: "RRF fusion, cross-encoder reranking, token-budget trimming" },
      ]},
      { part: "Part 4 · Reasoning & Consolidation", chapters: [
        { id: "ch09", num: "09", title: "Consolidation: Facts to Observations", file: "ch09-consolidation.html", desc: "How observations are synthesized from facts; scope semantics" },
        { id: "ch10", num: "10", title: "Reflect: Disposition-Aware Reasoning", file: "ch10-reflect.html", desc: "The agent loop, tools, mental models, disposition" },
      ]},
      { part: "Part 5 · Cross-Cutting Infrastructure", chapters: [
        { id: "ch11", num: "11", title: "The LLM Abstraction & Embeddings", file: "ch11-llm-embeddings.html", desc: "Provider model, structured output, hierarchical config" },
      ]},
      { part: "Part 6 · Ecosystem Overview", chapters: [
        { id: "ch12", num: "12", title: "The Ecosystem", file: "ch12-ecosystem.html", desc: "Control plane, CLI, integration patterns, deployment & benchmarks" },
      ]},
      { part: "Appendix", chapters: [
        { id: "appendix", num: "A", title: "Source Map & Glossary", file: "appendix.html", desc: "Find files by role, confused terms, run/debug, reading the tests" },
      ]},
    ],
  },
};

function currentLang() {
  return document.documentElement.getAttribute("lang") === "en" ? "en" : "zh";
}
function courseData() {
  return COURSE[currentLang()] || COURSE.zh;
}
function assetPrefix() {
  return currentLang() === "en" ? "../assets/" : "assets/";
}

function flattenChapters() {
  const out = [];
  for (const p of courseData().parts) for (const c of p.chapters) out.push(c);
  return out;
}

function currentFile() {
  const path = location.pathname;
  const name = path.substring(path.lastIndexOf("/") + 1) || "index.html";
  return name;
}

function renderSidebar() {
  const nav = document.getElementById("sidebar");
  if (!nav) return;
  const d = courseData();
  const here = currentFile();
  const lang = currentLang();
  const switchHref = (lang === "en" ? "../" : "en/") + here;
  let html = `
    <div class="brand">
      <div class="logo">H</div>
      <div class="brand-text"><b>${d.title}</b><span>${d.subtitle}</span></div>
    </div>`;
  for (const p of d.parts) {
    html += `<div class="nav-part">${p.part}</div>`;
    for (const c of p.chapters) {
      const active = c.file === here ? " active" : "";
      const num = c.num ? `<span class="num">${c.num}</span>` : "";
      html += `<a class="nav-link${active}" href="${c.file}">${num}${c.title}</a>`;
    }
  }
  html += `
    <div class="nav-tools">
      <a id="lang-switch" href="${switchHref}" title="${d.switchTitle}">${d.switchLabel}</a>
      <button id="theme-toggle" title="${lang === "en" ? "Toggle theme" : "切换深浅色"}">${d.themeLabel}</button>
    </div>`;
  nav.innerHTML = html;

  const btn = document.getElementById("theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}

function renderLandingTOC() {
  const toc = document.getElementById("toc");
  if (!toc) return;
  let html = "";
  for (const p of courseData().parts) {
    html += `<div class="toc-part"><h3>${p.part}</h3><ul class="toc-list">`;
    for (const c of p.chapters) {
      const n = c.num || "•";
      html += `<li><a href="${c.file}"><span class="n">${n}</span><span><b>${c.title}</b><span class="desc">${c.desc || ""}</span></span></a></li>`;
    }
    html += `</ul></div>`;
  }
  toc.innerHTML = html;
}

function renderPager() {
  const pager = document.getElementById("pager");
  if (!pager) return;
  const d = courseData();
  const flat = flattenChapters();
  const here = currentFile();
  const i = flat.findIndex((c) => c.file === here);
  if (i < 0) { pager.style.display = "none"; return; }
  const prev = flat[i - 1];
  const next = flat[i + 1];
  let html = "";
  if (prev) {
    html += `<a class="prev" href="${prev.file}"><span class="dir">${d.prevLabel}</span><span class="t">${prev.num ? prev.num + " · " : ""}${prev.title}</span></a>`;
  } else {
    html += `<span></span>`;
  }
  if (next) {
    html += `<a class="next" href="${next.file}"><span class="dir">${d.nextLabel}</span><span class="t">${next.num ? next.num + " · " : ""}${next.title}</span></a>`;
  } else {
    html += `<span></span>`;
  }
  pager.innerHTML = html;
}

function initCode() {
  if (window.hljs) {
    document.querySelectorAll("pre code").forEach((el) => {
      try { window.hljs.highlightElement(el); } catch (e) { /* ignore */ }
    });
  }
}

async function initMermaid() {
  if (!window.mermaid) return;
  try {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      // useMaxWidth:false so the SVG keeps its true size; we scale it to fit
      // the card ourselves (below) which keeps the height correct and avoids
      // the overlap/clipping that can happen with mermaid's own responsive mode.
      flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: false },
      sequence: { useMaxWidth: false },
      themeVariables: { fontFamily: "inherit", fontSize: "15px" },
    });
  } catch (e) {
    console.warn("mermaid init failed", e);
    return;
  }
  // Render SEQUENTIALLY (never concurrently — concurrent mermaid.run calls race
  // on shared measurement state and produce overlapping / clipped output).
  const failMsg = courseData().diagramFail;
  const nodes = Array.from(document.querySelectorAll(".mermaid"));
  for (const el of nodes) {
    const src = el.textContent;
    el.setAttribute("data-src", src);
    try {
      // eslint-disable-next-line no-await-in-loop
      await window.mermaid.run({ nodes: [el] });
      // Force the rendered SVG to fit the card width with a correct height
      // (overrides mermaid's inline max-width; height:auto preserves aspect
      // ratio so the card reserves the right amount of vertical space).
      const svg = el.querySelector("svg");
      if (svg) {
        svg.style.maxWidth = "100%";
        svg.style.height = "auto";
        svg.removeAttribute("width");
      }
    } catch (err) {
      console.warn("mermaid render failed for one diagram", err);
      el.innerHTML =
        '<pre style="text-align:left;white-space:pre-wrap;color:#b91c1c;font-size:12px;margin:0">' +
        failMsg +
        src.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
        "</pre>";
    }
  }
}

/* ---------- theme ---------- */
function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  const link = document.getElementById("hljs-theme");
  if (link) {
    link.setAttribute(
      "href",
      assetPrefix() + (mode === "dark" ? "css/hljs-github-dark.css" : "css/hljs-github.css")
    );
  }
  try { localStorage.setItem("hs-course-theme", mode); } catch (e) {}
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(cur === "dark" ? "light" : "dark");
}
function initTheme() {
  let saved = "light";
  try {
    saved =
      localStorage.getItem("hs-course-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (e) {}
  applyTheme(saved);
}

/* ---------- mobile nav ---------- */
function initNavToggle() {
  const btn = document.getElementById("nav-toggle");
  const overlay = document.getElementById("overlay");
  if (!btn) return;
  btn.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  if (overlay) overlay.addEventListener("click", () => document.body.classList.remove("nav-open"));
  document.querySelectorAll("#sidebar .nav-link").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderSidebar();
  renderLandingTOC();
  renderPager();
  initNavToggle();
  initCode();
  initMermaid();
});
