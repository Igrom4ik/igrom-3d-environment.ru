# Работа с контентом

## Создание контента (блоги, портфолио)

1. Открой админку: `https://igrom-3d-environment.ru/admin` (через VPN из РФ)
2. Создай пост/альбом/проект через интерфейс Keystatic
3. Загрузи изображения — они автоматически сохранятся в `public/...`
4. Контент сразу появится на сайте (без git)

## Обновление кода проекта

Локально:
```bash
git add .
git commit -m "Update components"
git push
```

На сервере:
```bash
cd /var/www/igrom-3d-environment
git pull
NODE_ENV=production npm run build
pm2 restart igrom-portfolio
```

Git подтянет только код, контент останется нетронутым.

## Большие файлы (> 100MB)

Используй `/api/upload` на сервере для загрузки тяжёлых .mview / видео.
