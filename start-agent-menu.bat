@echo off
title Neora AI Agent - Enhanced Edition
echo ============================================================
echo            NEORA VOICE-OPERATED AGENT v2.0
echo ============================================================
echo.
echo [1] Start Enhanced Agent (Voice + Design Mode)
echo [2] Start Original Agent (Broker Mode)
echo [3] Exit
echo.
set /p choice="Select option (1-3): "

if "%choice%"=="1" goto enhanced
if "%choice%"=="2" goto original
if "%choice%"=="3" goto end
goto end

:enhanced
echo.
echo Starting Enhanced Agent...
echo VOICE COMMANDS TO TRY:
echo   - "open notepad"
echo   - "open chrome"
echo   - "design a banner for Shukria Printers"
echo   - "open illustrator and create a logo"
echo   - "take a screenshot"
echo.
python neora_agent_enhanced.py
goto end

:original
echo.
echo Starting Original Agent...
python neora_agent.py
goto end

:end
pause
