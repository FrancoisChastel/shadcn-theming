/**
 * shadcn-theming CLI entry point.
 *
 * Subcommands:
 *   init                 interactive wizard (source → tokens → apply/registry)
 *   extract              build a brand.json from a logo/website/tokens
 *   generate             brand.json → registry theme (+ css/preview)
 *   apply                patch a project's globals.css
 *   registry             emit only the registry theme item
 *   preview              write a self-contained HTML preview
 *   audit                print the WCAG contrast audit
 */
import { createRequire } from "node:module";
import { Command } from "commander";
import { log } from "./utils/io.js";
import { initCommand } from "./commands/init.js";
import { extractCommand, type ExtractOptions } from "./commands/extract.js";
import { generateCommand, type GenerateOptions } from "./commands/generate.js";
import { applyCommand, type ApplyOptions } from "./commands/apply.js";
import { registryCommand, type RegistryOptions } from "./commands/registry.js";
import { previewCommand, type PreviewOptions } from "./commands/preview.js";
import { showcaseCommand, type ShowcaseOptions } from "./commands/showcase.js";
import { exploreCommand, type ExploreOptions } from "./commands/explore.js";
import { auditCommand, type AuditOptions } from "./commands/audit.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string; description: string };

/** Wrap an async action so thrown errors print cleanly and set exit code 1. */
function run<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
  return async (...args: A): Promise<void> => {
    try {
      await fn(...args);
    } catch (err) {
      log.error((err as Error).message);
      process.exitCode = 1;
    }
  };
}

const program = new Command();

program
  .name("shadcn-theming")
  .description(pkg.description)
  .version(pkg.version, "-v, --version");

program
  .command("init")
  .description("Interactive wizard: brand source → tokens → apply + registry")
  .action(run(async () => {
    await initCommand();
  }));

program
  .command("extract")
  .description("Build a brand.json from a logo, website, or design-tokens export")
  .option("--logo <path>", "extract a palette from a logo image (svg/png/jpg)")
  .option("--website <url>", "reverse-engineer a brand from a website URL")
  .option("--tokens <path>", "import a design-tokens JSON (W3C or Tokens Studio)")
  .option("-o, --out <file>", "output brand.json path", "brand.json")
  .option("--name <name>", "brand name")
  .option("--primary <color>", "override the primary color")
  .option("--secondary <color>", "override the secondary color")
  .option("--accent <color>", "override the accent color")
  .option("--destructive <color>", "override the destructive color")
  .option("--radius <length>", "corner radius, e.g. 0.5rem")
  .option("--font-sans <family>", "sans font family")
  .option("--appearance <mode>", "light | dark | both")
  .option("--tint", "tint neutrals toward the brand hue")
  .option("--print", "print the brand.json to stdout instead of writing")
  .action(run(async (opts: ExtractOptions) => {
    await extractCommand(opts);
  }));

program
  .command("generate")
  .argument("<brand.json>", "path to a brand.json")
  .description("Generate a shadcn registry theme (+ optional css/preview) from a brand")
  .option("-o, --out <file>", "registry theme JSON output path")
  .option("--css <file>", "also write a full globals.css scaffold")
  .option("--preview <file>", "also write an HTML preview page")
  .option("--name <name>", "registry item name")
  .option("--no-audit", "skip the contrast audit output")
  .action(run(async (brandPath: string, opts: GenerateOptions) => {
    await generateCommand(brandPath, opts);
  }));

program
  .command("apply")
  .argument("<brand.json>", "path to a brand.json")
  .description("Detect the shadcn project and patch its globals.css with the theme")
  .option("--cwd <dir>", "project directory to search from")
  .option("--css <file>", "explicit target CSS path (skips detection)")
  .option("--dry-run", "print the resulting CSS without writing")
  .option("-y, --yes", "write without confirmation")
  .action(run(async (brandPath: string, opts: ApplyOptions) => {
    await applyCommand(brandPath, opts);
  }));

program
  .command("registry")
  .argument("<brand.json>", "path to a brand.json")
  .description("Emit only the shadcn registry theme item")
  .option("-o, --out <file>", "output path")
  .option("--name <name>", "registry item name")
  .action(run(async (brandPath: string, opts: RegistryOptions) => {
    await registryCommand(brandPath, opts);
  }));

program
  .command("preview")
  .argument("<brand.json>", "path to a brand.json")
  .description("Write a self-contained HTML preview of the theme")
  .option("-o, --out <file>", "output HTML path")
  .action(run(async (brandPath: string, opts: PreviewOptions) => {
    await previewCommand(brandPath, opts);
  }));

program
  .command("showcase")
  .argument("<brand.json>", "path to a brand.json")
  .description("Render a full showcase HTML (all components + scientific charts)")
  .option("-o, --out <file>", "output HTML path")
  .action(run(async (brandPath: string, opts: ShowcaseOptions) => {
    await showcaseCommand(brandPath, opts);
  }));

program
  .command("explore")
  .argument("<brand.json>", "path to a brand.json")
  .description("Render a multi-page component explorer site (every component + charts)")
  .option("-o, --out <dir>", "output directory for the site")
  .action(run(async (brandPath: string, opts: ExploreOptions) => {
    await exploreCommand(brandPath, opts);
  }));

program
  .command("audit")
  .argument("<brand.json>", "path to a brand.json")
  .description("Print the WCAG contrast audit for the derived theme")
  .option("--strict", "exit non-zero if any check fails (for CI)")
  .action(run(async (brandPath: string, opts: AuditOptions) => {
    await auditCommand(brandPath, opts);
  }));

program.parseAsync().catch((err) => {
  log.error((err as Error).message);
  process.exitCode = 1;
});
