@echo off
cd /d "%~dp0"
call npm run register
set "result=%errorlevel%"
pause
exit /b %result%
