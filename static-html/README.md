# LogiFlow - 静态HTML版本

这是LogiFlow中哈物流员工平台的纯HTML/CSS/JavaScript版本。

## 🚀 功能特性

### 🌐 多语言支持
- **中文** (默认) - 中国用户
- **English** - 国际用户  
- **Русский** - 俄语用户
- **Қазақша** - 哈萨克语用户

### 📱 响应式设计
- 桌面端完整功能
- 移动端优化界面
- 底部移动导航栏

### ⚡ 核心功能
- **主页** - 功能概览和快速导航
- **扫描追踪** - 摄像头扫描和手动输入
- **发货管理** - 订单列表和详情查看
- **搜索订单** - 快速查找功能
- **统计数据** - 数据可视化

### 🎨 设计特色
- 现代化渐变配色
- 流畅的CSS动画
- 卡片式布局设计
- 悬停交互效果

## 📁 文件结构

```
static-html/
├── index.html              # 主页
├── scan.html              # 扫描追踪页面
├── shipments.html         # 发货管理页面
├── search.html            # 搜索订单页面 (待创建)
├── statistics.html        # 统计数据页面 (待创建)
├── styles.css             # 主样式文件
├── scan-styles.css        # 扫描页面样式
├── shipments-styles.css   # 发货页面样式
├── script.js              # 主JavaScript文件
├── scan-script.js         # 扫描功能脚本
├── shipments-script.js    # 发货管理脚本
└── README.md              # 说明文档
```

## 🛠️ 安装与运行

### 方法1: 直接打开
1. 下载所有文件到本地文件夹
2. 双击 `index.html` 在浏览器中打开

### 方法2: 本地服务器 (推荐)
使用Python启动本地服务器:
```bash
# Python 3
cd static-html
python -m http.server 8000

# 访问 http://localhost:8000
```

使用Node.js:
```bash
# 安装http-server
npm install -g http-server

# 启动服务器
cd static-html
http-server -p 8000

# 访问 http://localhost:8000
```

使用PHP:
```bash
cd static-html
php -S localhost:8000
```

## 🎯 页面功能说明

### 主页 (index.html)
- 英雄区块与动画图标
- 四大功能模块卡片
- 语言切换功能
- 用户资料菜单

### 扫描追踪 (scan.html)
- 摄像头扫描支持
- 手动输入追踪号
- 剪贴板粘贴功能
- 实时结果展示

### 发货管理 (shipments.html)
- 订单列表展示
- 状态筛选功能
- 时间线进度显示
- 详情弹窗查看

## 🔧 自定义配置

### 修改颜色主题
编辑 `styles.css` 中的CSS变量:
```css
:root {
    --primary-color: #3B82F6;    /* 主色调 */
    --success-color: #10B981;    /* 成功色 */
    --warning-color: #F59E0B;    /* 警告色 */
    --error-color: #EF4444;      /* 错误色 */
}
```

### 添加新语言
在 `script.js` 中的 `translations` 对象添加新语言:
```javascript
const translations = {
    'fr-FR': {
        'hero.title': 'Plateforme Employés',
        // ... 更多翻译
    }
};
```

### 修改模拟数据
编辑各页面的JavaScript文件中的模拟数据数组。

## 📱 移动端适配

### 断点设置
- `768px` 以下: 移动端布局
- `768px` 以上: 桌面端布局

### 移动端特性
- 底部导航栏
- 触摸优化
- 响应式网格
- 滑动手势支持

## 🚀 部署说明

### 静态托管平台
- **Netlify**: 拖拽文件夹直接部署
- **Vercel**: 支持Git集成
- **GitHub Pages**: 免费静态托管
- **阿里云OSS**: 国内访问优化

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/static-html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔒 浏览器兼容性

### 支持的浏览器
- **Chrome** 60+
- **Firefox** 55+ 
- **Safari** 12+
- **Edge** 79+
- **移动浏览器** (iOS Safari, Chrome Mobile)

### 核心功能依赖
- CSS Grid Layout
- Flexbox
- CSS Custom Properties
- ES6+ JavaScript
- getUserMedia API (摄像头功能)

## 📈 性能优化

### 已实现优化
- CSS动画使用transform和opacity
- 图片懒加载准备
- 最小化DOM操作
- 事件委托处理

### 建议优化
- 压缩CSS/JS文件
- 添加CDN加速
- 图片格式优化(WebP)
- 启用Gzip压缩

## 🐛 常见问题

### Q: 摄像头无法启动?
A: 确保使用HTTPS或localhost访问，浏览器需要安全环境才能访问摄像头。

### Q: 语言切换不生效?
A: 检查浏览器localStorage是否启用，语言设置保存在本地存储中。

### Q: 移动端布局异常?
A: 确保viewport meta标签正确设置，检查CSS媒体查询。

### Q: 动画效果卡顿?
A: 检查硬件加速是否启用，减少同时运行的动画数量。

## 📞 技术支持

如需技术支持或功能定制，请联系开发团队。

---

**LogiFlow** - 现代化中哈物流管理平台
版本: 1.0.0 | 更新时间: 2024年1月