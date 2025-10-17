# Repository Guidelines

## 项目结构与模块组织
- TypeScript 核心位于 `src/localizer.ts`，CLI 入口在 `src/cli.ts`，UI 服务封装于 `src/server/uiServer.ts`，统一导出通过 `src/index.ts`。
- `docs/index.html` 被 `ui` 子命令复用以提供可视化体验，`example.html` 是命令行与 UI 的共享演示样例。
- 历史 Node.js 与 Python 版本已迁入 `archive/js/`、`archive/py/`，默认只读；`dist/` 属于构建产物，不应提交仓库。

## 构建、测试与开发命令
- 使用 pnpm 管理依赖：`pnpm install` 后执行 `pnpm run build` 产出 `dist/`。
- CLI 快速验证：`node dist/cli.js example.html sandbox`；UI 体验：`node dist/cli.js ui --no-open` 并访问提示地址。
- 发布前可运行 `pnpm run build` 与 `pnpm pack` 进行包内容自检；调试源码可借助 `pnpm exec ts-node src/cli.ts ...`。

## 编码风格与命名约定
- TypeScript 编译目标为 ES2020，模块格式采用 CommonJS，启用严格模式。
- 类与接口使用帕斯卡命名，函数与常量使用驼峰命名；类型定义集中在 `src/types.ts` 或功能邻近文件。
- 新增文件需保留标准头部注释与 LF 行尾；文档示例默认使用 `pnpm` 指令，若描述发布流程可写作 “发布到 npm Registry”。

## 测试规范
- 当前无自动化测试，提交前至少完成 `pnpm run build` 与 `node dist/cli.js example.html tmp_output` 两步验证。
- 如调整 UI 行为，请在 PR 中列出启动命令与观察结果；后续若引入测试框架，请置于 `tests/` 目录并更新本指南。

## 提交与 Pull Request 指南
- Commit 推荐沿用 `<type>: <description>`（如 `docs: align pnpm usage`），内容聚焦主要变更。
- PR 描述需覆盖变更动机、核心改动与验证步骤（含 CLI 构建运行）；文档改动需说明是否同步多语言版本。
- 新增依赖或脚本时，请在说明中列出用途与调用示例，保持分支与主干同步后再提交。

## 安全与配置提示
- 工具会下载外部资源，务必确认目标 URL 合规且许可证兼容；必要时在 README 中提示依赖的网络条件。
- UI 服务默认绑定本地地址，若需暴露至局域网请显式设置 `--host` 并评估访问风险。
- 避免提交临时输出与敏感凭据，若新增文件类型需排除请同步更新 `.gitignore`。
