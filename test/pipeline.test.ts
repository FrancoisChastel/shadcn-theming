import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectProject } from "../src/core/project.js";
import { assembleBrand } from "../src/core/assemble.js";
import { parseBrand } from "../src/core/brand-schema.js";
import { deriveTheme } from "../src/core/tokens.js";
import { renderPreviewHtml } from "../src/core/preview.js";

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "shadcn-theming-"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("detectProject", () => {
  it("reads the css path from components.json", async () => {
    const root = join(dir, "proj-a");
    await mkdir(join(root, "src/app"), { recursive: true });
    await writeFile(
      join(root, "components.json"),
      JSON.stringify({ tailwind: { css: "src/app/globals.css", baseColor: "zinc", cssVariables: true } }),
    );
    await writeFile(join(root, "src/app/globals.css"), ":root{}");
    const project = detectProject(root);
    expect(project.componentsJsonPath).toBeDefined();
    expect(project.cssPath.endsWith("src/app/globals.css")).toBe(true);
    expect(project.baseColor).toBe("zinc");
    expect(project.cssExists).toBe(true);
  });

  it("finds a conventional css path when components.json is absent", async () => {
    const root = join(dir, "proj-b");
    await mkdir(join(root, "app"), { recursive: true });
    await writeFile(join(root, "app/globals.css"), ":root{}");
    const project = detectProject(root);
    expect(project.componentsJsonPath).toBeUndefined();
    expect(project.cssPath.endsWith("app/globals.css")).toBe(true);
  });

  it("honors an explicit css override", async () => {
    const project = detectProject(dir, "some/where/theme.css");
    expect(project.cssPath.endsWith("some/where/theme.css")).toBe(true);
  });
});

describe("assembleBrand", () => {
  it("builds a brand from overrides only", async () => {
    const { brand } = await assembleBrand({}, { primary: "#0ea5e9", name: "Sky" });
    expect(brand.name).toBe("Sky");
    expect(brand.colors.primary).toBe("#0ea5e9");
  });

  it("imports from a design-tokens file and applies overrides", async () => {
    const tokensPath = join(dir, "tokens.json");
    await writeFile(
      tokensPath,
      JSON.stringify({ color: { primary: { $value: "#7c3aed", $type: "color" } } }),
    );
    const { brand, notes } = await assembleBrand(
      { tokens: tokensPath },
      { accent: "#22d3ee", tint: true },
    );
    expect(brand.colors.primary).toBe("#7c3aed");
    expect(brand.colors.accent).toBe("#22d3ee");
    expect(brand.neutrals.tint).toBe(true);
    expect(notes.length).toBeGreaterThan(0);
  });

  it("throws when no primary can be determined", async () => {
    await expect(assembleBrand({}, {})).rejects.toThrow();
  });
});

describe("renderPreviewHtml", () => {
  it("produces a self-contained document with brand + swatches", () => {
    const brand = parseBrand({ name: "Preview Co", colors: { primary: "#4f46e5" } });
    const html = renderPreviewHtml(brand, deriveTheme(brand));
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Preview Co");
    expect(html).toContain("Toggle theme");
    expect(html).toContain("--primary:");
    expect(html).toContain("chart-5");
  });
});
