@echo off
REM PC to Git - Push local changes to GitHub
REM https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ============================================================
echo    PC TO GIT - PUSH LOCAL CHANGES TO GITHUB
echo ============================================================
echo.

set "REPO_URL=https://github.com/shukriaprinters/NEORA-AI-FULL-PC-OS-AGENT.git"
set "REPO_BRANCH=main"
set "COMMIT_MSG=%~1"

if "%COMMIT_MSG%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set "COMMIT_MSG=Neora Agent v2 update - %%c-%%a-%%b")
)

echo [INFO] Repository: %REPO_URL%
echo [INFO] Branch: %REPO_BRANCH%
echo [INFO] Commit: %COMMIT_MSG%
echo.

REM Check Git
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git not found
    pause
    exit /b 1
)
echo [OK] Git found
echo.

REM Check if repo initialized
if not exist ".git" (
    echo [ERROR] Git repository not initialized
    echo Run 'git to pc.bat' first
    pause
    exit /b 1
)

REM Show status
echo [ACTION] Your changes:
git status
echo.

REM Check if changes exist
git status --porcelain | findstr /R /C:"." >nul
if !ERRORLEVEL! NEQ 0 (
    echo [INFO] No changes to commit
    pause
    exit /b 0
)

REM Confirm push
echo [CONFIRMATION] Push changes to GitHub? (Y/N)
set /p "CONFIRM=: "

if /i not "%CONFIRM%"=="Y" (
    echo [CANCELLED] Push aborted
    pause
    exit /b 0
)

echo.
echo [ACTION] Staging changes...
git add -A

echo [ACTION] Creating commit...
git commit -m "%COMMIT_MSG%"

echo [ACTION] Pushing to GitHub...
git push origin %REPO_BRANCH%

if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Push failed
    pause
    exit /b 1
)

echo [SUCCESS] Changes pushed to GitHub!
echo.
git log --oneline -1
echo.
pause
exit /b 0
