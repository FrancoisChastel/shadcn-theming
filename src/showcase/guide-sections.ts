/**
 * The "Develop" page — how to install and use the design system across tools
 * (VS Code / Claude Code / Pi), the downloadable Agent Skill + AGENTS.md, and a
 * contribution guide (create-a-component workflow + PR checklist). The doc
 * contents are single-sourced from the real repo files via guide-content.ts.
 */
import type { Section } from "./sections.js";
import { icon } from "./icons.js";
import { AGENTS_MD, SKILL_MD, CONTRIBUTING_MD } from "./guide-content.js";

const RAW = "https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/registry";

function escHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
}

/** A copyable multi-line command block. */
function cmd(lines: string): string {
  return `<div class="cmd-block"><button class="cmd-copy" data-doc-copy aria-label="Copy">${icon("copy", { size: 14 })}</button><pre class="doc-pre" data-doc-src>${escHtml(lines)}</pre></div>`;
}

/** A downloadable document card (copy + download a real repo file). */
function docCard(name: string, content: string, note: string): string {
  return `<div class="doc-dl">
    <div class="doc-dl-head">
      <span class="doc-name">${icon("file-text", { size: 16 })} ${name}</span>
      <div class="doc-dl-actions">
        <button class="btn btn-outline btn-sm" data-doc-copy>${icon("copy", { size: 14 })} Copy</button>
        <button class="btn btn-primary btn-sm" data-doc-download data-file="${name}">${icon("download", { size: 14 })} Download</button>
      </div>
    </div>
    <p class="doc-note muted">${note}</p>
    <pre class="doc-pre doc-scroll" data-doc-src>${escHtml(content)}</pre>
  </div>`;
}

function toolCard(iconName: string, title: string, body: string): string {
  return `<div class="tool-card"><div class="tool-head">${icon(iconName, { size: 18 })} <h4>${title}</h4></div>${body}</div>`;
}

