# 🌐 HTML Assets Localizer

> 一键本地化 HTML 外部资源，打造真正的离线页面

**[English](README.md)** | 简体中文

[![npm version](https://img.shields.io/npm/v/html-assets-localizer.svg)](https://www.npmjs.com/package/html-assets-localizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**HTML Assets Localizer** 是一个强大的资源本地化工具,能够自动下载 HTML 文件中引用的所有外部 JavaScript 和 CSS 资源,并重写引用路径。无论是制作离线演示、归档网页,还是在网络受限环境下工作,它都是你的最佳选择。

---

## ✨ 核心特性

| 特性               | 说明                                    |
| ------------------ | --------------------------------------- |
| 🚀 **快速本地化**   | 自动识别并下载所有外部 JS/CSS 资源      |
| 🎯 **智能路径重写** | 自动更新 HTML 中的资源引用路径          |
| 💻 **双重体验**     | 提供 CLI 命令行和可视化 UI 两种使用方式 |
| 📦 **开箱即用**     | 支持全局安装,也可作为 npm 包集成到项目  |
| 🔧 **灵活配置**     | 支持自定义输出目录和文件组织结构        |
| 🛡️ **安全可靠**     | 自动处理文件名冲突,避免资源覆盖         |

---

## 📦 安装

### 本地开发安装

```bash
# 克隆项目
git clone https://github.com/YangsonHung/html-assets-localizer.git
cd html-assets-localizer

# 安装依赖
pnpm install

# 编译 TypeScript
pnpm run build
```

> 💡 **提示**：只要源码没有修改,通常只需编译一次。
>
> ⚠️ 请确保本地 Node.js 版本为 **20.19+**（或最新 22.x LTS），构建流程依赖的 Vite 7 需要该版本以上的运行环境。

### 全局安装（推荐）

```bash
# 使用 pnpm
pnpm add -g html-assets-localizer

# 使用 npm
npm install -g html-assets-localizer

# 使用 yarn
yarn global add html-assets-localizer
```

全局安装后,你可以在任意目录使用 `html-assets-localizer` 或简写命令 `hal`。

---

## 🚀 使用指南

### 1️⃣ CLI 命令行模式

适合快速处理和自动化场景。

#### 基础用法

```bash
# 完整命令
html-assets-localizer <html-file> <output-dir>

# 简写命令
hal <html-file> <output-dir>
```

#### 实际示例

```bash
# 处理单个 HTML 文件
hal index.html ./offline-bundle

# 从源码运行
node dist/cli.js example.html ./output
```

**执行效果**：

- ✅ 在 `<output-dir>` 下创建 `js/` 和 `css/` 子目录
- ✅ 下载所有外部资源到对应目录
- ✅ 生成新的 HTML 文件,路径已更新为本地引用
- ✅ 在终端打印资源映射详情

#### 常用命令

| 命令          | 说明             |
| ------------- | ---------------- |
| `hal help`    | 📖 显示帮助信息   |
| `hal version` | 🔖 查看当前版本   |
| `hal ui`      | 🖥️ 启动可视化界面 |

---

### 2️⃣ UI 可视化模式

适合团队协作和不熟悉命令行的用户。

#### 启动服务

```bash
# 默认启动（自动选择端口并打开浏览器）
html-assets-localizer ui

# 或使用简写
hal ui
```

#### 自定义配置

```bash
# 指定端口和主机地址
hal ui --port 4173 --host 0.0.0.0

# 启动但不自动打开浏览器
hal ui --no-open
```

#### 功能特点

- 📤 **拖拽上传** HTML 文件
- 📊 **实时查看** 下载进度和日志
- 📥 **一键下载** 处理后的离线包
- 🎨 **友好界面** 无需学习命令行

---

### 3️⃣ 编程集成模式

将工具集成到你的 Node.js 项目中。

#### 安装依赖

```bash
npm install html-assets-localizer
```

#### 代码示例

```typescript
import { HtmlAssetsLocalizer } from 'html-assets-localizer';

// 创建实例
const localizer = new HtmlAssetsLocalizer({
  htmlFilePath: './example.html',
  targetDir: './offline',
});

// 执行处理
const summary = await localizer.process();

// 查看结果
console.log('处理完成！');
console.log('资源列表:', summary.assets);
console.log('输出路径:', summary.outputPath);
```

#### 高级用法

```typescript
// 批量处理多个文件
const files = ['page1.html', 'page2.html', 'page3.html'];

for (const file of files) {
  const localizer = new HtmlAssetsLocalizer({
    htmlFilePath: file,
    targetDir: `./output/${file.replace('.html', '')}`,
  });

  await localizer.process();
  console.log(`✅ ${file} 处理完成`);
}
```

---

### 4️⃣ 浏览器 UMD 模式

在浏览器（包括 GitHub Pages）中直接使用，无需后端服务配合。

```html
<!-- 始终拉取最新发布的浏览器构建 -->
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
      const url = URL.createObjectURL(result.zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.zipFileName;
      link.click();
      URL.revokeObjectURL(url);
  }
</script>
```

> ⚠️ 注意：浏览器模式仍受 CORS 限制，无法访问被跨域策略阻止的资源。

---

## 📂 输出结构

处理后的文件组织结构：

```text
output-dir/
├── index.html          # 路径已更新的 HTML 文件
├── js/                 # JavaScript 资源目录
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│   └── app.js
└── css/                # CSS 资源目录
    ├── bootstrap.min.css
    ├── style.css
    └── theme.css
```

---

## 💡 使用技巧

### ⚡ 性能优化

- ✅ 保持网络连接稳定,避免下载中断
- ✅ 大型项目建议先测试单个文件
- ✅ 使用 CDN 加速可能影响下载速度

### 🔧 问题处理

- **文件名冲突**：工具会自动添加数字后缀（如 `style.css`、`style-1.css`）
- **下载超时**：检查网络连接,稍后重试
- **资源失效**：确保原始 HTML 中的外链地址有效

### 🎯 最佳实践

1. **版本管理**：建议将生成的离线包纳入版本控制
2. **定期更新**：定期重新本地化以获取资源更新
3. **测试验证**：生成后在本地环境测试页面功能
4. **备份原文件**：工具会生成新文件,但建议保留原始 HTML

---

## 🔄 开发指南

### 修改源码

如果需要修改工具功能：

```bash
# 1. 修改 src/ 目录下的源文件
vim src/localizer.ts

# 2. 重新编译
pnpm run build

# 3. 测试修改
node dist/cli.js test.html output
```

### 项目结构

```text
html-assets-localizer/
├── src/                      # TypeScript 源码
│   ├── cli.ts                # CLI 入口
│   ├── index.ts              # 包导出入口
│   ├── localizer.ts          # 核心本地化流程
│   ├── types.ts              # 共享类型定义
│   ├── browser/              # 浏览器端 UMD 入口
│   │   ├── index.ts
│   │   └── localizer.ts
│   └── server/
│       └── uiServer.ts       # 基于 Express 的可视化界面服务
├── tests/
│   └── localizer.test.ts     # Vitest 测试用例
├── docs/                     # UI 文档与静态资源
├── archive/                  # 历史示例与备份资源
├── example.html              # 示例 HTML 文件
├── .github/                  # GitHub Workflow 与模版
├── AGENTS.md                 # 贡献者入门指南
├── CHANGELOG.md              # 版本更新记录
├── CONTRIBUTING.md           # 贡献流程说明
├── package.json              # 项目元数据与脚本
├── pnpm-lock.yaml            # 依赖锁定文件
├── tsconfig.json             # TypeScript 编译配置
├── vite.config.ts            # CLI 构建配置
├── vite.browser.config.ts    # 浏览器构建配置
├── vitest.config.ts          # Vitest 配置
├── README.md / README.zh.md  # 英文与中文文档
└── dist/ (构建产物)          # `pnpm run build` 生成的输出
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发流程、代码规范与提交流程。

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🔗 相关链接

- 📦 [NPM Package](https://www.npmjs.com/package/html-assets-localizer)
- 💻 [GitHub Repository](https://github.com/YangsonHung/html-assets-localizer)
- 📖 [English Documentation](README.md)

---

<div align="center">

**Made with ❤️ by [YangsonHung](https://github.com/YangsonHung)**

如果这个项目对你有帮助,欢迎给个 ⭐ Star！

</div>
