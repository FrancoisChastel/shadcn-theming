/**
 * `audit` — print the WCAG contrast audit for a brand's derived theme and exit
 * non-zero when any pair fails, so it can gate CI.
 */
import { loadBrandFile, log } from "../utils/io.js";
import { printAudit } from "../utils/print.js";
import { deriveTheme } from "../core/tokens.js";
import { auditTokens } from "../core/audit.js";

export interface AuditOptions {
  /** Exit with a non-zero code when any contrast check fails. */
  strict?: boolean;
}

export async function auditCommand(brandPath: string, options: AuditOptions): Promise<void> {
  const brand = await loadBrandFile(brandPath);
  const tokens = deriveTheme(brand);

  log.heading(`Contrast audit — ${brand.name}`);
  let failures = 0;
  for (const app of ["light", "dark"] as const) {
    const map = tokens[app];
    if (!map) continue;
    const result = auditTokens(map, app);
    failures += result.failures;
    printAudit(result);
  }

  if (failures === 0) {
    log.success("\nAll contrast checks pass AA.");
  } else {
    log.warn(`\n${failures} contrast check(s) below target.`);
    if (options.strict) process.exitCode = 1;
  }
}
