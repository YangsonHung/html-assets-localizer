# HTML Assets Localizer

一个用于将HTML文件中的外部资源（JavaScript、CSS等）本地化的工具，支持Python和Node.js两个版本。

## 功能特性

- 🔍 自动检测HTML文件中的外部JavaScript和CSS资源
- 📥 批量下载外部资源到本地目录
- 🔄 自动更新HTML文件中的资源引用路径
- 🚀 支持Python和Node.js两种实现
- 📁 智能文件命名，避免重复下载
- 🔗 支持重定向处理

## 安装要求

### Python版本
- Python 3.6+
- 无需额外依赖，使用标准库

### Node.js版本
- Node.js 12+
- 无需额外依赖，使用内置模块

## 使用方法

### Python版本

```bash
# 基本使用
python assets_localizer.py input.html target_directory

# 示例
python assets_localizer.py index.html myProject
```

### Node.js版本

```bash
# 基本使用
node assets_localizer.js input.html target_directory

# 示例
node assets_localizer.js index.html myProject
```

## 使用示例

假设你有一个包含外部资源的HTML文件：

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
python assets_localizer.py example.html myProject
```

工具会：
1. 在目标目录中创建 `js/` 和 `css/` 目录
2. 下载所有外部资源到对应目录
3. 将处理后的HTML文件复制到目标目录，其中的资源引用已更新为本地路径

## 输出结构

```
目标目录/
├── index.html                # 处理后的HTML文件
├── js/                       # JavaScript文件目录
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│   └── script_abc123.js
└── css/                      # CSS文件目录
    ├── bootstrap.min.css
    ├── style_def456.css
    └── main.css
```

## 作为模块使用

### Python

```python
from assets_localizer import HTMLScriptLocalizer

# 创建实例
localizer = HTMLScriptLocalizer("input.html", "target_directory")

# 处理文件
localizer.process()
```

### Node.js

```javascript
const HTMLScriptLocalizer = require('./assets_localizer');

// 创建实例
const localizer = new HTMLScriptLocalizer('input.html', 'target_directory');

// 处理文件
localizer.process();
```

## 配置选项

- `html_file_path`: 输入的HTML文件路径
- `target_directory`: 目标输出目录，将在此目录下创建js/css子目录和处理后的HTML文件

## 注意事项

1. **网络连接**：工具需要网络连接来下载外部资源
2. **文件权限**：确保有写入目标目录的权限
3. **资源可用性**：某些CDN资源可能有访问限制
4. **文件覆盖**：如果本地已存在同名文件，工具会跳过下载

## 支持的资源类型

- ✅ JavaScript文件（.js）
- ✅ CSS样式表（.css）
- ✅ 支持HTTP和HTTPS协议
- ✅ 支持重定向跟踪

## 故障排除

### 常见问题

1. **下载失败**
   - 检查网络连接
   - 确认资源URL是否可访问
   - 检查防火墙设置

2. **文件权限错误**
   - 确保对目标目录有写入权限
   - 在Windows上可能需要管理员权限

3. **编码问题**
   - Python版本会自动尝试UTF-8和GBK编码
   - 确保HTML文件编码正确

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个工具！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持JavaScript和CSS资源本地化
- 提供Python和Node.js两种实现