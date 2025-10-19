
(() => {
  const selectionVariantClasses = {
    info: 'border border-sky-400/40 bg-sky-500/10 text-sky-100 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-sky-100 border-sky-600/40 bg-sky-50 text-sky-800',
    success: 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-100 border-emerald-600/40 bg-emerald-50 text-emerald-800',
    warning: 'border border-amber-400/40 bg-amber-500/10 text-amber-100 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100 border-amber-600/40 bg-amber-50 text-amber-800',
    danger: 'border border-rose-400/40 bg-rose-500/10 text-rose-100 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100 border-rose-600/40 bg-rose-50 text-rose-800',
  };

  const selectionVariantClassList = Object.values(selectionVariantClasses).join(' ');

  const logLevelClasses = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-200',
    danger: 'text-rose-600 dark:text-rose-300',
    info: 'text-sky-600 dark:text-sky-300',
    default: 'text-slate-700 dark:text-slate-200',
  };

  const state = {
    selectedFile: null,
    logs: [],
    assets: [],
    isProcessing: false,
    selection: { visible: false, key: null, params: null, variant: 'info', raw: null },
  };

  const resources = {
    en: {
      translation: {
        hero: {
          tagline: 'Offline-first localization',
          title: 'HTML Assets Localizer',
          lead:
            'Download every external JavaScript and CSS reference so your HTML keeps working without the network.',
          primaryCta: 'Try the browser tool',
          secondaryCta: 'View on GitHub',
        },
        language: { label: 'Language' },
        theme: { label: 'Theme' },
        online: {
          title: 'Online Tool',
          description:
            'Upload an HTML file and get a self-contained zip bundle with every remote asset downloaded and paths rewritten.',
          helper:
            'Supports <code>script</code>, <code>link</code>, and <code>img</code> tags with <code>http(s)</code> URLs.',
          fileLabel: 'Choose HTML file',
          fileHint: 'Only documents that reference http(s) resources are supported.',
          fileInputPlaceholder: 'No file selected',
          fileInputButton: 'Choose file',
          buttons: {
            process: 'Process & download bundle',
            reset: 'Reset',
            processing: 'Processing...',
          },
          messages: {
            selectPrompt: 'Please choose the HTML file you want to localize.',
            selected: 'Selected file: {{fileName}} ({{fileSize}}).',
            coreMissing:
              'Unable to initialize the browser localizer. Please check your network connection and refresh later.',
            runtimeUnavailable: 'The localization runtime is not ready yet. Please refresh the page.',
          },
          logs: {
            title: 'Processing log',
            fileReady: 'The HTML file is ready. You can start the localization run.',
            reading: 'Reading file contents...',
            parsing: 'Parsing markup and downloading remote resources...',
            summary: 'Found {{total}} remote asset(s), localized {{localized}}.',
            archiveReady: 'Archive generated: {{fileName}}.',
            noResources: 'No remote resources detected. The original HTML was added to the archive.',
            failure: 'Processing failed: {{details}}',
            coreMissing: 'BrowserHtmlAssetsLocalizer is missing on window.HtmlAssetsLocalizer.',
          },
          resources: {
            title: 'Localized assets',
            headers: {
              type: 'Type',
              original: 'Original URL',
              local: 'Local path',
              size: 'Size',
            },
          },
        },
        features: {
          title: 'Core capabilities',
          subtitle:
            'Based on the project README, these highlights cover what matters most when localizing HTML assets.',
          items: [
            {
              icon: '🚀',
              title: 'Fast localization',
              description: 'Automatically detects every external JavaScript or CSS asset.',
            },
            {
              icon: '🎯',
              title: 'Smart rewrites',
              description: 'Rewrites markup so pages keep working completely offline.',
            },
            {
              icon: '💻',
              title: 'CLI + UI',
              description: 'Offers both a command-line workflow and a visual interface.',
            },
            {
              icon: '🔧',
              title: 'Configurable',
              description: 'Customize output folders, file naming, and runtime options.',
            },
          ],
        },
        installation: {
          title: 'Installation',
          subtitle: 'Two simple ways to get started with HTML Assets Localizer.',
          cards: [
            {
              badge: 'Local development',
              title: 'Clone and build once',
              description: 'Work directly with the TypeScript source code.',
              code:
                '# Clone the repository\n' +
                'git clone https://github.com/YangsonHung/html-assets-localizer.git\n' +
                'cd html-assets-localizer\n\n' +
                '# Install dependencies\n' +
                'pnpm install\n\n' +
                '# Compile TypeScript\n' +
                'pnpm run build',
              notes: [
                'Requires Node.js 20.19+ (or the latest 22.x LTS).',
                'Vite 7 powers the build pipeline.',
              ],
            },
            {
              badge: 'Global install',
              title: 'Install the CLI everywhere',
              description: 'Use the published package from any JavaScript ecosystem.',
              code:
                '# pnpm\n' +
                'pnpm add -g html-assets-localizer\n\n' +
                '# npm\n' +
                'npm install -g html-assets-localizer\n\n' +
                '# yarn\n' +
                'yarn global add html-assets-localizer',
              notes: [
                'After installation run `html-assets-localizer` or the shorthand `hal` from any directory.',
              ],
            },
          ],
        },
        cli: {
          title: 'CLI Workflow',
          subtitle: 'Automate localization directly from the command line.',
          sections: [
            {
              title: 'Basic usage',
              description: 'Process an HTML source file and write the offline bundle to a target folder.',
              code:
                '# Full command\n' +
                'html-assets-localizer <html-file> <output-dir>\n\n' +
                '# Shorthand\n' +
                'hal <html-file> <output-dir>',
            },
            {
              title: 'What you get',
              list: [
                'Creates `js/` and `css/` subfolders under the output directory.',
                'Downloads every remote asset into the proper folder.',
                'Generates a new HTML file with paths rewritten to local references.',
              ],
            },
          ],
          commands: {
            title: 'Handy commands',
            description: 'The CLI provides these useful commands for quick access.',
            headers: {
              command: 'Command',
              description: 'Description',
            },
            items: [
              { command: 'hal help', description: 'Show usage information.' },
              { command: 'hal version', description: 'Print the installed version.' },
              { command: 'hal ui', description: 'Launch the visual UI.' },
            ],
          },
        },
        ui: {
          title: 'UI mode',
          subtitle: 'Launch the browser interface for teammates who prefer GUI workflows.',
          cards: [
            {
              title: 'Start instantly',
              description: 'Let the CLI choose a free port and open the UI automatically.',
              code: 'hal ui',
            },
            {
              title: 'Custom configuration',
              description: 'Specify host, port, or disable auto-open for remote environments.',
              code:
                '# Pick port and host\n' +
                'hal ui --port 4173 --host 0.0.0.0\n\n' +
                '# Start without opening a browser\n' +
                'hal ui --no-open',
            },
          ],
        },
        output: {
          title: 'Output structure',
          subtitle: 'Every run mirrors the structure documented in the README.',
          structure:
            'output-dir/\n' +
            '├── index.html          # HTML file with updated paths\n' +
            '├── js/                 # JavaScript resources directory\n' +
            '│   ├── jquery.min.js\n' +
            '│   ├── bootstrap.min.js\n' +
            '│   └── app.js\n' +
            '└── css/                # CSS resources directory\n' +
            '    ├── bootstrap.min.css\n' +
            '    ├── style.css\n' +
            '    └── theme.css',
        },
        tips: {
          title: 'Tips & good habits',
          columns: [
            {
              title: 'Performance',
              items: [
                'Keep the network stable to avoid interrupted downloads.',
                'Start with a single HTML file when localizing large sites.',
              ],
            },
            {
              title: 'Troubleshooting',
              items: [
                'Filename conflicts receive numeric suffixes automatically.',
                'If a download times out, verify connectivity and retry.',
              ],
            },
            {
              title: 'Best practices',
              items: [
                'Commit generated offline bundles when they are part of a release.',
                'Test the localized output locally before distribution.',
              ],
            },
          ],
        },
        links: {
          contribute: {
            title: 'Contribute & feedback',
            description: 'Issues and pull requests are welcome—see the contribution guide in the repo.',
            cta: 'Open repository',
          },
          resources: {
            title: 'Useful links',
            items: [
              { label: 'NPM package', url: 'https://www.npmjs.com/package/html-assets-localizer' },
              { label: 'GitHub repository', url: 'https://github.com/YangsonHung/html-assets-localizer' },
              { label: 'Chinese documentation', url: 'https://github.com/YangsonHung/html-assets-localizer/blob/main/README.zh.md' },
            ],
          },
          license: {
            title: 'License',
            description: 'Released under the MIT License.',
          },
        },
        footer: {
          summary:
            'HTML Assets Localizer keeps HTML truly offline by downloading remote resources and rewriting references automatically.',
          copyright: '© 2025 HTML Assets Localizer. All rights reserved.',
        },
      },
    },
    zh: {
      translation: {
        hero: {
          tagline: '专为离线而生的本地化工具',
          title: 'HTML Assets Localizer',
          lead: '自动下载 HTML 中的外部 JS/CSS 引用并重写路径，让页面在无网络环境下依旧可用。',
          primaryCta: '体验浏览器工具',
          secondaryCta: '查看 GitHub',
        },
        language: { label: '选择语言' },
        theme: { label: '主题模式' },
        online: {
          title: '在线工具',
          description: '上传包含外部资源的 HTML，浏览器端会下载依赖并生成可离线使用的压缩包。',
          helper: '兼容 <code>script</code>、<code>link</code>、<code>img</code> 中的 <code>http(s)</code> 资源。',
          fileLabel: '选择 HTML 文件',
          fileHint: '目前仅支持引用 http(s) 资源的页面。',
          fileInputPlaceholder: '未选择任何文件',
          fileInputButton: '选择文件',
          buttons: {
            process: '本地化并下载压缩包',
            reset: '重置',
            processing: '处理中...',
          },
          messages: {
            selectPrompt: '请先选择需要处理的 HTML 文件。',
            selected: '已选择文件：{{fileName}}（{{fileSize}}）。',
            coreMissing: '无法加载浏览器端本地化核心，请检查网络后刷新页面重试。',
            runtimeUnavailable: '本地化运行时尚未就绪，请刷新页面后重试。',
          },
          logs: {
            title: '处理日志',
            fileReady: 'HTML 文件已就绪，可以开始本地化。',
            reading: '正在读取文件内容...',
            parsing: '正在解析标记并下载远程资源...',
            summary: '检测到 {{total}} 个远程资源，成功本地化 {{localized}} 个。',
            archiveReady: '压缩包已生成：{{fileName}}。',
            noResources: '未检测到远程资源，已将原始 HTML 写入压缩包。',
            failure: '处理失败：{{details}}',
            coreMissing: '未能在 window.HtmlAssetsLocalizer 上找到 BrowserHtmlAssetsLocalizer。',
          },
          resources: {
            title: '已本地化资源',
            headers: {
              type: '类型',
              original: '原始链接',
              local: '本地路径',
              size: '大小',
            },
          },
        },
        features: {
          title: '核心特性',
          subtitle: '这些重点能力帮助你快速了解本地化流程。',
          items: [
            {
              icon: '🚀',
              title: '快速本地化',
              description: '自动发现所有外部 JavaScript 与 CSS 资源。',
            },
            {
              icon: '🎯',
              title: '智能重写',
              description: '自动更新 HTML 引用路径，确保离线可用。',
            },
            {
              icon: '💻',
              title: '双重体验',
              description: '同时提供命令行与可视化界面两种模式。',
            },
            {
              icon: '🔧',
              title: '灵活可配',
              description: '可按需调整输出目录、命名与运行参数。',
            },
          ],
        },
        installation: {
          title: '安装方式',
          subtitle: '两种简单方式开始使用 HTML Assets Localizer。',
          cards: [
            {
              badge: '本地开发',
              title: '克隆并编译',
              description: '适合需要修改源码或调试的场景。',
              code:
                '# 克隆仓库\n' +
                'git clone https://github.com/YangsonHung/html-assets-localizer.git\n' +
                'cd html-assets-localizer\n\n' +
                '# 安装依赖\n' +
                'pnpm install\n\n' +
                '# 编译 TypeScript\n' +
                'pnpm run build',
              notes: ['需要 Node.js 20.19+（或 22.x LTS）。', '构建流程由 Vite 7 驱动。'],
            },
            {
              badge: '全局安装',
              title: '安装 CLI',
              description: '使用熟悉的包管理器安装即可。',
              code:
                '# 使用 pnpm\n' +
                'pnpm add -g html-assets-localizer\n\n' +
                '# 使用 npm\n' +
                'npm install -g html-assets-localizer\n\n' +
                '# 使用 yarn\n' +
                'yarn global add html-assets-localizer',
              notes: ['安装后可在任意目录运行 `html-assets-localizer` 或 `hal`。'],
            },
          ],
        },
        cli: {
          title: 'CLI 工作流',
          subtitle: '直接通过命令行自动化本地化处理。',
          sections: [
            {
              title: '基础用法',
              description: '传入 HTML 源文件与输出目录即可启动本地化。',
              code:
                '# 完整命令\n' +
                'html-assets-localizer <html-file> <output-dir>\n\n' +
                '# 简写命令\n' +
                'hal <html-file> <output-dir>',
            },
            {
              title: '输出结果',
              list: [
                '在目标目录创建 `js/` 与 `css/` 子目录。',
                '下载所有外部资源到对应目录。',
                '生成路径已重写的新 HTML 文件。',
              ],
            },
          ],
          commands: {
            title: '常用命令',
            description: 'CLI 提供这些常用命令以便快速访问。',
            headers: { command: '命令', description: '说明' },
            items: [
              { command: 'hal help', description: '查看帮助信息。' },
              { command: 'hal version', description: '查看当前版本。' },
              { command: 'hal ui', description: '启动可视化界面。' },
            ],
          },
        },
        ui: {
          title: '可视化界面',
          subtitle: '为偏好 GUI 的同事提供即开即用的浏览器体验。',
          cards: [
            {
              title: '快速启动',
              description: '自动选择端口并打开浏览器。',
              code: 'hal ui',
            },
            {
              title: '自定义参数',
              description: '按需指定主机、端口或关闭自动打开浏览器。',
              code:
                '# 指定端口与主机\n' +
                'hal ui --port 4173 --host 0.0.0.0\n\n' +
                '# 不自动打开浏览器\n' +
                'hal ui --no-open',
            },
          ],
        },
        output: {
          title: '输出结构',
          subtitle: '本地化处理后的文件结构说明。',
          structure:
            'output-dir/\n' +
            '├── index.html          # 路径已更新的 HTML 文件\n' +
            '├── js/                 # JavaScript 资源目录\n' +
            '│   ├── jquery.min.js\n' +
            '│   ├── bootstrap.min.js\n' +
            '│   └── app.js\n' +
            '└── css/                # CSS 资源目录\n' +
            '    ├── bootstrap.min.css\n' +
            '    ├── style.css\n' +
            '    └── theme.css',
        },
        tips: {
          title: '技巧与实践',
          columns: [
            {
              title: '性能',
              items: ['保持网络稳定。', '大型项目可先处理单个页面。'],
            },
            {
              title: '排查',
              items: ['文件名冲突会自动加后缀。', '下载超时请检查网络后重试。'],
            },
            {
              title: '建议',
              items: ['可将离线包纳入版本管理。', '分发前请在本地验证结果。'],
            },
          ],
        },
        links: {
          contribute: {
            title: '贡献与反馈',
            description: '欢迎提交 Issue 或 PR，详细流程见仓库贡献指南。',
            cta: '打开仓库',
          },
          resources: {
            title: '相关链接',
            items: [
              { label: 'NPM Package', url: 'https://www.npmjs.com/package/html-assets-localizer' },
              { label: 'GitHub 仓库', url: 'https://github.com/YangsonHung/html-assets-localizer' },
              { label: 'English README', url: 'https://github.com/YangsonHung/html-assets-localizer/blob/main/README.md' },
            ],
          },
          license: {
            title: '许可证',
            description: '项目采用 MIT License 开源。',
          },
        },
        footer: {
          summary: 'HTML Assets Localizer 自动下载远程资源并重写引用，让页面随时离线可用。',
          copyright: '© 2025 HTML Assets Localizer. 保留所有权利。',
        },
      },
    },
  };

  const refs = {};

  document.addEventListener('DOMContentLoaded', () => {
    refs.fileInput = document.getElementById('htmlFileInput');
    refs.processButton = document.getElementById('processButton');
    refs.resetButton = document.getElementById('resetButton');
    refs.selectionInfo = document.getElementById('selectionInfo');
    refs.statusContainer = document.getElementById('statusContainer');
    refs.logOutput = document.getElementById('logOutput');
    refs.resourceTableWrapper = document.getElementById('resourceTableWrapper');
    refs.resourceTableBody = document.querySelector('#resourceTable tbody');
    refs.themeToggle = document.getElementById('themeToggle');

    const defaultLanguage = determineDefaultLanguage();

    if (!window.i18next) {
      console.error('i18next failed to load.');
      return;
    }

    i18next
      .init({
        lng: defaultLanguage,
        fallbackLng: 'en',
        resources,
      })
      .then(() => {
        setupThemeToggle();
        setupLanguageToggle();
        initOnlineTool();
        updateLanguageUI();
      })
      .catch((error) => {
        console.error('Failed to initialize i18next:', error);
      });
  });

  function determineDefaultLanguage() {
    const locale = (navigator.language || 'en').toLowerCase();
    return locale.startsWith('zh') ? 'zh' : 'en';
  }

  function setupLanguageToggle() {
    document.querySelectorAll('.lang-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const targetLang = button.dataset.lang;
        if (targetLang && targetLang !== i18next.language) {
          i18next.changeLanguage(targetLang);
        }
      });
    });

    i18next.on('languageChanged', () => {
      updateLanguageUI();
    });
  }

  function updateLanguageUI() {
    document.documentElement.lang = i18next.language === 'zh' ? 'zh-CN' : 'en';
    document.title = i18next.t('hero.title');

    updateLanguageButtons();
    updateStaticTexts();
    updateFileInputText();
    renderFeatures();
    renderInstallationCards();
    renderCLISections();
    renderCLITable();
    renderUICards();
    renderTipsGrid();
    renderResourceLinks();
    renderCodeSamples();
    renderSelection();
    renderLogs();
    renderResourceTable();
    updateProcessButtonState();
  }
  function updateLanguageButtons() {
    document.querySelectorAll('.lang-toggle').forEach((button) => {
      const isActive = button.dataset.lang === i18next.language;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('bg-brand-500', isActive);
      button.classList.toggle('dark:bg-white', isActive);
      button.classList.toggle('text-white', isActive);
      button.classList.toggle('dark:text-slate-950', isActive);
      button.classList.toggle('text-slate-600', !isActive);
      button.classList.toggle('dark:text-slate-200', !isActive);
      button.classList.toggle('shadow-brand-glow', isActive);
    });
  }

  function setupThemeToggle() {
    if (!refs.themeToggle) {
      return;
    }

    refs.themeToggle.addEventListener('change', (event) => {
      const isDark = event.target.checked;
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('hal-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('hal-theme', 'light');
      }
    });

    const storedTheme = localStorage.getItem('hal-theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      refs.themeToggle.checked = true;
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      refs.themeToggle.checked = false;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        refs.themeToggle.checked = true;
      } else {
        document.documentElement.classList.remove('dark');
        refs.themeToggle.checked = false;
      }
    }
  }

  function updateStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (key) {
        const translatedText = i18next.t(key);
        node.textContent = translatedText;
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach((node) => {
      const key = node.getAttribute('data-i18n-html');
      if (key) {
        const translatedHTML = i18next.t(key);
        node.innerHTML = translatedHTML;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      if (key) {
        const translatedText = i18next.t(key);
        node.textContent = translatedText;
      }
    });
  }

  function updateFileInputText() {
    if (!refs.fileInput) return;
    
    // 更新自定义文件输入组件的文本
    const fileInputText = document.getElementById('fileInputText');
    const fileInputButton = document.getElementById('fileInputButton');
    
    if (fileInputText) {
      fileInputText.textContent = i18next.t('online.fileInputPlaceholder');
    }
    
    if (fileInputButton) {
      fileInputButton.textContent = i18next.t('online.fileInputButton');
    }
    
    // 如果已选择文件，显示文件名
    if (refs.fileInput.files && refs.fileInput.files.length > 0) {
      const file = refs.fileInput.files[0];
      if (fileInputText) {
        fileInputText.textContent = file.name;
      }
    }
  }

  function renderFeatures() {
    const container = document.getElementById('featureGrid');
    if (!container) return;
    const items = i18next.t('features.items', { returnObjects: true });
    container.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('div');
      card.className =
        'group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-lg dark:shadow-black/30 transition hover:border-brand-300/60 dark:hover:bg-brand-400/10 hover:bg-brand-50/10';

      const icon = document.createElement('div');
      icon.className =
        'flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 dark:bg-brand-500/20 text-brand-600 dark:text-brand-200 transition group-hover:text-brand-700 dark:group-hover:text-brand-100 text-2xl';
      icon.textContent = item.icon || '';

      const title = document.createElement('h3');
      title.className = 'mt-6 text-xl font-semibold text-slate-900 dark:text-white';
      title.textContent = item.title || '';

      const description = document.createElement('p');
      description.className = 'mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300';
      description.textContent = item.description || '';

      card.append(icon, title, description);
      container.append(card);
    });
  }

  function renderInstallationCards() {
    const container = document.getElementById('installationCards');
    if (!container) return;
    const cards = i18next.t('installation.cards', { returnObjects: true });
    container.innerHTML = '';
    cards.forEach((data) => {
      const card = document.createElement('div');
      card.className =
        'rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-8 shadow-lg dark:shadow-black/30';

      const badge = document.createElement('span');
      badge.className =
        'inline-flex items-center rounded-full bg-brand-500/20 dark:bg-brand-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100';
      badge.textContent = data.badge || '';

      const title = document.createElement('h3');
      title.className = 'mt-4 text-xl font-semibold text-slate-900 dark:text-white';
      title.textContent = data.title || '';

      const description = document.createElement('p');
      description.className = 'mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300';
      description.textContent = data.description || '';

      const codeBlock = document.createElement('pre');
      codeBlock.className =
        'scrollbar-thin mt-6 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/70 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-mono';
      const code = document.createElement('code');
      code.textContent = data.code || '';
      codeBlock.append(code);

      card.append(badge, title, description, codeBlock);

      if (Array.isArray(data.notes) && data.notes.length) {
        const list = document.createElement('ul');
        list.className = 'mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300';
        data.notes.forEach((note) => {
          const item = document.createElement('li');
          item.textContent = note;
          list.append(item);
        });
        card.append(list);
      }

      container.append(card);
    });
  }

  function renderCLISections() {
    const container = document.getElementById('cliContent');
    if (!container) return;
    const sections = i18next.t('cli.sections', { returnObjects: true });
    container.innerHTML = '';
    sections.forEach((section) => {
      const card = document.createElement('div');
      card.className =
        'rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-8 shadow-lg dark:shadow-black/30';

      const title = document.createElement('h3');
      title.className = 'text-xl font-semibold text-slate-900 dark:text-white';
      title.textContent = section.title || '';
      card.append(title);

      if (section.description) {
        const description = document.createElement('p');
        description.className = 'mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300';
        description.textContent = section.description;
        card.append(description);
      }

      if (section.code) {
        const codeBlock = document.createElement('pre');
        codeBlock.className =
          'scrollbar-thin mt-6 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/70 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-mono';
        const code = document.createElement('code');
        code.textContent = section.code;
        codeBlock.append(code);
        card.append(codeBlock);
      }

      if (Array.isArray(section.list) && section.list.length) {
        const list = document.createElement('ul');
        list.className = 'mt-6 list-disc space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300';
        section.list.forEach((entry) => {
          const item = document.createElement('li');
          item.textContent = entry;
          list.append(item);
        });
        card.append(list);
      }

      container.append(card);
    });
  }

  function renderCLITable() {
    const tbody = document.getElementById('cliCommandTable');
    if (!tbody) return;
    const rows = i18next.t('cli.commands.items', { returnObjects: true });
    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');

      const commandCell = document.createElement('td');
      commandCell.className = 'px-4 py-3 align-top font-mono text-slate-700 dark:text-slate-200';
      commandCell.textContent = row.command || '';

      const descriptionCell = document.createElement('td');
      descriptionCell.className = 'px-4 py-3 align-top text-slate-600 dark:text-slate-300';
      descriptionCell.textContent = row.description || '';

      tr.append(commandCell, descriptionCell);
      tbody.append(tr);
    });
  }

  function renderUICards() {
    const container = document.getElementById('uiCards');
    if (!container) return;
    const cards = i18next.t('ui.cards', { returnObjects: true });
    container.innerHTML = '';
    cards.forEach((data) => {
      const card = document.createElement('div');
      card.className =
        'rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-8 shadow-lg dark:shadow-black/30';

      const title = document.createElement('h3');
      title.className = 'text-xl font-semibold text-slate-900 dark:text-white';
      title.textContent = data.title || '';

      const description = document.createElement('p');
      description.className = 'mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300';
      description.textContent = data.description || '';

      const codeBlock = document.createElement('pre');
      codeBlock.className =
        'scrollbar-thin mt-6 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-950/70 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-mono';
      const code = document.createElement('code');
      code.textContent = data.code || '';
      codeBlock.append(code);

      card.append(title, description, codeBlock);
      container.append(card);
    });
  }

  function renderTipsGrid() {
    const container = document.getElementById('tipsGrid');
    if (!container) return;
    const columns = i18next.t('tips.columns', { returnObjects: true });
    container.innerHTML = '';
    columns.forEach((column) => {
      const card = document.createElement('div');
      card.className =
        'rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-lg dark:shadow-black/30';

      const title = document.createElement('h3');
      title.className = 'text-lg font-semibold text-slate-900 dark:text-white';
      title.textContent = column.title || '';
      card.append(title);

      if (Array.isArray(column.items) && column.items.length) {
        const list = document.createElement('ul');
        list.className = 'mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300';
        column.items.forEach((item) => {
          const entry = document.createElement('li');
          entry.textContent = item;
          list.append(entry);
        });
        card.append(list);
      }

      container.append(card);
    });
  }

  function renderResourceLinks() {
    const container = document.getElementById('resourceLinks');
    if (!container) return;
    const items = i18next.t('links.resources.items', { returnObjects: true });
    container.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'text-sky-600 dark:text-sky-300 hover:text-sky-700 dark:hover:text-sky-100 transition';
      link.textContent = item.label || '';
      li.append(link);
      container.append(li);
    });
  }

  function renderCodeSamples() {
    document.querySelectorAll('[data-i18n-code]').forEach((node) => {
      const key = node.getAttribute('data-i18n-code');
      node.textContent = key ? i18next.t(key) : '';
    });
  }

  function initOnlineTool() {
    const library = window.HtmlAssetsLocalizer;
    if (!library || !library.BrowserHtmlAssetsLocalizer) {
      setSelection({ key: 'online.messages.coreMissing', variant: 'danger' });
      appendLog({ key: 'online.logs.coreMissing', level: 'danger' });
      disableControls();
      return;
    }

    state.browserCtor = library.BrowserHtmlAssetsLocalizer;

    refs.fileInput?.addEventListener('change', handleFileChange);
    refs.processButton?.addEventListener('click', () => void processFile());
    refs.resetButton?.addEventListener('click', resetState);
    
    // 设置自定义文件输入组件的事件监听
    const customFileInput = document.getElementById('customFileInput');
    const fileInputButton = document.getElementById('fileInputButton');
    
    if (customFileInput && refs.fileInput) {
      customFileInput.addEventListener('click', () => {
        refs.fileInput.click();
      });
    }
    
    if (fileInputButton && refs.fileInput) {
      fileInputButton.addEventListener('click', (e) => {
        e.stopPropagation();
        refs.fileInput.click();
      });
    }
  }

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];
    const fileInputText = document.getElementById('fileInputText');
    
    if (!file) {
      resetState();
      setSelection({ key: 'online.messages.selectPrompt', variant: 'warning' });
      appendLog({ key: 'online.messages.selectPrompt', level: 'warning' });
      updateFileInputText(); // 更新文件选择提示文本
      return;
    }
    state.selectedFile = file;
    setSelection({
      key: 'online.messages.selected',
      variant: 'info',
      params: { fileName: file.name, fileSize: formatBytes(file.size) },
    });
    appendLog({ key: 'online.logs.fileReady', level: 'success' });
    refs.resetButton && (refs.resetButton.disabled = false);
    updateProcessButtonState();
    
    // 更新文件输入文本显示文件名
    if (fileInputText) {
      fileInputText.textContent = file.name;
    }
  }

  async function processFile() {
    if (!state.browserCtor) {
      appendLog({ key: 'online.messages.runtimeUnavailable', level: 'danger' });
      return;
    }
    if (!state.selectedFile) {
      setSelection({ key: 'online.messages.selectPrompt', variant: 'warning' });
      appendLog({ key: 'online.messages.selectPrompt', level: 'warning' });
      return;
    }

    toggleProcessingState(true);
    showStatusContainer();
    appendLog({ key: 'online.logs.reading', level: 'info' });

    try {
      const htmlSource = await state.selectedFile.text();
      appendLog({ key: 'online.logs.parsing', level: 'info' });

      const localizer = new state.browserCtor({
        htmlContent: htmlSource,
        htmlFileName: state.selectedFile.name || 'index.html',
      });

      const result = await localizer.process();
      const { summary, zipBlob, zipFileName } = result;

      appendLog({
        key: 'online.logs.summary',
        level: 'success',
        params: { total: summary.totalRemoteResources, localized: summary.localizedResources },
      });

      updateResourceTable(summary.assets || []);
      triggerDownload(zipBlob, zipFileName);
      appendLog({
        key: 'online.logs.archiveReady',
        level: 'success',
        params: { fileName: zipFileName },
      });

      if (!summary.localizedResources) {
        appendLog({ key: 'online.logs.noResources', level: 'warning' });
      }
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      appendLog({ key: 'online.logs.failure', level: 'danger', params: { details } });
    } finally {
      toggleProcessingState(false);
    }
  }

  function resetState() {
    state.selectedFile = null;
    state.logs = [];
    state.assets = [];
    state.selection = { visible: false, key: null, params: null, variant: 'info', raw: null };
    if (refs.fileInput) {
      refs.fileInput.value = '';
      refs.fileInput.disabled = false;
    }
    refs.processButton && (refs.processButton.disabled = true);
    refs.resetButton && (refs.resetButton.disabled = true);
    refs.statusContainer?.classList.add('hidden');
    renderLogs();
    renderResourceTable();
    renderSelection();
    updateProcessButtonState();
    updateFileInputText(); // 更新文件输入组件文本
  }

  function toggleProcessingState(isProcessing) {
    state.isProcessing = isProcessing;
    refs.fileInput && (refs.fileInput.disabled = isProcessing);
    refs.resetButton && (refs.resetButton.disabled = isProcessing);
    updateProcessButtonState();
  }

  function updateProcessButtonState() {
    if (!refs.processButton) return;
    const disabled = state.isProcessing || !state.selectedFile || !state.browserCtor;
    refs.processButton.disabled = disabled;
    if (state.isProcessing) {
      refs.processButton.innerHTML = `${buildSpinnerMarkup()}${i18next.t('online.buttons.processing')}`;
    } else {
      refs.processButton.textContent = i18next.t('online.buttons.process');
    }
  }

  function buildSpinnerMarkup() {
    return '<span class="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent align-middle"></span>';
  }

  function showStatusContainer() {
    refs.statusContainer?.classList.remove('hidden');
  }

  function setSelection({ key, params, variant = 'info', raw = null, visible = true }) {
    state.selection = { key, params, variant, raw, visible };
    renderSelection();
  }

  function renderSelection() {
    if (!refs.selectionInfo) return;
    const { visible, key, params, variant, raw } = state.selection;
    if (!visible) {
      refs.selectionInfo.className =
        'mt-8 hidden rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg dark:shadow-black/20';
      refs.selectionInfo.textContent = '';
      return;
    }
    refs.selectionInfo.className = `mt-8 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg dark:shadow-black/20 ${selectionVariantClasses[variant] || selectionVariantClasses.info}`;
    if (raw) {
      refs.selectionInfo.textContent = raw;
    } else if (key) {
      // 确保在语言切换时重新翻译文本
      const translatedText = i18next.t(key, params || {});
      refs.selectionInfo.textContent = translatedText;
    } else {
      refs.selectionInfo.textContent = '';
    }
  }

  function appendLog({ key, level = 'info', params = null, raw = null }) {
    state.logs.push({
      key,
      level,
      params,
      raw,
      timestamp: new Date(),
    });
    renderLogs();
    showStatusContainer();
  }

  function renderLogs() {
    if (!refs.logOutput) return;
    refs.logOutput.innerHTML = '';
    state.logs.forEach((entry) => {
      const item = document.createElement('div');
      item.className = `mb-1 text-xs sm:text-sm ${logLevelClasses[entry.level] || logLevelClasses.default}`;
      const time = entry.timestamp.toLocaleTimeString(i18next.language === 'zh' ? 'zh-CN' : 'en-US');
      // 确保在语言切换时重新翻译日志消息
      const message = entry.raw ? entry.raw : i18next.t(entry.key, entry.params || {});
      item.textContent = `[${time}] ${message}`;
      refs.logOutput.append(item);
    });
    refs.logOutput.scrollTop = refs.logOutput.scrollHeight;
  }

  function updateResourceTable(assets) {
    state.assets = Array.isArray(assets) ? assets : [];
    renderResourceTable();
  }

  function renderResourceTable() {
    if (!refs.resourceTableWrapper || !refs.resourceTableBody) return;
    refs.resourceTableBody.innerHTML = '';
    if (!state.assets.length) {
      refs.resourceTableWrapper.classList.add('hidden');
      return;
    }

    state.assets.forEach((asset) => {
      const row = document.createElement('tr');

      const typeCell = document.createElement('td');
      typeCell.className = 'px-4 py-3 align-top';
      typeCell.textContent = asset.type || '-';

      const originalCell = document.createElement('td');
      originalCell.className = 'px-4 py-3 align-top text-sky-600 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-100 break-words';
      if (asset.originalUrl) {
        const link = document.createElement('a');
        link.href = asset.originalUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'break-words';
        link.textContent = asset.originalUrl;
        originalCell.append(link);
      } else {
        originalCell.textContent = '-';
      }

      const localCell = document.createElement('td');
      localCell.className = 'px-4 py-3 align-top text-slate-600 dark:text-slate-300 break-words';
      localCell.textContent = asset.localRelativePath || '-';

      const sizeCell = document.createElement('td');
      sizeCell.className = 'px-4 py-3 text-right align-top text-slate-700 dark:text-slate-200';
      sizeCell.textContent = formatBytes(asset.bytesWritten);

      row.append(typeCell, originalCell, localCell, sizeCell);
      refs.resourceTableBody.append(row);
    });

    refs.resourceTableWrapper.classList.remove('hidden');
  }

  function triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function disableControls() {
    refs.fileInput && (refs.fileInput.disabled = true);
    refs.processButton && (refs.processButton.disabled = true);
    refs.resetButton && (refs.resetButton.disabled = true);
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
  }
})();
