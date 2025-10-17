import JSZip from 'jszip';
import type { ResourceType } from '../types';

const RESOURCE_DIR_MAP: Record<ResourceType, string> = {
  script: 'js',
  style: 'css',
};

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
  bytes: Uint8Array;
  finalUrl: string;
  contentType?: string | null;
}

export interface BrowserLocalizerOptions {
  htmlContent: string;
  htmlFileName?: string;
  fetchFn?: typeof fetch;
}

export interface BrowserLocalizationAsset {
  originalUrl: string;
  localRelativePath: string;
  bytesWritten: number;
  type: ResourceType;
}

export interface BrowserLocalizationSummary {
  totalRemoteResources: number;
  localizedResources: number;
  assets: BrowserLocalizationAsset[];
}

export interface BrowserLocalizationResult {
  summary: BrowserLocalizationSummary;
  updatedHtml: string;
  zipBlob: Blob;
  zipUint8Array: Uint8Array;
  zipBase64: string;
  zipFileName: string;
}

export class BrowserHtmlAssetsLocalizer {
  private readonly htmlContent: string;
  private readonly htmlFileName: string;
  private readonly fetchFn: typeof fetch;
  private readonly usedFileNames: Record<ResourceType, Set<string>> = {
    script: new Set<string>(),
    style: new Set<string>(),
  };

  constructor(options: BrowserLocalizerOptions) {
    if (!options.htmlContent || options.htmlContent.trim().length === 0) {
      throw new Error('htmlContent is required');
    }
    this.htmlContent = options.htmlContent;
    this.htmlFileName = this.sanitizeHtmlFileName(options.htmlFileName);
    this.fetchFn = options.fetchFn ?? fetch.bind(globalThis);
  }

  async process(): Promise<BrowserLocalizationResult> {
    const candidates = this.extractResourceCandidates(this.htmlContent);
    const uniqueRemoteUrls = new Set(candidates.map((item) => item.url));
    const replacements: ReplacementDescriptor[] = [];
    const assets: BrowserLocalizationAsset[] = [];
    const downloadCache = new Map<string, BrowserLocalizationAsset>();

    const zip = new JSZip();
    const scriptFolder = zip.folder(RESOURCE_DIR_MAP.script);
    const styleFolder = zip.folder(RESOURCE_DIR_MAP.style);
    if (!scriptFolder || !styleFolder) {
      throw new Error('Failed to initialize zip folders');
    }

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

      try {
        const download = await this.downloadResource(candidate.url);
        const fileName = this.buildLocalFileName(
          download.finalUrl,
          candidate.url,
          candidate.type,
          download.contentType ?? undefined,
        );

        const folder = candidate.type === 'script' ? scriptFolder : styleFolder;
        folder.file(fileName, download.bytes);

        const localPath = `./${RESOURCE_DIR_MAP[candidate.type]}/${fileName}`;
        const asset: BrowserLocalizationAsset = {
          originalUrl: candidate.url,
          localRelativePath: localPath,
          bytesWritten: download.bytes.byteLength,
          type: candidate.type,
        };
        assets.push(asset);
        downloadCache.set(candidate.url, asset);
        replacements.push({
          originalUrl: candidate.url,
          attribute: candidate.attribute,
          localRelativePath: localPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to download resource: ${candidate.url} (${message})`);
      }
    }

    const updatedHtml = this.applyReplacements(this.htmlContent, replacements);
    zip.file(this.htmlFileName, updatedHtml);

    const zipUint8Array = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
    const zipBufferForBlob = zipUint8Array.slice().buffer;
    const zipBlob = new Blob([zipBufferForBlob], { type: 'application/zip' });
    const zipBase64 = this.uint8ArrayToBase64(zipUint8Array);

    return {
      summary: {
        totalRemoteResources: uniqueRemoteUrls.size,
        localizedResources: assets.length,
        assets,
      },
      updatedHtml,
      zipBlob,
      zipUint8Array,
      zipBase64,
      zipFileName: this.buildZipFileName(),
    };
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

  private async downloadResource(url: string): Promise<DownloadResult> {
    const response = await this.fetchFn(url, {
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return {
      bytes,
      finalUrl: response.url || url,
      contentType: response.headers.get('content-type'),
    };
  }

  private sanitizeHtmlFileName(input?: string): string {
    const fallback = 'index.html';
    if (!input || input.trim().length === 0) {
      return fallback;
    }
    const sanitized = this.sanitizeBaseName(input.replace(/\.[^.]+$/, ''));
    return `${sanitized || 'index'}.html`;
  }

  private buildZipFileName(): string {
    const base = this.htmlFileName.replace(/\.[^.]+$/, '');
    return `${base || 'localized-page'}-localized.zip`;
  }

  private buildLocalFileName(
    finalUrl: string,
    originalUrl: string,
    type: ResourceType,
    contentType?: string,
  ): string {
    const fallbackHash = this.generateFallbackId(originalUrl).slice(0, 10);
    let candidateName = '';

    try {
      const normalized = new URL(finalUrl);
      const segments = normalized.pathname.split('/');
      candidateName = decodeURIComponent(segments.pop() ?? '');
    } catch {
      candidateName = '';
    }

    const { baseName, ext } = this.parseFileName(candidateName);
    const defaultExt = type === 'script' ? '.js' : '.css';
    const resolvedExt = this.resolveExtension(ext, contentType, defaultExt);
    const sanitizedBase = this.sanitizeBaseName(baseName || `${type}-${fallbackHash}`);
    const fileName = `${sanitizedBase}${resolvedExt}`;
    return this.ensureUniqueFileName(fileName, type);
  }

  private parseFileName(fileName: string): { baseName: string; ext: string } {
    if (!fileName) {
      return { baseName: '', ext: '' };
    }
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === fileName.length - 1) {
      return { baseName: fileName, ext: '' };
    }
    return {
      baseName: fileName.slice(0, lastDot),
      ext: fileName.slice(lastDot).toLowerCase(),
    };
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

    const { baseName, ext } = this.parseFileName(fileName);
    let counter = 1;
    let nextName = '';
    do {
      nextName = `${baseName}-${counter}${ext}`;
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

  private isRemoteHttpUrl(url: string): boolean {
    return /^https?:\/\//i.test(url.trim());
  }

  private generateFallbackId(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }
}
