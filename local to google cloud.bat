@echo off
setlocal Enabledelayedexpansion
title Neora AI - Local PC to Google Cloud Hyper Sync
color 0B

echo ========================================================
echo               NEORA AI CLOUD SYNC SYSTEM
echo          [ LOCAL COMP -^> GOOGLE CLOUD INSTANCE ]
echo ========================================================
echo.

:: Safe Git Index repair if any corruption is detected
set INDEX_PATH=.git\index
if exist %INDEX_PATH% (
    :: Run quick check
    git status >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        color 0E
        echo [WARNING] Corrupted local git index detected! Repairing index...
        echo [সতর্কতা] লোকাল গিট ইনডেক্স সমস্যাযুক্ত! ইনডেক্স মেরামত করা হচ্ছে...
        del /f /q %INDEX_PATH%
        git reset >nul 2>&1
        echo [SUCCESS] Git local index successfully rebuilt!
    )
)

:: Ensure inside git tree
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] This workspace is not a valid Git repository!
    echo [ত্রুটি] এটি কোনো সঠিক গিট রিপোজিটরি নয়!
    echo.
    pause
    exit /b 1
)

echo [INFO] Staging altered workspace files...
git add .

echo.
set /p commit_msg=Enter update notes / কী পরিবর্তন করেছেন লিখুন (Default: 'Update Neora AI'): 
if "%commit_msg%"=="" set commit_msg=Update Neora AI

echo.
echo [INFO] Creating safe checkpoint commit...
git commit -m "%commit_msg%" >nul 2>&1

echo.
echo [INFO] Upstream URL configured to: git@github-shukria:shukriaprinters/Neora-AI-PC-OS-Agent.git
git remote set-url origin git@github-shukria:shukriaprinters/Neora-AI-PC-OS-Agent.git >nul 2>&1

echo [INFO] Initiating instant safe push to GitHub 'main' branch...
git push origin main
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Git push failed! Please check:
    echo 1. Your internet connection.
    echo 2. Verify SSH key authorization.
    echo 3. If remote modifications exist, run "google cloud to pc.bat" first!
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Commits pushed to GitHub successfully!
echo.

:: Part 2: Trigger Google Cloud to pull from GitHub instantly using curl or Powershell
echo [INFO] Establishing secure request bridge to Google Cloud...
set CLOUD_URL=https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app

echo.
echo [INFO] Dispatched synchronization request to: %CLOUD_URL%/api/sync/pull
powershell -Command "try { $res = Invoke-RestMethod -Uri '%CLOUD_URL%/api/sync/pull' -Method Post -TimeoutSec 120; Write-Host '[CLOUD RESPONSE]' $res.message; } catch { Write-Error $_.Exception.Message; exit 1; }"
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
    echo  [ERROR] Sync trigger failed at Google Cloud server level.
    echo  [ত্রুটি] গুগোল ক্লাউড সিঙ্ক করতে সমস্যা হয়েছে।
    echo ========================================================
)

echo.
pause
exit /b %sync_err%
