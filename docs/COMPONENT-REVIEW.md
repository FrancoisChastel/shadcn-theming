# Component review

A pass over every component in the explorer to confirm it renders correctly,
behaves sensibly, and is consistent with the rest of the system. Verified
in-browser (IMF theme, light + dark) with **no console errors** on any page.

## Verdict: the components make sense.

They are consistent (100% token-driven — no hardcoded colors), interactive where
a user would expect, and accessible (WCAG 2.2 AA pass: roles, names, focus,
reduced-motion). Below is what was checked.

## Foundations ✓
- **Colors** — 21 token cards, each with the token name, OKLCH value, and hex;
  swatches are live (theme-aware); paired tokens show a legible `Aa`.
- **Typography** — a real type scale in the brand font.
- **Radius** — sm/md/lg/xl/full derived from `--radius`.

## Forms ✓ (interaction-tested)
- Button (variants/sizes/states/disabled/loading), Input, Textarea.
- Checkbox, Radio, Switch, Slider (fill tracks the value), Toggle group.
- Select (custom), **Combobox** (search filters options → sets value),
  **Multi-select** (checkboxes → chips), **Date picker** (calendar popover →
  sets value), **Input OTP** (auto-advances, handles paste), **Password**
  (show/hide + strength meter), **File dropzone** (click + drag), **Tags**
  (Enter adds, × removes), **Search** (clear), **Segmented**, currency.
- Form field: live email validation + inline error states.

## Data display ✓
- Badge, Avatar (+ group), Card, Table (hover, numeric alignment), Progress,
  Skeleton, Tabs (roles + arrow keys), Accordion, Carousel, Calendar,
  Tooltip, Hover card.

## Overlays & menus ✓
- Dialog, Alert dialog, Sheet, Drawer (focus moves in / restores on close),
  Popover, Dropdown, Context menu (right-click), Command palette (⌘K, filters),
  Menubar, Alert, Toast (auto-dismiss).

## Navigation ✓
- Breadcrumb, Pagination (active state), Navigation menu.

## Layout & pages ✓
- Page header, Bento grid, Split (master–detail), Dashboard shell, Stack.
- Login, Sign up (password strength), Forgot password, Two-factor (OTP),
  404 error, Empty state.

## Communication & AI ✓
- Chat (send → typing indicator → reply).
- AI harness: streaming composer (send/stop), reasoning + tool cards (collapse),
  code block (copy), diff, agent plan, citations, message actions, model
  selector, suggested prompts.

## Charts ✓
- Scientific: histogram+KDE, box plot, scatter+regression band, area/fan,
  correlation heatmap.
- Business: time series, grouped & stacked bars, diverging bars, lollipop,
  donut (with legend + center label), bullet.

## Minor observations (non-blocking)
- **Segmented control vs Toggle group** overlap in purpose; both are kept as
  distinct, legitimate shadcn-style patterns.
- **Page-header tabs** use empty panels (the tabs act as sub-navigation in that
  demo); the tab state changes correctly even though the panels are placeholders.
- The demos are **illustrative HTML**; the *installable* React equivalents live
  in `registry/` (charts, KPI) — shadcn's own primitives (button, dialog, tabs…)
  are installed from shadcn directly and themed by the generated theme.
