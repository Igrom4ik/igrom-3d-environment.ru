#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начинаю деплой igrom-3d-environment...${NC}"

# Переход в директорию проекта
cd /var/www/igrom-3d-environment

# Остановка PM2
echo -e "${YELLOW}⏸️  Останавливаю PM2...${NC}"
pm2 stop igrom-portfolio

# Получение последних изменений
echo -e "${YELLOW}📥 Получаю изменения из Git...${NC}"
git pull origin main

# Установка зависимостей
echo -e "${YELLOW}📦 Устанавливаю зависимости...${NC}"
npm ci

# Удаление старой сборки
echo -e "${YELLOW}🗑️  Удаляю старую сборку...${NC}"
rm -rf .next

# Сборка проекта
echo -e "${YELLOW}🔨 Собираю проект (это займёт 3-5 минут)...${NC}"
NODE_ENV=production NODE_OPTIONS='--max-old-space-size=2048' npm run build

# Проверка успешности сборки
if [ ! -f ".next/BUILD_ID" ]; then
    echo -e "${RED}❌ Ошибка: Сборка не завершилась успешно!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Сборка завершена успешно!${NC}"

# Перезапуск PM2
echo -e "${YELLOW}🔄 Перезапускаю PM2...${NC}"
pm2 restart igrom-portfolio

# Проверка статуса
echo -e "${YELLOW}📊 Статус PM2:${NC}"
pm2 status

# Перезагрузка Nginx
echo -e "${YELLOW}🔄 Перезагружаю Nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}🎉 Деплой завершён успешно!${NC}"
echo -e "${GREEN}🌐 Сайт: https://igrom-3d-environment.ru${NC}"

# Показать последние логи
echo -e "${YELLOW}📝 Последние логи:${NC}"
pm2 logs igrom-portfolio --lines 10 --nostream
