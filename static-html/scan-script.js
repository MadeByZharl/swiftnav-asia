// Scan page specific functionality
let videoStream = null;
let scanning = false;

// Extended translations for scan page
const scanTranslations = {
    'zh-CN': {
        'scan.title': '扫描追踪码',
        'scan.placeholder': '输入追踪号...',
        'scan.camera': '开启摄像头',
        'scan.success': '扫描成功！',
        'scan.error': '未找到追踪信息',
        'scan.processing': '处理中...',
        'common.back': '返回',
        'common.search': '搜索',
        'profile': '个人资料',
        'settings': '设置',
        'logout': '退出登录'
    },
    'en-US': {
        'scan.title': 'Scan Tracking Code',
        'scan.placeholder': 'Enter tracking number...',
        'scan.camera': 'Start Camera',
        'scan.success': 'Scan successful!',
        'scan.error': 'Tracking information not found',
        'scan.processing': 'Processing...',
        'common.back': 'Back',
        'common.search': 'Search',
        'profile': 'Profile',
        'settings': 'Settings',
        'logout': 'Logout'
    },
    'ru-RU': {
        'scan.title': 'Сканировать трек-код',
        'scan.placeholder': 'Введите трек-номер...',
        'scan.camera': 'Запустить камеру',
        'scan.success': 'Сканирование успешно!',
        'scan.error': 'Информация о треке не найдена',
        'scan.processing': 'Обработка...',
        'common.back': 'Назад',
        'common.search': 'Поиск',
        'profile': 'Профиль',
        'settings': 'Настройки',
        'logout': 'Выйти'
    },
    'kk-KZ': {
        'scan.title': 'Трек-кодты сканерлеу',
        'scan.placeholder': 'Трек нөмірін енгізіңіз...',
        'scan.camera': 'Камераны іске қосу',
        'scan.success': 'Сканерлеу сәтті!',
        'scan.error': 'Трек ақпараты табылмады',
        'scan.processing': 'Өңдеуде...',
        'common.back': 'Артқа',
        'common.search': 'Іздеу',
        'profile': 'Профиль',
        'settings': 'Баптаулар',
        'logout': 'Шығу'
    }
};

// Merge scan translations with main translations
Object.keys(scanTranslations).forEach(lang => {
    if (translations[lang]) {
        Object.assign(translations[lang], scanTranslations[lang]);
    }
});

// Initialize scan page
document.addEventListener('DOMContentLoaded', function() {
    // Update current language
    updateLanguage(currentLanguage);
    
    // Add Enter key support for input
    const trackingInput = document.getElementById('trackingInput');
    if (trackingInput) {
        trackingInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchTracking();
            }
        });
        
        // Add input formatting
        trackingInput.addEventListener('input', function(e) {
            // Convert to uppercase and remove spaces
            let value = e.target.value.toUpperCase().replace(/\s+/g, '');
            e.target.value = value;
        });
    }
    
    // Check if device has camera
    checkCameraSupport();
});

// Check camera support
async function checkCameraSupport() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        
        const startBtn = document.getElementById('startScanBtn');
        if (!hasCamera && startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-camera-slash"></i><span>摄像头不可用</span>';
        }
    } catch (error) {
        console.log('Camera check failed:', error);
    }
}

// Start camera for scanning
async function startCamera() {
    try {
        showLoading();
        
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Use back camera on mobile
            }
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('scannerVideo');
        const overlay = document.querySelector('.scanner-overlay');
        const startBtn = document.getElementById('startScanBtn');
        const stopBtn = document.getElementById('stopScanBtn');
        
        if (video && videoStream) {
            video.srcObject = videoStream;
            video.play();
            
            // Hide overlay and show video
            overlay.style.display = 'none';
            video.style.display = 'block';
            
            // Update buttons
            startBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
            
            scanning = true;
            
            // Start scanning simulation (in real app, use a barcode library)
            setTimeout(() => {
                simulateBarcodeScan();
            }, 3000);
        }
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('无法访问摄像头');
        console.error('Camera access failed:', error);
    }
}

// Stop camera
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    const video = document.getElementById('scannerVideo');
    const overlay = document.querySelector('.scanner-overlay');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');
    
    if (video) {
        video.style.display = 'none';
        video.srcObject = null;
    }
    
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Update buttons
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    
    scanning = false;
}

