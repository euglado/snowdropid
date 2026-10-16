@echo off
cd /d "%~dp0"
call npm start
set "result=%errorlevel%"
pause
exit /b %result%
