@echo off
title Neora AI Agent - Install Background Service
echo ============================================================
echo     Install Neora Agent as Windows Background Service
echo ============================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "AGENT_SCRIPT=%SCRIPT_DIR%neora_agent_enhanced.py"
set "PYTHON=python"

echo This will configure Neora Agent to:
echo   - Start automatically when Windows boots
echo   - Run silently in background
echo   - Listen for voice commands 24/7
echo.
echo Requirements:
echo   - Python installed and in PATH
echo   - pip install SpeechRecognition pyaudio pyautogui Pillow pyperclip
echo.

pause

echo.
echo Creating Windows Task Scheduler entry...
schtasks /create /tn "NeoraVoiceAgent" /tr "'%PYTHON%' '%AGENT_SCRIPT%'" /sc onlogon /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Neora Agent will start automatically at boot.
    echo ============================================================
    echo.
    echo To start it now, run:
    echo   python neora_agent_enhanced.py
    echo.
    echo To remove later, run:
    echo   schtasks /delete /tn "NeoraVoiceAgent" /f
) else (
    echo.
    echo FAILED to create scheduled task.
    echo Try running this script as Administrator.
)

pause
