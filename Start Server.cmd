@echo off
setlocal
title TwitchMind Server
REM Fallback port if not set in .env
IF NOT DEFINED PORT set PORT=3001
echo Starting server on port %PORT% ...
node -r dotenv/config dist/server/index.js
pause
