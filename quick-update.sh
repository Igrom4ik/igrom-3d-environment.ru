#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}⚡ Быстрое обновление без пересборки...${NC}"

cd /var/www/igrom-3d-environment

echo -e "${YELLOW}📥 Получаю изменения...${NC}"
git pull origin main

echo -e "${YELLOW}🔄 Перезапускаю PM2...${NC}"
pm2 restart igrom-portfolio

echo -e "${GREEN}✅ Готово!${NC}"
pm2 logs igrom-portfolio --lines 5 --nostream
