@echo off
title StreamDachi - Local Mode
color 0A
cls

echo.
echo  ===================================================
echo     STREAMDACHI - LOCAL MODE
echo  ===================================================
echo.
echo  Database: SQLite (app.db)
echo  Server: http://localhost:5000
echo.
echo  Starting in 2 seconds...
echo  Press Ctrl+C to cancel
echo  ===================================================
echo.

timeout /t 2 /nobreak >nul

echo  [1/2] Checking dependencies...
if not exist "node_modules\" (
    echo  Installing packages (this may take a minute)...
    call npm install
    if errorlevel 1 (
        echo.
        echo  ERROR: npm install failed!
        echo  Make sure Node.js is installed.
        pause
        exit /b 1
    )
) else (
    echo  Dependencies OK!
)

echo.
echo  [2/2] Starting StreamDachi...
echo.
echo  ===================================================
echo     SERVER RUNNING
echo  ===================================================
echo.
echo  Open your browser to: http://localhost:5000
echo.
echo  Press Ctrl+C to stop the server
echo  ===================================================
echo.

npx tsx server/index.ts

if errorlevel 1 (
    echo.
    echo  ===================================================
    echo     SERVER STOPPED WITH ERROR
    echo  ===================================================
    echo.
    pause
    exit /b 1
)

echo.
echo  ===================================================
echo     SERVER STOPPED NORMALLY
echo  ===================================================
echo.
pause
