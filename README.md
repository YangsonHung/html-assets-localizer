# HTML Assets Localizer 🌐✨

HTML Assets Localizer keeps your HTML projects fully offline by mirroring external JavaScript and CSS assets to local folders. It offers both a quick CLI workflow and a browser-based UI for teams that prefer drag-and-drop convenience.

> Looking for the Chinese quick start? Head over to [README.zh.md](README.zh.md)

## ⚡ Quick Start

```bash
pnpm install       # install dependencies
pnpm run build     # compile TypeScript outputs
```

You only need to build once unless you modify the source code.

## 🧰 CLI Mode

- `html-assets-localizer <html-file> <output-dir>` — localize assets from an HTML file.
- `hal <html-file> <output-dir>` — shorthand alias, identical behavior.
- The command creates `js/` and `css/` folders within `<output-dir>` and prints a summary of every rewritten resource.

Example:

```bash
node dist/cli.js example.html offline-bundle
```

### 📋 Helpful Subcommands

- `html-assets-localizer help` / `hal help` — show usage and options.
- `html-assets-localizer version` / `hal version` — print the package version.
- `--port`, `--host`, `--no-open` — available when launching the UI mode.

## 🖥️ UI Mode

Launch an interactive UI that mirrors the hosted demo:

```bash
html-assets-localizer ui
```

- Serves `docs/index.html` on a local port.
- Auto-selects a free port and opens your default browser (disable with `--no-open`).
- Upload an HTML file, review download logs, and grab a ready-to-use archive.

Need a predictable address? Use:

```bash
hal ui --port 4173 --host 0.0.0.0
```

## 🧑‍💻 Programmatic Usage

```ts
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './offline',
});

const summary = await localizer.process();
console.log(summary.assets);
```

When working from source, run `pnpm run build` first so `dist/` exports are ready. After publishing, simply install the package and import it directly.

## 💡 Tips

- Keep a stable network connection while downloading remote assets.
- The tool respects existing filenames; duplicates receive a numeric suffix to avoid clashes.
- Use `pnpm run build` again whenever you modify source files under `src/`.

## 📄 License

MIT License — enjoy and build amazing offline experiences!
