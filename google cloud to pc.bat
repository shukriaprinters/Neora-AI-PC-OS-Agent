@echo off
setlocal Enabledelayedexpansion
title Neora AI - Google Cloud Workspace to PC Sync
color 0B

echo ========================================================
echo               NEORA AI CLOUD SYNC SYSTEM
echo         [ GOOGLE CLOUD INSTANCE -^> LOCAL PC ]
echo ========================================================
echo.

echo [WARNING] This will download all cloud modifications and safely extract them over your local files.
echo [সতর্কতা] এটি ক্লাউডের সকল রিমোট পরিবর্তনগুলো ডাউনলোড করে লোকাল ফাইলগুলো আপডেট করবে।
echo.
set /p confirm=Do you want to proceed? / আপনি কি সিঙ্ক করতে চান? (Y/N): 
if /i "%confirm%" neq "y" (
    echo [INFO] Sync aborted by user.
    pause
    exit /b 0
)

echo.
echo [1/3] Downloading latest workspace archive from Google Cloud container...
set CLOUD_URL=https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app
set ZIP_FILE=neora_cloud_workspace_download.zip

powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%CLOUD_URL%/api/sync/download' -OutFile '%ZIP_FILE%' -TimeoutSec 180; Write-Host '[SUCCESS] Download complete.'; } catch { Write-Error $_.Exception.Message; exit 1; }"
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Failed to download cloud workspace zip archive.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Extracting archived modifications safely into local workspace...
powershell -Command "try { Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '.' -Force; Write-Host '[SUCCESS] Extraction complete.'; } catch { Write-Error $_.Exception.Message; exit 1; }"
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Extraction failed. Please close any open files or IDEs and try again.
    echo.
    if exist %ZIP_FILE% del /f /q %ZIP_FILE%
    pause
    exit /b 1
)

echo.
echo [3/3] Cleaning up temporary download files...
if exist %ZIP_FILE% del /f /q %ZIP_FILE%
echo [SUCCESS] Temporary zip removed.

echo.
color 0A
echo ========================================================
echo  [SUCCESS] Local PC fully updated from Google Cloud!
echo  [সাফল্য] আপনার লোকাল পিসি ক্লাউডের সাথে সফলভাবে আপ-টু-ডেট হয়েছে!
echo ========================================================
echo.
pause
exit /b 0
