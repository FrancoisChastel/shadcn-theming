/**
 * `apply` — detect the target shadcn project and patch its globals.css with the
 * brand tokens, idempotently. Supports --dry-run and requires confirmation
 * (or --yes) before writing.
 */
import { relative } from "node:path";
import * as prompts from "@clack/prompts";
import { loadBrandFile, writeFileEnsured, readTextOrEmpty, log, pc } from "../utils/io.js";
import { printBrandSummary } from "../utils/print.js";
import { deriveTheme } from "../core/tokens.js";
import { detectProject } from "../core/project.js";
import { patchGlobalsCss } from "../core/css-patch.js";

export interface ApplyOptions {
  cwd?: string;
  css?: string;
  dryRun?: boolean;
  yes?: boolean;
}

export async function applyCommand(brandPath: string, options: ApplyOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);
  const cwd = options.cwd ?? process.cwd();
  const project = detectProject(cwd, options.css);

  log.heading(`Applying ${brand.name} theme`);
  printBrandSummary(brand, tokens);
  log.info("");
  if (project.componentsJsonPath) {
    log.step(`Detected shadcn project: ${relative(cwd, project.componentsJsonPath)}`);
    if (project.baseColor) log.dim(`  base color: ${project.baseColor}`);
  } else {
    log.warn("No components.json found — using conventional CSS path.");
  }
  log.step(`Target stylesheet: ${relative(cwd, project.cssPath) || project.cssPath}`);

  const existing = await readTextOrEmpty(project.cssPath);
  const result = patchGlobalsCss(existing, tokens);
  for (const warning of result.warnings) log.warn(warning);

  if (options.dryRun) {
    log.heading("Dry run — resulting globals.css:");
    console.log(pc.dim("────────────────────────────────────────"));
    console.log(result.css);
    console.log(pc.dim("────────────────────────────────────────"));
    log.info(result.created ? "(file would be created)" : "(file would be updated in place)");
    return;
  }

  if (!options.yes) {
    if (!process.stdout.isTTY) {
      throw new Error("Refusing to write without confirmation. Re-run with --yes (non-interactive).");
    }
    const verb = result.created ? "Create" : "Update";
    const ok = await prompts.confirm({
      message: `${verb} ${relative(cwd, project.cssPath) || project.cssPath}?`,
    });
    if (prompts.isCancel(ok) || !ok) {
      log.warn("Aborted — no files written.");
      return;
    }
  }

  await writeFileEnsured(project.cssPath, result.css);
  log.success(`${result.created ? "Created" : "Updated"} ${relative(cwd, project.cssPath) || project.cssPath}`);
  log.dim("  Restart your dev server if tokens don't hot-reload.");
}
