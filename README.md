# Khan Cargo - Система управления логистикой

Профессиональная платформа для управления грузоперевозками Китай-Казахстан с отслеживанием посылок в реальном времени.

## 🚀 Быстрый запуск в GitHub

### Автоматический деплой на GitHub Pages

1. **Загрузите код в GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Khan Cargo - Initial deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Включите GitHub Pages:**
   - Перейдите в Settings → Pages
   - Source: выберите **"GitHub Actions"**
   - Сайт автоматически развернется по адресу: `https://YOUR_USERNAME.github.io/YOUR_REPO`

### Локальная разработка

```bash
npm install
npm run dev
```

## 🌟 Возможности

- ✅ Отслеживание посылок с QR/штрих-кодами
- ✅ Управление заказами и статусами
- ✅ Многоязычность (Chinese, English, Русский, Қазақша)
- ✅ Система ролей (админ, китайские и казахстанские сотрудники)
- ✅ Статистика и аналитика
- ✅ Адаптивный дизайн для всех устройств
- ✅ Темная/светлая тема

## 🔧 Технологии

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Supabase (Authentication + PostgreSQL)
- **Деплой:** GitHub Pages + GitHub Actions
- **Мобильность:** PWA поддержка

## 📱 Поддерживаемые устройства

- Десктоп браузеры (Chrome, Firefox, Safari, Edge)
- Мобильные устройства (iOS Safari, Android Chrome)
- Планшеты и другие устройства

## 🌍 Мультиязычность

Приложение автоматически определяет язык и поддерживает:
- 🇨🇳 中文 (Chinese) - основной язык для китайских сотрудников
- 🇺🇸 English - международный язык
- 🇷🇺 Русский - для казахстанских сотрудников  
- 🇰🇿 Қазақша (Kazakh) - государственный язык Казахстана

## ⚙️ Настройка и деплой

Все файлы уже настроены для автоматического деплоя:
- ✅ GitHub Actions workflow готов
- ✅ Переменные окружения настроены
- ✅ Сборка и оптимизация настроена

**Инструкция по загрузке в GitHub:** см. файл `GITHUB_SETUP.md`

## 📞 Поддержка

- Техническая документация: `DEPLOYMENT_GUIDE.md`  
- Настройка GitHub: `GITHUB_SETUP.md`
- Проблемы? Проверьте вкладку "Actions" в GitHub репозитории