// Simulate barcode scanning (replace with real barcode detection)
function simulateBarcodeScan() {
    if (!scanning) return;
    
    // Simulate finding a barcode
    const mockTrackingNumber = 'CN' + Date.now().toString().slice(-8);
    document.getElementById('trackingInput').value = mockTrackingNumber;
    
    // Add scan animation
    const scanFrame = document.querySelector('.scan-frame');
    if (scanFrame) {
        scanFrame.style.animation = 'successPulse 0.5s ease-out';
        setTimeout(() => {
            scanFrame.style.animation = '';
        }, 500);
    }
    
    // Stop camera and search
    stopCamera();
    setTimeout(() => {
        searchTracking();
    }, 500);
}

// Search tracking number
function searchTracking() {
    const trackingInput = document.getElementById('trackingInput');
    const trackingNumber = trackingInput.value.trim();
    
    if (!trackingNumber) {
        showError('请输入追踪号');
        trackingInput.focus();
        return;
    }
    
    if (trackingNumber.length < 6) {
        showError('追踪号格式不正确');
        trackingInput.focus();
        return;
    }
    
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Simulate success/error based on tracking number
        if (trackingNumber.startsWith('ERROR')) {
            showTrackingResult(null, true);
        } else {
            const mockResult = generateMockTrackingResult(trackingNumber);
            showTrackingResult(mockResult, false);
        }
    }, 1500);
}

// Generate mock tracking result
function generateMockTrackingResult(trackingNumber) {
    const statuses = ['已收件', '运输中', '已到达', '派送中', '已签收'];
    const locations = ['深圳', '乌鲁木齐', '阿拉木图', '阿斯塔纳', '配送点'];
    
    return {
        trackingNumber: trackingNumber,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        recipient: '李明',
        weight: (Math.random() * 5 + 0.5).toFixed(1) + ' kg',
        estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'),
        lastUpdate: new Date().toLocaleString('zh-CN')
    };
}

// Show tracking result
function showTrackingResult(result, isError) {
    const resultsSection = document.getElementById('resultsSection');
    const resultCard = document.getElementById('resultCard');
    
    if (isError) {
        resultCard.className = 'result-card result-error animate-error';
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-icon error">
                    <i class="fas fa-times"></i>
                </div>
                <div class="result-info">
                    <h3>追踪信息未找到</h3>
                    <p>请检查追踪号是否正确</p>
                </div>
            </div>
        `;
    } else {
        resultCard.className = 'result-card result-success animate-success';
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-icon success">
                    <i class="fas fa-check"></i>
                </div>
                <div class="result-info">
                    <h3>追踪信息</h3>
                    <p>追踪号: ${result.trackingNumber}</p>
                </div>
            </div>
            <div class="tracking-details">
                <div class="detail-item">
                    <div class="detail-label">当前状态</div>
                    <div class="detail-value">${result.status}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">当前位置</div>
                    <div class="detail-value">${result.location}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">收件人</div>
                    <div class="detail-value">${result.recipient}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">重量</div>
                    <div class="detail-value">${result.weight}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">预计送达</div>
                    <div class="detail-value">${result.estimatedDelivery}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">最后更新</div>
                    <div class="detail-value">${result.lastUpdate}</div>
                </div>
            </div>
        `;
    }
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Paste from clipboard
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const trackingInput = document.getElementById('trackingInput');
        if (trackingInput) {
            trackingInput.value = text.trim().toUpperCase();
            trackingInput.focus();
        }
    } catch (error) {
        showError('无法访问剪贴板');
    }
}

// Clear input
function clearInput() {
    const trackingInput = document.getElementById('trackingInput');
    if (trackingInput) {
        trackingInput.value = '';
        trackingInput.focus();
    }
    
    // Hide results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
}

// Show loading overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add toast styles
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        .error-toast {
            position: fixed;
            top: 6rem;
            right: 1rem;
            background: #EF4444;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards;
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    
    document.head.appendChild(toastStyle);
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
        toastStyle.remove();
    }, 3000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (videoStream) {
        stopCamera();
    }
});

// Handle device orientation change
window.addEventListener('orientationchange', function() {
    if (scanning) {
        // Restart camera with new orientation
        setTimeout(() => {
            stopCamera();
            setTimeout(startCamera, 500);
        }, 500);
    }
});