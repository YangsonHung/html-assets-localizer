# HTML Assets Localizer

一个用于将 HTML 文件中的外部 JavaScript 与 CSS 资源本地化的工具，提供 **Python** 与 **Node.js** 两种实现，帮助你构建离线可用的页面资源依赖。

## 功能特性
- 自动检测并下载 HTML 中的外部 JavaScript 和 CSS 引用
- 在本地生成结构化的 `js/`、`css/` 目录并更新引用路径
- 同时支持命令行使用与模块化集成
- 通过资源哈希命名避免重复下载
- 支持 HTTP/HTTPS 及重定向

## 仓库结构
```
.
├── docs/
│   └── index.html             # 项目文档入口页面
├── src/
│   ├── js/
│   │   └── assets_localizer.js
│   └── py/
│       └── assets_localizer.py
├── LICENSE
├── README.md
└── .gitignore
```

## 安装要求
### Python 版本
- Python 3.6+
- 使用标准库，无需额外依赖

### Node.js 版本
- Node.js 12+
- 使用内置模块，无需额外依赖

## 使用方法
### Python 版本
```bash
# 基本用法
python src/py/assets_localizer.py input.html target_directory

# 示例
python src/py/assets_localizer.py example.html output
```

### Node.js 版本
```bash
# 基本用法
node src/js/assets_localizer.js input.html target_directory

# 示例
node src/js/assets_localizer.js example.html output
```

## 使用示例
假设你有一个包含外部资源的 HTML 文件：
```html
<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
</head>
<body>
    <h1>Hello World</h1>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

运行工具后：
```bash
python src/py/assets_localizer.py example.html myProject
```

工具会在 `myProject/` 目录中：
1. 创建 `js/` 与 `css/` 子目录
2. 下载所有外部资源到对应目录
3. 输出修改后引用本地资源的新 `index.html`

## 输出结构（示例）
```
myProject/
├── index.html
├── js/
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│   └── script_abc123.js
└── css/
    ├── bootstrap.min.css
    ├── style_def456.css
    └── main.css
```

## 作为模块使用
### Python
```python
from pathlib import Path
import sys

project_root = Path(__file__).resolve().parent
sys.path.append(str(project_root / "src" / "py"))

from assets_localizer import HTMLScriptLocalizer

localizer = HTMLScriptLocalizer("input.html", "target_directory")
localizer.process()
```

### Node.js
```javascript
const HTMLScriptLocalizer = require("./src/js/assets_localizer");

const localizer = new HTMLScriptLocalizer("input.html", "target_directory");
localizer.process();
```

## 配置选项
- `html_file_path`: 输入 HTML 文件路径
- `target_directory`: 输出目录，将在该目录下生成 `js/`、`css/` 与处理后的 HTML 文件

## 注意事项
1. 保持网络连接以下载外部资源
2. 确认拥有对目标目录的写入权限
3. 若资源 CDN 存在访问限制，请提前确认授权
4. 若目标目录存在同名文件，工具会跳过下载以避免覆盖

## 故障排除
### 下载失败
- 检查网络连接
- 确认资源 URL 可访问
- 检查防火墙或代理设置

### 文件权限错误
- 确保对目标目录拥有写入权限
- Windows 环境下可能需要管理员权限

### 编码问题
- Python 版本会自动尝试 UTF-8 与 GBK 编码
- 确保 HTML 文件编码格式正确

## 许可证
MIT License

## 贡献
欢迎提交 Issue 与 Pull Request 来改进该工具！

## 更新日志
### v1.0.0
- 初始版本发布
- 支持 JavaScript 与 CSS 资源本地化
- 提供 Python 与 Node.js 两种实现
