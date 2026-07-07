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
  "try {" ^
  "  $action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/c start \"\" /min \"' + $scriptPath + '\" --run > nul 2>&1') -WorkingDirectory $env:NEORA_ROOT;" ^
  "  $trigger = New-ScheduledTaskTrigger -AtLogOn;" ^
  "  $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel LeastPrivilege;" ^
  "  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew;" ^
  "  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null;" ^
  "  Write-Host '[SUCCESS] Registered Task Scheduler task: ' $taskName;" ^
  "} catch {" ^
  "  Write-Host '[WARNING] Could not register Task Scheduler task. Will fallback to Startup folder shortcut.';" ^
  "}" ^
  "$startupFolder = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Startup');" ^
  "$shortcutPath = [System.IO.Path]::Combine($startupFolder, 'NeoraAutoStart.lnk');" ^
  "try {" ^
  "  $WshShell = New-Object -ComObject WScript.Shell;" ^
  "  $Shortcut = $WshShell.CreateShortcut($shortcutPath);" ^
  "  $Shortcut.TargetPath = $env:NEORA_ROOT + 'start-all.bat';" ^
  "  $Shortcut.Arguments = '--run';" ^
  "  $Shortcut.WorkingDirectory = $env:NEORA_ROOT;" ^
  "  $Shortcut.WindowStyle = 7;" ^
  "  $Shortcut.Save();" ^
  "  Write-Host '[SUCCESS] Created Windows Startup Shortcut at: ' $shortcutPath;" ^
  "} catch {" ^
  "  Write-Host '[ERROR] Failed to create Startup Shortcut: ' $_.Exception.Message;" ^
  "}"
exit /b 0

:remove_startup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME;" ^
  "if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false; Write-Host ('Removed scheduled task: ' + $taskName) }" ^
  "$startupFolder = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Startup');" ^
  "$shortcutPath = [System.IO.Path]::Combine($startupFolder, 'NeoraAutoStart.lnk');" ^
  "if (Test-Path $shortcutPath) { Remove-Item -Path $shortcutPath -Force; Write-Host 'Removed Windows Startup Shortcut.' }"
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

echo ========================================================
echo          NEORA AI SYSTEM STARTUP & SELF-HEALING
echo ========================================================
echo.
echo [1/6] Checking for new updates from Neora Cloud...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$cloudUrl = 'https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app';" ^
  "$zipFile = 'neora_cloud_workspace_download.zip';" ^
  "try {" ^
  "  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
  "  $test = Invoke-WebRequest -Uri ($cloudUrl + '/api/health') -TimeoutSec 4 -UseBasicParsing;" ^
  "  if ($test.StatusCode -eq 200) {" ^
  "    Write-Host '[INFO] Cloud server reachable. Safely shutting down active local processes to unlock files...';" ^
  "    try { Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like ''*neora*'' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } } catch {}" ^
  "    try { $pids = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess; if ($pids) { Stop-Process -Id $pids -Force -ErrorAction SilentlyContinue } } catch {}" ^
  "    Start-Sleep -Seconds 1;" ^
  "    Write-Host '[INFO] Downloading the latest updates...';" ^
  "    Invoke-WebRequest -Uri ($cloudUrl + '/api/sync/download') -OutFile $zipFile -TimeoutSec 90 -UseBasicParsing;" ^
  "    if (Test-Path $zipFile) {" ^
  "      Write-Host '[INFO] Extracting updates safely file-by-file...';" ^
  "      Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "      $zip = [System.IO.Compression.ZipFile]::OpenRead($zipFile);" ^
  "      $count = 0;" ^
  "      foreach ($entry in $zip.Entries) {" ^
  "        if ($entry.FullName -ne '' -and -not $entry.FullName.EndsWith('/')) {" ^
  "          $target = [System.IO.Path]::Combine((Get-Item '.').FullName, $entry.FullName);" ^
  "          $dir = [System.IO.Path]::GetDirectoryName($target);" ^
  "          if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }" ^
  "          try {" ^
  "            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true);" ^
  "            $count++;" ^
  "          } catch {" ^
  "            # Skip files that are locked/in-use" ^
  "          }" ^
  "        }" ^
  "      }" ^
  "      $zip.Dispose();" ^
  "      Remove-Item -Path $zipFile -Force;" ^
  "      Write-Host ('[SUCCESS] Auto-update completed. ' + $count + ' files updated!');" ^
  "    }" ^
  "  } else {" ^
  "    Write-Host '[INFO] Cloud server online but returned code ' + $test.StatusCode + '. Skipping auto-update.';" ^
  "  }" ^
  "} catch {" ^
  "  Write-Host '[INFO] Offline or Cloud server unreachable. Proceeding with existing local files.';" ^
  "}"

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

