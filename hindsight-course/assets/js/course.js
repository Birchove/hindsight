/* ============================================================
   Hindsight 源码精读 — shared course logic
   - Builds the chapter sidebar from COURSE data
   - Highlights the current page, builds prev/next pager
   - Renders code (highlight.js) and diagrams (mermaid)
   - Light/dark theme toggle (persisted), mobile nav
   Diagrams always render on a light card with mermaid 'default'
   theme, so they stay legible in both light and dark modes.
   ============================================================ */

const COURSE = {
  title: "Hindsight 源码精读",
  subtitle: "像读一门工程课程那样读懂一个 Agent 记忆系统",
  parts: [
    {
      part: "开始之前",
      chapters: [
        { id: "index", num: "", title: "课程导读", file: "index.html", desc: "这门课讲什么、怎么读、如何把系统跑起来" },
      ],
    },
    {
      part: "第一部分 · 认识系统",
      chapters: [
        { id: "ch01", num: "01", title: "全景与核心概念", file: "ch01-big-picture.html", desc: "它解决什么问题、三层架构、monorepo 地图" },
        { id: "ch02", num: "02", title: "数据模型:记忆长什么样", file: "ch02-data-model.html", desc: "表结构、ER 关系、pgvector、事实作为原子单位" },
      ],
    },
    {
      part: "第二部分 · 写入 Retain",
      chapters: [
        { id: "ch03", num: "03", title: "Retain 端到端", file: "ch03-retain-e2e.html", desc: "一次请求从 HTTP 走到落库,streaming 与事务设计" },
        { id: "ch04", num: "04", title: "事实抽取与切块", file: "ch04-extraction-chunking.html", desc: "chunk_text 的幂等、LLM 抽事实、prompt 设计" },
        { id: "ch05", num: "05", title: "实体解析与建边", file: "ch05-entities-links.html", desc: "实体归一、时序/语义/因果边、Phase1/2/3" },
      ],
    },
    {
      part: "第三部分 · 检索 Recall",
      chapters: [
        { id: "ch06", num: "06", title: "Recall 总览与查询分析", file: "ch06-recall-overview.html", desc: "整体流水线、时间约束抽取、并行与资源控制" },
        { id: "ch07", num: "07", title: "四路检索", file: "ch07-four-retrievers.html", desc: "语义 / BM25 / 图扩展 / 时间扩散,逐路拆解" },
        { id: "ch08", num: "08", title: "融合与重排", file: "ch08-fusion-rerank.html", desc: "RRF 融合、cross-encoder 重排、token 预算裁剪" },
      ],
    },
    {
      part: "第四部分 · 推理与巩固",
      chapters: [
        { id: "ch09", num: "09", title: "巩固:从事实到观察", file: "ch09-consolidation.html", desc: "observation 如何从 facts 合成、scopes 语义" },
        { id: "ch10", num: "10", title: "Reflect:带性格的推理", file: "ch10-reflect.html", desc: "agent 循环、工具、mental models、disposition" },
      ],
    },
    {
      part: "第五部分 · 横切支撑",
      chapters: [
        { id: "ch11", num: "11", title: "LLM 抽象层与 Embeddings", file: "ch11-llm-embeddings.html", desc: "provider 模型、structured output、层级配置" },
      ],
    },
    {
      part: "第六部分 · 生态概览",
      chapters: [
        { id: "ch12", num: "12", title: "生态全景", file: "ch12-ecosystem.html", desc: "control plane、CLI、集成模式、部署与基准" },
      ],
    },
    {
      part: "附录",
      chapters: [
        { id: "appendix", num: "A", title: "源码跳读地图与术语表", file: "appendix.html", desc: "按职责找文件、易混概念、运行调试、测试导读" },
      ],
    },
  ],
};

function flattenChapters() {
  const out = [];
  for (const p of COURSE.parts) for (const c of p.chapters) out.push(c);
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
  const here = currentFile();
  let html = `
    <div class="brand">
      <div class="logo">H</div>
      <div class="brand-text"><b>${COURSE.title}</b><span>Agent 记忆系统精读</span></div>
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
      <button id="theme-toggle" title="切换深浅色">🌗 主题</button>
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
    html += `<a class="prev" href="${prev.file}"><span class="dir">← 上一章</span><span class="t">${prev.num ? prev.num + " · " : ""}${prev.title}</span></a>`;
  } else {
    html += `<span></span>`;
  }
  if (next) {
    html += `<a class="next" href="${next.file}"><span class="dir">下一章 →</span><span class="t">${next.num ? next.num + " · " : ""}${next.title}</span></a>`;
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
        "⚠️ 此图渲染失败,原始定义如下:\n" +
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
      mode === "dark" ? "assets/css/hljs-github-dark.css" : "assets/css/hljs-github.css"
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
