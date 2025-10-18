(() => {
    const fileInput = document.getElementById('htmlFileInput');
    if (!fileInput) {
        return;
    }

    const processButton = document.getElementById('processButton');
    const resetButton = document.getElementById('resetButton');
    const selectionInfo = document.getElementById('selectionInfo');
    const statusContainer = document.getElementById('statusContainer');
    const logOutput = document.getElementById('logOutput');
    const resourceTableWrapper = document.getElementById('resourceTableWrapper');
    const resourceTableBody = document.querySelector('#resourceTable tbody');

    const library = window.HtmlAssetsLocalizer;
    if (!library || !library.BrowserHtmlAssetsLocalizer) {
        if (statusContainer) {
            statusContainer.style.display = 'block';
        }
        if (logOutput) {
            const entry = document.createElement('div');
            entry.className = 'small text-danger';
            entry.textContent = '未能加载本地化核心脚本，请检查网络或稍后重试。';
            logOutput.appendChild(entry);
        }
        console.error('BrowserHtmlAssetsLocalizer is not available on window.HtmlAssetsLocalizer.');
        fileInput.disabled = true;
        if (processButton) {
            processButton.disabled = true;
        }
        if (resetButton) {
            resetButton.disabled = true;
        }
        return;
    }

    const { BrowserHtmlAssetsLocalizer } = library;
    let selectedFile = null;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            resetState();
            appendLog('请选择需要处理的 HTML 文件。', 'warning');
            return;
        }
        selectedFile = file;
        updateSelectionInfo(file);
    });

    processButton.addEventListener('click', async () => {
        await processFile();
    });

    resetButton.addEventListener('click', () => resetState());

    function updateSelectionInfo(file) {
        selectionInfo.classList.remove('alert-warning', 'alert-danger');
        selectionInfo.classList.add('alert-info');
        selectionInfo.textContent = `已选择文件：${file.name}（${formatBytes(file.size)}）`;
        selectionInfo.style.display = 'block';
        processButton.disabled = false;
        resetButton.disabled = false;
        appendLog('HTML 文件已准备好，可以开始处理。', 'success');
    }

    async function processFile() {
        if (!selectedFile) {
            appendLog('请先选择需要处理的 HTML 文件。', 'warning');
            return;
        }

        toggleProcessingState(true);
        statusContainer.style.display = 'block';
        appendLog('正在读取文件内容...', 'info');

        try {
            const htmlSource = await selectedFile.text();
            appendLog('正在解析并下载远程资源...', 'info');

            const localizer = new BrowserHtmlAssetsLocalizer({
                htmlContent: htmlSource,
                htmlFileName: selectedFile.name || 'index.html',
            });

            const result = await localizer.process();
            const { summary, zipBlob, zipFileName } = result;

            appendLog(`检测到 ${summary.totalRemoteResources} 个远程资源，成功本地化 ${summary.localizedResources} 个。`, 'success');
            updateResourceTable(summary.assets || []);

            triggerDownload(zipBlob, zipFileName);
            appendLog(`压缩包已生成：${zipFileName}`, 'success');

            if (!summary.localizedResources) {
                appendLog('未检测到需要本地化的远程资源，已将原始 HTML 写入压缩包。', 'warning');
            }
        } catch (error) {
            const details = error instanceof Error ? error.message : String(error);
            appendLog(`处理失败：${details}`, 'danger');
        } finally {
            toggleProcessingState(false);
        }
    }

    function resetState() {
        selectedFile = null;
        fileInput.value = '';
        selectionInfo.style.display = 'none';
        logOutput.innerHTML = '';
        statusContainer.style.display = 'none';
        resourceTableBody.innerHTML = '';
        resourceTableWrapper.style.display = 'none';
        processButton.disabled = true;
        resetButton.disabled = true;
        processButton.innerHTML = '处理并下载压缩包';
        fileInput.disabled = false;
    }

    function toggleProcessingState(isProcessing) {
        fileInput.disabled = isProcessing;
        processButton.disabled = isProcessing || !selectedFile;
        resetButton.disabled = isProcessing;
        if (isProcessing) {
            processButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>处理中...';
        } else {
            processButton.innerHTML = '处理并下载压缩包';
        }
    }

    function updateResourceTable(assets) {
        if (!assets.length) {
            resourceTableWrapper.style.display = 'none';
            return;
        }

        resourceTableBody.innerHTML = '';
        assets.forEach((asset) => {
            const row = document.createElement('tr');

            const typeCell = document.createElement('td');
            typeCell.textContent = asset.type;
            row.appendChild(typeCell);

            const originalUrlCell = document.createElement('td');
            originalUrlCell.classList.add('text-break');
            const link = document.createElement('a');
            link.href = asset.originalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = asset.originalUrl;
            originalUrlCell.appendChild(link);
            row.appendChild(originalUrlCell);

            const localPathCell = document.createElement('td');
            localPathCell.classList.add('text-break');
            localPathCell.textContent = asset.localRelativePath;
            row.appendChild(localPathCell);

            const sizeCell = document.createElement('td');
            sizeCell.classList.add('text-end');
            sizeCell.textContent = formatBytes(asset.bytesWritten || 0);
            row.appendChild(sizeCell);

            resourceTableBody.appendChild(row);
        });
        resourceTableWrapper.style.display = 'block';
    }

    function appendLog(message, level = 'info') {
        statusContainer.style.display = 'block';
        const entry = document.createElement('div');
        entry.className = `small mb-1 ${getLogClass(level)}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    function getLogClass(level) {
        switch (level) {
            case 'success':
                return 'text-success';
            case 'warning':
                return 'text-warning';
            case 'danger':
                return 'text-danger';
            case 'info':
                return 'text-info';
            default:
                return 'text-secondary';
        }
    }

    function triggerDownload(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    function formatBytes(bytes) {
        if (!bytes) {
            return '0 B';
        }
        const units = ['B', 'KB', 'MB', 'GB'];
        const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / Math.pow(1024, exponent);
        return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    }
})();
