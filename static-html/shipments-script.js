// Shipments page functionality
let allShipments = [];
let filteredShipments = [];

// Mock shipment data
const mockShipments = [
    {
        id: 'SH001',
        trackingNumber: 'CN2024001234',
        recipient: '李明',
        sender: '深圳发货中心',
        destination: '阿拉木图',
        weight: '2.3 kg',
        status: 'delivered',
        date: '2024-01-15',
        estimatedDelivery: '2024-01-20',
        actualDelivery: '2024-01-19',
        value: '¥599',
        steps: [
            { id: 'created', label: '订单创建', completed: true },
            { id: 'picked', label: '已揽件', completed: true },
            { id: 'transit', label: '运输中', completed: true },
            { id: 'customs', label: '清关中', completed: true },
            { id: 'delivered', label: '已送达', completed: true }
        ]
    },
    {
        id: 'SH002',
        trackingNumber: 'CN2024001235',
        recipient: '王丽',
        sender: '北京发货中心',
        destination: '努尔苏丹',
        weight: '1.8 kg',
        status: 'in-transit',
        date: '2024-01-18',
        estimatedDelivery: '2024-01-25',
        value: '¥428',
        steps: [
            { id: 'created', label: '订单创建', completed: true },
            { id: 'picked', label: '已揽件', completed: true },
            { id: 'transit', label: '运输中', completed: true },
            { id: 'customs', label: '清关中', completed: false },
            { id: 'delivered', label: '已送达', completed: false }
        ]
    },
    {
        id: 'SH003',
        trackingNumber: 'CN2024001236',
        recipient: '张三',
        sender: '上海发货中心',
        destination: '阿拉木图',
        weight: '3.1 kg',
        status: 'shipped',
        date: '2024-01-20',
        estimatedDelivery: '2024-01-28',
        value: '¥756',
        steps: [
            { id: 'created', label: '订单创建', completed: true },
            { id: 'picked', label: '已揽件', completed: true },
            { id: 'transit', label: '运输中', completed: false },
            { id: 'customs', label: '清关中', completed: false },
            { id: 'delivered', label: '已送达', completed: false }
        ]
    },
    {
        id: 'SH004',
        trackingNumber: 'CN2024001237',
        recipient: '刘芳',
        sender: '广州发货中心',
        destination: '什姆肯特',
        weight: '0.9 kg',
        status: 'pending',
        date: '2024-01-22',
        estimatedDelivery: '2024-01-30',
        value: '¥299',
        steps: [
            { id: 'created', label: '订单创建', completed: true },
            { id: 'picked', label: '已揽件', completed: false },
            { id: 'transit', label: '运输中', completed: false },
            { id: 'customs', label: '清关中', completed: false },
            { id: 'delivered', label: '已送达', completed: false }
        ]
    }
];

// Status translations
const statusTranslations = {
    'zh-CN': {
        'pending': '待发货',
        'shipped': '已发货', 
        'in-transit': '运输中',
        'delivered': '已送达'
    },
    'en-US': {
        'pending': 'Pending',
        'shipped': 'Shipped',
        'in-transit': 'In Transit', 
        'delivered': 'Delivered'
    },
    'ru-RU': {
        'pending': 'Ожидает',
        'shipped': 'Отправлено',
        'in-transit': 'В пути',
        'delivered': 'Доставлено'
    },
    'kk-KZ': {
        'pending': 'Күтуде',
        'shipped': 'Жіберілді',
        'in-transit': 'Жолда',
        'delivered': 'Жеткізілді'
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateLanguage(currentLanguage);
    allShipments = [...mockShipments];
    filteredShipments = [...allShipments];
    renderShipments();
    
    // Set today's date as default for date filter
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateFilter').value = today;
});

