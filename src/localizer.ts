import { promises as fs } from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { createHash } from 'crypto';
import type {
  LocalizerConstructorOptions,
  LocalizationSummary,
  ResourceType,
  UrlMappingItem,
} from './types';

interface ResourceCandidate {
  url: string;
  attribute: 'src' | 'href';
  type: ResourceType;
}

interface ReplacementDescriptor {
  originalUrl: string;
  attribute: 'src' | 'href';
  localRelativePath: string;
}

interface DownloadResult {
  buffer: Buffer;
  finalUrl: string;
  contentType?: string;
}

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 5;

const RESOURCE_DIR_MAP: Record<ResourceType, string> = {
  script: 'js',
  style: 'css',
} as const;

export class HtmlAssetsLocalizer {
  private readonly htmlFilePath: string;
  private readonly targetDir: string;
  private readonly jsDir: string;
  private readonly cssDir: string;
  private readonly usedFileNames: Record<ResourceType, Set<string>> = {
    script: new Set<string>(),
    style: new Set<string>(),
  };

  constructor(options: LocalizerConstructorOptions) {
    this.htmlFilePath = path.resolve(options.htmlFilePath);
    this.targetDir = path.resolve(options.targetDir);
    this.jsDir = path.join(this.targetDir, RESOURCE_DIR_MAP.script);
    this.cssDir = path.join(this.targetDir, RESOURCE_DIR_MAP.style);
  }

  async process(): Promise<LocalizationSummary> {
    const htmlContent = await this.loadHtmlContent();
    const candidates = this.extractResourceCandidates(htmlContent);

    const uniqueRemoteUrls = new Set(candidates.map((item) => item.url));
    const downloadCache = new Map<string, UrlMappingItem>();
    const replacements: ReplacementDescriptor[] = [];

    for (const candidate of candidates) {
      const cached = downloadCache.get(candidate.url);
      if (cached) {
        replacements.push({
          originalUrl: candidate.url,
          attribute: candidate.attribute,
          localRelativePath: cached.localRelativePath,
        });
        continue;
      }

      const stored = await this.downloadAndStore(candidate.url, candidate.type);
      if (stored) {
        downloadCache.set(candidate.url, stored);
        replacements.push({
          originalUrl: candidate.url,
          attribute: candidate.attribute,
          localRelativePath: stored.localRelativePath,
        });
      }
    }

    const updatedHtml = this.applyReplacements(htmlContent, replacements);
    await fs.mkdir(this.targetDir, { recursive: true });

    const outputHtmlPath = path.join(this.targetDir, path.basename(this.htmlFilePath));
    await fs.writeFile(outputHtmlPath, updatedHtml, 'utf8');

    return {
      sourceHtmlPath: this.htmlFilePath,
      outputHtmlPath,
      updatedHtml,
      totalRemoteResources: uniqueRemoteUrls.size,
      localizedResources: downloadCache.size,
      assets: Array.from(downloadCache.values()),
    };
  }

  private async loadHtmlContent(): Promise<string> {
    try {
      return await fs.readFile(this.htmlFilePath, 'utf8');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      throw new Error(`Failed to read HTML file: ${message}`);
    }
  }

  private extractResourceCandidates(html: string): ResourceCandidate[] {
    const candidates: ResourceCandidate[] = [];

    const scriptPattern = /<script[^>]*\ssrc\s*=\s*["']?([^"'>\s]+)["']?[^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptPattern.exec(html)) !== null) {
      const url = match[1];
      if (this.isRemoteHttpUrl(url)) {
        candidates.push({
          url,
          attribute: 'src',
          type: 'script',
        });
      }
    }

