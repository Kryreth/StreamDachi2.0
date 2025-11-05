@echo off
echo ========================================
echo  StreamDachi - Local Mode Setup
echo ========================================
echo.
echo Installing dependencies...
call npm install
echo.
echo ========================================
echo  Starting StreamDachi in Local Mode
echo ========================================
echo.
echo Database: SQLite (app.db)
echo Server: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
npx tsx server/index.ts
