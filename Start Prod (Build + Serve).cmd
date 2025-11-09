@echo off
setlocal
title TwitchMind Production (Build GUI + Serve on 3001)
IF NOT DEFINED PORT set PORT=3001
echo Building client...
pushd client
npx vite build
popd
echo Starting server on %PORT% (serving client/dist)...
start "TwitchMind Server (Prod)" cmd /k node -r dotenv/config dist/server/index.js
timeout /t 2 >nul
start "" http://localhost:3001/
echo Server started. Close the server window to stop.
