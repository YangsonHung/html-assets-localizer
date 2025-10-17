import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import http from 'http';
import { HtmlAssetsLocalizer } from '../src/localizer';

const createTempDir = () => mkdtempSync(path.join(tmpdir(), 'html-assets-localizer-'));

describe('HtmlAssetsLocalizer', () => {
  let server: http.Server;
  let baseUrl: string;
  let tempRoot: string;

  beforeAll(async () => {
    tempRoot = createTempDir();

    server = http.createServer((req, res) => {
      if (req.url === '/assets/app.js') {
        res.setHeader('Content-Type', 'application/javascript');
        res.end('console.log("hello from local server");');
        return;
      }

      if (req.url === '/assets/styles.css') {
        res.setHeader('Content-Type', 'text/css');
        res.end('body { background: #123456; }');
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
        } else {
          baseUrl = 'http://127.0.0.1';
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('downloads remote assets and rewrites HTML references', async () => {
    const inputHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Test Page</title>
          <link rel="stylesheet" href="${baseUrl}/assets/styles.css" />
        </head>
        <body>
          <h1>Hello</h1>
          <script src="${baseUrl}/assets/app.js"></script>
        </body>
      </html>
    `;

    const htmlPath = path.join(tempRoot, 'input.html');
    writeFileSync(htmlPath, inputHtml, 'utf8');

    const outputDir = path.join(tempRoot, 'output');
    const localizer = new HtmlAssetsLocalizer({
      htmlFilePath: htmlPath,
      targetDir: outputDir,
    });

    const summary = await localizer.process();

    expect(summary.localizedResources).toBe(2);
    expect(summary.assets).toHaveLength(2);
    expect(summary.assets.map((asset) => asset.localRelativePath)).toEqual(
      expect.arrayContaining(['./js/app.js', './css/styles.css']),
    );

    const rewrittenHtmlPath = path.join(outputDir, 'input.html');
    expect(existsSync(rewrittenHtmlPath)).toBe(true);

    const rewrittenHtml = readFileSync(rewrittenHtmlPath, 'utf8');
    expect(rewrittenHtml).toContain('./js/app.js');
    expect(rewrittenHtml).toContain('./css/styles.css');

    const jsContents = readFileSync(path.join(outputDir, 'js', 'app.js'), 'utf8');
    const cssContents = readFileSync(path.join(outputDir, 'css', 'styles.css'), 'utf8');

    expect(jsContents).toContain('hello from local server');
    expect(cssContents).toContain('background: #123456');
  });
});
