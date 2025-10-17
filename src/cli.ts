#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { HtmlAssetsLocalizer } from './localizer';
import type { LocalizationSummary } from './types';
import { launchUiServer } from './server/uiServer';

interface UiCommandOptions {
  port?: number;
  host: string;
  openBrowser: boolean;
}

function printUsage(): void {
  console.log(`
html-assets-localizer - 将 HTML 中的外部 JS/CSS 资源本地化

使用方法:
  html-assets-localizer <html文件路径> <目标目录>
  html-assets-localizer ui [--port <端口>] [--host <主机>] [--no-open]

选项:
  --port <端口>    指定 UI 服务监听端口（默认自动选择空闲端口）
  --host <主机>    指定 UI 服务绑定地址（默认 127.0.0.1）
  --no-open        启动 UI 服务时不自动打开浏览器
  -h, --help       查看帮助
`.trim());
}

function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  const units = ['KB', 'MB', 'GB'];
  let idx = -1;
  let value = size;
  do {
    value /= 1024;
    idx += 1;
  } while (value >= 1024 && idx < units.length - 1);
  return `${value.toFixed(2)} ${units[idx]}`;
}

function printSummary(summary: LocalizationSummary): void {
  console.log('处理完成:');
  console.log(`  源文件: ${summary.sourceHtmlPath}`);
  console.log(`  输出 HTML: ${summary.outputHtmlPath}`);
  console.log(`  发现远程资源: ${summary.totalRemoteResources}`);
  console.log(`  已本地化资源: ${summary.localizedResources}`);
  if (summary.assets.length > 0) {
    console.log('  资源映射:');
    summary.assets.forEach((asset) => {
      console.log(
        `    - [${asset.type}] ${asset.originalUrl} -> ${asset.localRelativePath} (${formatBytes(
          asset.bytesWritten,
        )})`,
      );
    });
  }
}

async function ensureFileExists(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`指定的 HTML 文件不存在: ${filePath}`);
  }
}

function parseUiOptions(args: string[]): UiCommandOptions {
  let port: number | undefined;
  let host = '127.0.0.1';
  let openBrowser = true;

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    if (current === '--port') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('缺少 --port 参数的取值');
      }
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error('端口号必须为正整数');
      }
      port = parsed;
      i += 1;
    } else if (current === '--host') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('缺少 --host 参数的取值');
      }
      host = value;
      i += 1;
    } else if (current === '--no-open') {
      openBrowser = false;
    } else {
      throw new Error(`无法识别的参数: ${current}`);
    }
  }

  return { port, host, openBrowser };
}

async function runCli(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const [command, ...rest] = argv;

  if (command === 'ui') {
    const options = parseUiOptions(rest);
    await launchUiServer(options);
    return;
  }

  const htmlFilePath = path.resolve(command);
  const targetDir = rest[0] ? path.resolve(rest[0]) : path.resolve(process.cwd(), 'output');

  await ensureFileExists(htmlFilePath);

  const localizer = new HtmlAssetsLocalizer({
    htmlFilePath,
    targetDir,
  });

  const summary = await localizer.process();
  printSummary(summary);
}

runCli().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`执行失败: ${message}`);
  process.exitCode = 1;
});
