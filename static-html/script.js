// Translations object
const translations = {
    'zh-CN': {
        'hero.title': '员工工作平台',
        'hero.subtitle': '中国 ⇄ 哈萨克斯坦物流管理系统',
        'hero.description': '高效管理订单、追踪货物、查看统计数据的现代化平台',
        'features.trackScan.title': '扫描追踪',
        'features.trackScan.description': '扫描条形码快速追踪包裹',
        'features.shipments.title': '发货管理',
        'features.shipments.description': '管理和查看所有发货信息',
        'features.search.title': '搜索订单',
        'features.search.description': '按追踪号或客户姓名搜索',
        'features.statistics.title': '统计数据',
        'features.statistics.description': '查看详细的业务统计图表',
        'nav.home': '首页',
        'nav.scan': '扫描追踪',
        'nav.shipments': '发货',
        'nav.search': '搜索订单',
        'nav.statistics': '统计数据',
        'profile': '个人资料',
        'settings': '设置',
        'logout': '退出登录'
    },
    'en-US': {
        'hero.title': 'Employee Work Platform',
        'hero.subtitle': 'China ⇄ Kazakhstan Logistics Management System',
        'hero.description': 'Modern platform for efficient order management, package tracking, and statistics viewing',
        'features.trackScan.title': 'Track Scanner',
        'features.trackScan.description': 'Scan barcodes to quickly track packages',
        'features.shipments.title': 'Shipments',
        'features.shipments.description': 'Manage and view all shipment information',
        'features.search.title': 'Search Orders',
        'features.search.description': 'Search by tracking number or customer name',
        'features.statistics.title': 'Statistics',
        'features.statistics.description': 'View detailed business statistics and charts',
        'nav.home': 'Home',
        'nav.scan': 'Track Scan',
        'nav.shipments': 'Shipments',
        'nav.search': 'Search Orders',
        'nav.statistics': 'Statistics',
        'profile': 'Profile',
        'settings': 'Settings',
        'logout': 'Logout'
    },
    'ru-RU': {
        'hero.title': 'Платформа для сотрудников',
        'hero.subtitle': 'Система логистики Китай ⇄ Казахстан',
        'hero.description': 'Современная платформа для эффективного управления заказами, отслеживания посылок и просмотра статистики',
        'features.trackScan.title': 'Сканировать трек',
        'features.trackScan.description': 'Сканируйте штрих-коды для быстрого отслеживания посылок',
        'features.shipments.title': 'Отправки',
        'features.shipments.description': 'Управляйте и просматривайте информацию о всех отправках',
        'features.search.title': 'Поиск заказов',
        'features.search.description': 'Поиск по трек-номеру или имени клиента',
        'features.statistics.title': 'Статистика',
        'features.statistics.description': 'Просматривайте подробную бизнес-статистику и графики',
        'nav.home': 'Главная',
        'nav.scan': 'Сканировать трек',
        'nav.shipments': 'Отправки',
        'nav.search': 'Поиск заказов',
        'nav.statistics': 'Статистика',
        'profile': 'Профиль',
        'settings': 'Настройки',
        'logout': 'Выйти'
    },
    'kk-KZ': {
        'hero.title': 'Қызметкерлер платформасы',
        'hero.subtitle': 'Қытай ⇄ Қазақстан логистика жүйесі',
        'hero.description': 'Тапсырыстарды тиімді басқару, сәлемдемелерді қадағалау және статистиканы қарау үшін заманауи платформа',
        'features.trackScan.title': 'Тректі сканерлеу',
        'features.trackScan.description': 'Сәлемдемелерді жылдам қадағалау үшін штрих-кодтарды сканерлеу',
        'features.shipments.title': 'Жөнелтулер',
        'features.shipments.description': 'Барлық жөнелту ақпаратын басқару және көру',
        'features.search.title': 'Тапсырыстарды іздеу',
        'features.search.description': 'Трек нөмірі немесе тұтынушы аты бойынша іздеу',
        'features.statistics.title': 'Статистика',
        'features.statistics.description': 'Толық бизнес статистикасы мен диаграммаларын көру',
        'nav.home': 'Басты бет',
        'nav.scan': 'Тректі сканерлеу',
        'nav.shipments': 'Жөнелтулер',
        'nav.search': 'Тапсырыстарды іздеу',
        'nav.statistics': 'Статистика',
        'profile': 'Профиль',
        'settings': 'Баптаулар',
        'logout': 'Шығу'
    }
};

// Language flags mapping
const languageFlags = {
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
    'ru-RU': '🇷🇺',
    'kk-KZ': '🇰🇿'
};

// Current language
let currentLanguage = localStorage.getItem('language') || 'zh-CN';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language
    updateLanguage(currentLanguage);
    
    // Set page title based on language
    updatePageTitle();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    document.querySelectorAll('.features-grid, .info-section').forEach(el => {
        observer.observe(el);
    });
});

// Toggle dropdown visibility
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('show');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // Open the clicked dropdown if it wasn't open
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

// Close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateLanguage(lang);
    updatePageTitle();
    closeAllDropdowns();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Show language change animation
    showLanguageChangeAnimation();
}

// Update all text elements with translations
function updateLanguage(lang) {
    const langTranslations = translations[lang];
    
    // Update flag in language button
    const currentFlag = document.getElementById('currentFlag');
    if (currentFlag) {
        currentFlag.textContent = languageFlags[lang];
    }
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (langTranslations[key]) {
            element.textContent = langTranslations[key];
        }
    });
}

// Update page title based on language
function updatePageTitle() {
    const titles = {
        'zh-CN': 'LogiFlow - 员工工作平台 | 中哈物流管理系统',
        'en-US': 'LogiFlow - Employee Platform | China-Kazakhstan Logistics',
        'ru-RU': 'LogiFlow - Платформа сотрудников | Логистика Китай-Казахстан',
        'kk-KZ': 'LogiFlow - Қызметкерлер платформасы | Қытай-Қазақстан логистика'
    };
    
    document.title = titles[currentLanguage] || titles['zh-CN'];
}

// Show language change animation
function showLanguageChangeAnimation() {
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
}

// Navigation function
function navigateTo(page) {
    // Add click animation
    const event = new Event('click');
    document.body.dispatchEvent(event);
    
    // Navigate after animation
    setTimeout(() => {
        window.location.href = page;
    }, 100);
}

// Add click ripple effect
document.addEventListener('click', function(e) {
    if (e.target.closest('.feature-card')) {
        const card = e.target.closest('.feature-card');
        const ripple = document.createElement('div');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth page transitions
window.addEventListener('beforeunload', function() {
    document.body.style.opacity = '0';
});

// Performance optimization: lazy load animations
function lazyLoadAnimations() {
    const animatedElements = document.querySelectorAll('.hero-icons, .feature-card');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadAnimations);

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAllDropdowns();
    }
    
    // Navigate with numbers 1-5
    if (e.key >= '1' && e.key <= '5') {
        const pages = ['index.html', 'scan.html', 'shipments.html', 'search.html', 'statistics.html'];
        const pageIndex = parseInt(e.key) - 1;
        if (pages[pageIndex]) {
            navigateTo(pages[pageIndex]);
        }
    }
});

// Add accessibility improvements
function improveAccessibility() {
    // Add ARIA labels
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `功能卡片 ${index + 1}`);
        
        // Add keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
    // Add focus styles
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        .feature-card:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
        }
        
        .dropdown button:focus {
            outline: 2px solid #3B82F6;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
}

// Initialize accessibility improvements
document.addEventListener('DOMContentLoaded', improveAccessibility);