/**
 * The "AI harness" section group — a Claude Code / Pi-style web AI experience:
 * a full conversation shell with streaming, markdown prose, code blocks,
 * tool-call cards, reasoning, a diff view, an agent plan, citations, message
 * actions, and an interactive composer with a model selector. All token-driven.
 */
import type { Section } from "./sections.js";
import { icon } from "./icons.js";

const demo = (inner: string, cls = "") => `<div class="demo ${cls}">${inner}</div>`;
const chev = icon("chevron-right", { cls: "t-chev", size: 13 });

/** A message row. */
function aiMsg(role: "user" | "assistant", avatar: string, label: string, body: string, actions = false): string {
  return `<div class="ai-msg ${role}"><div class="ai-avatar">${avatar}</div><div class="ai-body"><div class="ai-role">${label}</div><div class="ai-content">${body}</div>${actions ? aiActions() : ""}</div></div>`;
}

function aiActions(): string {
  return `<div class="ai-actions">
    <button class="ai-act" data-ai-copy title="Copy" aria-label="Copy">${icon("copy", { size: 15 })}</button>
    <button class="ai-act" title="Retry" aria-label="Retry">${icon("refresh", { size: 15 })}</button>
    <button class="ai-act" title="Edit" aria-label="Edit">${icon("edit", { size: 15 })}</button>
    <button class="ai-act" data-ai-vote title="Good response" aria-label="Good response">${icon("thumbs-up", { size: 15 })}</button>
    <button class="ai-act" data-ai-vote title="Bad response" aria-label="Bad response">${icon("thumbs-down", { size: 15 })}</button>
  </div>`;
}

function aiReasoning(text: string): string {
  return `<div class="ai-reasoning"><div class="ai-reasoning-head" data-ai-reasoning-toggle>${chev} Thought for 3s</div><div class="ai-reasoning-body">${text}</div></div>`;
}

function aiPlan(items: Array<{ state: "done" | "run" | "pending"; text: string }>): string {
  return `<div class="ai-plan"><div class="ai-plan-title">Plan</div>${items
    .map((i) => `<div class="ai-plan-item ${i.state}"><span class="mark">${i.state === "done" ? icon("check", { size: 11 }) : ""}</span>${i.text}</div>`)
    .join("")}</div>`;
}

function aiTool(name: string, arg: string, status: "run" | "done", output: string): string {
  const badge = status === "run" ? `<span class="spinner"></span> running` : `${icon("check", { size: 12 })} done`;
  return `<div class="ai-tool ${status === "done" ? "open" : ""}"><div class="ai-tool-head" data-ai-tool-toggle>${chev}<span class="t-name">${name}</span><span class="t-arg">${arg}</span><span class="ai-tool-status ${status}">${badge}</span></div><div class="ai-tool-body">${output}</div></div>`;
}

function aiCode(lang: string, code: string): string {
  return `<div class="ai-code"><div class="ai-code-head"><span>${lang}</span><button class="ai-code-copy" data-ai-copy-code>${icon("copy", { size: 13 })} Copy</button></div><pre><code>${code}</code></pre></div>`;
}

function aiDiff(lines: Array<{ type: "ctx" | "add" | "del"; text: string }>): string {
  return `<div class="ai-diff">${lines
    .map((l) => `<div class="ai-diff-line ${l.type}"><span class="gutter">${l.type === "add" ? "+" : l.type === "del" ? "−" : ""}</span><span class="code">${l.text}</span></div>`)
    .join("")}</div>`;
}

function aiCitations(sources: string[]): string {
  return `<div class="ai-cite">${sources.map((s, i) => `<a href="#"><span class="num">${i + 1}</span> ${s}</a>`).join("")}</div>`;
}

const SAMPLE_CODE = `<span class="tok-key">import</span> { AreaBand } <span class="tok-key">from</span> <span class="tok-str">"@/components/ui/area-band"</span>

<span class="tok-com">// WEO real GDP growth, history + projection band</span>
<span class="tok-key">export function</span> <span class="tok-fn">GrowthChart</span>() {
  <span class="tok-key">return</span> &lt;<span class="tok-fn">AreaBand</span> data={weo} title=<span class="tok-str">"World GDP growth"</span> /&gt;
}`;

function aiComposer(brand: string): string {
  return `<div class="ai-composer">
    <div class="ai-composer-box">
      <textarea data-ai-input rows="1" placeholder="Ask ${brand} anything…  (⌘↵ to send)"></textarea>
      <div class="ai-composer-tools">
        <button class="ai-tool-btn" title="Attach file" aria-label="Attach file">${icon("paperclip", { size: 17 })}</button>
        <div class="ai-model"><button class="ai-model-trigger" data-menu-trigger>${icon("sparkles", { size: 13 })} <span data-ai-model-value>Analyst v2</span> ${icon("chevron-down", { size: 13 })}</button><div data-menu><div class="menu-item" data-ai-model-option>Analyst v2</div><div class="menu-item" data-ai-model-option>Analyst Pro</div><div class="menu-item" data-ai-model-option>Fast draft</div></div></div>
        <span class="ai-usage">${icon("clock", { size: 12 })} 3.2k / 200k <span class="bar"><span style="width:2%"></span></span></span>
        <button class="ai-send" data-ai-send title="Send" aria-label="Send">${icon("send", { size: 16 })}</button>
      </div>
    </div>
  </div>`;
}

