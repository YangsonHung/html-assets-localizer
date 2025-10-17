# HTML Assets Localizer

HTML Assets Localizer is a TypeScript/Node.js toolkit that mirrors external JavaScript and CSS resources into an offline-ready workspace. It ships with a command-line interface and an optional UI so you can keep HTML pages self-contained without relying on remote CDNs.

> 中文文档请参见 [README.zh.md](README.zh.md)

## Features

- TypeScript-based CLI: run `html-assets-localizer <html-file> <output-dir>` to download remote assets and rewrite HTML references.
- `ui` sub-command: serves `docs/index.html`, recreating the upload/download flow from the hosted demo.
- Automatic directory management: creates `js/` and `css/` folders, deduplicates filenames, and handles HTTP/HTTPS with redirects.
- Programmatic API: import the TypeScript implementation and reuse it inside your own Node.js applications.
- Archived parity: legacy Node.js and Python versions are preserved under `archive/` for historical reference.

## Project Structure

```
.
├── AGENTS.md
├── archive/
│   ├── js/assets_localizer.js      # Archived Node.js implementation
│   └── py/assets_localizer.py      # Archived Python implementation
├── docs/
│   └── index.html                  # UI served by the `ui` sub-command
├── dist/                           # Compiled output (excluded from source control)
├── example.html
├── package.json
├── src/
│   ├── cli.ts
│   ├── index.ts
│   ├── localizer.ts
│   └── server/uiServer.ts
├── tsconfig.json
└── ...
```

## Requirements

### Node.js CLI

- Node.js 18 or newer.
- Install dependencies with `pnpm install`, then run `pnpm run build` once to populate `dist/`.

### Archived Python Script

- Python 3.6 or newer if you need to reference the legacy script located at `archive/py/assets_localizer.py`.

## Setup

```bash
# Install dependencies and compile TypeScript
pnpm install
pnpm run build
```

## CLI Usage

```bash
# Localize an HTML file using the compiled CLI
node dist/cli.js example.html output

# After publishing to npm, run the CLI without cloning the repo
pnpm dlx html-assets-localizer example.html output
```

The command writes an updated HTML file and populates `js/` and `css/` folders inside the target directory while printing a resource mapping summary.

## UI Mode

```bash
# Serve the local UI on a random free port
node dist/cli.js ui

# Or expose it on a predictable address
html-assets-localizer ui --port 4173 --host 0.0.0.0
```

The server hosts `docs/index.html`, optionally opens your default browser, and lets you upload HTML files, inspect logs, and download the generated archive.

## Programmatic Usage

```ts
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './output',
});

const summary = await localizer.process();
console.log(summary.assets);
```

When consuming the library from source, run `pnpm run build` first so the compiled exports in `dist/` are ready. Once published, install the package and import it directly.

## Archived Implementations

- `archive/js/assets_localizer.js`: original CommonJS implementation for Node.js.
- `archive/py/assets_localizer.py`: Python version powered by the standard library.

Both are retained for comparison purposes and are no longer actively maintained.

## License

MIT License.
