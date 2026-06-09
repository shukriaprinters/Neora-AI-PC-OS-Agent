@echo off
setlocal Enabledelayedexpansion
title Neora AI - Local to GitHub Push Sync
color 0B

echo ========================================================
echo                 NEORA AI PUSH SYNC 
echo              [ LOCAL PC -^> GITHUB REPO ]
echo ========================================================
echo.

echo [INFO] Configuring remote origin secure URL...
git remote set-url origin git@github-shukria:shukriaprinters/Neora-AI-PC-OS-Agent.git

:: Check if git is initialized
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] This directory is not a Git repository!
    echo [দুঃখিত] এটি কোনো গিট রিপোজিটরি নয়!
    echo.
    pause
    exit /b 1
)

echo [INFO] Checking workspace status...
git status -s
echo.

set /p commit_msg=Enter commit message / কমিট মেসেজ লিখুন (Default: 'Update Neora AI'): 
if "%commit_msg%"=="" set commit_msg=Update Neora AI

echo.
echo [INFO] Adding files to Git index...
git add .

echo [INFO] Committing local modifications...
git commit -m "%commit_msg%" >nul 2>&1

echo.
echo [INFO] Pushing changes to GitHub main branch...
git push origin main
set push_err=%ERRORLEVEL%

echo.
if %push_err% equ 0 (
    color 0A
    echo ========================================================
    echo  [SUCCESS] Local modifications pushed to GitHub successfully!
    echo  [সাফল্য] আপনার লোকাল পরিবর্তনগুলো গিটহাবে সফলভাবে আপলোড হয়েছে!
    echo ========================================================
) else (
    color 0C
    echo ========================================================
    echo  [ERROR] Push failed. Please check your SSH keys or Internet setup.
    echo  [ত্রুটি] গিটহাবে আপলোড ব্যর্থ হয়েছে। দয়া করে SSH কী অথবা ইন্টারনেট কানেকশন চেক করুন।
    echo ========================================================
    echo.
    echo Suggestions / সমাধান পদ্ধতি:
    echo 1. If there are new changes on GitHub, you must run "git to pc.bat" first!
    echo    (গিটহাবে নতুন কোনো পরিবর্তন থাকলে প্রথমে "git to pc.bat" রান করুন!)
    echo 2. Verify your SSH connection: "ssh -T git@github-shukria"
    echo    (আপনার SSH কানেকশন চেক করুন!)
)

echo.
pause
exit /b %push_err%