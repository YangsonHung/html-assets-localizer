#!/usr/bin/env node
/**
 * HTML外部脚本本地化工具 - Node.js版本
 * 功能：解析HTML文件，下载外部JavaScript文件，并修改HTML中的引用为本地路径
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

class HTMLScriptLocalizer {
    constructor(htmlFilePath, targetDir = 'output') {
        this.htmlFilePath = htmlFilePath;
        this.targetDir = targetDir;
        this.baseDir = path.dirname(htmlFilePath);
        this.jsDir = path.join(targetDir, 'js');
        this.cssDir = path.join(targetDir, 'css');
    }

    async init() {
        // 创建目标目录和子目录
        try {
            await fs.mkdir(this.targetDir, { recursive: true });
            await fs.mkdir(this.jsDir, { recursive: true });
            await fs.mkdir(this.cssDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    extractResourceUrls(htmlContent) {
        // 提取HTML中的外部资源URL
        const resources = {
            scripts: [],
            stylesheets: []
        };

        // 提取script标签中的src属性
        const scriptPattern = /<script[^>]*\ssrc\s*=\s*["']?([^"'>\s]+)["']?[^>]*>/gi;
        let match;
        while ((match = scriptPattern.exec(htmlContent)) !== null) {
            if (match[1].startsWith('http://') || match[1].startsWith('https://')) {
                resources.scripts.push(match[1]);
            }
        }

        // 提取link标签中的href属性（只要rel="stylesheet"的）
        const linkPattern1 = /<link[^>]*\srel\s*=\s*["']?stylesheet["']?[^>]*\shref\s*=\s*["']?([^"'>\s]+)["']?[^>]*>/gi;
        while ((match = linkPattern1.exec(htmlContent)) !== null) {
            if (match[1].startsWith('http://') || match[1].startsWith('https://')) {
                resources.stylesheets.push(match[1]);
            }
        }

        // 也支持href在前的情况
        const linkPattern2 = /<link[^>]*\shref\s*=\s*["']?([^"'>\s]+)["']?[^>]*\srel\s*=\s*["']?stylesheet["']?[^>]*>/gi;
        while ((match = linkPattern2.exec(htmlContent)) !== null) {
            if (match[1].startsWith('http://') || match[1].startsWith('https://')) {
                resources.stylesheets.push(match[1]);
            }
        }

        return resources;
    }

    downloadFile(url, maxRedirects = 5) {
        return new Promise((resolve, reject) => {
            if (maxRedirects <= 0) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            const protocol = url.startsWith('https:') ? https : http;
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'identity',
                    'Connection': 'close'
                },
                timeout: 30000 // 30秒超时
            };

            const req = protocol.request(options, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    // 处理重定向
                    const redirectUrl = new URL(response.headers.location, url).href;
                    this.downloadFile(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }

                let data = '';
                response.setEncoding('utf8');
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
                response.on('error', reject);
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }

    async downloadResource(url, resourceType = 'js') {
        try {
            // URL验证和清理
            if (!url || typeof url !== 'string') {
                throw new Error('Invalid URL: URL must be a non-empty string');
            }
            
            // 清理URL中的空白字符
            url = url.trim();
            
            // 验证URL格式
            let urlObj;
            try {
                urlObj = new URL(url);
            } catch (urlError) {
                throw new Error(`Invalid URL format: ${urlError.message}`);
            }
            
            // 生成本地文件名
            let filename = path.basename(urlObj.pathname);

            // 如果文件名为空或没有正确扩展名，生成一个基于URL hash的文件名
            const expectedExt = `.${resourceType}`;
            if (!filename || !filename.endsWith(expectedExt)) {
                const urlHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
                filename = `${resourceType === 'css' ? 'style' : 'script'}_${urlHash}.${resourceType}`;
            }

            const targetDir = resourceType === 'css' ? this.cssDir : this.jsDir;
            const localPath = path.join(targetDir, filename);

            // 使用文件锁机制避免重复下载
            const lockFile = `${localPath}.lock`;
            
            // 检查文件是否已存在
            try {
                await fs.access(localPath);
                console.log(`文件已存在，跳过下载: ${filename}`);
                return filename;
            } catch {
                // 文件不存在，继续下载
            }
            
            // 检查是否有其他进程正在下载
            try {
                await fs.access(lockFile);
                console.log(`文件正在下载中，跳过: ${filename}`);
                return null;
            } catch {
                // 锁文件不存在，可以开始下载
            }

            // 确保目标目录存在
            await fs.mkdir(targetDir, { recursive: true });
            
            // 创建锁文件
            await fs.writeFile(lockFile, '', 'utf8');
            
            try {
                // 下载文件
                console.log(`正在下载: ${url}`);
                const content = await this.downloadFile(url);
                await fs.writeFile(localPath, content, 'utf8');
                console.log(`下载完成: ${filename}`);
                
                // 删除锁文件
                await fs.unlink(lockFile).catch(() => {});
                
                return filename;
            } catch (downloadError) {
                // 下载失败时删除锁文件
                await fs.unlink(lockFile).catch(() => {});
                throw downloadError;
            }

        } catch (error) {
            console.error(`下载失败 ${url}: ${error.message}`);
            return null;
        }
    }

    updateHtmlContent(htmlContent, urlMapping) {
        let updatedContent = htmlContent;

        for (const [originalUrl, localPath] of Object.entries(urlMapping)) {
            if (localPath) {
                // 替换HTML中的URL，使用更精确的正则表达式
                const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // 替换script标签中的src属性
                const srcPattern = new RegExp(`src\\s*=\\s*["']?${escapedUrl}["']?`, 'gi');
                updatedContent = updatedContent.replace(srcPattern, `src="${localPath}"`);
                
                // 替换link标签中的href属性
                const hrefPattern = new RegExp(`href\\s*=\\s*["']?${escapedUrl}["']?`, 'gi');
                updatedContent = updatedContent.replace(hrefPattern, `href="${localPath}"`);
                
                console.log(`已替换: ${originalUrl} -> ${localPath}`);
            }
        }

        return updatedContent;
    }

    async process() {
        try {
            await this.init();

            // 读取HTML文件
            console.log(`正在处理HTML文件: ${this.htmlFilePath}`);
            const htmlContent = await fs.readFile(this.htmlFilePath, 'utf8');

            // 提取外部资源URL
            const resources = this.extractResourceUrls(htmlContent);
            const scriptUrls = resources.scripts;
            const cssUrls = resources.stylesheets;
            console.log(`找到 ${scriptUrls.length} 个外部脚本，${cssUrls.length} 个外部样式表`);

            if (scriptUrls.length === 0 && cssUrls.length === 0) {
                console.log('没有找到外部资源，无需处理');
                return false;
            }

            // 确保js和css目录存在（即使没有成功下载的文件）
            if (scriptUrls.length > 0) {
                await fs.mkdir(this.jsDir, { recursive: true });
            }
            if (cssUrls.length > 0) {
                await fs.mkdir(this.cssDir, { recursive: true });
            }

            // 下载资源文件
            const urlMapping = {};
            const downloadPromises = [
                ...scriptUrls.map(async (url) => {
                    const localFilename = await this.downloadResource(url, 'js');
                    if (localFilename) {
                        urlMapping[url] = `./js/${localFilename}`;
                    }
                }),
                ...cssUrls.map(async (url) => {
                    const localFilename = await this.downloadResource(url, 'css');
                    if (localFilename) {
                        urlMapping[url] = `./css/${localFilename}`;
                    }
                })
            ];

            await Promise.all(downloadPromises);

            // 更新HTML内容
            const updatedHtml = this.updateHtmlContent(htmlContent, urlMapping);

            // 保存更新后的HTML文件到目标目录
            const parsedPath = path.parse(this.htmlFilePath);
            const outputHtmlPath = path.join(this.targetDir, `${parsedPath.name}${parsedPath.ext}`);

            await fs.writeFile(outputHtmlPath, updatedHtml, 'utf8');
            console.log(`HTML文件已更新: ${outputHtmlPath}`);
            console.log('处理完成！');
            return true;

        } catch (error) {
            console.error('处理过程中出现错误:', error.message);
            throw error;
        }
    }
}

// 命令行使用
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('使用方法: node assets_localizer.js <html文件路径> <目标目录>');
        console.log('示例: node assets_localizer.js index.html myProject');
        process.exit(1);
    }

    const htmlFilePath = args[0];
    const targetDir = args[1];

    try {
        await fs.access(htmlFilePath);
    } catch {
        console.error(`错误: HTML文件不存在 - ${htmlFilePath}`);
        process.exit(1);
    }

    try {
        const localizer = new HTMLScriptLocalizer(htmlFilePath, targetDir);
        const success = await localizer.process();
        if (success) {
            console.log('资源本地化完成！');
            process.exit(0);
        } else {
            console.log('没有需要处理的资源');
            process.exit(0);
        }
    } catch (error) {
        console.error('执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

// 导出类以供其他模块使用
module.exports = HTMLScriptLocalizer;

/* 使用示例（作为模块导入时）
const HTMLScriptLocalizer = require('./script-localizer');

async function example() {
    const localizer = new HTMLScriptLocalizer('index.html', 'output_directory');
    await localizer.process();
}
*/