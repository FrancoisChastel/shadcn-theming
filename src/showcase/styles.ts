/**
 * The stylesheet for the component explorer. Every value is expressed through
 * shadcn theme tokens (`--primary`, `--border`, `--radius`, …) so the whole
 * gallery recolors with any generated brand theme.
 */
export const EXPLORE_CSS = `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif); background: var(--background); color: var(--foreground); font-size: 14px; }
.muted { color: var(--muted-foreground); }
a { color: inherit; text-decoration: none; }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; border-radius: 3px; }
/* WCAG 2.2: honor reduced-motion — neutralize non-essential animation/transition. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
}
/* WCAG 2.4.1: skip link */
.skip-link { position: absolute; left: 0.5rem; top: -3rem; z-index: 100; background: var(--primary); color: var(--primary-foreground); padding: 0.5rem 0.9rem; border-radius: var(--radius); transition: top .15s; }
.skip-link:focus { top: 0.5rem; }
/* Print: drop chrome, expand content, flatten shadows. */
@media print {
  .side, .topbar, .skip-link, .overlay, #cmdk, .toaster { display: none !important; }
  .app { display: block; }
  .content { max-width: none; padding: 0; }
  * { box-shadow: none !important; }
  .card, .demo, section.block { break-inside: avoid; }
}

/* layout */
.app { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
.side { position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto; border-right: 1px solid var(--border); padding: 1.25rem 1rem; background: var(--sidebar); color: var(--sidebar-foreground); }
.side .brand { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; }
.side .brand .mark { width: 2rem; height: 2rem; border-radius: var(--radius); background: var(--sidebar-primary); color: var(--sidebar-primary-foreground); display: grid; place-items: center; font-weight: 700; }
.side .brand b { font-size: 0.95rem; letter-spacing: -0.01em; }
.side .brand span { font-size: 0.72rem; color: var(--muted-foreground); display: block; }
.nav-group { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-foreground); margin: 1rem 0 0.35rem; font-weight: 600; }
.nav a { display: block; padding: 0.3rem 0.55rem; border-radius: calc(var(--radius) - 1px); color: var(--muted-foreground); font-size: 0.83rem; }
.nav a:hover { background: var(--sidebar-accent); color: var(--sidebar-accent-foreground); }
.nav a.active { background: var(--sidebar-accent); color: var(--foreground); font-weight: 500; }
.main { min-width: 0; }
.topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 2rem; border-bottom: 1px solid var(--border); background: color-mix(in oklab, var(--background) 82%, transparent); backdrop-filter: blur(8px); }
.topbar .search { flex: 1; max-width: 360px; display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--input); border-radius: var(--radius); padding: 0.4rem 0.7rem; color: var(--muted-foreground); font-size: 0.8rem; font-family: inherit; text-align: left; cursor: pointer; background: var(--background); }
.topbar .search kbd { margin-left: auto; font-size: 0.7rem; border: 1px solid var(--border); border-radius: 4px; padding: 0 0.35rem; background: var(--muted); }
.pagenav { display: flex; gap: 0.2rem; flex-wrap: wrap; }
.pagenav a { padding: 0.35rem 0.75rem; border-radius: var(--radius); font-size: 0.83rem; color: var(--muted-foreground); font-weight: 500; }
.pagenav a:hover { background: var(--accent); color: var(--accent-foreground); }
.pagenav a.active { background: var(--primary); color: var(--primary-foreground); }
.content { padding: 2rem 2rem 6rem; max-width: 1080px; }
.hero { margin-bottom: 2.5rem; }
.hero h1 { font-size: 1.9rem; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
.hero p { margin: 0; color: var(--muted-foreground); max-width: 60ch; }
section.block { margin: 2.75rem 0; scroll-margin-top: 72px; }
section.block > h2 { font-size: 1.15rem; margin: 0 0 0.25rem; letter-spacing: -0.01em; }
section.block > .desc { color: var(--muted-foreground); margin: 0 0 1rem; font-size: 0.86rem; }
.demo { border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; background: var(--card); }
.demo.col { flex-direction: column; align-items: stretch; flex-wrap: nowrap; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
@media (max-width: 980px) { .app { grid-template-columns: 1fr; } .side { display: none; } .grid2,.grid3,.grid4 { grid-template-columns: 1fr; } }

/* buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; border-radius: var(--radius); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border: 1px solid transparent; cursor: pointer; transition: opacity .15s, background .15s; line-height: 1; }
.btn:hover { opacity: 0.9; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; }
.btn-lg { padding: 0.65rem 1.4rem; font-size: 0.95rem; }
.btn-icon { padding: 0.5rem; width: 2.25rem; height: 2.25rem; }
.btn-primary { background: var(--primary); color: var(--primary-foreground); }
.btn-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.btn-outline { background: transparent; color: var(--foreground); border-color: var(--border); }
.btn-outline:hover { background: var(--accent); color: var(--accent-foreground); opacity: 1; }
.btn-ghost { background: transparent; color: var(--foreground); }
.btn-ghost:hover { background: var(--accent); color: var(--accent-foreground); opacity: 1; }
.btn-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.btn-link { background: transparent; color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }

/* badges */
.badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 999px; font-weight: 600; }
.badge-primary { background: var(--primary); color: var(--primary-foreground); }
.badge-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.badge-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.badge-outline { border: 1px solid var(--border); color: var(--foreground); }

/* inputs */
.input, .textarea, .select-trigger { width: 100%; padding: 0.5rem 0.75rem; border-radius: var(--radius); border: 1px solid var(--input); background: var(--background); color: var(--foreground); font-size: 0.875rem; font-family: inherit; }
.input:focus, .textarea:focus { outline: 2px solid var(--ring); outline-offset: 1px; }
.input::placeholder, .textarea::placeholder { color: var(--muted-foreground); }
.textarea { min-height: 80px; resize: vertical; }
.label { font-size: 0.83rem; font-weight: 500; display: block; margin-bottom: 0.4rem; }
.field { display: flex; flex-direction: column; gap: 0; max-width: 320px; }
.hint { font-size: 0.75rem; color: var(--muted-foreground); margin-top: 0.35rem; }

/* checkbox / radio */
.check, .radio { display: inline-flex; align-items: center; gap: 0.55rem; font-size: 0.85rem; cursor: pointer; }
.check input, .radio input { appearance: none; width: 1.05rem; height: 1.05rem; border: 1px solid var(--border); background: var(--background); cursor: pointer; display: grid; place-items: center; }
.check input { border-radius: 4px; }
.radio input { border-radius: 999px; }
.check input:checked, .radio input:checked { background: var(--primary); border-color: var(--primary); }
.check input:checked::after { content: "✓"; color: var(--primary-foreground); font-size: 0.7rem; }
.radio input:checked::after { content: ""; width: 0.45rem; height: 0.45rem; border-radius: 999px; background: var(--primary-foreground); }

/* switch */
.switch { display: inline-flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.85rem; }
.switch input { display: none; }
.switch .track { width: 2.35rem; height: 1.3rem; background: var(--secondary); border-radius: 999px; position: relative; transition: background .15s; }
.switch .thumb { position: absolute; top: 2px; left: 2px; width: 1.05rem; height: 1.05rem; border-radius: 999px; background: var(--background); transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.2); }
.switch input:checked + .track { background: var(--primary); }
.switch input:checked + .track .thumb { transform: translateX(1.05rem); }

/* slider */
.slider { -webkit-appearance: none; appearance: none; width: 220px; height: 6px; border-radius: 999px; background: var(--secondary); outline: none; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 999px; background: var(--background); border: 2px solid var(--primary); cursor: pointer; }
.slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 999px; background: var(--background); border: 2px solid var(--primary); cursor: pointer; }

/* toggle group */
.toggle { border: 1px solid var(--border); background: transparent; color: var(--foreground); border-radius: var(--radius); padding: 0.4rem 0.65rem; cursor: pointer; font-size: 0.85rem; }
.toggle.on { background: var(--accent); color: var(--accent-foreground); border-color: var(--primary); }
.toggle-group { display: inline-flex; gap: 0.35rem; }

/* tabs */
.tabs-list { display: inline-flex; gap: 0.25rem; background: var(--muted); padding: 0.25rem; border-radius: var(--radius); }
[data-tab] { border: none; background: transparent; color: var(--muted-foreground); padding: 0.35rem 0.85rem; border-radius: calc(var(--radius) - 1px); cursor: pointer; font-size: 0.83rem; font-weight: 500; }
[data-tab][aria-selected="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
[data-tab-panel] { padding: 1rem 0.15rem; font-size: 0.88rem; color: var(--muted-foreground); }

/* accordion */
[data-accordion] { width: 100%; }
[data-acc-item] { border-bottom: 1px solid var(--border); }
[data-acc-trigger] { width: 100%; text-align: left; background: none; border: none; color: var(--foreground); padding: 0.85rem 0.25rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
[data-acc-trigger] .chev { transition: transform .2s; color: var(--muted-foreground); }
[data-acc-item].open [data-acc-trigger] .chev { transform: rotate(180deg); }
.acc-content { max-height: 0; overflow: hidden; transition: max-height .25s ease; color: var(--muted-foreground); font-size: 0.86rem; }
[data-acc-item].open .acc-content { max-height: 200px; }
.acc-content-inner { padding: 0 0.25rem 0.9rem; }

/* card */
.card { background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); }
.card-h { padding: 1.1rem 1.25rem 0.4rem; }
.card-t { font-weight: 600; letter-spacing: -0.01em; }
.card-d { color: var(--muted-foreground); font-size: 0.82rem; margin-top: 0.2rem; }
.card-b { padding: 0.6rem 1.25rem 1rem; font-size: 0.86rem; }
.card-f { padding: 0.9rem 1.25rem; border-top: 1px solid var(--border); display: flex; gap: 0.5rem; justify-content: flex-end; }

/* alert */
.alert { display: flex; gap: 0.7rem; border-radius: var(--radius); border: 1px solid var(--border); padding: 0.9rem 1rem; font-size: 0.86rem; background: var(--card); }
.alert .ico { color: var(--muted-foreground); display: inline-flex; align-items: center; flex: none; }
.alert .ico svg { flex: none; }
.ai-act svg { display: block; }
.alert-destructive { border-color: var(--destructive); color: var(--destructive); }
.alert-destructive .ico { color: var(--destructive); }

/* separator */
.sep { height: 1px; background: var(--border); border: none; width: 100%; margin: 0.25rem 0; }
.sep-v { width: 1px; align-self: stretch; background: var(--border); }

/* avatar */
.avatar { width: 2.5rem; height: 2.5rem; border-radius: 999px; background: var(--secondary); color: var(--secondary-foreground); display: grid; place-items: center; font-weight: 600; font-size: 0.85rem; overflow: hidden; }
.avatar-group { display: flex; }
.avatar-group .avatar { border: 2px solid var(--background); margin-left: -0.6rem; }

/* progress / skeleton */
.progress { width: 100%; height: 0.55rem; background: var(--secondary); border-radius: 999px; overflow: hidden; }
.progress > span { display: block; height: 100%; background: var(--primary); border-radius: 999px; transition: width .3s; }
.skeleton { background: linear-gradient(90deg, var(--muted), color-mix(in oklab, var(--muted) 60%, var(--background)), var(--muted)); background-size: 200% 100%; animation: sk 1.4s infinite; border-radius: calc(var(--radius) - 1px); }
@keyframes sk { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* table */
.tbl { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.tbl caption { text-align: left; color: var(--muted-foreground); padding-bottom: 0.6rem; font-size: 0.8rem; }
.tbl th { text-align: left; color: var(--muted-foreground); font-weight: 500; padding: 0.55rem 0.6rem; border-bottom: 1px solid var(--border); }
.tbl td { padding: 0.55rem 0.6rem; border-bottom: 1px solid var(--border); }
.tbl tbody tr:hover { background: var(--muted); }
.tbl .num, .tbl th.num { text-align: right; font-variant-numeric: tabular-nums; }

/* tooltip / hover card (CSS hover) */
.tip-wrap, .hover-wrap { position: relative; display: inline-flex; }
.tip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: var(--primary); color: var(--primary-foreground); font-size: 0.75rem; padding: 0.3rem 0.55rem; border-radius: calc(var(--radius) - 1px); white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s; }
.tip-wrap:hover .tip { opacity: 1; }
.hover-card { position: absolute; top: calc(100% + 8px); left: 0; width: 260px; background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.9rem; box-shadow: 0 8px 24px rgba(0,0,0,.14); opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity .15s, transform .15s; z-index: 20; }
.hover-wrap:hover .hover-card { opacity: 1; transform: translateY(0); pointer-events: auto; }

/* menus / popovers / selects / dropdown / context */
[data-menu-trigger], [data-select] { position: relative; }
[data-menu] { position: absolute; top: calc(100% + 6px); left: 0; min-width: 200px; background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.3rem; box-shadow: 0 8px 24px rgba(0,0,0,.14); opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity .12s, transform .12s; z-index: 40; }
[data-menu].open { opacity: 1; pointer-events: auto; transform: translateY(0); }
.menu-item { display: flex; align-items: center; gap: 0.55rem; padding: 0.4rem 0.55rem; border-radius: calc(var(--radius) - 1px); font-size: 0.83rem; cursor: pointer; }
.menu-item:hover { background: var(--accent); color: var(--accent-foreground); }
.menu-item.danger { color: var(--destructive); }
.menu-label { padding: 0.35rem 0.55rem; font-size: 0.72rem; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.06em; }
.menu-sep { height: 1px; background: var(--border); margin: 0.3rem 0; }
.select-trigger { display: flex; align-items: center; justify-content: space-between; cursor: pointer; max-width: 260px; }
[data-select-option] { }
[data-select-option].selected { background: var(--accent); color: var(--accent-foreground); }

/* overlays: dialog / sheet / drawer */
.overlay { position: fixed; inset: 0; z-index: 50; display: none; }
.overlay.open { display: block; }
.overlay .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.5); animation: fade .2s; }
@keyframes fade { from { opacity: 0; } }
.dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(460px, 92vw); background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 24px 60px rgba(0,0,0,.28); animation: pop .2s; }
@keyframes pop { from { opacity: 0; transform: translate(-50%, -46%) scale(.97); } }
.dialog .dh { padding: 1.25rem 1.25rem 0.4rem; }
.dialog .dh h3 { margin: 0; font-size: 1.05rem; }
.dialog .db { padding: 0.4rem 1.25rem 0.6rem; color: var(--muted-foreground); font-size: 0.87rem; }
.dialog .df { padding: 1rem 1.25rem; display: flex; gap: 0.5rem; justify-content: flex-end; }
.sheet { position: absolute; top: 0; right: 0; height: 100%; width: min(400px, 90vw); background: var(--card); color: var(--card-foreground); border-left: 1px solid var(--border); box-shadow: -12px 0 40px rgba(0,0,0,.2); animation: slideR .25s; padding: 1.5rem; }
@keyframes slideR { from { transform: translateX(100%); } }
.drawer { position: absolute; bottom: 0; left: 0; width: 100%; max-height: 80%; background: var(--card); color: var(--card-foreground); border-top: 1px solid var(--border); border-radius: var(--radius) var(--radius) 0 0; box-shadow: 0 -12px 40px rgba(0,0,0,.2); animation: slideU .25s; padding: 1.5rem; }
.drawer .grab { width: 40px; height: 4px; border-radius: 999px; background: var(--border); margin: -0.5rem auto 1rem; }
@keyframes slideU { from { transform: translateY(100%); } }

/* command palette */
#cmdk { position: fixed; inset: 0; z-index: 55; display: none; align-items: flex-start; justify-content: center; padding-top: 12vh; background: rgba(0,0,0,.5); }
#cmdk.open { display: flex; }
.cmd { width: min(560px, 92vw); background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 24px 60px rgba(0,0,0,.3); overflow: hidden; animation: pop .18s; }
.cmd input { width: 100%; border: none; border-bottom: 1px solid var(--border); background: transparent; color: inherit; padding: 0.9rem 1rem; font-size: 0.95rem; outline: none; }
.cmd .list { max-height: 320px; overflow-y: auto; padding: 0.4rem; }
[data-cmd-item] { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.7rem; border-radius: calc(var(--radius) - 1px); font-size: 0.86rem; cursor: pointer; }
[data-cmd-item]:hover { background: var(--accent); color: var(--accent-foreground); }
[data-cmd-item][hidden] { display: none; }

/* toast */
.toaster { position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 70; display: flex; flex-direction: column; gap: 0.6rem; }
.toast { background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.8rem 1rem; box-shadow: 0 8px 28px rgba(0,0,0,.18); min-width: 260px; opacity: 0; transform: translateX(20px); transition: opacity .25s, transform .25s; }
.toast.show { opacity: 1; transform: translateX(0); }

/* breadcrumb / pagination */
.crumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.83rem; color: var(--muted-foreground); }
.crumb a:hover { color: var(--foreground); }
.crumb .cur { color: var(--foreground); font-weight: 500; }
.pagination { display: inline-flex; gap: 0.3rem; }
[data-page] { min-width: 2rem; height: 2rem; display: grid; place-items: center; border: 1px solid var(--border); border-radius: calc(var(--radius) - 1px); cursor: pointer; font-size: 0.83rem; background: var(--background); }
[data-page].active { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }

/* carousel */
[data-carousel] { position: relative; overflow: hidden; border-radius: var(--radius); border: 1px solid var(--border); }
[data-carousel-track] { display: flex; transition: transform .35s ease; }
[data-carousel-item] { min-width: 100%; height: 180px; display: grid; place-items: center; font-size: 2rem; font-weight: 700; color: var(--muted-foreground); background: var(--muted); }
[data-carousel-prev], [data-carousel-next] { position: absolute; top: 50%; transform: translateY(-50%); width: 2rem; height: 2rem; border-radius: 999px; border: 1px solid var(--border); background: var(--background); cursor: pointer; display: grid; place-items: center; }
[data-carousel-prev] { left: 0.5rem; } [data-carousel-next] { right: 0.5rem; }

/* calendar */
.cal { width: 260px; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.9rem; background: var(--card); }
.cal-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 500; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
.cal-grid .dow { font-size: 0.68rem; color: var(--muted-foreground); padding: 0.25rem 0; }
.cal-grid .day { font-size: 0.78rem; padding: 0.3rem 0; border-radius: calc(var(--radius) - 1px); cursor: pointer; }
.cal-grid .day:hover { background: var(--accent); color: var(--accent-foreground); }
.cal-grid .day.sel { background: var(--primary); color: var(--primary-foreground); }
.cal-grid .day.out { color: var(--muted-foreground); opacity: 0.4; }

/* menubar / navigation menu */
.menubar { display: inline-flex; gap: 0.15rem; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.2rem; }
.menubar [data-menu-trigger] { border: none; background: transparent; color: var(--foreground); padding: 0.35rem 0.7rem; border-radius: calc(var(--radius) - 1px); cursor: pointer; font-size: 0.83rem; }
.menubar [data-menu-trigger]:hover { background: var(--accent); color: var(--accent-foreground); }

/* charts / kpi */
.plot { width: 100%; height: auto; display: block; }
.plot-card { padding: 1rem 1.1rem 0.9rem; overflow: hidden; }
.plot-title { font-size: 13px; font-weight: 500; color: var(--foreground); margin: 0 0 0.5rem; }
.plot-card figure { margin: 0; }
.plot-card svg { max-width: 100%; height: auto; overflow: visible; }
.spark svg { width: 96px; height: 30px; }
.spark { width: 96px; height: 30px; }
.kpi { padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.55rem; }
.kpi-mid { display: flex; align-items: flex-end; justify-content: space-between; gap: 0.75rem; }
.kpi-value { font-size: 1.55rem; font-weight: 650; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.kpi-delta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; }
.kpi-delta .pill { padding: 0.1rem 0.45rem; border-radius: 999px; font-weight: 600; }
.kpi-delta.up .pill { background: color-mix(in oklab, var(--chart-1) 15%, var(--card)); color: var(--chart-1); }
.kpi-delta.down .pill { background: color-mix(in oklab, var(--destructive) 15%, var(--card)); color: var(--destructive); }

/* palette strip */
.palette { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; }
.sw { display: flex; align-items: center; gap: 0.45rem; font-size: 0.72rem; }
.sw .chip { width: 1.15rem; height: 1.15rem; border-radius: 4px; border: 1px solid var(--border); }
.sw code { color: var(--muted-foreground); }

/* ---- Foundations: color panel ---- */
.color-group-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); font-weight: 600; margin: 1rem 0 0.6rem; }
.color-group-title:first-child { margin-top: 0; }
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.75rem; }
.color-card { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--card); }
.color-swatch { height: 66px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; }
.color-swatch.bordered { border-bottom: 1px solid var(--border); }
.color-meta { padding: 0.55rem 0.7rem; display: flex; flex-direction: column; gap: 0.15rem; }
.color-name { font-size: 0.78rem; font-weight: 600; }
.color-val { font-size: 0.68rem; color: var(--muted-foreground); }
.color-hex { font-size: 0.68rem; color: var(--muted-foreground); text-transform: uppercase; }

/* ---- Foundations: typography ---- */
.type-specimens { gap: 0.1rem; }
.type-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
.type-row:last-child { border-bottom: none; }
.type-sample { color: var(--foreground); font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif); }
.type-sample.mono { font-family: var(--font-mono, ui-monospace, monospace); }
.type-meta { font-size: 0.72rem; color: var(--muted-foreground); white-space: nowrap; font-variant-numeric: tabular-nums; }

/* ---- Foundations: radius ---- */
.radius-row { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.radius-item { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: var(--muted-foreground); }
.radius-box { width: 68px; height: 52px; background: var(--secondary); border: 1px solid var(--border); border-bottom: 2px solid var(--primary); }

/* ---- Layout ---- */
.page-header { border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem 1.25rem; background: var(--card); width: 100%; }
.ph-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin: 0.5rem 0 0.9rem; }
.ph-row h2 { margin: 0; font-size: 1.25rem; letter-spacing: -0.01em; }
.ph-row p { margin: 0.25rem 0 0; }
.ph-actions { display: flex; gap: 0.5rem; flex: none; }
.bento { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 92px; gap: 0.85rem; width: 100%; }
.bento .card { padding: 0.9rem 1rem; display: flex; flex-direction: column; justify-content: space-between; }
.bento .b-title { font-size: 0.72rem; color: var(--muted-foreground); }
.bento .b-value { font-size: 1.4rem; font-weight: 650; letter-spacing: -0.02em; }
.bento .lg { grid-column: span 2; grid-row: span 2; }
.bento .wide { grid-column: span 2; }
@media (max-width: 720px) { .bento { grid-template-columns: repeat(2, 1fr); } .bento .lg { grid-column: span 2; } }
.split { display: grid; grid-template-columns: 1fr 1px 2fr; width: 100%; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; height: 200px; }
.split-pane { padding: 1rem; overflow: auto; }
.split-pane.list { background: var(--sidebar); }
.split-pane .li { padding: 0.5rem 0.6rem; border-radius: calc(var(--radius) - 1px); font-size: 0.83rem; cursor: pointer; }
.split-pane .li:hover, .split-pane .li.active { background: var(--accent); color: var(--accent-foreground); }
.split-handle { background: var(--border); }
.mini-app { display: grid; grid-template-columns: 130px 1fr; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; height: 230px; width: 100%; }
.mini-side { background: var(--sidebar); color: var(--sidebar-foreground); border-right: 1px solid var(--border); padding: 0.7rem; display: flex; flex-direction: column; gap: 0.3rem; }
.mini-side .m-brand { display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.8rem; margin-bottom: 0.5rem; }
.mini-side .m-dot { width: 1.1rem; height: 1.1rem; border-radius: 4px; background: var(--sidebar-primary); }
.mini-side .m-item { font-size: 0.72rem; color: var(--muted-foreground); padding: 0.28rem 0.4rem; border-radius: 4px; }
.mini-side .m-item.on { background: var(--sidebar-accent); color: var(--foreground); }
.mini-top { height: 40px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 0.9rem; gap: 0.5rem; }
.mini-content { padding: 0.9rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.mini-content .m-kpi { border: 1px solid var(--border); border-radius: calc(var(--radius) - 1px); padding: 0.55rem 0.65rem; }
.mini-content .m-kpi b { font-size: 1rem; }
.mini-content .m-chart { grid-column: span 3; border: 1px solid var(--border); border-radius: calc(var(--radius) - 1px); height: 66px; background: linear-gradient(90deg, color-mix(in oklab, var(--chart-1) 18%, var(--card)), var(--card)); }
.stack-demo { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.vstack, .hstack { border: 1px dashed var(--border); border-radius: var(--radius); padding: 0.6rem; gap: 0.5rem; display: flex; }
.vstack { flex-direction: column; }
.stack-box { background: var(--secondary); color: var(--secondary-foreground); border-radius: calc(var(--radius) - 1px); padding: 0.4rem 0.8rem; font-size: 0.78rem; text-align: center; }

/* ---- Chat ---- */
.chat { width: min(440px, 100%); display: flex; flex-direction: column; height: 460px; overflow: hidden; }
.chat-head { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1rem; border-bottom: 1px solid var(--border); }
.chat-head .status { color: var(--chart-5); }
.chat-body { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; background: color-mix(in oklab, var(--muted) 40%, var(--background)); }
.msg { display: flex; flex-direction: column; max-width: 78%; gap: 0.15rem; }
.msg.in { align-self: flex-start; align-items: flex-start; }
.msg.out { align-self: flex-end; align-items: flex-end; }
.bubble { padding: 0.5rem 0.75rem; border-radius: var(--radius); font-size: 0.86rem; line-height: 1.35; }
.msg.in .bubble { background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
.msg.out .bubble { background: var(--primary); color: var(--primary-foreground); border-bottom-right-radius: 4px; }
.msg-time { font-size: 0.65rem; color: var(--muted-foreground); padding: 0 0.2rem; }
.chat-typing { display: inline-flex; gap: 3px; padding: 0.6rem 0.8rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); border-bottom-left-radius: 4px; }
.chat-typing span { width: 6px; height: 6px; border-radius: 999px; background: var(--muted-foreground); animation: typing 1.2s infinite; }
.chat-typing span:nth-child(2) { animation-delay: 0.15s; }
.chat-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
.chat-input { display: flex; gap: 0.5rem; padding: 0.7rem; border-top: 1px solid var(--border); }
.chat-input .input { flex: 1; min-width: 0; }

/* ---- Advanced forms ---- */
.form-field { display: flex; flex-direction: column; gap: 0.35rem; max-width: 340px; }
.form-field .label { margin: 0; }
.form-field .req { color: var(--destructive); }
.form-field .err-msg { font-size: 0.75rem; color: var(--destructive); }
.input.invalid, .invalid > .select-trigger, .invalid.combobox-trigger { border-color: var(--destructive); }
.input.invalid:focus { outline-color: var(--destructive); }
.input-icon { position: relative; display: flex; align-items: center; }
.input-icon .lead { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: var(--muted-foreground); pointer-events: none; font-size: 0.9rem; display: inline-flex; align-items: center; }
.input-icon .input { padding-left: 2rem; }
.input-icon .clear { position: absolute; right: 0.5rem; border: none; background: var(--muted); color: var(--muted-foreground); width: 1.15rem; height: 1.15rem; border-radius: 999px; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 0.7rem; }
.input-icon.has-value .clear { display: inline-flex; }
.pw-wrap { position: relative; }
.pw-wrap .toggle-pw { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); border: none; background: none; color: var(--muted-foreground); cursor: pointer; font-size: 0.9rem; display: inline-flex; align-items: center; padding: 0.15rem; }
.pw-wrap .toggle-pw:hover { color: var(--foreground); }
.pw-meter { height: 4px; border-radius: 999px; background: var(--secondary); overflow: hidden; margin-top: 0.4rem; }
.pw-meter > span { display: block; height: 100%; width: 0; transition: width .2s, background .2s; }
.pw-hint { font-size: 0.72rem; color: var(--muted-foreground); margin-top: 0.25rem; }
.otp { display: flex; gap: 0.5rem; }
.otp input { width: 2.6rem; height: 3rem; text-align: center; font-size: 1.1rem; border: 1px solid var(--input); border-radius: var(--radius); background: var(--background); color: var(--foreground); font-variant-numeric: tabular-nums; }
.otp input:focus { outline: 2px solid var(--ring); outline-offset: 1px; }
.dropzone { border: 1.5px dashed var(--border); border-radius: var(--radius); padding: 1.4rem; text-align: center; color: var(--muted-foreground); cursor: pointer; transition: border-color .15s, background .15s; max-width: 360px; }
.dropzone.drag, .dropzone:hover { border-color: var(--primary); background: color-mix(in oklab, var(--primary) 5%, var(--background)); }
.dropzone .dz-file { color: var(--foreground); font-size: 0.83rem; margin-top: 0.4rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.35rem; border: 1px solid var(--input); border-radius: var(--radius); padding: 0.35rem 0.4rem; max-width: 360px; }
.tags:focus-within { outline: 2px solid var(--ring); outline-offset: 1px; }
.tags .tag { display: inline-flex; align-items: center; gap: 0.3rem; background: var(--secondary); color: var(--secondary-foreground); border-radius: calc(var(--radius) - 2px); padding: 0.15rem 0.45rem; font-size: 0.78rem; }
.tags .tag button { border: none; background: none; color: inherit; cursor: pointer; font-size: 0.8rem; line-height: 1; opacity: 0.7; }
.tags .tag button:hover { opacity: 1; }
.tags input { border: none; outline: none; background: none; color: inherit; flex: 1; min-width: 80px; font-size: 0.83rem; padding: 0.15rem; }
.segmented { display: inline-flex; background: var(--muted); border-radius: var(--radius); padding: 0.2rem; gap: 0.15rem; }
.segmented button { border: none; background: none; color: var(--muted-foreground); padding: 0.35rem 0.85rem; border-radius: calc(var(--radius) - 1px); cursor: pointer; font-size: 0.83rem; font-weight: 500; }
.segmented button.on { background: var(--background); color: var(--foreground); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.combobox-trigger, .multiselect-trigger { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%; max-width: 320px; padding: 0.5rem 0.75rem; border: 1px solid var(--input); border-radius: var(--radius); background: var(--background); color: var(--foreground); font-size: 0.875rem; cursor: pointer; text-align: left; }
.combobox-trigger .ph, .multiselect-trigger .ph { color: var(--muted-foreground); }
[data-combobox] [data-menu], [data-multiselect] [data-menu] { min-width: 100%; max-width: 320px; }
[data-menu] .cb-search { width: calc(100% - 0.6rem); margin: 0.15rem 0.3rem 0.3rem; padding: 0.4rem 0.55rem; border: 1px solid var(--input); border-radius: calc(var(--radius) - 1px); background: var(--background); color: var(--foreground); font-size: 0.83rem; outline: none; }
[data-menu] .cb-list { max-height: 200px; overflow-y: auto; }
[data-cb-option][hidden] { display: none; }
.ms-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.ms-chips .chip-mini { background: var(--secondary); color: var(--secondary-foreground); border-radius: 999px; padding: 0.05rem 0.5rem; font-size: 0.72rem; }
.check-line { display: flex; align-items: center; gap: 0.55rem; padding: 0.4rem 0.55rem; border-radius: calc(var(--radius) - 1px); cursor: pointer; font-size: 0.83rem; }
.check-line:hover { background: var(--accent); color: var(--accent-foreground); }

/* ---- Blocks: framed page templates ---- */
.block-frame { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--muted); width: 100%; }
.block-bar { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); background: var(--card); }
.block-bar .dot { width: 0.6rem; height: 0.6rem; border-radius: 999px; background: var(--border); }
.block-bar .url { margin-left: 0.5rem; font-size: 0.72rem; color: var(--muted-foreground); background: var(--muted); padding: 0.15rem 0.6rem; border-radius: 999px; }
.block-stage { min-height: 440px; display: grid; place-items: center; padding: 2rem; background: color-mix(in oklab, var(--muted) 45%, var(--background)); }
.auth-card { width: min(380px, 100%); background: var(--card); color: var(--card-foreground); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem; box-shadow: 0 12px 40px rgba(0,0,0,.08); }
.auth-card .auth-logo { width: 2.5rem; height: 2.5rem; border-radius: var(--radius); background: var(--primary); color: var(--primary-foreground); display: grid; place-items: center; font-weight: 700; margin: 0 auto 1rem; }
.auth-card h3 { text-align: center; margin: 0 0 0.25rem; font-size: 1.25rem; }
.auth-card .sub { text-align: center; color: var(--muted-foreground); font-size: 0.85rem; margin: 0 0 1.25rem; }
.auth-card .field { gap: 0.35rem; margin-bottom: 0.85rem; max-width: none; }
.auth-card .row-between { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.85rem; }
.auth-card .btn { width: 100%; }
.auth-divider { display: flex; align-items: center; gap: 0.75rem; color: var(--muted-foreground); font-size: 0.72rem; margin: 1rem 0; }
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
.auth-foot { text-align: center; font-size: 0.82rem; color: var(--muted-foreground); margin-top: 1rem; }
.auth-foot a { color: var(--primary); font-weight: 500; }

/* ---- Error / empty ---- */
.errstate { text-align: center; max-width: 420px; }
.errstate .code { font-size: 4rem; font-weight: 700; letter-spacing: -0.03em; color: var(--primary); line-height: 1; }
.errstate h3 { margin: 0.75rem 0 0.4rem; font-size: 1.35rem; }
.errstate p { color: var(--muted-foreground); margin: 0 0 1.25rem; }
.emptystate { text-align: center; padding: 2.5rem 1rem; color: var(--muted-foreground); border: 1.5px dashed var(--border); border-radius: var(--radius); }
.emptystate .ico { font-size: 2rem; opacity: 0.5; color: var(--muted-foreground); display: inline-flex; }
.emptystate h4 { margin: 0.6rem 0 0.3rem; color: var(--foreground); font-size: 1rem; }
.emptystate p { margin: 0 0 1rem; font-size: 0.85rem; }

/* ---- AI harness ---- */
.ai-shell { display: grid; grid-template-columns: 210px 1fr; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; height: 620px; background: var(--background); width: 100%; }
.ai-rail { border-right: 1px solid var(--border); background: var(--sidebar); display: flex; flex-direction: column; min-width: 0; }
.ai-rail-head { padding: 0.75rem; border-bottom: 1px solid var(--border); }
.ai-rail-list { overflow-y: auto; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.15rem; }
.ai-rail-item { padding: 0.5rem 0.6rem; border-radius: calc(var(--radius) - 1px); font-size: 0.8rem; color: var(--muted-foreground); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ai-rail-item:hover { background: var(--sidebar-accent); color: var(--sidebar-accent-foreground); }
.ai-rail-item.on { background: var(--sidebar-accent); color: var(--foreground); font-weight: 500; }
.ai-rail-group { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); padding: 0.5rem 0.6rem 0.25rem; }
.ai-main { display: flex; flex-direction: column; min-width: 0; }
.ai-convo { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.5rem; }
.ai-msg { display: flex; gap: 0.75rem; }
.ai-avatar { width: 1.75rem; height: 1.75rem; border-radius: 999px; flex: none; display: grid; place-items: center; font-size: 0.72rem; font-weight: 700; }
.ai-msg.user .ai-avatar { background: var(--secondary); color: var(--secondary-foreground); }
.ai-msg.assistant .ai-avatar { background: var(--primary); color: var(--primary-foreground); }
.ai-body { min-width: 0; flex: 1; }
.ai-role { font-size: 0.72rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.3rem; }
.ai-content { font-size: 0.9rem; line-height: 1.6; color: var(--foreground); }
.ai-content p { margin: 0 0 0.7rem; }
.ai-content p:last-child { margin-bottom: 0; }
.ai-content ul { margin: 0 0 0.7rem; padding-left: 1.2rem; }
.ai-content li { margin: 0.2rem 0; }
.ai-content code { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.82em; background: var(--muted); padding: 0.1rem 0.35rem; border-radius: 4px; }
.ai-content h4 { margin: 0.2rem 0 0.5rem; font-size: 0.95rem; }
.ai-cursor { display: inline-block; width: 0.5rem; height: 1rem; background: var(--primary); vertical-align: text-bottom; animation: blink 1s steps(2) infinite; margin-left: 1px; }
@keyframes blink { 50% { opacity: 0; } }
/* code block */
.ai-code { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 0 0 0.7rem; background: color-mix(in oklab, var(--muted) 55%, var(--background)); }
.ai-code-head { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.7rem; border-bottom: 1px solid var(--border); font-size: 0.72rem; color: var(--muted-foreground); }
.ai-code-copy { border: none; background: none; color: var(--muted-foreground); cursor: pointer; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.3rem; }
.ai-code-copy:hover { color: var(--foreground); }
.ai-code pre { margin: 0; padding: 0.75rem 0.85rem; overflow-x: auto; font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.8rem; line-height: 1.55; }
.tok-key { color: var(--chart-1); } .tok-str { color: var(--chart-5); } .tok-num { color: var(--chart-3); } .tok-com { color: var(--muted-foreground); font-style: italic; } .tok-fn { color: var(--chart-2); }
/* diff */
.ai-diff { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 0 0 0.7rem; font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.78rem; }
.ai-diff-line { display: grid; grid-template-columns: 1.4rem 1fr; }
.ai-diff-line .gutter { text-align: center; color: var(--muted-foreground); user-select: none; }
.ai-diff-line .code { padding-right: 0.6rem; white-space: pre; overflow-x: auto; }
.ai-diff-line.add { background: color-mix(in oklab, var(--chart-5) 14%, var(--background)); }
.ai-diff-line.add .gutter { color: var(--chart-5); }
.ai-diff-line.del { background: color-mix(in oklab, var(--destructive) 12%, var(--background)); }
.ai-diff-line.del .gutter { color: var(--destructive); }
/* tool call */
.ai-tool { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 0 0 0.7rem; }
.ai-tool-head { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem; font-size: 0.82rem; cursor: pointer; background: var(--card); }
.ai-tool-head .t-name { font-weight: 500; }
.ai-tool-head .t-arg { color: var(--muted-foreground); font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.78rem; }
.ai-tool-status { margin-left: auto; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.3rem; }
.ai-tool-status.done { color: var(--chart-5); }
.ai-tool-status.run { color: var(--chart-3); }
.spinner { width: 0.8rem; height: 0.8rem; border: 2px solid color-mix(in oklab, var(--chart-3) 40%, transparent); border-top-color: var(--chart-3); border-radius: 999px; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ai-tool-body { display: none; padding: 0.6rem 0.75rem; border-top: 1px solid var(--border); background: color-mix(in oklab, var(--muted) 40%, var(--background)); font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.76rem; color: var(--muted-foreground); white-space: pre-wrap; max-height: 160px; overflow-y: auto; }
.ai-tool.open .ai-tool-body { display: block; }
.ai-tool.open .t-chev { transform: rotate(90deg); }
.t-chev { transition: transform .2s; color: var(--muted-foreground); }
/* reasoning */
.ai-reasoning { margin: 0 0 0.7rem; }
.ai-reasoning-head { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: var(--muted-foreground); cursor: pointer; }
.ai-reasoning-body { display: none; margin-top: 0.4rem; padding-left: 0.85rem; border-left: 2px solid var(--border); font-size: 0.82rem; color: var(--muted-foreground); font-style: italic; line-height: 1.55; }
.ai-reasoning.open .ai-reasoning-body { display: block; }
.ai-reasoning.open .t-chev { transform: rotate(90deg); }
/* message actions */
.ai-actions { display: flex; gap: 0.15rem; margin-top: 0.5rem; opacity: 0; transition: opacity .15s; }
.ai-msg:hover .ai-actions { opacity: 1; }
.ai-act { border: none; background: none; color: var(--muted-foreground); cursor: pointer; padding: 0.25rem 0.35rem; border-radius: calc(var(--radius) - 2px); font-size: 0.8rem; }
.ai-act:hover { background: var(--accent); color: var(--accent-foreground); }
.ai-act.on { color: var(--primary); }
/* plan / todo */
.ai-plan { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.7rem 0.85rem; margin: 0 0 0.7rem; }
.ai-plan-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); margin-bottom: 0.5rem; font-weight: 600; }
.ai-plan-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.2rem 0; }
.ai-plan-item .mark { width: 1.05rem; height: 1.05rem; flex: none; border-radius: 999px; display: grid; place-items: center; font-size: 0.65rem; border: 1px solid var(--border); }
.ai-plan-item.done .mark { background: var(--chart-5); color: #fff; border-color: transparent; }
.ai-plan-item.run .mark { border-color: var(--chart-3); color: var(--chart-3); }
.ai-plan-item.done { color: var(--muted-foreground); text-decoration: line-through; }
/* citations */
.ai-cite { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.4rem; }
.ai-cite a { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: var(--muted-foreground); border: 1px solid var(--border); border-radius: 999px; padding: 0.1rem 0.5rem; }
.ai-cite a:hover { border-color: var(--primary); color: var(--foreground); }
.ai-cite .num { width: 1rem; height: 1rem; border-radius: 999px; background: var(--primary); color: var(--primary-foreground); display: grid; place-items: center; font-size: 0.62rem; }
/* suggested prompts */
.ai-suggest { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ai-suggest button { display: inline-flex; align-items: center; gap: 0.55rem; border: 1px solid var(--border); background: var(--card); color: var(--foreground); border-radius: var(--radius); padding: 0.55rem 0.8rem; font-size: 0.82rem; cursor: pointer; text-align: left; }
.ai-suggest button svg { flex: none; color: var(--primary); }
.ai-suggest button:hover { border-color: var(--primary); background: var(--accent); }
/* composer */
.ai-composer { border-top: 1px solid var(--border); padding: 0.75rem; }
.ai-composer-box { border: 1px solid var(--input); border-radius: var(--radius); background: var(--background); transition: border-color .15s; }
.ai-composer-box:focus-within { border-color: var(--ring); box-shadow: 0 0 0 1px var(--ring); }
.ai-composer textarea { width: 100%; border: none; outline: none; background: none; color: var(--foreground); resize: none; font-family: inherit; font-size: 0.9rem; line-height: 1.5; padding: 0.7rem 0.8rem 0.2rem; max-height: 140px; }
.ai-composer textarea::placeholder { color: var(--muted-foreground); }
.ai-composer-tools { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.5rem 0.5rem; }
.ai-tool-btn { border: none; background: none; color: var(--muted-foreground); cursor: pointer; width: 1.9rem; height: 1.9rem; border-radius: calc(var(--radius) - 1px); font-size: 0.95rem; }
.ai-tool-btn:hover { background: var(--accent); color: var(--accent-foreground); }
.ai-model { position: relative; }
.ai-model-trigger { display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid var(--border); border-radius: 999px; padding: 0.25rem 0.65rem; font-size: 0.76rem; color: var(--foreground); background: var(--background); cursor: pointer; }
.ai-send { margin-left: auto; width: 2rem; height: 2rem; border-radius: 999px; border: none; background: var(--primary); color: var(--primary-foreground); cursor: pointer; display: grid; place-items: center; font-size: 0.95rem; }
.ai-send.stop { background: var(--destructive); }
.ai-send:disabled { opacity: 0.4; cursor: default; }
.ai-usage { font-size: 0.68rem; color: var(--muted-foreground); display: flex; align-items: center; gap: 0.4rem; }
.ai-usage .bar { width: 60px; height: 4px; border-radius: 999px; background: var(--secondary); overflow: hidden; }
.ai-usage .bar > span { display: block; height: 100%; background: var(--primary); }
.ai-empty { text-align: center; margin: auto; max-width: 460px; }
.ai-empty .mark { width: 3rem; height: 3rem; border-radius: var(--radius); background: var(--primary); color: var(--primary-foreground); display: grid; place-items: center; font-weight: 700; font-size: 1.2rem; margin: 0 auto 0.9rem; }
.ai-empty h3 { margin: 0 0 0.35rem; font-size: 1.3rem; }
.ai-empty p { color: var(--muted-foreground); margin: 0 0 1.25rem; }

/* ---- Data table ---- */
.dtable { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--card); }
.dtable-toolbar { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border); }
.dtable-scroll { max-height: 320px; overflow: auto; }
table.dt { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.84rem; }
table.dt thead th { position: sticky; top: 0; z-index: 1; background: var(--card); text-align: left; color: var(--muted-foreground); font-weight: 500; padding: 0.55rem 0.7rem; border-bottom: 1px solid var(--border); white-space: nowrap; }
table.dt th[data-dt-sort] { cursor: pointer; user-select: none; }
table.dt th[data-dt-sort]:hover { color: var(--foreground); }
table.dt th .sort-ind { opacity: 0; margin-left: 0.3rem; }
table.dt th.asc .sort-ind, table.dt th.desc .sort-ind { opacity: 1; }
table.dt th.desc .sort-ind { display: inline-block; transform: rotate(180deg); }
table.dt td { padding: 0.5rem 0.7rem; border-bottom: 1px solid var(--border); }
table.dt tbody tr:hover { background: var(--muted); }
table.dt tbody tr.selected { background: color-mix(in oklab, var(--primary) 8%, var(--card)); }
table.dt .num { text-align: right; font-variant-numeric: tabular-nums; }
table.dt .dt-check { width: 2.2rem; text-align: center; }
table.dt .dt-check input { accent-color: var(--primary); }
.dtable-foot { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; padding: 0.6rem 0.75rem; border-top: 1px solid var(--border); font-size: 0.78rem; color: var(--muted-foreground); }
.dtable-foot [data-dt-pager] { display: inline-flex; gap: 0.25rem; }

/* ---- IMF page templates ---- */
.explorer { display: grid; grid-template-columns: 220px 1fr; min-height: 480px; }
.ex-filters { border-right: 1px solid var(--border); padding: 1rem; background: var(--sidebar); display: flex; flex-direction: column; gap: 0.9rem; }
.ex-filters .label { margin: 0 0 0.35rem; }
.ex-main { padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; overflow: auto; }
.ex-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.ex-head h3 { margin: 0; font-size: 1.15rem; }
.country-head { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-bottom: 1px solid var(--border); }
.country-head .flag { width: 3rem; height: 3rem; border-radius: var(--radius); background: var(--secondary); display: grid; place-items: center; font-size: 1.5rem; flex: none; }
.country-head .flag svg { color: var(--primary); }
.country-head h3 { margin: 0; font-size: 1.35rem; }
.country-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
.mini-kpi { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.7rem 0.85rem; background: var(--card); }
.mini-kpi .l { font-size: 0.7rem; color: var(--muted-foreground); }
.mini-kpi .v { font-size: 1.35rem; font-weight: 650; letter-spacing: -0.02em; }
.mini-kpi .d { font-size: 0.7rem; }
.reader { display: grid; grid-template-columns: 180px 1fr; gap: 1.5rem; padding: 1.5rem; max-height: 580px; overflow: auto; }
.reader-toc { position: sticky; top: 0; align-self: start; font-size: 0.8rem; }
.reader-toc .toc-title { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.68rem; color: var(--muted-foreground); margin-bottom: 0.5rem; }
.reader-toc a { display: block; padding: 0.25rem 0; color: var(--muted-foreground); }
.reader-toc a:hover { color: var(--foreground); }
.reader-body { max-width: 640px; }
.reader-body .eyebrow { color: var(--primary); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
.reader-body h1 { font-size: 1.9rem; line-height: 1.15; letter-spacing: -0.02em; margin: 0.4rem 0 0.5rem; }
.reader-body .meta { color: var(--muted-foreground); font-size: 0.83rem; margin-bottom: 1.25rem; }
.reader-body h2 { font-size: 1.2rem; margin: 1.5rem 0 0.6rem; }
.reader-body p { line-height: 1.7; margin: 0 0 0.9rem; }
.reader-body figure.fig { margin: 1.25rem 0; border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; }
.reader-body figure.fig figcaption { font-size: 0.78rem; color: var(--muted-foreground); margin-top: 0.5rem; }
.footnotes { border-top: 1px solid var(--border); margin-top: 1.5rem; padding-top: 1rem; font-size: 0.78rem; color: var(--muted-foreground); }
.footnotes p { margin: 0.2rem 0; line-height: 1.5; }
@media (max-width: 820px) { .explorer, .reader, .kpi-row { grid-template-columns: 1fr; } }

/* ---- Foundations: spacing / elevation / motion / icons ---- */
.spacing-row { display: flex; flex-direction: column; gap: 0.5rem; }
.spacing-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: var(--muted-foreground); }
.spacing-item .bar { height: 0.85rem; background: color-mix(in oklab, var(--primary) 22%, var(--card)); border-radius: 3px; }
.spacing-item code { width: 3rem; }
.elev-row { display: flex; flex-wrap: wrap; gap: 1.25rem; }
.elev-item { width: 120px; height: 84px; border-radius: var(--radius); background: var(--card); border: 1px solid var(--border); display: grid; place-items: center; font-size: 0.72rem; color: var(--muted-foreground); }
.elev-sm { box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.elev-md { box-shadow: 0 4px 10px rgba(0,0,0,.10); }
.elev-lg { box-shadow: 0 10px 24px rgba(0,0,0,.14); }
.elev-xl { box-shadow: 0 20px 48px rgba(0,0,0,.18); }
.motion-row { display: flex; flex-wrap: wrap; gap: 1.25rem; }
.motion-item { text-align: center; font-size: 0.72rem; color: var(--muted-foreground); }
.motion-box { width: 84px; height: 56px; border-radius: var(--radius); background: var(--primary); margin-bottom: 0.4rem; }
.motion-item:hover .motion-box { transform: translateX(28px); }
.motion-fast .motion-box { transition: transform 150ms cubic-bezier(0.16,1,0.3,1); }
.motion-normal .motion-box { transition: transform 300ms cubic-bezier(0.16,1,0.3,1); }
.motion-slow .motion-box { transition: transform 600ms cubic-bezier(0.16,1,0.3,1); }
.icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 0.6rem; }
.icon-cell { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0.7rem 0.4rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.66rem; color: var(--muted-foreground); }
.icon-cell svg { width: 20px; height: 20px; color: var(--foreground); }

/* ---- Data display extras ---- */
.tree { font-size: 0.85rem; }
.tree-item > .tree-row { display: flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.4rem; border-radius: calc(var(--radius) - 1px); cursor: pointer; }
.tree-item > .tree-row:hover { background: var(--accent); color: var(--accent-foreground); }
.tree-item > .tree-row .tw-chev { transition: transform .15s; color: var(--muted-foreground); width: 12px; }
.tree-item.open > .tree-row .tw-chev { transform: rotate(90deg); }
.tree-children { margin-left: 1rem; border-left: 1px solid var(--border); padding-left: 0.4rem; display: none; }
.tree-item.open > .tree-children { display: block; }
.tree-leaf .tw-chev { visibility: hidden; }
.timeline { position: relative; padding-left: 1.4rem; }
.timeline::before { content: ""; position: absolute; left: 0.35rem; top: 0.3rem; bottom: 0.3rem; width: 2px; background: var(--border); }
.tl-item { position: relative; padding: 0 0 1.1rem 0.4rem; }
.tl-item::before { content: ""; position: absolute; left: -1.12rem; top: 0.2rem; width: 0.7rem; height: 0.7rem; border-radius: 999px; background: var(--primary); border: 2px solid var(--background); }
.tl-item.muted::before { background: var(--muted-foreground); }
.tl-time { font-size: 0.72rem; color: var(--muted-foreground); }
.tl-title { font-weight: 500; font-size: 0.88rem; }
.stepper { display: flex; align-items: center; gap: 0; width: 100%; }
.step { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
.step .num { width: 1.6rem; height: 1.6rem; border-radius: 999px; display: grid; place-items: center; font-size: 0.78rem; border: 1px solid var(--border); flex: none; }
.step.done .num { background: var(--chart-5); color: #fff; border-color: transparent; }
.step.active .num { background: var(--primary); color: var(--primary-foreground); border-color: transparent; }
.step .st-label { font-size: 0.8rem; }
.step.pending .st-label { color: var(--muted-foreground); }
.step .line { flex: 1; height: 2px; background: var(--border); margin: 0 0.5rem; }
.step.done .line { background: var(--chart-5); }
.dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.4rem 1.25rem; font-size: 0.86rem; }
.dl dt { color: var(--muted-foreground); }
.dl dd { margin: 0; font-variant-numeric: tabular-nums; }
.gauge-wrap { display: flex; gap: 1.5rem; flex-wrap: wrap; }

/* ---- System page templates ---- */
.sys-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.1rem; overflow: auto; }
.sresult { display: flex; flex-direction: column; gap: 0.9rem; }
.sresult .sr { border-bottom: 1px solid var(--border); padding-bottom: 0.85rem; }
.sresult .sr .ttl { color: var(--primary); font-weight: 500; }
.sresult .sr .snip { font-size: 0.85rem; color: var(--muted-foreground); margin: 0.2rem 0; }
.sresult .sr .m { font-size: 0.72rem; color: var(--muted-foreground); }
.filter-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.filter-chips .fc { border: 1px solid var(--border); border-radius: 999px; padding: 0.2rem 0.65rem; font-size: 0.76rem; cursor: pointer; color: var(--muted-foreground); }
.filter-chips .fc.on { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.notif .ni { display: flex; gap: 0.75rem; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid var(--border); }
.notif .ni .nico { width: 2rem; height: 2rem; border-radius: 999px; background: var(--secondary); display: grid; place-items: center; flex: none; }
.notif .ni .nt { font-size: 0.72rem; color: var(--muted-foreground); }
.notif .ni .dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: var(--primary); flex: none; }
.settings-layout { display: grid; grid-template-columns: 170px 1fr; gap: 1.5rem; padding: 1.25rem; }
.settings-nav a { display: block; padding: 0.4rem 0.6rem; border-radius: calc(var(--radius) - 1px); font-size: 0.84rem; color: var(--muted-foreground); }
.settings-nav a.active { background: var(--accent); color: var(--foreground); font-weight: 500; }
@media (max-width: 820px) { .settings-layout { grid-template-columns: 1fr; } }
`;
