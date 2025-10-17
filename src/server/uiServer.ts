/*
 * @codex 由 hongyx 使用 codex 生成
 * @file uiServer.ts
 * @summary 提供 html-assets-localizer ui 子命令的本地服务启动逻辑
 * @copyright 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 * @author hongyx
 * @model gpt-5-codex
 * @date 2025-10-17 12:13:00
 */

import { promises as fs } from 'fs';
import http from 'http';
import path from 'path';
import process from 'process';
import express from 'express';
import open from 'open';

export interface LaunchUiServerOptions {
  port?: number;
  host: string;
  openBrowser: boolean;
}

export async function launchUiServer(options: LaunchUiServerOptions): Promise<void> {
  const host = options.host || '127.0.0.1';
  const port = await resolvePort(host, options.port);
  const docsRoot = await resolveDocsRoot();

  const app = express();
  app.use(express.static(docsRoot));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(docsRoot, 'index.html'));
  });

  const server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });

  const addressInfo = server.address();
  const actualPort = typeof addressInfo === 'object' && addressInfo ? addressInfo.port : port;
  const origin =
    host === '0.0.0.0' || host === '::' ? `http://127.0.0.1:${actualPort}` : `http://${host}:${actualPort}`;

  console.log(`UI 服务已启动: ${origin}`);
  console.log('按 Ctrl+C 可退出服务。');

  if (options.openBrowser) {
    try {
      await open(origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`自动打开浏览器失败: ${message}`);
    }
  }

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

async function resolveDocsRoot(): Promise<string> {
  const docsPath = path.resolve(__dirname, '..', '..', 'docs');
  try {
    await fs.access(docsPath);
  } catch {
    throw new Error(`无法找到 docs 目录: ${docsPath}`);
  }
  return docsPath;
}

async function resolvePort(host: string, preferred?: number): Promise<number> {
  if (preferred) {
    return preferred;
  }

  return new Promise<number>((resolve, reject) => {
    const probe = http.createServer();
    probe.once('error', reject);
    probe.listen(0, host, () => {
      const addr = probe.address();
      if (typeof addr === 'object' && addr) {
        const freePort = addr.port;
        probe.close(() => resolve(freePort));
      } else {
        probe.close(() => reject(new Error('无法获取空闲端口')));
      }
    });
  });
}
