@echo off
REM Git to PC - Pull latest code from GitHub
REM https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ============================================================
echo    GIT TO PC - PULL LATEST CODE FROM GITHUB
echo ============================================================
echo.

set "REPO_URL=https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT.git"
set "REPO_BRANCH=main"

echo [INFO] Repository: %REPO_URL%
echo [INFO] Branch: %REPO_BRANCH%
echo.

REM Check Git
echo [CHECK] Verifying Git installation...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git not found. Install from https://git-scm.com
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('git --version') do echo [OK] %%i found
echo.

REM Initialize if needed
if not exist ".git" (
    echo [ACTION] Initializing Git repository...
    git init
    git remote add origin %REPO_URL%
    echo [OK] Repository initialized
    echo.
)

REM Configure Git
git config user.email >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git config user.name "Neora Agent v2"
    git config user.email "neora@shukriaprinters.local"
    echo [OK] Git configured
    echo.
)

REM Verify remote
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git remote add origin %REPO_URL%
)
echo [OK] Remote configured
echo.

REM Stash local changes
echo [ACTION] Checking for local changes...
git status --porcelain | findstr /R /C:"." >nul
if !ERRORLEVEL! EQU 0 (
    echo [WARNING] Local changes detected. Stashing...
    git stash
    echo [OK] Changes stashed
    echo.
)

REM Fetch latest
echo [ACTION] Fetching latest changes from GitHub...
git fetch origin %REPO_BRANCH%
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Failed to fetch from GitHub
    pause
    exit /b 1
)
echo [OK] Latest changes fetched
echo.

REM Merge
echo [ACTION] Merging changes...
git merge origin/%REPO_BRANCH% --no-edit
if !ERRORLEVEL! NEQ 0 (
    echo [WARNING] Merge conflict detected. Resolve manually and commit.
    pause
    exit /b 1
)
echo [OK] Changes merged
echo.

REM Update npm
if exist "package.json" (
    echo [ACTION] Updating dependencies...
    npm install --silent
)
echo.

echo ============================================================
echo    RECENT CHANGES
echo ============================================================
echo.
git log --oneline -5
echo.

echo [SUCCESS] Code synchronization complete!
echo.
pause
exit /b 0
