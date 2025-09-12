#!/usr/bin/env python3
"""
HTML外部脚本本地化工具 - Python版本
功能：解析HTML文件，下载外部JavaScript文件，并修改HTML中的引用为本地路径
"""

import os
import re
import urllib.request
import urllib.parse
from pathlib import Path
import hashlib

class HTMLScriptLocalizer:
    def __init__(self, html_file_path, output_dir="js", base_dir=None):
        self.html_file_path = html_file_path
        self.output_dir = output_dir
        self.base_dir = base_dir or os.path.dirname(os.path.abspath(html_file_path))
        self.js_dir = os.path.join(self.base_dir, self.output_dir)

        # 创建JS文件存储目录
        os.makedirs(self.js_dir, exist_ok=True)

    def extract_script_urls(self, html_content):
        """提取HTML中的外部script标签的src属性"""
        # 匹配script标签中的src属性，支持单引号、双引号和无引号
        pattern = r'<script[^>]*\ssrc\s*=\s*["\']?([^"\'>\s]+)["\']?[^>]*>'
        matches = re.findall(pattern, html_content, re.IGNORECASE)

        # 过滤出外部链接（http/https开头）
        external_urls = [url for url in matches if url.startswith(('http://', 'https://'))]
        return external_urls

    def download_script(self, url):
        """下载JavaScript文件并返回本地文件名"""
        try:
            # 生成本地文件名
            parsed_url = urllib.parse.urlparse(url)
            filename = os.path.basename(parsed_url.path)

            # 如果文件名为空或没有.js扩展名，生成一个基于URL hash的文件名
            if not filename or not filename.endswith('.js'):
                url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                filename = f"script_{url_hash}.js"

            local_path = os.path.join(self.js_dir, filename)

            # 如果文件已存在，跳过下载
            if os.path.exists(local_path):
                print(f"文件已存在，跳过下载: {filename}")
                return filename

            # 下载文件
            print(f"正在下载: {url}")
            urllib.request.urlretrieve(url, local_path)
            print(f"下载完成: {filename}")

            return filename

        except Exception as e:
            print(f"下载失败 {url}: {str(e)}")
            return None

    def update_html_content(self, html_content, url_mapping):
        """更新HTML内容中的script src路径"""
        updated_content = html_content

        for original_url, local_filename in url_mapping.items():
            if local_filename:
                local_path = f"./{self.output_dir}/{local_filename}"
                # 替换HTML中的URL
                pattern = f'src\s*=\s*["\']?{re.escape(original_url)}["\']?'
                replacement = f'src="{local_path}"'
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.IGNORECASE)
                print(f"已替换: {original_url} -> {local_path}")

        return updated_content

    def process(self, output_html_path=None):
        """主处理流程"""
        # 读取HTML文件
        try:
            with open(self.html_file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            with open(self.html_file_path, 'r', encoding='gbk') as f:
                html_content = f.read()

        print(f"正在处理HTML文件: {self.html_file_path}")

        # 提取外部script URL
        script_urls = self.extract_script_urls(html_content)
        print(f"找到 {len(script_urls)} 个外部脚本")

        if not script_urls:
            print("没有找到外部脚本，无需处理")
            return

        # 下载脚本文件
        url_mapping = {}
        for url in script_urls:
            local_filename = self.download_script(url)
            url_mapping[url] = local_filename

        # 更新HTML内容
        updated_html = self.update_html_content(html_content, url_mapping)

        # 保存更新后的HTML文件
        if output_html_path is None:
            # 生成输出文件名
            file_path = Path(self.html_file_path)
            output_html_path = file_path.parent / f"{file_path.stem}_local{file_path.suffix}"

        with open(output_html_path, 'w', encoding='utf-8') as f:
            f.write(updated_html)

        print(f"HTML文件已更新: {output_html_path}")
        print("处理完成！")

def main():
    """命令行使用示例"""
    import sys

    if len(sys.argv) < 2:
        print("使用方法: python script_localizer.py <html_file_path> [output_html_path]")
        print("示例: python script_localizer.py index.html index_local.html")
        return

    html_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.exists(html_file):
        print(f"错误: HTML文件不存在 - {html_file}")
        return

    # 创建本地化工具实例并处理
    localizer = HTMLScriptLocalizer(html_file)
    localizer.process(output_file)

if __name__ == "__main__":
    main()

# 使用示例（作为模块导入时）
"""
from script_localizer import HTMLResourceLocalizer

# 创建实例
localizer = HTMLResourceLocalizer("index.html", "output_directory")

# 处理文件
localizer.process()
"""