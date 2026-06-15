@echo off
setlocal Enabledelayedexpansion
title Neora AI - Push Local to Google Cloud
color 0B

echo ========================================================
echo               NEORA AI CLOUD SYNC SYSTEM
echo           [ LOCAL PC -^> GOOGLE CLOUD INGRESS ]
echo ========================================================
echo.

:: Part 1: Push to GitHub first
echo [1/2] Syncing local files to GitHub Repository...
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] This directory is not a Git repository!
    echo.
    pause
    exit /b 1
)

echo [INFO] Adding files to git index...
git add .

set /p commit_msg=Enter commit message / কমিট মেসেজ লিখুন (Default: 'Update Neora AI'): 
if "%commit_msg%"=="" set commit_msg=Update Neora AI

echo [INFO] Committing changes...
git commit -m "%commit_msg%" >nul 2>&1

echo [INFO] Pushing changes to GitHub 'main' branch...
git push origin main
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Git push failed! Please check your internet, SSH key, or run "git to pc.bat" first.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Pushed to GitHub successfully!
echo.

:: Part 2: Trigger Google Cloud to pull from GitHub
echo [2/2] Triggering Google Cloud container to pull updates...
set CLOUD_URL=https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app

echo [INFO] Sending sync request to Google Cloud Server...
powershell -Command "try { $res = Invoke-RestMethod -Uri '%CLOUD_URL%/api/sync/pull' -Method Post -TimeoutSec 120; Write-Host '[SUCCESS]' $res.message; } catch { Write-Error $_.Exception.Message; exit 1; }"
set sync_err=%ERRORLEVEL%

echo.
if %sync_err% equ 0 (
    color 0A
    echo ========================================================
    echo  [SUCCESS] All files fully updated in Google Cloud!
    echo  [সাফল্য] গুগোল ক্লাউড ও লোকাল পিসি সম্পূর্ণ সিঙ্কড হয়েছে!
    echo ========================================================
) else (
    color 0C
    echo ========================================================
    echo  [ERROR] Sync failed at Google Cloud wrapper level.
    echo  [ত্রুটি] গুগোল ক্লাউড সিঙ্ক করতে সমস্যা হয়েছে।
    echo ========================================================
)

echo.
pause
exit /b %sync_err%
