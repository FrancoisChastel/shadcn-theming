# Vendored assets

These minified bundles are vendored so the generated showcase/explorer pages are
fully self-contained (offline, single-file). They are inlined into the HTML by
the `showcase` and `explore` commands.

| File | Library | Version | License |
| --- | --- | --- | --- |
| `plot.umd.min.js` | [Observable Plot](https://github.com/observablehq/plot) | 0.6.17 | ISC © Observable, Inc. |
| `d3.min.js` | [D3](https://github.com/d3/d3) | 7.9.0 | ISC © Mike Bostock |

Both are unmodified redistributions. See each project's repository for full
license text. Observable Plot's UMD build expects a global `d3`, so `d3.min.js`
is loaded first.

To refresh after a dependency bump:

```bash
cp node_modules/@observablehq/plot/dist/plot.umd.min.js assets/plot.umd.min.js
cp node_modules/d3/dist/d3.min.js assets/d3.min.js
```
