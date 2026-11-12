@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto missing_node
if not exist "node_modules\vite\bin\vite.js" goto missing_dependencies

echo Starting XR Women Research Library...
echo Keep this window open while using the website.
echo.

if /i "%~1"=="--no-open" (
  node "node_modules\vite\bin\vite.js" --host 127.0.0.1
) else (
  node "node_modules\vite\bin\vite.js" --host 127.0.0.1 --open
)
if errorlevel 1 goto failed
exit /b 0

:missing_node
echo Node.js was not found. Install Node.js, then try again.
pause
exit /b 1

:missing_dependencies
echo Project dependencies are missing. Run npm install in this folder, then try again.
pause
exit /b 1

:failed
echo.
echo The website could not start. Check the error above.
pause
exit /b 1
