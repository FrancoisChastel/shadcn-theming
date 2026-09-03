# Component & layout roadmap

A running inventory of what the IMF-flavored design system ships today and what a
full **enterprise / institutional ("fund")** design system still wants. Use it to
decide what to build next. Everything below is rendered live in the multi-page
explorer (`npx shadcn-theming explore examples/imf.brand.json -o site`).

Legend: ✅ shipped · 🆕 added in the latest pass · ⬜ recommended next

---

## Foundations
- ✅ Color palette + semantic tokens, typography, radius, spacing, elevation, motion
- ✅ Icon gallery (single-source `icon()` set — now **102** Lucide-style icons)
- 🆕 Shield / security icon family (shield, shield-check/half/alert/x/off, lock-keyhole, file-lock, key, stamp, fingerprint, badge-check)
- 🆕 App-shell icons (panel-left, layout-dashboard, chevrons, log-out, building, briefcase, life-buoy)
- ⬜ Design-token JSON export page (copy-to-clipboard for `--tokens`)
- ⬜ Content/voice & number-formatting guidance (locale-aware figures)

## Forms
- ✅ Button (variants/sizes/states), Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Toggle
- ✅ Combobox + multi-select, Date picker, OTP, Password (strength + reveal), File upload, Search/tags/segmented, Field validation
- ⬜ **Date-range picker** (single date exists; ranges are heavily used in data tools)
- ⬜ Multi-step **form wizard** (stepper exists; a bound multi-page form does not)
- ⬜ Rich-text / markdown editor, Currency & unit inputs, Autosave affordance

## Data display
- ✅ Badge, Avatar, Card, Table, **Data table** (sort/filter/select/paginate/export)
- ✅ Tree view, Timeline, Stepper, Gauge, Description list, Code block, Progress/Skeleton, Tabs, Accordion, Carousel, Calendar, Tooltip/Hover card
- ⬜ **Audit log / activity feed** as a first-class component (a mini version lives on the profile page)
- ⬜ **Comparison / diff table** (side-by-side vintages)
- ⬜ Pivot / cross-tab, Virtualized long list, KPI "big number" board variants

## Security & classification 🆕
- 🆕 **Document classification** — the four IMF levels (Available to the Public → For Official Use Only → Confidential → Strictly Confidential)
- 🆕 Classification **badges**, **banner** (top/bottom document stamp), and a **picker**
- 🆕 Reusable registry item `classification-badge` (badge + banner, dependency-free)
- ⬜ Redaction / restricted-preview component, Watermarking, Access-request flow, Consent/embargo banner

## Overlays & menus
- ✅ Dialog, Alert dialog, Sheet, Drawer, Dropdown, Context menu, Menubar, Popover, Command palette (⌘K), Toast, Alert
- ⬜ Guided **product tour / coachmarks**, Confirmation with typed-name guard

## Navigation & app shell 🆕
- ✅ Breadcrumb, Pagination, Navigation menu, Page header, Bento grid, Split view, Stack
- 🆕 **Two-level enterprise header** (utility bar + main nav + mega-menu)
- 🆕 Header variants (application header, marketing/site header, compact editing toolbar)
- 🆕 **Sidebar** — icon rail + grouped nav + counts + user card
- 🆕 **Footers** — app status bar, multi-column site footer, legal/classification bar
- 🆕 **Composed app shell** (header + sidebar + content + footer)
- ⬜ Collapsible/resizable sidebar with persisted width, Command-driven nav, Multi-workspace switcher

## Charts (scientific + business)
- ✅ Area band (WEO), histogram + KDE, scatter + OLS band, box plot, correlation heatmap
- ✅ Time series, stacked area, grouped/stacked bars, diverging bars, lollipop, donut, bullet
- 🆕 **Distributions**: violin (KDE), ridgeline (joyplot), beeswarm, ECDF, hexbin 2-D density
- 🆕 **Analytical**: probabilistic fan chart, waterfall, slopegraph, connected-scatter, Lorenz curve (+ Gini), candlestick (OHLC), radar
- ⬜ Choropleth / tile-grid map (DataMapper), Sankey / flow, Population pyramid, Small-multiples faceting helper

## Templates & pages
- ✅ Dashboard, Data explorer, Country profile, Publication reader (now carries a classification banner)
- ✅ Search results, Notifications, Login / Sign-up / Forgot / Two-factor, 404, Empty state
- 🆕 **Profile page** (cover, stats, tabs, documents with classification badges, activity)
- 🆕 **Settings** (multi-section: security, passkeys, default classification, active sessions)
- 🆕 **403 clearance wall** (tied to classification) and **500 server error**
- ⬜ Onboarding flow, Billing/usage, Team/roles admin, Report builder, Comment/annotation thread, Maintenance page

---

## Reusable registry items
Installable with `npx shadcn add <raw-url>/registry/<name>.json`.

`icon` · `sparkline` · `stat-card` · `histogram` · `box-plot` · `scatter-plot` ·
`area-band` · `correlation-heatmap` · `line-chart` · `bar-chart` · `bullet-chart` ·
`donut-chart` · `data-table` · **`fan-chart`** · **`waterfall-chart`** ·
**`slope-chart`** · **`connected-scatter`** · **`ecdf-plot`** · **`lorenz-curve`** ·
**`candlestick-chart`** · **`radar-chart`** · **`classification-badge`**

## Suggested next priorities
1. Date-range picker + form wizard (highest everyday demand in data tools).
2. Audit log / activity feed and a comparison/diff table (institutional review flows).
3. Choropleth / tile-grid map (the one iconic IMF chart still missing).
4. Redaction / access-request flow to complete the classification story.
