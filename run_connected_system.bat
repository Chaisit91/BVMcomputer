@echo off
setlocal
cd /d "%~dp0"
node "Backend-web\scripts\run-system.cjs"
if errorlevel 1 pause
