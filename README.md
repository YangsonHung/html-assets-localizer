# HTML Assets Localizer

A tool for localizing external JavaScript and CSS resources in HTML files, with implementations in both **Python** and **Node.js**, helping you build offline-ready page resource dependencies.

> 中文文档 [README.zh.md](README.zh.md)

## Features

- Automatically detect and download external JavaScript and CSS references in HTML
- Generate structured `js/` and `css/` directories locally and update reference paths
- Support both command-line usage and modular integration
- Avoid duplicate downloads through resource hash naming
- Support HTTP/HTTPS and redirects

## Repository Structure

```
.
├── docs/
│   └── index.html             # Project documentation entry page
├── src/
│   ├── js/
│   │   └── assets_localizer.js
│   └── py/
│       └── assets_localizer.py
├── LICENSE
├── README.md
└── .gitignore
```

## Requirements

### Python Version

- Python 3.6+
- Uses standard library, no additional dependencies required

### Node.js Version

- Node.js 12+
- Uses built-in modules, no additional dependencies required

## Usage

### Python Version

```bash
# Basic usage
python src/py/assets_localizer.py input.html target_directory

# Example
python src/py/assets_localizer.py example.html output
```

### Node.js Version

```bash
# Basic usage
node src/js/assets_localizer.js input.html target_directory

# Example
node src/js/assets_localizer.js example.html output
```

## Usage Example

Suppose you have an HTML file with external resources:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Example Page</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
</head>
<body>
    <h1>Hello World</h1>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

After running the tool:

```bash
python src/py/assets_localizer.py example.html myProject
```

The tool will create in the `myProject/` directory:

1. Create `js/` and `css/` subdirectories
2. Download all external resources to corresponding directories
3. Output a new `index.html` that references local resources

## Output Structure (Example)

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

## Using as a Module

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

## Configuration Options

- `html_file_path`: Input HTML file path
- `target_directory`: Output directory, where `js/`, `css/` and processed HTML files will be generated

## Notes

1. Maintain network connection to download external resources
2. Ensure write permissions to the target directory
3. If resource CDNs have access restrictions, please confirm authorization in advance
4. If files with the same name exist in the target directory, the tool will skip downloading to avoid overwriting

## Troubleshooting

### Download Failures

- Check network connection
- Confirm resource URLs are accessible
- Check firewall or proxy settings

### File Permission Errors

- Ensure write permissions to the target directory
- Windows environment may require administrator privileges

### Encoding Issues

- Python version will automatically try UTF-8 and GBK encoding
- Ensure HTML file encoding format is correct

## License

MIT License

## Contributing

Issues and Pull Requests are welcome to improve this tool!

## Changelog

### v1.0.0

- Initial release
- Support JavaScript and CSS resource localization
- Provide Python and Node.js implementations
