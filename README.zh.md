# HTML Assets Localizer 🌐✨

HTML Assets Localizer 可以将 HTML 中引用的远程 JavaScript、CSS 资源全部下载到本地，帮助你打造真正离线可用的页面。它同时提供命令行和图形界面两种体验，适合不同的团队协作方式。

> 想查看英文指南？请访问 [README.md](README.md)

## ⚡ 快速开始

```bash
pnpm install       # 安装依赖
pnpm run build     # 编译 TypeScript 输出
```

只要源码没有改动，通常只需编译一次即可。

### 🌍 全局安装

想在任何目录直接调用 CLI？

```bash
pnpm add -g html-assets-localizer
npm install -g html-assets-localizer
yarn global add html-assets-localizer
```

全局安装后，可以在任意位置使用 `html-assets-localizer`、`hal` 或 UI 子命令，无需克隆仓库。

## 🧰 CLI 模式

- `html-assets-localizer <html-file> <output-dir>` —— 从 HTML 中下载并重写外链资源。
- `hal <html-file> <output-dir>` —— CLI 的简写别名，行为完全一致。
- 工具会在 `<output-dir>` 下生成 `js/`、`css/` 子目录，并打印每个资源的映射结果。

示例：

```bash
node dist/cli.js example.html offline-bundle
```

### 📋 常用子命令

- `html-assets-localizer help` / `hal help` —— 查看命令用法与参数。
- `html-assets-localizer version` / `hal version` —— 输出当前版本号。
- `--port`、`--host`、`--no-open` —— 在 UI 模式下可用的额外参数。

## 🖥️ UI 模式

想要拖拽上传？试试以下命令：

```bash
html-assets-localizer ui
```

- 会在本地启动一个托管 `docs/index.html` 的服务。
- 默认自动选择空闲端口并打开浏览器（可通过 `--no-open` 禁用）。
- 上传 HTML，查看下载日志，并直接获取压缩包结果。

需要固定地址时，可执行：

```bash
hal ui --port 4173 --host 0.0.0.0
```

## 🧑‍💻 编程接入

```ts
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './offline',
});

const summary = await localizer.process();
console.log(summary.assets);
```

如果直接使用源码，请先执行 `pnpm run build` 以生成 `dist/` 输出；发布为 npm 包后，只需安装依赖即可引用。

## 💡 小贴士

- 下载资源时请保持网络畅通，若遇到超时可稍后重试。
- 重名文件会自动追加序号后缀，避免覆盖。
- 修改 `src/` 下的源码后，重新运行 `pnpm run build` 以更新编译结果。

## 📄 许可证

MIT License —— 祝你构建出色的离线体验！
