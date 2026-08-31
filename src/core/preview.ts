/**
 * Render a fully self-contained HTML preview of a generated theme.
 *
 * The page injects the derived tokens as CSS custom properties and renders
 * shadcn-flavored component mockups (buttons, cards, inputs, badges, alerts,
 * charts) in both light and dark, with a toggle. No network, no build step —
 * ideal for eyeballing a theme or letting an agent screenshot it for review.
 */
import type { Brand } from "./brand-schema.js";
import { renderRootBlock, renderDarkBlock } from "./render.js";
import { COLOR_TOKENS, type ThemeTokens, type TokenMap } from "./tokens.js";

function escapeHtml(input: string): string {
  return input.replace(/[&<>"]/g, (ch) =>
    ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;",
  );
}

/** Render the swatch grid for one appearance's tokens. */
function swatches(map: TokenMap): string {
  return COLOR_TOKENS.map((key) => {
    const isFg = key.endsWith("-foreground");
    return `<div class="swatch">
      <span class="chip" style="background: var(--${key}); ${isFg ? "border:1px solid var(--border)" : ""}"></span>
      <code>${key}</code>
    </div>`;
  }).join("\n");
}

const COMPONENTS = `
<section class="stack">
  <h3>Buttons</h3>
  <div class="row">
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-secondary">Secondary</button>
    <button class="btn btn-outline">Outline</button>
    <button class="btn btn-ghost">Ghost</button>
    <button class="btn btn-destructive">Delete</button>
  </div>
</section>

<section class="stack">
  <h3>Card</h3>
  <div class="card">
    <div class="card-header">
      <div class="card-title">Upgrade your plan</div>
      <div class="card-desc">You're currently on the free tier.</div>
    </div>
    <div class="card-body">
      <label class="label">Email</label>
      <input class="input" placeholder="you@company.com" />
      <div class="badges">
        <span class="badge badge-primary">Pro</span>
        <span class="badge badge-secondary">Beta</span>
        <span class="badge badge-outline">v2</span>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn btn-ghost">Cancel</button>
      <button class="btn btn-primary">Continue</button>
    </div>
  </div>
</section>

<section class="stack">
  <h3>Alert</h3>
  <div class="alert alert-destructive">
    <strong>Heads up.</strong> Your session is about to expire.
  </div>
</section>

<section class="stack">
  <h3>Chart palette</h3>
  <div class="chart">
    <div class="bar" style="height:40%;background:var(--chart-1)"></div>
    <div class="bar" style="height:72%;background:var(--chart-2)"></div>
    <div class="bar" style="height:55%;background:var(--chart-3)"></div>
    <div class="bar" style="height:88%;background:var(--chart-4)"></div>
    <div class="bar" style="height:63%;background:var(--chart-5)"></div>
  </div>
</section>
`;

const STATIC_CSS = `
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  background: var(--background);
  color: var(--foreground);
  transition: background 200ms, color 200ms;
}
.wrap { max-width: 1080px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }
header.top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
.brand { display: flex; align-items: center; gap: 0.75rem; }
.brand .dot { width: 2rem; height: 2rem; border-radius: var(--radius); background: var(--primary); }
.brand h1 { font-size: 1.25rem; margin: 0; }
.brand p { margin: 0; color: var(--muted-foreground); font-size: 0.8125rem; }
.toggle {
  border: 1px solid var(--border); background: var(--card); color: var(--card-foreground);
  border-radius: var(--radius); padding: 0.5rem 0.875rem; cursor: pointer; font-size: 0.8125rem;
}
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; margin-bottom: 2.5rem; }
.swatch { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; }
.swatch .chip { width: 1.5rem; height: 1.5rem; border-radius: calc(var(--radius) - 4px); flex: none; }
.swatch code { color: var(--muted-foreground); overflow: hidden; text-overflow: ellipsis; }
.panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2.5rem; align-items: start; }
@media (max-width: 720px) { .panels { grid-template-columns: 1fr; } }
.stack { margin-bottom: 1.75rem; }
.stack h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); margin: 0 0 0.75rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.btn {
  border-radius: var(--radius); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; transition: opacity 150ms, background 150ms;
}
.btn:hover { opacity: 0.9; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); }
.btn-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.btn-outline { background: transparent; color: var(--foreground); border-color: var(--border); }
.btn-ghost { background: transparent; color: var(--foreground); }
.btn-ghost:hover { background: var(--accent); color: var(--accent-foreground); opacity: 1; }
.btn-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.card { background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.card-header { padding: 1.25rem 1.25rem 0.5rem; }
.card-title { font-weight: 600; }
.card-desc { color: var(--muted-foreground); font-size: 0.8125rem; margin-top: 0.25rem; }
.card-body { padding: 0.75rem 1.25rem 1.25rem; }
.card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.5rem; background: var(--muted); }
.label { display: block; font-size: 0.8125rem; margin-bottom: 0.375rem; }
.input { width: 100%; padding: 0.5rem 0.75rem; border-radius: var(--radius); border: 1px solid var(--input); background: var(--background); color: var(--foreground); font-size: 0.875rem; }
.input:focus { outline: 2px solid var(--ring); outline-offset: 1px; }
.badges { display: flex; gap: 0.5rem; margin-top: 1rem; }
.badge { font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 999px; font-weight: 500; }
.badge-primary { background: var(--primary); color: var(--primary-foreground); }
.badge-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.badge-outline { border: 1px solid var(--border); color: var(--foreground); }
.alert { border-radius: var(--radius); padding: 0.875rem 1rem; font-size: 0.875rem; }
.alert-destructive { border: 1px solid var(--destructive); color: var(--destructive); }
.chart { display: flex; align-items: flex-end; gap: 0.75rem; height: 140px; padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); }
.chart .bar { flex: 1; border-radius: calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0 0; }
`;

/** Render the complete preview HTML document for a brand + its tokens. */
export function renderPreviewHtml(brand: Brand, tokens: ThemeTokens): string {
  const light = tokens.light ?? tokens.dark!;
  const rootBlock = renderRootBlock(tokens, light);
  const darkBlock = tokens.dark && tokens.light ? renderDarkBlock(tokens.dark) : "";
  const swatchMap = tokens.light ?? tokens.dark!;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(brand.name)} — shadcn theme preview</title>
<style>
${rootBlock}
${darkBlock}
${STATIC_CSS}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="brand">
      <span class="dot"></span>
      <div>
        <h1>${escapeHtml(brand.name)}</h1>
        <p>shadcn/ui theme preview · ${escapeHtml(String(tokens.radius))} radius</p>
      </div>
    </div>
    <button class="toggle" onclick="document.documentElement.classList.toggle('dark')">Toggle theme</button>
  </header>

  <div class="grid">
    ${swatches(swatchMap)}
  </div>

  <div class="panels">
    ${COMPONENTS}
  </div>
</div>
</body>
</html>
`;
}
