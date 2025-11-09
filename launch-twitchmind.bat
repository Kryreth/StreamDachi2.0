@echo off
cd /d "%~dp0server\dist"
if exist "%~dp0\node\node.exe" (
    "%~dp0\node\node.exe" index.js
) else (
    echo Node.js not found in local directory. Trying global node...
    node index.js
)
pause
