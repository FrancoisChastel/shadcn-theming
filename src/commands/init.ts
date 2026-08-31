/**
 * `init` — an interactive wizard that walks from a brand source all the way to
 * applied CSS + a shareable registry theme. This is the "just run it" entry
 * point; every step maps to a non-interactive flag on the other commands.
 */
import * as p from "@clack/prompts";
import { relative } from "node:path";
import { slugify } from "../utils/slug.js";
import { writeJson, writeFileEnsured, readTextOrEmpty, log } from "../utils/io.js";
import { printAudit } from "../utils/print.js";
import { assembleBrand, type AssembleSources, type AssembleOverrides } from "../core/assemble.js";
import { deriveTheme } from "../core/tokens.js";
import { auditTokens } from "../core/audit.js";
import { buildThemeRegistryItem } from "../core/registry.js";
import { renderPreviewHtml } from "../core/preview.js";
import { detectProject } from "../core/project.js";
import { patchGlobalsCss } from "../core/css-patch.js";

/** Abort the wizard cleanly when the user cancels a prompt. */
function guard<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return value as T;
}

export async function initCommand(): Promise<void> {
  p.intro("shadcn-theming — brand your shadcn/ui");

  const source = guard(
    await p.select({
      message: "Where should the brand come from?",
      options: [
        { value: "manual", label: "Enter colors manually" },
        { value: "logo", label: "Extract from a logo image" },
        { value: "website", label: "Extract from a website URL" },
        { value: "tokens", label: "Import a design-tokens JSON" },
      ],
    }),
  ) as "manual" | "logo" | "website" | "tokens";

  const sources: AssembleSources = {};
  const overrides: AssembleOverrides = {};

  if (source === "logo") {
    sources.logo = guard(await p.text({ message: "Path to logo (svg/png/jpg):", placeholder: "./logo.svg" }));
  } else if (source === "website") {
    sources.website = guard(await p.text({ message: "Website URL:", placeholder: "https://acme.com" }));
  } else if (source === "tokens") {
    sources.tokens = guard(await p.text({ message: "Path to design-tokens JSON:", placeholder: "./tokens.json" }));
  } else {
    overrides.primary = guard(await p.text({ message: "Primary color:", placeholder: "#4f46e5" }));
    const accent = guard(await p.text({ message: "Accent color (optional):", placeholder: "" }));
    if (accent) overrides.accent = accent;
  }

  overrides.name = guard(await p.text({ message: "Brand name:", placeholder: "Acme", defaultValue: "Brand" }));

  const radius = guard(
    await p.select({
      message: "Corner radius:",
      options: [
        { value: "0rem", label: "Sharp (0)" },
        { value: "0.375rem", label: "Small (0.375rem)" },
        { value: "0.625rem", label: "Default (0.625rem)" },
        { value: "1rem", label: "Rounded (1rem)" },
      ],
      initialValue: "0.625rem",
    }),
  ) as string;
  overrides.radius = radius;

  overrides.appearance = guard(
    await p.select({
      message: "Which appearances?",
      options: [
        { value: "both", label: "Light + Dark" },
        { value: "light", label: "Light only" },
        { value: "dark", label: "Dark only" },
      ],
      initialValue: "both",
    }),
  ) as "both" | "light" | "dark";

  overrides.tint = guard(
    await p.confirm({ message: "Tint neutrals toward the brand hue? (subtle, premium)", initialValue: false }),
  );

  const spin = p.spinner();
  spin.start("Assembling brand and deriving tokens");
  const { brand, notes } = await assembleBrand(sources, overrides);
  const tokens = deriveTheme(brand);
  spin.stop("Theme derived.");

  if (notes.length) p.note(notes.join("\n"), "Extraction notes");

  // Audit summary inside the wizard.
  let failures = 0;
  for (const app of ["light", "dark"] as const) {
    const map = tokens[app];
    if (map) failures += auditTokens(map, app).failures;
  }
  p.note(
    `primary  ${brand.colors.primary}\nradius   ${tokens.radius}\ncontrast ${failures === 0 ? "all pass AA" : `${failures} below target`}`,
    brand.name,
  );
  for (const app of ["light", "dark"] as const) {
    const map = tokens[app];
    if (map) printAudit(auditTokens(map, app));
  }

  const outputs = guard(
    await p.multiselect({
      message: "What should I produce?",
      options: [
        { value: "brand", label: "brand.json (canonical brand file)", hint: "recommended" },
        { value: "registry", label: "registry theme.json (shareable)" },
        { value: "apply", label: "Apply to this project's globals.css" },
        { value: "preview", label: "HTML preview page" },
      ],
      initialValues: ["brand", "registry"],
      required: false,
    }),
  ) as string[];

  const slug = slugify(brand.name);

  if (outputs.includes("brand")) {
    await writeJson("brand.json", {
      $schema: "https://raw.githubusercontent.com/FrancoisChastel/shadcn-theming/main/schema/brand.schema.json",
      name: brand.name,
      colors: brand.colors,
      ...(brand.fonts ? { fonts: brand.fonts } : {}),
      ...(brand.neutrals.tint ? { neutrals: brand.neutrals } : {}),
      radius: brand.radius,
      appearance: brand.appearance,
    });
    log.success("Wrote brand.json");
  }

  if (outputs.includes("registry")) {
    await writeJson(`${slug}-theme.json`, buildThemeRegistryItem(brand, tokens));
    log.success(`Wrote ${slug}-theme.json`);
  }

  if (outputs.includes("preview")) {
    await writeFileEnsured(`${slug}-preview.html`, renderPreviewHtml(brand, tokens));
    log.success(`Wrote ${slug}-preview.html`);
  }

  if (outputs.includes("apply")) {
    const project = detectProject(process.cwd());
    const target = relative(process.cwd(), project.cssPath) || project.cssPath;
    const ok = guard(await p.confirm({ message: `Patch ${target}?`, initialValue: true }));
    if (ok) {
      const existing = await readTextOrEmpty(project.cssPath);
      const result = patchGlobalsCss(existing, tokens);
      await writeFileEnsured(project.cssPath, result.css);
      for (const w of result.warnings) log.warn(w);
      log.success(`${result.created ? "Created" : "Updated"} ${target}`);
    }
  }

  p.outro("Done. Restart your dev server to see the new theme.");
}
