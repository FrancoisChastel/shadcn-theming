/**
 * Small IO + logging helpers shared across CLI commands. Keeps the command
 * modules focused on orchestration rather than fs plumbing and ANSI codes.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import pc from "picocolors";
import { parseBrand, type Brand } from "../core/brand-schema.js";

export const log = {
  info: (msg: string) => console.log(msg),
  step: (msg: string) => console.log(`${pc.cyan("→")} ${msg}`),
  success: (msg: string) => console.log(`${pc.green("✓")} ${msg}`),
  warn: (msg: string) => console.warn(`${pc.yellow("!")} ${msg}`),
  error: (msg: string) => console.error(`${pc.red("✗")} ${msg}`),
  dim: (msg: string) => console.log(pc.dim(msg)),
  heading: (msg: string) => console.log(`\n${pc.bold(msg)}`),
};

export { pc };

/** Read + parse + validate a brand.json file into a fully-defaulted Brand. */
export async function loadBrandFile(path: string): Promise<Brand> {
  const abs = resolve(path);
  if (!existsSync(abs)) {
    throw new Error(`Brand file not found: ${abs}`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(abs, "utf8"));
  } catch (err) {
    throw new Error(`Invalid JSON in ${abs}: ${(err as Error).message}`);
  }
  return parseBrand(raw);
}

/** Read + parse a JSON file into an unknown value. */
export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

/** Write text to a path, creating parent directories as needed. */
export async function writeFileEnsured(path: string, content: string): Promise<void> {
  const abs = resolve(path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf8");
}

/** Write a value as pretty JSON (trailing newline). */
export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFileEnsured(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Read a file's text, returning "" when it does not exist. */
export async function readTextOrEmpty(path: string): Promise<string> {
  const abs = resolve(path);
  if (!existsSync(abs)) return "";
  return readFile(abs, "utf8");
}
