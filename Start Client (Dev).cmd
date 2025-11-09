@echo off
setlocal
title TwitchMind Client (Vite Dev)
cd /d "%~dp0client"
echo Starting Vite dev server on http://localhost:5173 ...
npx vite --host
pause
