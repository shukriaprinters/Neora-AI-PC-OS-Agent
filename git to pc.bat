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

:: Check if git is initialized & remote works
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] This directory is not a Git repository!
    echo [সাফল্য] এটি একটি গিট রিপোজিটরি নয়!
    echo.
    pause
    exit /b 1
)

:: Check for unresolved merge conflicts (unmerged files)
git diff --name-only --diff-filter=U | findstr /R "." >nul
if %ERRORLEVEL% equ 0 (
    goto handle_conflicts
)

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
    echo.
    pause
    exit /b 0
) else (
    echo ========================================================
    echo  [WARNING] Standard Sync Encountered Issues/Conflicts.
    echo  [সতর্কবার্তা] স্ট্যান্ডার্ড সিঙ্ক করতে গিয়ে সমস্যা/কনফ্লিক্ট হয়েছে।
    echo ========================================================
    goto handle_conflicts
)

:handle_conflicts
cls
color 0C
echo ========================================================
echo          [CONFLICT DETECTED / কনফ্লিক্ট সনাক্ত হয়েছে]
echo     Unresolved merge conflicts found in your workspace.
echo    লোকাল কম্পিউটারে পূর্বের কোনো মার্জ কনফ্লিক্ট অবশিষ্টাংশ রয়েছে।
echo ========================================================
echo.
echo Conflicted non-merged files (কনফ্লিক্ট হওয়া ফাইলসমূহ):
echo --------------------------------------------------------
git diff --name-only --diff-filter=U
echo --------------------------------------------------------
echo.
echo Selection Menu (সমাধানের জন্য অপশন নির্বাচন করুন):
echo.
echo [1] Discard local changes and FORCE SYNC to GitHub (Recommended/Safest)
echo     লোকাল পরিবর্তনগুলো বাতিল করে গিটহাবের আপডেট জোরপূর্বক নিয়ে আসুন (প্রস্তাবিত)
echo.
echo [2] Keep GitHub version of the conflicted files (GitHub Wins)
echo     কনফ্লিক্ট ফাইলের ক্ষেত্রে গিটহাবের ভার্সনটি রাখুন
echo.
echo [3] Keep your Local version of the conflicted files (Local Wins)
echo     কনফ্লিক্ট ফাইলের ক্ষেত্রে আপনার লোকাল পিসির পরিবর্তনটি রাখুন
echo.
echo [4] Abort current merge and reset index (Safe Cancel)
echo     চলমান মার্জ বাতিল করে রিসেট করুন
echo.
echo [5] Exit and resolve manually later
echo     এখনই কোনো পরিবর্তন না করে বের হয়ে যান
echo.
set /p choice=Select choice / অপশন নির্বাচন করুন [1-5]: 

if "%choice%"=="1" goto force_sync
if "%choice%"=="2" goto github_wins
if "%choice%"=="3" goto local_wins
if "%choice%"=="4" goto abort_merge
if "%choice%"=="5" goto end_script
goto handle_conflicts

:force_sync
echo.
echo [INFO] Aborting current merges...
git merge --abort >nul 2>&1
git rebase --abort >nul 2>&1
echo [INFO] Performing force reset to origin/main...
git fetch origin main
git reset --hard origin/main
git clean -df
set sync_err=%ERRORLEVEL%
echo.
if %sync_err% equ 0 (
    color 0A
    echo ========================================================
    echo  [SUCCESS] Force Reset successful! Synced with GitHub.
    echo  [সাফল্য] গিটহাব থেকে সফলভাবে ফোর্স রিসেট ও সিঙ্ক সম্পন্ন হয়েছে!
    echo ========================================================
) else (
    echo ========================================================
    echo  [ERROR] Force Sync failed. Verify internet/SSH connection.
    echo  [ত্রুটি] ফোর্স সিঙ্ক ব্যর্থ হয়েছে। ইন্টারনেট বা SSH চেক করুন।
    echo ========================================================
)
pause
exit /b %sync_err%

:github_wins
echo.
echo [INFO] Checking out remote/theirs files for conflicts...
git checkout --theirs .
git add .
git commit -m "Auto-resolved conflicts: GitHub version preferred"
echo [INFO] Completing final merge pull...
git pull origin main
set sync_err=%ERRORLEVEL%
echo.
if %sync_err% equ 0 (
    color 0A
    echo ========================================================
    echo  [SUCCESS] Synced using GitHub remote version!
    echo  [সাফল্য] গিটহাবের ফাইলের সংস্করণ নিয়ে সিঙ্ক সম্পন্ন হয়েছে!
    echo ========================================================
) else (
    echo ========================================================
    echo  [ERROR] Sync failed.
    echo  [ত্রুটি] গিটহাব সংস্করণ দিয়ে সিঙ্কও ব্যর্থ হয়েছে।
    echo ========================================================
)
pause
exit /b %sync_err%

:local_wins
echo.
echo [INFO] Checking out local/ours files for conflicts...
git checkout --ours .
git add .
git commit -m "Auto-resolved conflicts: Local version preferred"
echo [INFO] Completing final pull...
git pull origin main
set sync_err=%ERRORLEVEL%
echo.
if %sync_err% equ 0 (
    color 0A
    echo ========================================================
    echo  [SUCCESS] Synced using Local version!
    echo  [সাফল্য] আপনার লোকাল পিসির সংস্করণ নিয়ে সিঙ্ক সম্পন্ন হয়েছে!
    echo ========================================================
) else (
    echo ========================================================
    echo  [ERROR] Sync failed.
    echo  [ত্রুটি] লোকাল সংস্করণ দিয়ে সিঙ্ক ব্যর্থ হয়েছে।
    echo ========================================================
)
pause
exit /b %sync_err%

:abort_merge
echo.
echo [INFO] Aborting current merge & rebase...
git merge --abort
git rebase --abort
git reset
echo ========================================================
echo  [INFO] Merge has been aborted. Local files are preserved.
echo  [তথ্য] চলতি মার্জ বাতিল করা হয়েছে। লোকাল ফাইলগুলো সংরক্ষিত আছে।
echo ========================================================
pause
exit /b 0

:end_script
echo.
echo [INFO] Exiting Neora Sync. No actions were performed.
echo [তথ্য] কোনো অ্যাকশন ছাড়াই প্রস্থান করা হচ্ছে।
pause
exit /b 0
