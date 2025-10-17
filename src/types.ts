export type ResourceType = 'script' | 'style';

export interface UrlMappingItem {
  originalUrl: string;
  localRelativePath: string;
  absolutePath: string;
  bytesWritten: number;
  type: ResourceType;
}

export interface LocalizationSummary {
  sourceHtmlPath: string;
  outputHtmlPath: string;
  updatedHtml: string;
  totalRemoteResources: number;
  localizedResources: number;
  assets: UrlMappingItem[];
}

export interface LocalizerConstructorOptions {
  htmlFilePath: string;
  targetDir: string;
}