export function guideSections(): Section[] {
  return [
    {
      id: "dev-start",
      group: "Develop",
      title: "Get started",
      desc: "A shared, token-driven design system on top of shadcn/ui. Apply a brand theme, then install only the components you need — everything re-themes automatically because it reads the theme's CSS variables.",
      html: `<div class="guide">
        <div class="guide-lead">
          <div class="guide-step"><span class="gs-num">1</span><div><b>Theme</b><p class="muted">Derive contrast-safe OKLCH tokens and patch <code>globals.css</code>.</p></div></div>
          <div class="guide-step"><span class="gs-num">2</span><div><b>Install</b><p class="muted">Add components from the registry with the shadcn CLI.</p></div></div>
          <div class="guide-step"><span class="gs-num">3</span><div><b>Build</b><p class="muted">Compose UI using semantic tokens — never hardcode color.</p></div></div>
        </div>
        <div class="grid2" style="margin-top:1rem">
          <div><h4 style="margin:.2rem 0 .5rem">Apply a brand theme</h4>${cmd(`# interactive: brand source → tokens → globals.css\nnpx shadcn-theming init\n\n# or add a prebuilt registry theme\nnpx shadcn@latest add ${RAW}/themes/imf-theme.json`)}</div>
          <div><h4 style="margin:.2rem 0 .5rem">Install components</h4>${cmd(`npx shadcn@latest add ${RAW}/fan-chart.json\nnpx shadcn@latest add ${RAW}/classification-badge.json\nnpx shadcn@latest add ${RAW}/icon.json`)}</div>
        </div>
        <div class="callout" style="margin-top:1rem">${icon("info", { size: 16 })}<div>Verify accessibility before shipping theme changes: <code>npx shadcn-theming audit brand.json --strict</code> gates on WCAG 2.2 AA and exits non-zero on failure.</div></div>
      </div>`,
    },
    {
      id: "dev-tooling",
      group: "Develop",
      title: "Use it in your editor & agents",
      desc: "The system is built to standardize development across tools. Drop AGENTS.md at your repo root and load the Agent Skill; then ask your assistant to build with the design system in plain language.",
      html: `<div class="guide"><div class="tool-grid">
        ${toolCard("code", "VS Code (Copilot, Cursor, Codex)", `<p class="muted">Place <code>AGENTS.md</code> at the repo root — it's read automatically by 30+ agents. Add components with the shadcn CLI or the shadcn VS Code action.</p>${cmd("npx shadcn@latest add " + RAW + "/data-table.json")}`)}
        ${toolCard("terminal", "Claude Code", `<p class="muted">Load the skills, then ask in natural language.</p>${cmd("npx skills add FrancoisChastel/shadcn-theming")}<p class="muted" style="margin:.5rem 0 0">Then: <em>“Add a WEO fan chart to the dashboard using our design system.”</em></p>`)}
        ${toolCard("sparkles", "Pi & other agents", `<p class="muted">Point the agent at <code>AGENTS.md</code> and <code>SKILL.md</code> (both downloadable below), then use the same <code>npx shadcn add</code> commands. No lock-in — it's plain Markdown + a public registry.</p>`)}
      </div></div>`,
    },
    {
      id: "dev-skill",
      group: "Develop",
      title: "Agent Skill",
      desc: "A portable Agent Skill that teaches an assistant to use this design system — how to theme, which components exist, the token contract, and the conventions to follow. Installable with npx skills, or download it below.",
      html: `<div class="guide">
        ${cmd("npx skills add FrancoisChastel/shadcn-theming")}
        ${docCard("SKILL.md", SKILL_MD, "Drop into ~/.claude/skills/imf-design-system/ (or a project's .claude/skills/), or hand it to any agent.")}
      </div>`,
    },
    {
      id: "dev-agents",
      group: "Develop",
      title: "AGENTS.md",
      desc: "Drop this in your own product repo. It's the open, cross-agent standard (read natively by Claude Code, Cursor, Copilot, Codex, Aider, Gemini CLI, and more) — it tells your agent how to build UI with the design system: install commands, the token contract, the component catalog, and the conventions to follow.",
      html: `<div class="guide">
        ${docCard("AGENTS.md", AGENTS_MD, "Save at your repository root. Agents read it on task start — no configuration needed.")}
      </div>`,
    },
    {
      id: "dev-contribute",
      group: "Develop",
      title: "Contribute a component",
      desc: "New components are token-driven, typed, accessibility-checked, and reviewed on a pull request. Follow this workflow; it keeps the system consistent and the output reproducible.",
      html: `<div class="guide">
        <ol class="contrib-steps">
          <li><b>Add the source.</b> <code>registry/components/ui/&lt;name&gt;.tsx</code> — color it only through theme tokens, type its props, keep it dependency-light.</li>
          <li><b>Register it.</b> Add an entry in <code>scripts/build-registry.mjs</code> (name, title, description, deps) and run <code>npm run registry:build</code>.</li>
          <li><b>Demo it.</b> Add a <code>Section</code> in the matching <code>src/showcase/*sections.ts</code> (and a data generator in <code>data.ts</code> if needed).</li>
          <li><b>Verify.</b> <code>npm run typecheck &amp;&amp; npm test</code>, regenerate the demo, and open it — no console errors, both themes intentional.</li>
          <li><b>Open a PR.</b> Conventional Commits; include a before/after for visual changes.</li>
        </ol>
        <div class="review-card">
          <h4>${icon("badge-check", { size: 16 })} PR review checklist</h4>
          <ul class="review-list">
            <li>${icon("check", { size: 14 })} Colors come only from theme tokens (no hardcoded hex)</li>
            <li>${icon("check", { size: 14 })} Props are typed; no <code>any</code>; external input validated</li>
            <li>${icon("check", { size: 14 })} WCAG 2.2 AA: semantic HTML, labels, focus, reduced-motion</li>
            <li>${icon("check", { size: 14 })} Doesn't duplicate an existing component</li>
            <li>${icon("check", { size: 14 })} <code>typecheck</code>, <code>test</code>, and <code>build</code> pass</li>
          </ul>
        </div>
        ${docCard("CONTRIBUTING.md", CONTRIBUTING_MD, "The full contribution guide — setup, project layout, guidelines, and the PR process.")}
      </div>`,
    },
  ];
}
