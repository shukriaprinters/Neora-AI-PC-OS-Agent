@echo off
REM Neora Agent v2 - OS Control Voice Agent Runner
REM GitHub: https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT
REM Starts voice + text agent as always-on background service

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Parse arguments
set "CONFIRMATION_ENABLED=true"
set "DEV_MODE=false"
set "AGENT_PORT=3000"

:parse_args
if "%~1"=="" goto args_done
if /i "%~1"=="--no-confirmation" (set "CONFIRMATION_ENABLED=false" & shift & goto parse_args)
if /i "%~1"=="--dev" (set "DEV_MODE=true" & shift & goto parse_args)
if /i "%~1"=="--port" (set "AGENT_PORT=%~2" & shift & shift & goto parse_args)
shift
goto parse_args

:args_done
cls
echo.
echo ============================================================
echo        NEORA AGENT v2 - OS CONTROL VOICE AGENT
echo ============================================================
echo.
echo [INFO] Initializing Neora Agent v2...
echo [INFO] Port: %AGENT_PORT%
echo [INFO] Confirmation: %CONFIRMATION_ENABLED%
echo [INFO] Dev Mode: %DEV_MODE%
echo.

REM Check Node.js
echo [CHECK] Verifying Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i found

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo [OK] npm %%i found
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo [ACTION] Installing dependencies...
    call npm install --silent
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
)

REM Create .env if missing
if not exist ".env" (
    echo [ACTION] Creating environment configuration...
    (
        echo AGENT_PORT=%AGENT_PORT%
        echo CONFIRMATION_ENABLED=%CONFIRMATION_ENABLED%
        echo DEV_MODE=%DEV_MODE%
        echo AGENT_VERSION=2.0.0
        echo AGENT_PLATFORM=windows
        echo NODE_ENV=production
    ) > .env
    echo [OK] Configuration created
)

echo.
echo [INFO] Starting Neora Agent v2...
echo ============================================================
echo.
echo Available Commands:
echo   Voice:  "Open Chrome", "Type hello", "Go to google.com"
echo   Text:   Type in the command box
echo   Hotkey: Alt+N = Listen, Ctrl+Shift+N = Show/Hide, Escape = Stop
echo.
echo Press Ctrl+C to stop
echo ============================================================
echo.

REM Start the agent
set AGENT_PORT=%AGENT_PORT%
set CONFIRMATION_ENABLED=%CONFIRMATION_ENABLED%
set DEV_MODE=%DEV_MODE%

if "%DEV_MODE%"=="true" (
    echo [DEV] Starting in development mode...
    call npm run dev
) else (
    start "Neora Backend" /min cmd /c "npm run start"
    timeout /t 3 /nobreak >nul
    echo [INFO] Starting web interface at http://localhost:%AGENT_PORT%
    call npm run dev-frontend
)

echo.
echo [INFO] Shutting down Neora Agent v2...
taskkill /FI "WINDOWTITLE eq Neora Backend" /T /F >nul 2>&1
pause
exit /b 0
