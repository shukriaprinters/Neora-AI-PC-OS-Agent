@echo off
REM Setup Neora Agent v2 Auto-Start on Windows Boot
REM Run as Administrator!

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ============================================================
echo    SETUP NEORA AGENT v2 AUTO-START ON WINDOWS BOOT
echo ============================================================
echo.

echo [CHECK] Checking for administrator privileges...
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] This requires administrator privileges!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)
echo [OK] Administrator privileges confirmed
echo.

set "PROJECT_DIR=%CD%"
set "SCRIPT_PATH=%PROJECT_DIR%\neora agent v2 run.bat"

if not exist "%SCRIPT_PATH%" (
    echo [ERROR] Could not find: %SCRIPT_PATH%
    pause
    exit /b 1
)

echo [ACTION] Setting up auto-start...
echo Project: %PROJECT_DIR%
echo Script: %SCRIPT_PATH%
echo.

REM Method 1: Startup folder shortcut
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo [ACTION] Creating startup shortcut...
powershell -Command "^
    $WshShell = New-Object -ComObject WScript.Shell; ^
    $Shortcut = $WshShell.CreateShortcut('[STARTUP]\Neora Agent v2.lnk'); ^
    $Shortcut.TargetPath = '[SCRIPT]'; ^
    $Shortcut.WorkingDirectory = '[PROJECT]'; ^
    $Shortcut.Description = 'Neora Agent v2'; ^
    $Shortcut.Save()" 2>nul

REM Method 2: Registry entry
echo [ACTION] Configuring Windows Registry...
set "REG_KEY=HKCU\Software\Microsoft\Windows\CurrentVersion\Run"
reg add "%REG_KEY%" /v "NeoraAgentv2" /t REG_SZ /d "%SCRIPT_PATH%" /f >nul 2>&1

REM Method 3: Task Scheduler
echo [ACTION] Creating Task Scheduler entry...
taskkill /FI "TASKLIST eq NeoraAgentv2" /T /F >nul 2>&1
schtasks /delete /tn "NeoraAgentv2" /f >nul 2>&1
schtasks /create /tn "NeoraAgentv2" /tr "%SCRIPT_PATH%" /sc onstart /RL HIGHEST /f >nul 2>&1

echo.
echo ============================================================
echo    AUTO-START CONFIGURATION COMPLETE
echo ============================================================
echo.

echo [SUCCESS] Neora Agent v2 will auto-start on next Windows boot!
echo.
echo Next steps:
echo   1. Restart your Windows computer
echo   2. Neora will start automatically
echo   3. Check Task Manager (Ctrl+Shift+Esc) for "node.exe"
echo.
echo To disable auto-start later:
echo   - Remove shortcut from: %STARTUP%
echo   - Or delete Registry entry from: %REG_KEY%
echo   - Or delete Task Scheduler task: NeoraAgentv2
echo.

pause
exit /b 0
