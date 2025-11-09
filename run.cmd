@echo off
setlocal EnableExtensions
set "APP_ROOT=%~dp0"
set "NODE_EXE=%APP_ROOT%node\node.exe"
set "SERVER_DIR=%APP_ROOT%server\dist"
set "SERVER_MAIN=index.js"
set "SHELL_EXE=%APP_ROOT%shell\TwitchMindShell.exe"

echo [Launcher] Using NODE: "%NODE_EXE%"
if not exist "%NODE_EXE%" (
  echo [ERROR] Missing Node: "%NODE_EXE%"
  pause
  exit /b 1
)

for /f "usebackq delims=" %%A in (`"%NODE_EXE%" -v 2^>^&1`) do set "NODE_VER=%%~A"
for /f "usebackq delims=" %%A in (`"%NODE_EXE%" -p "process.arch" 2^>^&1`) do set "NODE_ARCH=%%~A"
echo [Launcher] Node %NODE_VER% (%NODE_ARCH%)

if not exist "%SERVER_DIR%\%SERVER_MAIN%" (
  echo [ERROR] Missing server entry: "%SERVER_DIR%\%SERVER_MAIN%"
  pause
  exit /b 1
)

pushd "%SERVER_DIR%"
<<<<<<< HEAD
start "StreamDachi Server" /min "%NODE_EXE%" "%SERVER_MAIN%"
popd

REM Prefer contained window if present
if exist "%SHELL_EXE%" (
  echo [Launcher] Launching window: "%SHELL_EXE%"
  start "" "%SHELL_EXE%"
) else (
  echo [Launcher] Window app not found. Opening browser http://127.0.0.1:4173/
=======
start "TwitchMind Server" /min "%NODE_EXE%" "%SERVER_MAIN%"
popd

REM Prefer shell window if available
if exist "%SHELL_EXE%" (
  echo [Launcher] Launching shell: "%SHELL_EXE%"
  start "" "%SHELL_EXE%"
) else (
  echo [Launcher] Shell not found. Opening browser at http://127.0.0.1:4173/
>>>>>>> 31dbe52 (2025-11-09 16:21:47 sync)
  start "" "http://127.0.0.1:4173/"
)

exit /b 0
