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

  console.log(`UI server running at ${origin}`);
  console.log('Press Ctrl+C to stop the server.');

  if (options.openBrowser) {
    try {
      await open(origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to open browser automatically: ${message}`);
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
    throw new Error(`Unable to find docs directory: ${docsPath}`);
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
        probe.close(() => reject(new Error('Unable to acquire a free port')));
      }
    });
  });
}
