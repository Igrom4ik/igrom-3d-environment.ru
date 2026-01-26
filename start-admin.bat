@echo off
echo Starting Next.js server...
start npm run dev

echo Opening Admin Panel...
timeout /t 2 /nobreak >nul
start http://localhost:3000/secret-login
