/* ============================================================
   Hindsight source-code course — shared logic (bilingual)
   Language is taken from <html lang="..."> on each page
   ("zh-CN" or "en"). The same assets serve both languages;
   the page bodies are authored per language, while the
   navigation, pager, theme and language switcher come from here.
   ============================================================ */

const COURSE_BY_LANG = {
  "zh-CN": {
    title: "Hindsight 源码精读",
    brandSub: "Agent 记忆系统精读",
    parts: [
      { part: "开始之前", chapters: [
        { id: "index", num: "", title: "课程导读", file: "index.html", desc: "这门课讲什么、怎么读、如何把系统跑起来" } ] },
      { part: "第一部分 · 认识系统", chapters: [
        { id: "ch01", num: "01", title: "全景与核心概念", file: "ch01-big-picture.html", desc: "它解决什么问题、三层架构、monorepo 地图" },
        { id: "ch02", num: "02", title: "数据模型:记忆长什么样", file: "ch02-data-model.html", desc: "表结构、ER 关系、pgvector、事实作为原子单位" } ] },
      { part: "第二部分 · 写入 Retain", chapters: [
        { id: "ch03", num: "03", title: "Retain 端到端", file: "ch03-retain-e2e.html", desc: "一次请求从 HTTP 走到落库,streaming 与事务设计" },
        { id: "ch04", num: "04", title: "事实抽取与切块", file: "ch04-extraction-chunking.html", desc: "chunk_text 的幂等、LLM 抽事实、prompt 设计" },
        { id: "ch05", num: "05", title: "实体解析与建边", file: "ch05-entities-links.html", desc: "实体归一、时序/语义/因果边、Phase1/2/3" } ] },
      { part: "第三部分 · 检索 Recall", chapters: [
        { id: "ch06", num: "06", title: "Recall 总览与查询分析", file: "ch06-recall-overview.html", desc: "整体流水线、时间约束抽取、并行与资源控制" },
        { id: "ch07", num: "07", title: "四路检索", file: "ch07-four-retrievers.html", desc: "语义 / BM25 / 图扩展 / 时间扩散,逐路拆解" },
        { id: "ch08", num: "08", title: "融合与重排", file: "ch08-fusion-rerank.html", desc: "RRF 融合、cross-encoder 重排、token 预算裁剪" } ] },
      { part: "第四部分 · 推理与巩固", chapters: [
        { id: "ch09", num: "09", title: "巩固:从事实到观察", file: "ch09-consolidation.html", desc: "observation 如何从 facts 合成、scopes 语义" },
        { id: "ch10", num: "10", title: "Reflect:带性格的推理", file: "ch10-reflect.html", desc: "agent 循环、工具、mental models、disposition" } ] },
      { part: "第五部分 · 横切支撑", chapters: [
        { id: "ch11", num: "11", title: "LLM 抽象层与 Embeddings", file: "ch11-llm-embeddings.html", desc: "provider 模型、structured output、层级配置" } ] },
      { part: "第六部分 · 生态概览", chapters: [
        { id: "ch12", num: "12", title: "生态全景", file: "ch12-ecosystem.html", desc: "control plane、CLI、集成模式、部署与基准" } ] },
      { part: "附录", chapters: [
        { id: "appendix", num: "A", title: "源码跳读地图与术语表", file: "appendix.html", desc: "按职责找文件、易混概念、运行调试、测试导读" } ] },
    ],
  },
  en: {
    title: "Reading Hindsight's Source",
    brandSub: "An Agent Memory System, Read in Depth",
    parts: [
      { part: "Before you start", chapters: [
        { id: "index", num: "", title: "Course Guide", file: "index.html", desc: "What this course is, how to read it, how to run the system" } ] },
      { part: "Part 1 · Understanding the System", chapters: [
        { id: "ch01", num: "01", title: "The Big Picture & Core Concepts", file: "ch01-big-picture.html", desc: "The problem it solves, the 3-layer architecture, the monorepo map" },
        { id: "ch02", num: "02", title: "The Data Model: What a Memory Looks Like", file: "ch02-data-model.html", desc: "Tables, ER relations, pgvector, the fact as the atomic unit" } ] },
      { part: "Part 2 · Writing — Retain", chapters: [
        { id: "ch03", num: "03", title: "Retain End-to-End", file: "ch03-retain-e2e.html", desc: "One request from HTTP to storage; streaming & the transaction design" },
        { id: "ch04", num: "04", title: "Fact Extraction & Chunking", file: "ch04-extraction-chunking.html", desc: "chunk_text idempotency, LLM fact extraction, prompt design" },
        { id: "ch05", num: "05", title: "Entity Resolution & Link Building", file: "ch05-entities-links.html", desc: "Entity normalization, temporal/semantic/causal edges, Phase1/2/3" } ] },
      { part: "Part 3 · Retrieval — Recall", chapters: [
        { id: "ch06", num: "06", title: "Recall Overview & Query Analysis", file: "ch06-recall-overview.html", desc: "The pipeline, temporal-constraint extraction, parallelism & budgets" },
        { id: "ch07", num: "07", title: "The Four Retrievers", file: "ch07-four-retrievers.html", desc: "Semantic / BM25 / graph expansion / temporal, arm by arm" },
        { id: "ch08", num: "08", title: "Fusion & Reranking", file: "ch08-fusion-rerank.html", desc: "RRF fusion, cross-encoder reranking, token-budget trimming" } ] },
      { part: "Part 4 · Reasoning & Consolidation", chapters: [
        { id: "ch09", num: "09", title: "Consolidation: Facts to Observations", file: "ch09-consolidation.html", desc: "How observations are synthesized from facts; scope semantics" },
        { id: "ch10", num: "10", title: "Reflect: Disposition-Aware Reasoning", file: "ch10-reflect.html", desc: "The agent loop, tools, mental models, disposition" } ] },
      { part: "Part 5 · Cross-Cutting Infrastructure", chapters: [
        { id: "ch11", num: "11", title: "The LLM Abstraction & Embeddings", file: "ch11-llm-embeddings.html", desc: "The provider model, structured output, hierarchical config" } ] },
      { part: "Part 6 · Ecosystem Overview", chapters: [
        { id: "ch12", num: "12", title: "The Ecosystem at a Glance", file: "ch12-ecosystem.html", desc: "Control plane, CLI, integration patterns, deployment & benchmarks" } ] },
      { part: "Appendix", chapters: [
        { id: "appendix", num: "A", title: "Code Map & Glossary", file: "appendix.html", desc: "Find files by role, confused terms, run/debug, tests" } ] },
    ],
  },
};

