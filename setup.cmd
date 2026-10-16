@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Install Node.js 24 LTS / Node.js 24 LTS kurun. & pause & exit /b 1)
call npm ci --ignore-scripts
if errorlevel 1 (pause & exit /b 1)
call npm run setup
set "result=%errorlevel%"
pause
exit /b %result%
