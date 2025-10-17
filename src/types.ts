/*
 * @codex 由 hongyx 使用 codex 生成
 * @file types.ts
 * @summary HTML 资源本地化流程涉及的类型定义
 * @copyright 版权声明 厦门畅享信息技术有限公司, 版权所有 违者必究
 * @author hongyx
 * @model gpt-5-codex
 * @date 2025-10-17 12:06:55
 */

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
