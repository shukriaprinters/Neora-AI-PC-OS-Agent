@echo off
setlocal Enabledelayedexpansion
title Neora AI - GitHub to PC Sync
color 0B

echo ========================================================
echo                 NEORA AI SYSTEM SYNC 
echo              [ GITHUB -^> LOCAL WORKSPACE ]
echo ========================================================
echo.
echo [INFO] Configuring remote origin secure URL...
git remote set-url origin git@github-shukria:shukriaprinters/Neora-AI-PC-OS-Agent.git

echo.
echo [INFO] Safeguarding runtime/data files to prevent conflicts...
echo [INFO] Stashing local changes temporarily...
git stash >nul 2>&1

echo.
echo [INFO] Fetching metadata and updates from GitHub repo...
git fetch origin main

echo.
echo [INFO] Pulling and merging newest updates to your local PC...
git pull origin main
set pull_status=%ERRORLEVEL%

echo.
echo [INFO] Re-applying local runtime modifications...
git stash pop >nul 2>&1

echo.
if %pull_status% equ 0 (
    echo ========================================================
    echo  [SUCCESS] Neora AI has been synced to your local PC!
    echo  [সাফল্য] আপনার লোকাল পিসিতে Neora AI সফলভাবে আপডেট হয়েছে!
    echo ========================================================
) else (
    echo ========================================================
    echo  [ERROR] Sync failed. Please check your SSH connection or conflicts.
    echo  [ত্রুটি] আপডেট ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট বা SSH চেক করুন।
    echo ========================================================
)

echo.
pause