/** Build the AI-harness section group. */
export function aiSections(brand: string): Section[] {
  const rail = `<div class="ai-rail">
    <div class="ai-rail-head"><button class="btn btn-outline btn-sm" style="width:100%;display:inline-flex;align-items:center;gap:.4rem;justify-content:center">${icon("plus", { size: 15 })} New chat</button></div>
    <div class="ai-rail-list">
      <div class="ai-rail-group">Today</div>
      <div class="ai-rail-item on">Add WEO growth chart</div>
      <div class="ai-rail-item">Explain the fan chart band</div>
      <div class="ai-rail-item">Refactor the data loader</div>
      <div class="ai-rail-group">Yesterday</div>
      <div class="ai-rail-item">Debug inflation query</div>
      <div class="ai-rail-item">Draft the WEO summary</div>
    </div>
  </div>`;

  const transcript = [
    aiMsg("user", "FC", "You", `<p>Add a WEO growth projection chart to the dashboard, using our theme.</p>`),
    aiMsg(
      "assistant",
      icon("sparkles", { size: 15 }),
      "Analyst",
      aiReasoning(
        "The dashboard already imports card primitives. I should reuse the area-band chart (it renders the projection fan) and feed it the WEO series so it stays token-driven and matches the theme.",
      ) +
        aiPlan([
          { state: "done", text: "Locate the dashboard layout" },
          { state: "done", text: "Add the GrowthChart component" },
          { state: "run", text: "Wire the WEO data source" },
          { state: "pending", text: "Add a unit test" },
        ]) +
        `<p>I'll add a <code>GrowthChart</code> that wraps <code>AreaBand</code> and drop it into the dashboard grid.</p>` +
        aiTool("Read", "app/dashboard/page.tsx", "done", "1  export default function Dashboard() {\n2    return <div className=\"grid\">…</div>\n3  }") +
        aiTool("Edit", "components/growth-chart.tsx", "done", "+ created components/growth-chart.tsx (7 lines)") +
        aiCode("components/growth-chart.tsx", SAMPLE_CODE) +
        `<p>Then wired it into the dashboard grid:</p>` +
        aiDiff([
          { type: "ctx", text: "  <CardContent>" },
          { type: "del", text: "    <Placeholder label=\"chart\" />" },
          { type: "add", text: "    <GrowthChart />" },
          { type: "ctx", text: "  </CardContent>" },
        ]) +
        `<p>Done — the chart inherits <code>--chart-1</code> and the projection band renders with a dashed forecast. Restart the dev server to see it.</p>` +
        aiCitations(["WEO Oct 2026", "area-band.tsx", "theming.md"]),
      true,
    ),
  ].join("");

  const shell = `<div class="ai-shell" data-ai-shell>
    ${rail}
    <div class="ai-main">
      <div class="ai-convo" data-ai-convo>${transcript}</div>
      ${aiComposer(brand)}
    </div>
  </div>`;

  return [
    {
      id: "ai-chat",
      group: "AI harness",
      title: "Conversation",
      desc: "A full AI chat surface (Claude Code / Pi-style): streaming replies, reasoning, tool calls, code + diff, an agent plan, citations, and a live composer with a model selector. Type a message and send.",
      html: demo(shell, "col"),
    },
    {
      id: "ai-anatomy",
      group: "AI harness",
      title: "Message anatomy",
      desc: "The building blocks: reasoning, tool-call cards, code block, diff, plan, and citations.",
      html: demo(
        `<div style="width:100%;max-width:640px">
          ${aiReasoning("Let me check the current bandwidth before choosing the KDE smoothing.")}
          ${aiTool("Bash", "npm test", "run", "running vitest…")}
          ${aiTool("Read", "lib/stats.ts", "done", "export function gaussianKDE(xs) { … }")}
          ${aiCode("bash", `<span class="tok-com"># apply the brand theme</span>\n<span class="tok-fn">npx</span> shadcn-theming apply brand.json <span class="tok-key">--yes</span>`)}
          ${aiDiff([
            { type: "ctx", text: "  --primary: oklch(0.205 0 0);" },
            { type: "del", text: "  --primary: oklch(0.205 0 0);" },
            { type: "add", text: "  --primary: oklch(0.42 0.14 255);" },
          ])}
          ${aiPlan([
            { state: "done", text: "Derive OKLCH tokens" },
            { state: "run", text: "Patch globals.css" },
            { state: "pending", text: "Verify contrast" },
          ])}
          ${aiCitations(["shadcn-tokens.md", "color-science.md"])}
        </div>`,
        "col",
      ),
    },
    {
      id: "ai-composer",
      group: "AI harness",
      title: "Composer & prompt starters",
      desc: "The empty-state greeting with suggested prompts, plus the standalone composer.",
      html: demo(
        `<div style="width:100%;max-width:640px">
          <div class="ai-empty">
            <div class="mark">${brand.trim().charAt(0).toUpperCase() || "◆"}</div>
            <h3>How can I help with the data?</h3>
            <p>Ask about projections, build a chart, or draft a summary.</p>
            <div class="ai-suggest">
              <button data-ai-suggest>${icon("bar-chart", { size: 16 })} <span>Chart world GDP growth with the projection band</span></button>
              <button data-ai-suggest>${icon("calculator", { size: 16 })} <span>Explain the Phillips-curve regression</span></button>
              <button data-ai-suggest>${icon("edit", { size: 16 })} <span>Draft a one-paragraph WEO summary</span></button>
              <button data-ai-suggest>${icon("map", { size: 16 })} <span>Compare inflation across regions</span></button>
            </div>
          </div>
          <div class="ai-shell" data-ai-shell style="grid-template-columns:1fr;height:auto;margin-top:1.25rem">
            <div class="ai-main"><div class="ai-convo" data-ai-convo style="min-height:60px;padding:0.75rem"></div>${aiComposer(brand)}</div>
          </div>
        </div>`,
        "col",
      ),
    },
  ];
}
