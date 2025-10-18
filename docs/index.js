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
            statusContainer.classList.remove('hidden');
        }
        if (logOutput) {
            const entry = document.createElement('div');
            entry.className = 'text-sm text-rose-600 dark:text-rose-300';
            entry.textContent = '未能加载本地化核心脚本，请检查网络或稍后重试。';
            logOutput.appendChild(entry);
        }

        console.error('BrowserHtmlAssetsLocalizer is not available on window.HtmlAssetsLocalizer.');
        fileInput.disabled = true;
        setButtonDisabled(processButton, true);
        setButtonDisabled(resetButton, true);
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

    function setButtonDisabled(button, isDisabled) {
        if (!button) {
            return;
        }
        button.disabled = isDisabled;
        if (isDisabled) {
            button.setAttribute('disabled', '');
            button.setAttribute('aria-disabled', 'true');
            button.classList.add('cursor-not-allowed');
            button.classList.remove('cursor-pointer');
        } else {
            button.removeAttribute('disabled');
            button.removeAttribute('aria-disabled');
            button.classList.add('cursor-pointer');
            button.classList.remove('cursor-not-allowed');
        }
    }

    setButtonDisabled(processButton, true);
    setButtonDisabled(resetButton, true);

    function updateSelectionInfo(file) {
        selectionInfo.className =
            'rounded-2xl border border-blue-300/60 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-100';
        selectionInfo.textContent = `已选择文件：${file.name}（${formatBytes(file.size)}）`;
        selectionInfo.classList.remove('hidden');

        setButtonDisabled(processButton, false);
        setButtonDisabled(resetButton, false);

        appendLog('HTML 文件已准备好，可以开始处理。', 'success');
    }

    async function processFile() {
        if (!selectedFile) {
            appendLog('请先选择需要处理的 HTML 文件。', 'warning');
            return;
        }

        toggleProcessingState(true);
        statusContainer.classList.remove('hidden');
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

            appendLog(
                `检测到 ${summary.totalRemoteResources} 个远程资源，成功本地化 ${summary.localizedResources} 个。`,
                'success'
            );
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
        selectionInfo.classList.add('hidden');
        logOutput.innerHTML = '';
        statusContainer.classList.add('hidden');
        resourceTableBody.innerHTML = '';
        resourceTableWrapper.classList.add('hidden');
        setButtonDisabled(processButton, true);
        setButtonDisabled(resetButton, true);
        processButton.innerHTML = '处理并下载压缩包';
        fileInput.disabled = false;
    }

    function toggleProcessingState(isProcessing) {
        fileInput.disabled = isProcessing;
        setButtonDisabled(processButton, isProcessing || !selectedFile);
        setButtonDisabled(resetButton, isProcessing);

        if (isProcessing) {
            processButton.innerHTML =
                '<span class="flex items-center justify-center gap-2">' +
                '<svg class="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
                '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
                '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
                '</svg>处理中...</span>';
        } else {
            processButton.innerHTML = '处理并下载压缩包';
        }
    }

    function updateResourceTable(assets) {
        if (!assets.length) {
            resourceTableWrapper.classList.add('hidden');
            resourceTableBody.innerHTML = '';
            return;
        }

        resourceTableBody.innerHTML = '';
        assets.forEach((asset) => {
            const row = document.createElement('tr');
            row.className = 'transition hover:bg-slate-100 dark:hover:bg-slate-800/40';

            const typeCell = document.createElement('td');
            typeCell.className = 'px-4 py-3 align-top text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300';
            typeCell.textContent = asset.type;
            row.appendChild(typeCell);

            const originalUrlCell = document.createElement('td');
            originalUrlCell.classList.add('px-4', 'py-3', 'break-all', 'text-slate-700', 'dark:text-slate-200');
            const link = document.createElement('a');
            link.href = asset.originalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className =
                'text-indigo-600 underline decoration-indigo-400/60 underline-offset-4 transition hover:text-indigo-500 dark:text-indigo-200 dark:decoration-indigo-400/40 dark:hover:text-indigo-100 dark:hover:decoration-indigo-200';
            link.textContent = asset.originalUrl || '';
            originalUrlCell.appendChild(link);
            row.appendChild(originalUrlCell);

            const localPathCell = document.createElement('td');
            localPathCell.classList.add('px-4', 'py-3', 'break-all', 'text-slate-600', 'dark:text-slate-300');
            localPathCell.textContent = asset.localRelativePath;
            row.appendChild(localPathCell);

            const sizeCell = document.createElement('td');
            sizeCell.classList.add('px-4', 'py-3', 'text-right', 'text-slate-500', 'dark:text-slate-400');
            sizeCell.textContent = formatBytes(asset.bytesWritten || 0);
            row.appendChild(sizeCell);

            resourceTableBody.appendChild(row);
        });

        resourceTableWrapper.classList.remove('hidden');
    }

    function appendLog(message, level = 'info') {
        statusContainer.classList.remove('hidden');
        const entry = document.createElement('div');
        entry.className = `mb-1 text-xs leading-6 ${getLogClass(level)}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    function getLogClass(level) {
        switch (level) {
            case 'success':
                return 'text-emerald-600 dark:text-emerald-300';
            case 'warning':
                return 'text-amber-500 dark:text-amber-300';
            case 'danger':
                return 'text-rose-500 dark:text-rose-300';
            case 'info':
                return 'text-indigo-600 dark:text-indigo-200';
            default:
                return 'text-slate-500 dark:text-slate-400';
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

