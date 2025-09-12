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
    constructor(htmlFilePath, outputDir = 'js') {
        this.htmlFilePath = htmlFilePath;
        this.outputDir = outputDir;
        this.baseDir = path.dirname(path.resolve(htmlFilePath));
        this.jsDir = path.join(this.baseDir, this.outputDir);
    }

    async init() {
        // 创建JS文件存储目录
        try {
            await fs.mkdir(this.jsDir, { recursive: true });
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
    } = [];
        let match;

        while ((match = pattern.exec(htmlContent)) !== null) {
            matches.push(match[1]);
        }

        // 过滤出外部链接（http/https开头）
        return matches.filter(url => url.startsWith('http://') || url.startsWith('https://'));
    }

    downloadFile(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;

            protocol.get(url, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    // 处理重定向
                    this.downloadFile(response.headers.location).then(resolve).catch(reject);
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
            }).on('error', reject);
        });
    }

    async downloadScript(url) {
        try {
            // 生成本地文件名
            const urlObj = new URL(url);
            let filename = path.basename(urlObj.pathname);

            // 如果文件名为空或没有.js扩展名，生成一个基于URL hash的文件名
            if (!filename || !filename.endsWith('.js')) {
                const urlHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
                filename = `script_${urlHash}.js`;
            }

            const localPath = path.join(this.jsDir, filename);

            // 检查文件是否已存在
            try {
                await fs.access(localPath);
                console.log(`文件已存在，跳过下载: ${filename}`);
                return filename;
            } catch {
                // 文件不存在，继续下载
            }

            // 下载文件
            console.log(`正在下载: ${url}`);
            const content = await this.downloadFile(url);
            await fs.writeFile(localPath, content, 'utf8');
            console.log(`下载完成: ${filename}`);

            return filename;

        } catch (error) {
            console.error(`下载失败 ${url}: ${error.message}`);
            return null;
        }
    }

    updateHtmlContent(htmlContent, urlMapping) {
        let updatedContent = htmlContent;

        for (const [originalUrl, localFilename] of Object.entries(urlMapping)) {
            if (localFilename) {
                const localPath = `./${this.outputDir}/${localFilename}`;
                // 替换HTML中的URL，使用更精确的正则表达式
                const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(`src\\s*=\\s*["']?${escapedUrl}["']?`, 'gi');
                updatedContent = updatedContent.replace(pattern, `src="${localPath}"`);
                console.log(`已替换: ${originalUrl} -> ${localPath}`);
            }
        }

        return updatedContent;
    }

    async process(outputHtmlPath = null) {
        try {
            await this.init();

            // 读取HTML文件
            console.log(`正在处理HTML文件: ${this.htmlFilePath}`);
            const htmlContent = await fs.readFile(this.htmlFilePath, 'utf8');

            // 提取外部script URL
            const scriptUrls = this.extractScriptUrls(htmlContent);
            console.log(`找到 ${scriptUrls.length} 个外部脚本`);

            if (scriptUrls.length === 0) {
                console.log('没有找到外部脚本，无需处理');
                return;
            }

            // 下载脚本文件
            const urlMapping = {};
            const downloadPromises = scriptUrls.map(async (url) => {
                const localFilename = await this.downloadScript(url);
                urlMapping[url] = localFilename;
            });

            await Promise.all(downloadPromises);

            // 更新HTML内容
            const updatedHtml = this.updateHtmlContent(htmlContent, urlMapping);

            // 保存更新后的HTML文件
            if (!outputHtmlPath) {
                const parsedPath = path.parse(this.htmlFilePath);
                outputHtmlPath = path.join(parsedPath.dir, `${parsedPath.name}_local${parsedPath.ext}`);
            }

            await fs.writeFile(outputHtmlPath, updatedHtml, 'utf8');
            console.log(`HTML文件已更新: ${outputHtmlPath}`);
            console.log('处理完成！');

        } catch (error) {
            console.error('处理过程中出现错误:', error.message);
            throw error;
        }
    }
}

// 命令行使用
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('使用方法: node script-localizer.js <html_file_path> [output_html_path]');
        console.log('示例: node script-localizer.js index.html index_local.html');
        process.exit(1);
    }

    const htmlFile = args[0];
    const outputFile = args[1] || null;

    try {
        await fs.access(htmlFile);
    } catch {
        console.error(`错误: HTML文件不存在 - ${htmlFile}`);
        process.exit(1);
    }

    try {
        const localizer = new HTMLScriptLocalizer(htmlFile);
        await localizer.process(outputFile);
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