// Render shipments list
function renderShipments() {
    const shipmentsList = document.getElementById('shipmentsList');
    
    if (filteredShipments.length === 0) {
        shipmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>暂无发货记录</h3>
                <p>使用上方筛选条件查找发货记录</p>
            </div>
        `;
        return;
    }
    
    shipmentsList.innerHTML = filteredShipments.map(shipment => `
        <div class="shipment-card ${shipment.status}" onclick="toggleShipmentDetails('${shipment.id}')">
            <div class="shipment-header">
                <div class="shipment-info">
                    <div class="shipment-number">${shipment.trackingNumber}</div>
                    <div class="shipment-date">${formatDate(shipment.date)}</div>
                </div>
                <div class="shipment-status status-${shipment.status}">
                    ${getStatusText(shipment.status)}
                </div>
            </div>
            
            <div class="shipment-details">
                <div class="detail-item">
                    <div class="detail-label">收件人</div>
                    <div class="detail-value">${shipment.recipient}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">目的地</div>
                    <div class="detail-value">${shipment.destination}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">重量</div>
                    <div class="detail-value">${shipment.weight}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">货值</div>
                    <div class="detail-value">${shipment.value}</div>
                </div>
            </div>
            
            <div class="shipment-progress" id="progress-${shipment.id}">
                <div class="progress-timeline">
                    ${shipment.steps.map(step => `
                        <div class="timeline-step ${step.completed ? 'completed' : ''}">
                            <div class="step-icon">
                                <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'}"></i>
                            </div>
                            <div class="step-label">${step.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle shipment details
function toggleShipmentDetails(shipmentId) {
    const shipmentCard = document.querySelector(`[onclick="toggleShipmentDetails('${shipmentId}')"]`);
    const isExpanded = shipmentCard.classList.contains('expanded');
    
    // Close all expanded cards
    document.querySelectorAll('.shipment-card.expanded').forEach(card => {
        card.classList.remove('expanded');
    });
    
    // Open clicked card if it wasn't expanded
    if (!isExpanded) {
        shipmentCard.classList.add('expanded');
        
        // Add click handler to view full details
        setTimeout(() => {
            shipmentCard.addEventListener('dblclick', () => showShipmentModal(shipmentId));
        }, 100);
    }
}

// Show shipment modal
function showShipmentModal(shipmentId) {
    const shipment = allShipments.find(s => s.id === shipmentId);
    if (!shipment) return;
    
    const modal = document.getElementById('shipmentModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card">
                <div class="detail-label">追踪号</div>
                <div class="detail-value">${shipment.trackingNumber}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">状态</div>
                <div class="detail-value">
                    <span class="shipment-status status-${shipment.status}">
                        ${getStatusText(shipment.status)}
                    </span>
                </div>
            </div>
            <div class="detail-card">
                <div class="detail-label">收件人</div>
                <div class="detail-value">${shipment.recipient}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">发件地</div>
                <div class="detail-value">${shipment.sender}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">目的地</div>
                <div class="detail-value">${shipment.destination}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">重量</div>
                <div class="detail-value">${shipment.weight}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">货值</div>
                <div class="detail-value">${shipment.value}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">发货日期</div>
                <div class="detail-value">${formatDate(shipment.date)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">预计送达</div>
                <div class="detail-value">${formatDate(shipment.estimatedDelivery)}</div>
            </div>
            ${shipment.actualDelivery ? `
                <div class="detail-card">
                    <div class="detail-label">实际送达</div>
                    <div class="detail-value">${formatDate(shipment.actualDelivery)}</div>
                </div>
            ` : ''}
        </div>
        
        <div class="progress-timeline">
            ${shipment.steps.map(step => `
                <div class="timeline-step ${step.completed ? 'completed' : ''}">
                    <div class="step-icon">
                        <i class="fas ${step.completed ? 'fa-check' : 'fa-circle'}"></i>
                    </div>
                    <div class="step-label">${step.label}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('shipmentModal');
    modal.classList.remove('show');
}

// Filter shipments
function filterShipments() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredShipments = allShipments.filter(shipment => {
        const statusMatch = !statusFilter || shipment.status === statusFilter;
        const dateMatch = !dateFilter || shipment.date >= dateFilter;
        
        return statusMatch && dateMatch;
    });
    
    renderShipments();
}

// Search shipments
function searchShipments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filterShipments();
        return;
    }
    
    filteredShipments = filteredShipments.filter(shipment => 
        shipment.trackingNumber.toLowerCase().includes(searchTerm) ||
        shipment.recipient.toLowerCase().includes(searchTerm) ||
        shipment.destination.toLowerCase().includes(searchTerm)
    );
    
    renderShipments();
}

// Get status text in current language
function getStatusText(status) {
    return statusTranslations[currentLanguage]?.[status] || status;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Show add modal (placeholder)
function showAddModal() {
    alert('新建发货功能开发中...');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('shipmentModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// Add empty state styles
const emptyStateStyles = `
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #64748B;
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-state h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
        color: #374151;
    }
    
    .empty-state p {
        color: #6B7280;
    }
`;

const style = document.createElement('style');
style.textContent = emptyStateStyles;
document.head.appendChild(style);