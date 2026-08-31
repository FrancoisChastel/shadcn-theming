import { defineConfig } from "tsup";

export default defineConfig([
  {
    // Library entry — no shebang, importable as `shadcn-theming`.
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node18",
    clean: true,
    dts: true,
    sourcemap: true,
    splitting: false,
    shims: true,
  },
  {
    // CLI entry — executable, gets the shebang banner.
    entry: { cli: "src/cli.ts" },
    format: ["esm"],
    target: "node18",
    clean: false,
    dts: false,
    sourcemap: true,
    splitting: false,
    shims: true,
    banner: { js: "#!/usr/bin/env node" },
  },
]);
