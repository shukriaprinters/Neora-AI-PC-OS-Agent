@echo off
setlocal Enabledelayedexpansion
title Neora AI - Pull Google Cloud to Local PC
color 0B

echo ========================================================
echo               NEORA AI CLOUD SYNC SYSTEM
echo           [ GOOGLE CLOUD INGRESS -^> LOCAL PC ]
echo ========================================================
echo.

echo [WARNING] This will download all cloud modifications and overwrite standard files.
echo [সতর্কতা] এটি ক্লাউডের পরিবর্তনগুলো ডাউনলোড করে লোকাল ফাইলগুলো ওভাররাইট করবে।
echo.
set /p confirm=Do you want to proceed? / আপনি কি এগিয়ে যেতে চান? (Y/N): 
if /i "%confirm%" neq "y" (
    echo [INFO] Sync cancelled by user.
    pause
    exit /b 0
)

echo.
echo [1/3] Downloading workspace archive from Google Cloud...
set CLOUD_URL=https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app
set ZIP_FILE=neora_cloud_workspace.zip

powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%CLOUD_URL%/api/sync/download' -OutFile '%ZIP_FILE%' -TimeoutSec 150; Write-Host '[SUCCESS] Download complete.'; } catch { Write-Error $_.Exception.Message; exit 1; }"
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Failed to download cloud workspace archive.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Extracting and updating local workspace...
:: Extraction through powershell
powershell -Command "try { Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '.' -Force; Write-Host '[SUCCESS] Extraction complete.'; } catch { Write-Error $_.Exception.Message; exit 1; }"
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Extraction failed. Make sure you are running the terminal in your workspace root directory.
    echo.
    if exist %ZIP_FILE% del /f /q %ZIP_FILE%
    pause
    exit /b 1
)

echo.
echo [3/3] Cleaning up temporary archive file...
if exist %ZIP_FILE% del /f /q %ZIP_FILE%
echo [SUCCESS] Cleanup finished.

echo.
color 0A
echo ========================================================
echo  [SUCCESS] Local PC updated from Google Cloud workspace!
echo  [সাফল্য] আপনার লোকাল পিসি ক্লাউডের সাথে সফলভাবে আপ-টু-ডেট হয়েছে!
echo ========================================================
echo.
pause
exit /b 0
