/**
 * Document confidentiality classification — the four levels an institution like
 * the IMF uses to mark documents, expressed as reusable UI: shield badges, a
 * full-width banner, and a picker. Colors are semantic (theme tokens), not
 * decorative: green = public, brand blue = official use, amber = confidential,
 * red = strictly confidential.
 *
 * The labels mirror the public IMF information-classification vocabulary
 * (Available to the public → For Official Use Only → Confidential → Strictly
 * Confidential). Everything here is illustrative UI, not a real classified
 * document.
 */
import type { Section } from "./sections.js";
import { icon } from "./icons.js";

export interface ClassificationLevel {
  key: string;
  /** Full display label. */
  label: string;
  /** The stamp text used on banners. */
  stamp: string;
  /** Icon name from the shield family. */
  icon: string;
  /** Tone → CSS class suffix (`cls-<tone>`). */
  tone: "public" | "official" | "confidential" | "strict";
  /** Who may access, in one line. */
  who: string;
  /** Handling rule, one sentence. */
  rule: string;
}

/** The four levels, least → most restrictive. */
export const CLASSIFICATION_LEVELS: ClassificationLevel[] = [
  {
    key: "public",
    label: "Public",
    stamp: "Available to the Public",
    icon: "shield-check",
    tone: "public",
    who: "Anyone",
    rule: "Cleared for public release — no distribution restriction.",
  },
  {
    key: "official",
    label: "For Official Use Only",
    stamp: "For Official Use Only",
    icon: "shield-half",
    tone: "official",
    who: "Fund + designated staff",
    rule: "Available to staff of the relevant unit on a prudent-use basis; not to be further disclosed without consent.",
  },
  {
    key: "confidential",
    label: "Confidential",
    stamp: "Confidential",
    icon: "shield-alert",
    tone: "confidential",
    who: "Need-to-know",
    rule: "Limited to staff with a determined need to know.",
  },
  {
    key: "strict",
    label: "Strictly Confidential",
    stamp: "Strictly Confidential",
    icon: "lock-keyhole",
    tone: "strict",
    who: "Strict need-to-know",
    rule: "Limited to specifically designated staff with a strict need to know.",
  },
];

const byKey = (key: string) => CLASSIFICATION_LEVELS.find((l) => l.key === key) ?? CLASSIFICATION_LEVELS[0]!;

/** A pill badge for a classification level. */
export function clsBadge(key: string, size = 13): string {
  const l = byKey(key);
  return `<span class="cls-badge cls-${l.tone}">${icon(l.icon, { size })}<span>${l.label}</span></span>`;
}

/** A full-width classification banner (the stamp that rides atop a document). */
export function clsBanner(key: string): string {
  const l = byKey(key);
  return `<div class="cls-banner cls-${l.tone}" role="note" aria-label="Classification: ${l.stamp}">${icon(l.icon, { size: 14 })}<span class="cls-stamp">${l.stamp}</span><span class="cls-dist">Handling: ${l.who}</span></div>`;
}

/** Section group for the explorer. */
export function classificationSections(): Section[] {
  const demo = (inner: string, cls = "") => `<div class="demo ${cls}">${inner}</div>`;

  const table = `<div class="cls-table">
    <div class="cls-row cls-head"><span>Level</span><span>Who can access</span><span>Handling rule</span></div>
    ${CLASSIFICATION_LEVELS.map(
      (l) => `<div class="cls-row"><span>${clsBadge(l.key)}</span><span class="cls-who">${l.who}</span><span class="cls-rule">${l.rule}</span></div>`,
    ).join("")}
  </div>`;

  const banners = CLASSIFICATION_LEVELS.map((l) => clsBanner(l.key)).join("");

  const picker = `<div class="field" style="max-width:320px">
    <label class="label">Set document classification</label>
    <div class="cls-select" data-cls-picker>
      <button class="select-trigger" data-menu-trigger aria-haspopup="listbox">${clsBadge("official")} ${icon("chevron-down", { size: 15 })}</button>
      <div data-menu role="listbox">
        ${CLASSIFICATION_LEVELS.map((l) => `<div class="menu-item" role="option" data-cls-option data-cls="${l.key}">${clsBadge(l.key)}</div>`).join("")}
      </div>
    </div>
  </div>`;

  const doc = `<div class="cls-doc">
    ${clsBanner("strict")}
    <div class="cls-doc-body">
      <div class="muted" style="font-size:.72rem;letter-spacing:.04em;text-transform:uppercase">Working paper · WP/26/184 · draft</div>
      <h3 style="margin:.35rem 0 .5rem">Cross-country disinflation dynamics</h3>
      <p class="muted" style="font-size:.86rem;margin:0 0 .6rem">Services prices remain sticky while goods disinflation broadens. This draft is pre-decisional and must not be redistributed.</p>
      <div class="cls-doc-meta"><span>${icon("user", { size: 13 })} A. Economist</span><span>${icon("calendar", { size: 13 })} 12 Sep 2026</span><span>${icon("file-lock", { size: 13 })} 2 authorized readers</span></div>
    </div>
    ${clsBanner("strict")}
  </div>`;

  return [
    {
      id: "classification-levels",
      group: "Security & classification",
      title: "Document classification",
      desc: "The four confidentiality levels, least to most restrictive, as color-coded shield badges with their access and handling rules. Green = public, brand blue = official use, amber = confidential, red = strictly confidential.",
      html: demo(`<div style="width:100%">${table}</div>`, "col"),
    },
    {
      id: "classification-badges",
      group: "Security & classification",
      title: "Classification badges & picker",
      desc: "Inline badges to mark a record, plus a picker to set a document's level. Use badges in tables, cards, and list rows.",
      html: demo(
        `<div style="width:100%;display:flex;flex-direction:column;gap:1.25rem">
          <div style="display:flex;gap:.6rem;flex-wrap:wrap;align-items:center">${CLASSIFICATION_LEVELS.map((l) => clsBadge(l.key)).join("")}</div>
          ${picker}
        </div>`,
        "col",
      ),
    },
    {
      id: "classification-banner",
      group: "Security & classification",
      title: "Classification banners",
      desc: "The full-width stamp a classified document carries top and bottom. Sober for public, saturated as restriction increases.",
      html: demo(`<div style="width:100%;display:flex;flex-direction:column;gap:.6rem">${banners}</div>`, "col"),
    },
    {
      id: "classification-doc",
      group: "Security & classification",
      title: "Classified document",
      desc: "A document framed by its classification banner, with an access summary — the pattern the publication reader and profile documents reuse.",
      html: demo(`<div style="width:100%;max-width:640px;margin:0 auto">${doc}</div>`, "col"),
    },
  ];
}
