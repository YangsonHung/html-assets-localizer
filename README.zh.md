# HTML Assets Localizer

HTML Assets Localizer 是一个用于将 HTML 文件中的远程 JavaScript、CSS 等资源转存到本地的工具集，现提供基于 TypeScript/Node.js 的 CLI 与可视化 UI 服务，助力构建离线可用的页面资源依赖。

> English documentation is available in [README.md](README.md)

## 功能特性

- TypeScript 重写的 CLI：`html-assets-localizer <html> <target>` 一键本地化
- 内置 `ui` 子命令，直接启动 `docs/index.html` 对应的交互式体验
- 自动创建 `js/`、`css/` 目录并为重复资源生成唯一文件名
- 支持 HTTP/HTTPS、30 秒超时与多次重定向处理
- 旧版 Node.js 与 Python 实现已归档至 `archive/`，方便回溯

## 仓库结构

```
.
├── AGENTS.md
├── archive/
│   ├── js/assets_localizer.js      # 历史 Node.js 版本
│   └── py/assets_localizer.py      # 历史 Python 版本
├── docs/
│   └── index.html                  # UI 服务复用的页面
├── dist/                           # tsc 编译后的输出
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

## 环境要求

### Node.js CLI

- Node.js 18 及以上版本
- 执行 `pnpm install` 安装依赖，随后 `pnpm run build` 生成 `dist/`

### 归档的 Python 版本

- Python 3.6+，脚本位于 `archive/py/assets_localizer.py`，仅作历史保留

## 安装与使用

```bash
# 安装依赖并构建
pnpm install
pnpm run build

# 运行 CLI（本地执行示例）
node dist/cli.js example.html output

# 未来以 npm 包方式安装后
pnpm dlx html-assets-localizer example.html output
```

CLI 会在目标目录写入更新后的 HTML 文件及 `js/`、`css/` 子目录，并输出资源映射详情。

### UI 模式

```bash
node dist/cli.js ui
# 或
html-assets-localizer ui --port 4173 --host 0.0.0.0
```

命令会启动本地静态服务，托管 `docs/index.html`，默认自动打开浏览器。页面支持上传 HTML、查看下载日志并导出压缩包。

### 编程方式集成

```ts
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './output',
});

const summary = await localizer.process();
console.log(summary.assets);
```

若在本地调试，请先执行 `pnpm run build`；若已发布为 npm 包，可直接在项目中安装并导入。

## 归档实现

- `archive/js/assets_localizer.js`：旧版 Node.js CommonJS 版本
- `archive/py/assets_localizer.py`：Python 版本，仅依赖标准库

上述文件不再更新，仅供参考。

## License

MIT License.
