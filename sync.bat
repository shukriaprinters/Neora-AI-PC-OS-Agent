@echo off
setlocal Enabledelayedexpansion
title Neora AI - Unified Cloud and Git Synchronizer
color 0B

:menu
cls
echo ========================================================
echo                 NEORA AI UNIFIED SYNCHRONIZER
echo              [ LOCAL WORKSPACE ^<--^> CLOUD ^& GIT ]
echo ========================================================
echo.
echo Please choose a synchronization command:
echo অনুগ্রহ করে একটি সিনক্রোনাইজেশন কমান্ড বেছে নিন:
echo.
echo  [1] Git Sync: Add, Commit, Pull and Push to GitHub
echo      গিট সিঙ্ক: গিটহাবে লোকাল পরিবর্তন গিট পুশ করা
echo  [2] GCloud Auth: Login to Google Cloud Platform
echo      জিক্লাউড লগইন: গুগল ক্লাউড প্ল্যাটফর্ম অথেন্টিকেশন
echo  [3] GCloud Project: Configure Google Cloud Active Project
echo      প্রজেক্ট কনফিগার: জিক্লাউড সক্রিয় প্রজেক্ট আইডি সেট করা
echo  [4] GCloud Cloud Run: Build ^& Deploy Container to Cloud Run
echo      ক্লাউড রান ডিপ্লয়: গুগল ক্লাউড রান সার্ভিসে ডিপ্লয় করা
echo  [5] Git to PC: Hard pull remote repository code
echo      রিমোট থেকে পিসিতে কোড জোরপূর্বক নিয়ে আসা
echo  [6] Exit / বন্ধ করুন
echo.
set /p opt=Choose option / অপশন নম্বর চাপুন (1-6): 

if "%opt%"=="1" goto gitsync
if "%opt%"=="2" goto gcloudauth
if "%opt%"=="3" goto gcloudproj
if "%opt%"=="4" goto gcloudeploy
if "%opt%"=="5" goto gitpull
if "%opt%"=="6" goto end
goto menu

:gitsync
cls
echo ========================================================
echo        [GIT SYNC] LOCAL WORKSPACE --^> GITHUB
echo ========================================================
echo.
git rev-parse --is-inside-work-tree >nul 2>&1
if !ERRORLEVEL! neq 0 (
    color 0C
    echo [ERROR] Current directory is not initialized as a git repository!
    echo [ত্রুটি] এটি কোনো গিট রিপোজিটরি নয়!
    pause
    goto menu
)

echo [INFO] Stashing non-committed assets temporarily...
git stash

echo [INFO] Fetching and merging remote main branch updates...
git pull origin main

echo [INFO] Restoring stashed edits...
git stash pop

echo.
set /p commit_msg=Enter commit message / কমিট মেসেজ লিখুন (Default: 'Update Neora Workspace'): 
if "%commit_msg%"==" " set commit_msg=Update Neora Workspace
if "%commit_msg%"=="" set commit_msg=Update Neora Workspace

echo [INFO] Indexing files...
git add .

echo [INFO] Committing changes...
git commit -m "%commit_msg%"

echo [INFO] Transferring updates to GitHub Repo...
git push origin main
if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Git Sync finished successfully!
    echo [সাফল্য] গিট সিঙ্ক সফলভাবে সম্পন্ন হয়েছে!
) else (
    color 0C
    echo.
    echo [ERROR] Push failed. Please check your network or credentials.
    echo [ত্রুটি] পুশ ব্যর্থ হয়েছে। দয়া করে গিটহাব কানেকশন চেক করুন।
)
pause
goto menu

:gcloudauth
cls
echo ========================================================
echo        [GCLOUD AUTH] GOOGLE CLOUD LOGIN
echo ========================================================
echo.
echo Initiating browser authentication via GCloud CLI...
echo ব্রাউজার অথেন্টিকেশন শুরু হচ্ছে...
gcloud auth login
if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Successfully authenticated with GCP!
    echo [সাফল্য] গুগল ক্লাউডের সাথে সফলভাবে কানেক্ট হয়েছে!
) else (
    color 0C
    echo.
    echo [ERROR] Authentication aborted or failed.
    echo [ত্রুটি] জীবনবৃত্তান্ত বা অথেন্টিকেশন ব্যর্থ হয়েছে।
)
pause
goto menu

:gcloudproj
cls
echo ========================================================
echo        [GCLOUD PROJECT] CONFIGURE TARGET PROJECT
echo ========================================================
echo.
set /p proj_id=Enter Google Cloud Project ID / প্রজেক্ট আইডি লিখুন: 
if "%proj_id%"=="" (
    echo [ERROR] Project ID cannot be empty!
    pause
    goto menu
)
echo.
echo [INFO] Linking gcloud workspace context with project '%proj_id%'...
gcloud config set project %proj_id%
if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Active project set to '%proj_id%'!
    echo [সাফল্য] সক্রিয় প্রজেক্ট সেট করা হয়েছে!
) else (
    color 0C
    echo.
    echo [ERROR] Failed to switch project. Verify the project ID exists and you have privileges.
)
pause
goto menu

:gcloudeploy
cls
echo ========================================================
echo        [GCLOUD DEPLOY] DEPLOY CONTAINER TO CLOUD RUN
echo ========================================================
echo.
set /p svc_name=Enter Cloud Run Service Name / সার্ভিস নাম লিখুন (Default: 'neora-agent'): 
if "%svc_name%"=="" set svc_name=neora-agent

echo.
set /p region_val=Enter Google Cloud Region / রিজিয়ন কোড লিখুন (Default: 'us-central1'): 
if "%region_val%"=="" set region_val=us-central1

echo [INFO] Preparing gcloud source-code upload build...
gcloud run deploy %svc_name% --source . --region %region_val% --allow-unauthenticated
if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Container built and deployed successfully on Cloud Run!
) else (
    color 0C
    echo.
    echo [ERROR] Build or routing deployment terminated with errors.
)
pause
goto menu

:gitpull
cls
echo ========================================================
echo        [GIT TO PC] HARD REFLUSH FROM REMOTES
echo ========================================================
echo.
echo [WARNING] This will discard uncommitted local modifications!
echo [সতর্কবার্তা] এর ফলে সেভ না করা লোকাল ফাইল ডিসকার্ড হতে পারে!
set /p confirm=Type 'YES' to proceed / 'YES' লিখে এগিয়ে যান: 
if /i "%confirm%" neq "YES" (
    echo Pull cancelled / বাতিল করা হয়েছে।
    pause
    goto menu
)
echo.
echo [INFO] Hard fetching origin updates...
git fetch --all
git reset --hard origin/main
if %ERRORLEVEL% equ 0 (
    color 0A
    echo.
    echo [SUCCESS] Your PC workspace is now perfectly mirroring GitHub main branch.
) else (
    color 0C
    echo.
    echo [ERROR] Force pull failed.
)
pause
goto menu

:end
cls
color 07
echo Sync tool closed. Goodbye!
echo সিনক্রোনাইজেশন টুল বন্ধ করা হয়েছে। খোদা হাফেজ!
exit /b 0
