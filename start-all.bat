@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "NEORA_TASK_NAME=Neora Start All"
set "NEORA_STARTUP_CMD=%~f0 --run"

if /I "%~1"=="--install-startup" goto install_startup
if /I "%~1"=="--remove-startup" goto remove_startup
if /I "%~1"=="--run" goto run_sequence
if /I "%~1"=="--status" goto status

echo Neora start-all helper
echo.
echo Usage:
echo   start-all.bat --run
echo   start-all.bat --install-startup
echo   start-all.bat --remove-startup
echo   start-all.bat --status
exit /b 0

:install_startup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME; $command = 'cmd.exe /c start \"Neora Start All\" /min \"' + $env:NEORA_STARTUP_CMD + '\"';" ^
  "$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/c start \"Neora Start All\" /min \"' + $env:NEORA_STARTUP_CMD + '\"');" ^
  "$trigger = New-ScheduledTaskTrigger -AtLogOn;" ^
  "$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel LeastPrivilege;" ^
  "$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew;" ^
  "Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null; Write-Host ('Installed scheduled task: ' + $taskName)"
exit /b %ERRORLEVEL%

:remove_startup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME;" ^
  "if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false; Write-Host ('Removed scheduled task: ' + $taskName) } else { Write-Host ('Scheduled task not found: ' + $taskName) }"
exit /b %ERRORLEVEL%

:status
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME;" ^
  "if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) { Get-ScheduledTask -TaskName $taskName | Select-Object TaskName,State,Date,Author | Format-List } else { Write-Host ('Scheduled task not found: ' + $taskName) }"
exit /b 0

:run_sequence
if not exist package.json (
  echo package.json not found.
  exit /b 1
)

if not defined NEORA_AGENT_TOKEN set "NEORA_AGENT_TOKEN=NEORA-X7-AGENT"
if not defined NEORA_BROKER_URL set "NEORA_BROKER_URL=http://127.0.0.1:3000"
if not defined NEORA_HEADLESS set "NEORA_HEADLESS=1"
if not defined PORT set "PORT=3000"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm not found on PATH.
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo python not found on PATH.
  exit /b 1
)

echo [1/5] npm install
npm install
if errorlevel 1 exit /b 1

echo [2/5] npm run build
npm run build
if errorlevel 1 exit /b 1

echo [3/5] starting server
start "Neora Server" /min cmd /c "set PORT=%PORT%&& set NEORA_AGENT_TOKEN=%NEORA_AGENT_TOKEN%&& npm run dev"

echo Waiting for server to become available...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$baseUrl = $env:NEORA_BROKER_URL.TrimEnd('/');" ^
  "for ($i = 0; $i -lt 40; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Headers @{ 'x-neora-token' = $env:NEORA_AGENT_TOKEN } -Uri ($baseUrl + '/api/os/status') -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } } catch { Start-Sleep -Seconds 2 } } exit 1"
if errorlevel 1 (
  echo Server did not become ready in time.
  exit /b 1
)

echo [4/5] starting agent
start "Neora Agent" /min cmd /c "set NEORA_AGENT_TOKEN=%NEORA_AGENT_TOKEN%&& set NEORA_BROKER_URL=%NEORA_BROKER_URL%&& set NEORA_HEADLESS=%NEORA_HEADLESS%&& python neora_agent.py"

echo Waiting for agent to come online...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$baseUrl = $env:NEORA_BROKER_URL.TrimEnd('/');" ^
  "for ($i = 0; $i -lt 45; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Headers @{ 'x-neora-token' = $env:NEORA_AGENT_TOKEN } -Uri ($baseUrl + '/api/os/status') -TimeoutSec 3; $json = $r.Content | ConvertFrom-Json; if ($json.status -eq 'online' -or $json.queue -ne $null) { exit 0 } } catch { Start-Sleep -Seconds 2 } } exit 1"
if errorlevel 1 (
  echo Agent did not come online in time.
  exit /b 1
)

echo [5/5] npm run smoke
npm run smoke
if errorlevel 1 exit /b 1

echo Neora startup sequence complete.
exit /b 0
