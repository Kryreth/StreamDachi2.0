@echo off
setlocal
title TwitchMind Dev (Server + GUI)
IF NOT DEFINED PORT set PORT=3001
echo Launching server on %PORT% in a new window...
start "TwitchMind Server" cmd /k node -r dotenv/config dist/server/index.js
timeout /t 2 >nul
echo Launching Vite dev server in a new window...
start "TwitchMind Client (Vite Dev)" cmd /k "cd /d %~dp0client && npx vite --host"
timeout /t 2 >nul
start "" http://localhost:5173/
echo Both windows launched. Close them to stop.