const UI = {
  "zh-CN": { theme: "🌗 主题", prev: "← 上一章", next: "下一章 →", menu: "目录", switchTo: "EN" },
  en:      { theme: "🌗 Theme", prev: "← Previous", next: "Next →", menu: "Menu", switchTo: "中文" },
};

const LANG = (document.documentElement.lang === "en") ? "en" : "zh-CN";
const COURSE = COURSE_BY_LANG[LANG] || COURSE_BY_LANG["zh-CN"];
const T = UI[LANG] || UI["zh-CN"];

function flattenChapters() {
  const out = [];
  for (const p of COURSE.parts) for (const c of p.chapters) out.push(c);
  return out;
}

function currentFile() {
  const path = location.pathname;
  return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

// The other language's copy of the current page. zh pages live at the root,
// en pages live in ./en/, so the cross-link is relative to the current folder.
function otherLangHref() {
  const file = currentFile();
  const isEn = location.pathname.includes("/en/");
  return isEn ? "../" + file : "en/" + file;
}

function renderSidebar() {
  const nav = document.getElementById("sidebar");
  if (!nav) return;
  const here = currentFile();
  let html = `
    <div class="brand">
      <div class="logo">H</div>
      <div class="brand-text"><b>${COURSE.title}</b><span>${COURSE.brandSub}</span></div>
    </div>`;
  for (const p of COURSE.parts) {
    html += `<div class="nav-part">${p.part}</div>`;
    for (const c of p.chapters) {
      const active = c.file === here ? " active" : "";
      const num = c.num ? `<span class="num">${c.num}</span>` : "";
      html += `<a class="nav-link${active}" href="${c.file}">${num}${c.title}</a>`;
    }
  }
  html += `
    <div class="nav-tools">
      <button id="theme-toggle" title="${LANG === "en" ? "Toggle light/dark" : "切换深浅色"}">${T.theme}</button>
      <a id="lang-switch" href="${otherLangHref()}" title="${LANG === "en" ? "切换到中文" : "Switch to English"}">${T.switchTo}</a>
    </div>`;
  nav.innerHTML = html;

  const btn = document.getElementById("theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}

function renderLandingTOC() {
  const toc = document.getElementById("toc");
  if (!toc) return;
  let html = "";
  for (const p of COURSE.parts) {
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
  const flat = flattenChapters();
  const here = currentFile();
  const i = flat.findIndex((c) => c.file === here);
  if (i < 0) { pager.style.display = "none"; return; }
  const prev = flat[i - 1];
  const next = flat[i + 1];
  let html = "";
  if (prev) {
    html += `<a class="prev" href="${prev.file}"><span class="dir">${T.prev}</span><span class="t">${prev.num ? prev.num + " · " : ""}${prev.title}</span></a>`;
  } else { html += `<span></span>`; }
  if (next) {
    html += `<a class="next" href="${next.file}"><span class="dir">${T.next}</span><span class="t">${next.num ? next.num + " · " : ""}${next.title}</span></a>`;
  } else { html += `<span></span>`; }
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
      flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: false },
      sequence: { useMaxWidth: false },
      themeVariables: { fontFamily: "inherit", fontSize: "15px" },
    });
  } catch (e) {
    console.warn("mermaid init failed", e);
    return;
  }
  const nodes = Array.from(document.querySelectorAll(".mermaid"));
  for (const el of nodes) {
    const src = el.textContent;
    el.setAttribute("data-src", src);
    try {
      // eslint-disable-next-line no-await-in-loop
      await window.mermaid.run({ nodes: [el] });
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
        "⚠️ render failed; source:\n" +
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
    const base = location.pathname.includes("/en/") ? "../" : "";
    link.setAttribute(
      "href",
      base + (mode === "dark" ? "assets/css/hljs-github-dark.css" : "assets/css/hljs-github.css")
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
