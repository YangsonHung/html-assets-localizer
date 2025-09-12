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
import sys

class HTMLScriptLocalizer:
    def __init__(self, html_file_path, target_dir=None):
        self.html_file_path = html_file_path
        self.target_dir = target_dir or os.path.dirname(os.path.abspath(html_file_path))
        self.js_dir = os.path.join(self.target_dir, "js")
        self.css_dir = os.path.join(self.target_dir, "css")

        # 创建目标目录和子目录
        os.makedirs(self.target_dir, exist_ok=True)
        os.makedirs(self.js_dir, exist_ok=True)
        os.makedirs(self.css_dir, exist_ok=True)

    def extract_resource_urls(self, html_content):
        """提取HTML中的外部资源URL"""
        resources = {
            'scripts': [],
            'stylesheets': []
        }

        # 提取script标签中的src属性
        script_pattern = r'<script[^>]*\ssrc\s*=\s*["\']?([^"\'>\s]+)["\']?[^>]*>'
        script_matches = re.findall(script_pattern, html_content, re.IGNORECASE)
        resources['scripts'] = [url for url in script_matches if url.startswith(('http://', 'https://'))]

        # 提取link标签中的href属性（只要rel="stylesheet"的）
        link_pattern1 = r'<link[^>]*\srel\s*=\s*["\']?stylesheet["\']?[^>]*\shref\s*=\s*["\']?([^"\'>\s]+)["\']?[^>]*>'
        link_pattern2 = r'<link[^>]*\shref\s*=\s*["\']?([^"\'>\s]+)["\']?[^>]*\srel\s*=\s*["\']?stylesheet["\']?[^>]*>'
        
        css_matches1 = re.findall(link_pattern1, html_content, re.IGNORECASE)
        css_matches2 = re.findall(link_pattern2, html_content, re.IGNORECASE)
        
        all_css = css_matches1 + css_matches2
        resources['stylesheets'] = [url for url in all_css if url.startswith(('http://', 'https://'))]

        return resources

    def download_resource(self, url, resource_type):
        """下载资源文件并返回本地文件名"""
        try:
            # 生成本地文件名
            parsed_url = urllib.parse.urlparse(url)
            filename = os.path.basename(parsed_url.path)

            # 根据资源类型确定目录和文件扩展名
            if resource_type == 'script':
                target_dir = self.js_dir
                if not filename or not filename.endswith('.js'):
                    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                    filename = f"script_{url_hash}.js"
            elif resource_type == 'stylesheet':
                target_dir = self.css_dir
                if not filename or not filename.endswith('.css'):
                    url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                    filename = f"style_{url_hash}.css"
            else:
                return None

            local_path = os.path.join(target_dir, filename)

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

    def update_html_content(self, html_content, script_mapping, css_mapping):
        """更新HTML内容中的资源路径"""
        updated_content = html_content

        # 替换JavaScript文件路径
        for original_url, local_filename in script_mapping.items():
            if local_filename:
                local_path = f"./js/{local_filename}"
                # 替换HTML中的URL
                pattern = f'src\s*=\s*["\']?{re.escape(original_url)}["\']?'
                replacement = f'src="{local_path}"'
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.IGNORECASE)
                print(f"已替换: {original_url} -> {local_path}")

        # 替换CSS文件路径
        for original_url, local_filename in css_mapping.items():
            if local_filename:
                local_path = f"./css/{local_filename}"
                # 替换HTML中的URL
                pattern = f'href\s*=\s*["\']?{re.escape(original_url)}["\']?'
                replacement = f'href="{local_path}"'
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.IGNORECASE)
                print(f"已替换: {original_url} -> {local_path}")

        return updated_content

    def process(self):
        """处理HTML文件，下载外部资源并更新引用"""
        try:
            # 读取HTML文件
            with open(self.html_file_path, 'r', encoding='utf-8') as file:
                html_content = file.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            with open(self.html_file_path, 'r', encoding='gbk') as file:
                html_content = file.read()
        except Exception as e:
            print(f"读取文件失败: {str(e)}")
            return None

        print(f"正在处理HTML文件: {self.html_file_path}")

        # 提取外部资源URL
        resources = self.extract_resource_urls(html_content)
        script_urls = resources['scripts']
        css_urls = resources['stylesheets']

        if not script_urls and not css_urls:
            print("未找到外部资源链接")
            return html_content

        print(f"找到 {len(script_urls)} 个外部脚本和 {len(css_urls)} 个外部样式表:")
        for url in script_urls:
            print(f"  JS: {url}")
        for url in css_urls:
            print(f"  CSS: {url}")

        # 下载资源文件
        script_mapping = {}
        css_mapping = {}
        
        for url in script_urls:
            local_filename = self.download_resource(url, 'script')
            script_mapping[url] = local_filename
            
        for url in css_urls:
            local_filename = self.download_resource(url, 'stylesheet')
            css_mapping[url] = local_filename

        # 更新HTML内容
        updated_html = self.update_html_content(html_content, script_mapping, css_mapping)

        return updated_html

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python assets_localizer.py <html_file_path> [target_directory]")
        print("示例: python assets_localizer.py test.html myProject")
        return

    html_file = sys.argv[1]
    target_directory = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.exists(html_file):
        print(f"错误: 文件 '{html_file}' 不存在")
        return

    # 创建本地化器实例
    localizer = HTMLScriptLocalizer(html_file, target_directory)

    # 处理HTML文件
    updated_html = localizer.process()

    if updated_html is None:
        print("处理失败")
        return

    # 保存更新后的HTML文件到目标目录
    html_filename = os.path.basename(html_file)
    output_html_path = os.path.join(localizer.target_dir, html_filename)
    with open(output_html_path, 'w', encoding='utf-8') as file:
        file.write(updated_html)

    print(f"\n处理完成！")
    print(f"项目已创建到目录: {localizer.target_dir}")
    print(f"HTML文件: {output_html_path}")
    print(f"JavaScript文件目录: {localizer.js_dir}")
    print(f"CSS文件目录: {localizer.css_dir}")

if __name__ == "__main__":
    main()

# 使用示例（作为模块导入时）
"""
from assets_localizer import HTMLScriptLocalizer

# 创建实例
localizer = HTMLScriptLocalizer("test.html", "myProject")

# 处理文件
result = localizer.process()

if result:
    print("处理成功！")
"""