# HTML Assets Localizer

HTML Assets Localizer 提供一个 TypeScript/Node.js CLI 与本地 UI 服务，帮助将 HTML 中引用的远程 JavaScript 与 CSS 资源下载到本地，便于构建离线可用的页面资源依赖。

> 中文文档请参见 [README.zh.md](README.zh.md)

## Features

- TypeScript 重写的 CLI：使用 `html-assets-localizer <html> <target>` 快速本地化资源
- `ui` 子命令内置静态站点服务，复用 `docs/index.html` 的交互体验
- 自动创建 `js/` 与 `css/` 目录并去重命名，支持 HTTP/HTTPS 与多次重定向
- 提供编程接口，可在 Node.js 项目中直接导入并复用核心逻辑
- 历史 Python 与旧版 Node.js 实现保存在 `archive/` 目录，便于参考

## Repository Structure

```
.
├── AGENTS.md
├── archive/
│   ├── js/assets_localizer.js      # 归档的旧版 Node.js 实现
│   └── py/assets_localizer.py      # 归档的 Python 实现
├── docs/
│   └── index.html                  # UI 模式复用的静态页面
├── dist/                           # tsc 编译后的输出（npm 包入口）
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

- Node.js 18 或更高版本
- 使用 `pnpm install` 安装依赖，随后执行 `pnpm run build` 产出 `dist/`

### Archived Python Script

- Python 3.6+，脚本位于 `archive/py/assets_localizer.py`，保持原样以备查验

## Installation & Usage

```bash
# 安装依赖并构建
pnpm install
pnpm run build

# 运行 CLI（本地路径示例）
node dist/cli.js example.html output

# 或在发布为 npm 包后
pnpm dlx html-assets-localizer example.html output
```

CLI 会在目标目录下生成更新后的 HTML 文件以及 `js/`、`css/` 子目录，并打印资源映射详情。

### UI Mode

```bash
node dist/cli.js ui
# 或未来使用已发布包
html-assets-localizer ui --port 4173 --host 0.0.0.0
```

命令会启动一个本地静态服务，托管 `docs/index.html`，默认自动打开浏览器。通过页面即可上传 HTML、实时查看日志并下载打包结果。

### Programmatic Usage

```ts
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './output',
});

const summary = await localizer.process();
console.log(summary.assets);
```

若作为子模块使用，请先通过 `pnpm run build` 生成 `dist/`，或在自身项目中安装 npm 包。

## Archived Implementations

- `archive/js/assets_localizer.js`：原始 Node.js CommonJS 版本
- `archive/py/assets_localizer.py`：Python 版本，依赖标准库

它们不再接受新功能，只作为参考保留。

## License

MIT License.
