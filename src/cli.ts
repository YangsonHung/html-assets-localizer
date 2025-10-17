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

let cachedVersion: string | null = null;

async function resolvePackageVersion(): Promise<string> {
  if (cachedVersion) {
    return cachedVersion;
  }
  try {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const raw = await fs.readFile(packageJsonPath, 'utf8');
    const data = JSON.parse(raw) as { version?: string };
    cachedVersion = data.version ?? '0.0.0';
  } catch {
    cachedVersion = 'unknown';
  }
  return cachedVersion;
}

function printUsage(): void {
  console.log(
    [
      'html-assets-localizer — Localize external JS/CSS assets referenced in HTML files',
      '',
      'Usage:',
      '  html-assets-localizer <html-file> <output-dir>',
      '  html-assets-localizer ui [--port <port>] [--host <hostname>] [--no-open]',
      '  html-assets-localizer help',
      '  html-assets-localizer version',
      '',
      'Aliases:',
      '  hal                  Shorthand alias for html-assets-localizer',
      '',
      'Options:',
      '  --port <port>        UI server port (defaults to a random free port)',
      '  --host <hostname>    UI server host (defaults to 127.0.0.1)',
      '  --no-open            Do not open the browser automatically',
      '  -h, --help           Show usage information',
      '  -v, --version        Show version information',
    ].join('\n'),
  );
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
  console.log('Localization summary:');
  console.log(`  Source HTML: ${summary.sourceHtmlPath}`);
  console.log(`  Output HTML: ${summary.outputHtmlPath}`);
  console.log(`  Remote resources detected: ${summary.totalRemoteResources}`);
  console.log(`  Resources localized: ${summary.localizedResources}`);
  if (summary.assets.length > 0) {
    console.log('  Asset mapping:');
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
    throw new Error(`HTML file not found: ${filePath}`);
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
        throw new Error('Missing value for --port');
      }
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error('Port must be a positive integer');
      }
      port = parsed;
      i += 1;
    } else if (current === '--host') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --host');
      }
      host = value;
      i += 1;
    } else if (current === '--no-open') {
      openBrowser = false;
    } else {
      throw new Error(`Unknown option: ${current}`);
    }
  }

  return { port, host, openBrowser };
}

async function runCli(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes('--version') || argv.includes('-v')) {
    const version = await resolvePackageVersion();
    console.log(version);
    return;
  }

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const [command, ...rest] = argv;

  if (command === 'help') {
    printUsage();
    return;
  }

  if (command === 'version') {
    const version = await resolvePackageVersion();
    console.log(version);
    return;
  }

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
  console.error(`Command failed: ${message}`);
  process.exitCode = 1;
});