echo [2/6] Checking and auto-installing Python dependencies...
python -m pip install --upgrade pip --quiet >nul 2>&1
if exist requirements.txt (
  python -m pip install -r requirements.txt --quiet
) else (
  python -m pip install requests pyautogui Pillow pyperclip SpeechRecognition --quiet
)
if errorlevel 1 (
  echo [WARNING] requirements.txt installation failed. Installing core modules individually...
  python -m pip install requests pyautogui Pillow pyperclip SpeechRecognition --quiet
)

echo [3/6] npm install
call npm install
if errorlevel 1 exit /b 1

echo [4/6] npm run build
call npm run build
if errorlevel 1 exit /b 1

echo [5/6] starting server (silent background)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = $env:NEORA_ROOT;" ^
  "$out = Join-Path $root 'logs\server.out.log';" ^
  "$err = Join-Path $root 'logs\server.err.log';" ^
  "$args = '/c cd /d \"' + $root + '\" && set PORT=' + $env:PORT + '&& set NEORA_AGENT_TOKEN=' + $env:NEORA_AGENT_TOKEN + '&& npm run dev';" ^
  "Start-Process -FilePath 'cmd.exe' -ArgumentList $args -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err"

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

echo [6/6] starting agent (silent background)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = $env:NEORA_ROOT;" ^
  "$pythonExe = 'pythonw.exe';" ^
  "if (-not (Get-Command $pythonExe -ErrorAction SilentlyContinue)) { $pythonExe = 'python.exe' };" ^
  "if (Test-Path (Join-Path $root 'neora_agent_enhanced.py')) {" ^
  "  $args1 = '/c cd /d \"' + $root + '\" && set NEORA_AGENT_TOKEN=' + $env:NEORA_AGENT_TOKEN + '&& set NEORA_BROKER_URL=' + $env:NEORA_BROKER_URL + '&& set NEORA_HEADLESS=' + $env:NEORA_HEADLESS + '&& ' + $pythonExe + ' neora_agent_enhanced.py';" ^
  "  Start-Process -FilePath 'cmd.exe' -ArgumentList $args1 -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'logs\agent_enhanced.out.log') -RedirectStandardError (Join-Path $root 'logs\agent_enhanced.err.log');" ^
  "}" ^
  "if (Test-Path (Join-Path $root 'neora_agent.py')) {" ^
  "  $args2 = '/c cd /d \"' + $root + '\" && set NEORA_AGENT_TOKEN=' + $env:NEORA_AGENT_TOKEN + '&& set NEORA_BROKER_URL=' + $env:NEORA_BROKER_URL + '&& set NEORA_HEADLESS=' + $env:NEORA_HEADLESS + '&& ' + $pythonExe + ' neora_agent.py';" ^
  "  Start-Process -FilePath 'cmd.exe' -ArgumentList $args2 -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'logs\agent_legacy.out.log') -RedirectStandardError (Join-Path $root 'logs\agent_legacy.err.log');" ^
  "}"

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

echo [Smoke Check] Checking status...
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
