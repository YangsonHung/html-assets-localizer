# 🌐 HTML Assets Localizer

> One-click localization of HTML external resources for truly offline pages

English | **[简体中文](README.zh.md)**

[![npm version](https://img.shields.io/npm/v/html-assets-localizer.svg)](https://www.npmjs.com/package/html-assets-localizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**HTML Assets Localizer** is a powerful resource localization tool that automatically downloads all external JavaScript and CSS resources referenced in HTML files and rewrites the reference paths. Whether you're creating offline demos, archiving web pages, or working in network-restricted environments, it's your best choice.

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🚀 **Fast Localization** | Automatically identify and download all external JS/CSS resources |
| 🎯 **Smart Path Rewriting** | Automatically update resource reference paths in HTML |
| 💻 **Dual Experience** | Provides both CLI command-line and visual UI modes |
| 📦 **Ready to Use** | Supports global installation or integration as an npm package |
| 🔧 **Flexible Configuration** | Supports custom output directories and file organization |
| 🛡️ **Safe & Reliable** | Automatically handles filename conflicts to avoid resource overwrites |

---

## 📦 Installation

### Local Development Installation

```bash
# Clone the repository
git clone https://github.com/YangsonHung/html-assets-localizer.git
cd html-assets-localizer

# Install dependencies
pnpm install

# Compile TypeScript
pnpm run build
```

> 💡 **Tip**: Unless you modify the source code, you typically only need to compile once.
>
> ⚠️ Requires Node.js **20.19+** (or the latest 22.x LTS) because the build pipeline is powered by Vite 7.

### Global Installation (Recommended)

```bash
# Using pnpm
pnpm add -g html-assets-localizer

# Using npm
npm install -g html-assets-localizer

# Using yarn
yarn global add html-assets-localizer
```

After global installation, you can use `html-assets-localizer` or the shorthand `hal` from any directory.

---

## 🚀 Usage Guide

### 1️⃣ CLI Command-Line Mode

Perfect for quick processing and automation scenarios.

#### Basic Usage

```bash
# Full command
html-assets-localizer <html-file> <output-dir>

# Shorthand command
hal <html-file> <output-dir>
```

#### Practical Examples

```bash
# Process a single HTML file
hal index.html ./offline-bundle

# Run from source
node dist/cli.js example.html ./output
```

**Execution Results**:

- ✅ Creates `js/` and `css/` subdirectories under `<output-dir>`
- ✅ Downloads all external resources to corresponding directories
- ✅ Generates a new HTML file with paths updated to local references
- ✅ Prints resource mapping details in the terminal

#### Common Commands

| Command | Description |
|---------|-------------|
| `hal help` | 📖 Display help information |
| `hal version` | 🔖 Show current version |
| `hal ui` | 🖥️ Launch visual interface |

---

### 2️⃣ UI Visual Mode

Ideal for team collaboration and users unfamiliar with command-line tools.

#### Start Service

```bash
# Default startup (auto-select port and open browser)
html-assets-localizer ui

# Or use shorthand
hal ui
```

#### Custom Configuration

```bash
# Specify port and host address
hal ui --port 4173 --host 0.0.0.0

# Start without auto-opening browser
hal ui --no-open
```

#### Features

- 📤 **Drag & Drop** HTML file upload
- 📊 **Real-time View** download progress and logs
- 📥 **One-click Download** processed offline package
- 🎨 **Friendly Interface** no command-line knowledge required

---

### 3️⃣ Programmatic Integration Mode

Integrate the tool into your Node.js projects.

#### Install Dependency

```bash
npm install html-assets-localizer
```

#### Code Example

```typescript
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

// Create instance
const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './offline',
});

// Execute processing
const summary = await localizer.process();

// View results
console.log('Processing complete!');
console.log('Asset list:', summary.assets);
console.log('Output path:', summary.outputPath);
```

#### Advanced Usage

```typescript
// Batch process multiple files
const files = ['page1.html', 'page2.html', 'page3.html'];

for (const file of files) {
  const localizer = new HtmlAssetsLocalizer({
    htmlFilePath: file,
    targetDir: `./output/${file.replace('.html', '')}`,
  });

  await localizer.process();
  console.log(`✅ ${file} processed successfully`);
}
```

---

### 4️⃣ Browser UMD Mode

Use the library directly in browsers (including GitHub Pages) without any backend.

```html
<!-- Always pulls the latest published bundle -->
<script src="https://unpkg.com/html-assets-localizer/dist/index.umd.js"></script>
<script>
  const { BrowserHtmlAssetsLocalizer } = window.HtmlAssetsLocalizer;

  async function localizeFile(file) {
    const htmlContent = await file.text();
    const localizer = new BrowserHtmlAssetsLocalizer({
      htmlContent,
      htmlFileName: file.name,
    });

    const result = await localizer.process();
    // Trigger download
    const url = URL.createObjectURL(result.zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.zipFileName;
    link.click();
    URL.revokeObjectURL(url);
  }
</script>
```

> ⚠️ Note: the browser mode still follows standard CORS restrictions—resources blocked by the remote server cannot be fetched.

---

## 📂 Output Structure

File organization after processing:

```text
output-dir/
├── index.html          # HTML file with updated paths
├── js/                 # JavaScript resources directory
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│   └── app.js
└── css/                # CSS resources directory
    ├── bootstrap.min.css
    ├── style.css
    └── theme.css
```

---

## 💡 Usage Tips

### ⚡ Performance Optimization

- ✅ Maintain a stable network connection to avoid download interruptions
- ✅ For large projects, test with a single file first
- ✅ Using CDN acceleration may affect download speed

### 🔧 Troubleshooting

- **Filename Conflicts**: The tool automatically adds numeric suffixes (e.g., `style.css`, `style-1.css`)
- **Download Timeout**: Check network connection and retry later
- **Invalid Resources**: Ensure external URLs in the original HTML are valid

### 🎯 Best Practices

1. **Version Control**: Recommend including generated offline packages in version control
2. **Regular Updates**: Periodically re-localize to get resource updates
3. **Testing**: Test page functionality in local environment after generation
4. **Backup Originals**: The tool generates new files, but keep original HTML as backup

---

## 🔄 Development Guide

### Modifying Source Code

If you need to modify tool functionality:

```bash
# 1. Edit source files in src/ directory
vim src/localizer.ts

# 2. Recompile
pnpm run build

# 3. Test modifications
node dist/cli.js test.html output
```

### Project Structure

```text
html-assets-localizer/
├── src/                      # TypeScript source
│   ├── cli.ts                # CLI entry point
│   ├── index.ts              # Package exports
│   ├── localizer.ts          # Core localization pipeline
│   ├── types.ts              # Shared type declarations
│   ├── browser/              # Browser bundle entry (UMD)
│   │   ├── index.ts
│   │   └── localizer.ts
│   └── server/
│       └── uiServer.ts       # Express-powered UI launcher
├── tests/
│   └── localizer.test.ts     # Vitest coverage for HTML flows
├── docs/                     # UI documentation and static assets
├── archive/                  # Archived examples and legacy assets
├── example.html              # Ready-to-run sample HTML file
├── .github/                  # GitHub workflows and issue templates
├── AGENTS.md                 # Contributor quick-start guide
├── CHANGELOG.md              # Release notes
├── CONTRIBUTING.md           # Detailed contribution process
├── package.json          # Project metadata and scripts
├── pnpm-lock.yaml         # Locked dependency graph
├── tsconfig.json          # TypeScript compiler options
├── vite.config.ts         # CLI build configuration
├── vite.browser.config.ts # Browser bundle configuration
├── vitest.config.ts       # Vitest runner setup
├── README.md / README.zh.md # Documentation (English & Chinese)
└── dist/ (generated)      # Build output produced by `pnpm run build`
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, coding conventions, and submission guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🔗 Related Links

- 📦 [NPM Package](https://www.npmjs.com/package/html-assets-localizer)
- 💻 [GitHub Repository](https://github.com/YangsonHung/html-assets-localizer)
- 📖 [中文文档](README.zh.md)

---

<div align="center">

**Made with ❤️ by [YangsonHung](https://github.com/YangsonHung)**

If this project helps you, please give it a ⭐ Star!

</div>
