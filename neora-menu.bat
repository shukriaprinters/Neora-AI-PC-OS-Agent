@echo off
setlocal
cd /d "%~dp0"

:menu
cls
echo Neora Control Menu
echo ==================
echo 1. Start Neora
echo 2. Stop Neora
echo 3. Status
echo 4. Exit
echo.
set /p choice=Select an option [1-4]: 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto status
if "%choice%"=="4" exit /b 0
goto menu

:start
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-neora.ps1"
pause
goto menu

:stop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-neora.ps1"
pause
goto menu

:status
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0status-neora.ps1"
pause
goto menu
