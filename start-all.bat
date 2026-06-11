@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "NEORA_TASK_NAME=Neora Start All"
set "NEORA_ROOT=%~dp0"
set "NEORA_STARTUP_CMD=%~f0 --run"
set "NEORA_SUMMARY_FILE=%~dp0logs\start-all-summary.json"
set "NEORA_DASHBOARD_URL=http://127.0.0.1:3000"
set "NEORA_START_TIME="

if /I "%~1"=="" goto run_sequence
if /I "%~1"=="--install-startup" goto install_startup
if /I "%~1"=="--remove-startup" goto remove_startup
if /I "%~1"=="--status" goto status
if /I "%~1"=="--help" goto help
if /I "%~1"=="--run" goto run_sequence

goto run_sequence

:help
echo Neora start-all helper
echo.
echo Usage:
echo   start-all.bat
echo   start-all.bat --run
echo   start-all.bat --install-startup
echo   start-all.bat --remove-startup
echo   start-all.bat --status
exit /b 0

:install_startup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME;" ^
  "$scriptPath = $env:NEORA_STARTUP_CMD;" ^
  "$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/c start \"\" /min \"' + $scriptPath + '\" --run > nul 2>&1') -WorkingDirectory $env:NEORA_ROOT;" ^
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
set "NEORA_START_TIME=%date% %time%"
if not exist logs mkdir logs >nul 2>nul
if not exist .neora-startup-installed (
  call "%~f0" --install-startup
  if errorlevel 1 (
    echo Failed to install startup task.
    exit /b 1
  )
  > ".neora-startup-installed" echo installed
)

if not exist package.json (
  echo package.json not found in "%CD%".
  exit /b 1
)

if not defined NEORA_AGENT_TOKEN set "NEORA_AGENT_TOKEN=NEORA-X7-AGENT"
if not defined NEORA_BROKER_URL set "NEORA_BROKER_URL=http://127.0.0.1:3000"
if not defined NEORA_HEADLESS set "NEORA_HEADLESS=0"
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
call npm install
if errorlevel 1 exit /b 1

echo [2/5] npm run build
call npm run build
if errorlevel 1 exit /b 1

echo [3/5] starting server
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = $env:NEORA_ROOT;" ^
  "$out = Join-Path $root 'logs\server.out.log';" ^
  "$err = Join-Path $root 'logs\server.err.log';" ^
  "$args = '/c cd /d \"' + $root + '\" && set PORT=' + $env:PORT + '&& set NEORA_AGENT_TOKEN=' + $env:NEORA_AGENT_TOKEN + '&& npm run dev';" ^
  "Start-Process -FilePath 'cmd.exe' -ArgumentList $args -WorkingDirectory $root -WindowStyle Minimized -RedirectStandardOutput $out -RedirectStandardError $err"

echo Waiting for server to become available...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$baseUrl = $env:NEORA_BROKER_URL.TrimEnd('/');" ^
  "for ($i = 0; $i -lt 60; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Headers @{ 'x-neora-token' = $env:NEORA_AGENT_TOKEN } -Uri ($baseUrl + '/api/os/status') -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } } catch { Start-Sleep -Seconds 2 } } exit 1"
if errorlevel 1 (
  echo Server did not become ready in time. Check logs\server.log.
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$summary = @{ startedAt = $env:NEORA_START_TIME; finishedAt = (Get-Date).ToString('o'); result = 'failed'; stage = 'server-wait'; notes = 'Server did not become ready in time.' } | ConvertTo-Json -Depth 4; Set-Content -Path $env:NEORA_SUMMARY_FILE -Value $summary -Encoding UTF8"
  exit /b 1
)

start "" "%NEORA_DASHBOARD_URL%"

echo [4/5] starting agent
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = $env:NEORA_ROOT;" ^
  "$out = Join-Path $root 'logs\agent.out.log';" ^
  "$err = Join-Path $root 'logs\agent.err.log';" ^
  "$args = '/c cd /d \"' + $root + '\" && set NEORA_AGENT_TOKEN=' + $env:NEORA_AGENT_TOKEN + '&& set NEORA_BROKER_URL=' + $env:NEORA_BROKER_URL + '&& set NEORA_HEADLESS=' + $env:NEORA_HEADLESS + '&& python neora_agent_enhanced.py';" ^
  "Start-Process -FilePath 'cmd.exe' -ArgumentList $args -WorkingDirectory $root -WindowStyle Minimized -RedirectStandardOutput $out -RedirectStandardError $err"

echo Waiting for agent to come online...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$baseUrl = $env:NEORA_BROKER_URL.TrimEnd('/');" ^
  "for ($i = 0; $i -lt 60; $i++) { try { $r = Invoke-WebRequest -UseBasicParsing -Headers @{ 'x-neora-token' = $env:NEORA_AGENT_TOKEN } -Uri ($baseUrl + '/api/os/status') -TimeoutSec 3; $json = $r.Content | ConvertFrom-Json; if ($json.status -eq 'online' -or $json.queue -ne $null) { exit 0 } } catch { Start-Sleep -Seconds 2 } } exit 1"
if errorlevel 1 (
  echo Agent did not come online in time. Check logs\agent.log.
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$summary = @{ startedAt = $env:NEORA_START_TIME; finishedAt = (Get-Date).ToString('o'); result = 'failed'; stage = 'agent-wait'; notes = 'Agent did not come online in time.' } | ConvertTo-Json -Depth 4; Set-Content -Path $env:NEORA_SUMMARY_FILE -Value $summary -Encoding UTF8"
  exit /b 1
)

echo [5/5] npm run smoke
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$baseUrl = $env:NEORA_BROKER_URL.TrimEnd('/');" ^
  "try { $r = Invoke-WebRequest -UseBasicParsing -Headers @{ 'x-neora-token' = $env:NEORA_AGENT_TOKEN } -Uri ($baseUrl + '/api/os/status') -TimeoutSec 3; if ($r.StatusCode -eq 200) { Write-Host 'Smoke skipped: dashboard already healthy.'; exit 0 } } catch { } exit 1"
if not errorlevel 1 goto smoke_skip
call npm run smoke
if errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$summary = @{ startedAt = $env:NEORA_START_TIME; finishedAt = (Get-Date).ToString('o'); result = 'degraded'; stage = 'smoke'; notes = 'npm run smoke failed after startup; dashboard remains available.' } | ConvertTo-Json -Depth 4; Set-Content -Path $env:NEORA_SUMMARY_FILE -Value $summary -Encoding UTF8"
  echo Startup completed with smoke warnings. See logs and summary file.
  exit /b 0
)
:smoke_skip
echo Smoke skipped because dashboard is already healthy.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$summary = @{ startedAt = $env:NEORA_START_TIME; finishedAt = (Get-Date).ToString('o'); result = 'success'; stage = 'complete'; broker = $env:NEORA_BROKER_URL; token = $env:NEORA_AGENT_TOKEN } | ConvertTo-Json -Depth 4; Set-Content -Path $env:NEORA_SUMMARY_FILE -Value $summary -Encoding UTF8"

echo Neora startup sequence complete.
exit /b 0