    const linkPattern = /<link[^>]*\srel\s*=\s*["']?stylesheet["']?[^>]*\shref\s*=\s*["']?([^"'>\s]+)["']?[^>]*>/gi;
    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      if (this.isRemoteHttpUrl(url)) {
        candidates.push({
          url,
          attribute: 'href',
          type: 'style',
        });
      }
    }

    const altLinkPattern = /<link[^>]*\shref\s*=\s*["']?([^"'>\s]+)["']?[^>]*\srel\s*=\s*["']?stylesheet["']?[^>]*>/gi;
    while ((match = altLinkPattern.exec(html)) !== null) {
      const url = match[1];
      if (this.isRemoteHttpUrl(url)) {
        candidates.push({
          url,
          attribute: 'href',
          type: 'style',
        });
      }
    }

    return candidates;
  }

  private isRemoteHttpUrl(url: string): boolean {
    return /^https?:\/\//i.test(url.trim());
  }

  private async downloadAndStore(url: string, type: ResourceType): Promise<UrlMappingItem | null> {
    try {
      const downloadResult = await this.fetchRemoteResource(url, MAX_REDIRECTS);
      const directory = type === 'script' ? this.jsDir : this.cssDir;
      await fs.mkdir(directory, { recursive: true });

      const fileName = this.buildLocalFileName(downloadResult.finalUrl, url, type, downloadResult.contentType);
      const absolutePath = path.join(directory, fileName);

      await fs.writeFile(absolutePath, downloadResult.buffer);

      const relativePath = `./${RESOURCE_DIR_MAP[type]}/${fileName}`;
      return {
        originalUrl: url,
        localRelativePath: relativePath,
        absolutePath,
        bytesWritten: downloadResult.buffer.length,
        type,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'network request failed';
      console.warn(`Failed to download resource: ${url} (${reason})`);
      return null;
    }
  }

  private async fetchRemoteResource(url: string, redirectsRemaining: number): Promise<DownloadResult> {
    if (redirectsRemaining <= 0) {
      throw new Error('Too many redirects');
    }

    const urlObject = new URL(url);
    const protocol = urlObject.protocol === 'https:' ? https : http;

    const options: https.RequestOptions = {
      hostname: urlObject.hostname,
      port: urlObject.port ? Number(urlObject.port) : undefined,
      path: `${urlObject.pathname}${urlObject.search}`,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'close',
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    return new Promise<DownloadResult>((resolve, reject) => {
      const request = protocol.request(options, (response) => {
        const statusCode = response.statusCode ?? 0;

        if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
          const redirectedUrl = new URL(response.headers.location, urlObject).toString();
          response.resume();
          this.fetchRemoteResource(redirectedUrl, redirectsRemaining - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`HTTP ${statusCode} ${response.statusMessage ?? ''}`.trim()));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => {
          resolve({
            buffer: Buffer.concat(chunks),
            finalUrl: url,
            contentType: response.headers['content-type'],
          });
        });
        response.on('error', reject);
      });

      request.on('timeout', () => {
        request.destroy(new Error('Request timeout'));
      });
      request.on('error', reject);
      request.end();
    });
  }

  private buildLocalFileName(finalUrl: string, originalUrl: string, type: ResourceType, contentType?: string): string {
    const fallbackHash = this.hash(originalUrl).slice(0, 10);
    let candidateName = '';

    try {
      const normalized = new URL(finalUrl);
      candidateName = decodeURIComponent(path.posix.basename(normalized.pathname));
    } catch {
      candidateName = '';
    }

    const parsed = path.posix.parse(candidateName);
    const defaultExt = type === 'script' ? '.js' : '.css';
    const resolvedExt = this.resolveExtension(parsed.ext, contentType, defaultExt);

    const baseName = this.sanitizeBaseName(parsed.name || `${type}-${fallbackHash}`);
    const fileName = `${baseName}${resolvedExt}`;
    return this.ensureUniqueFileName(fileName, type);
  }

  private sanitizeBaseName(input: string): string {
    const trimmed = input.trim().replace(/\s+/g, '-');
    const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, '_');
    return sanitized.length > 0 ? sanitized.slice(0, 120) : 'asset';
  }

  private resolveExtension(existingExt: string, contentType: string | undefined, defaultExt: string): string {
    if (existingExt && existingExt.startsWith('.')) {
      return existingExt.toLowerCase();
    }

    if (contentType) {
      if (/javascript|ecmascript|json/i.test(contentType)) {
        return '.js';
      }
      if (/css/i.test(contentType)) {
        return '.css';
      }
    }

    return defaultExt;
  }

  private ensureUniqueFileName(fileName: string, type: ResourceType): string {
    const registry = this.usedFileNames[type];
    if (!registry.has(fileName)) {
      registry.add(fileName);
      return fileName;
    }

    const parsed = path.parse(fileName);
    let counter = 1;
    let nextName = '';
    do {
      nextName = `${parsed.name}-${counter}${parsed.ext}`;
      counter += 1;
    } while (registry.has(nextName));

    registry.add(nextName);
    return nextName;
  }

  private applyReplacements(html: string, replacements: ReplacementDescriptor[]): string {
    let updated = html;
    for (const item of replacements) {
      const escapedUrl = this.escapeForRegExp(item.originalUrl);
      const pattern = new RegExp(`${item.attribute}\\s*=\\s*["']?${escapedUrl}["']?`, 'gi');
      updated = updated.replace(pattern, `${item.attribute}="${item.localRelativePath}"`);
    }
    return updated;
  }

  private escapeForRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private hash(input: string): string {
    return createHash('sha1').update(input).digest('hex');
  }
}
