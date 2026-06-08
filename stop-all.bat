@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "NEORA_TASK_NAME=Neora Start All"

if /I "%~1"=="--remove-startup" goto remove_startup
if /I "%~1"=="--stop" goto stop_processes

echo Neora stop helper
echo.
echo Usage:
echo   stop-all.bat --stop
echo   stop-all.bat --remove-startup
exit /b 0

:remove_startup
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName = $env:NEORA_TASK_NAME;" ^
  "if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false; Write-Host ('Removed scheduled task: ' + $taskName) } else { Write-Host ('Scheduled task not found: ' + $taskName) }"
exit /b %ERRORLEVEL%

:stop_processes
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$patterns = @('npm run dev', 'server.ts', 'neora_agent.py', 'dist/server.cjs');" ^
  "$procs = Get-CimInstance Win32_Process | Where-Object { $cmd = $_.CommandLine; $cmd -and ($patterns | ForEach-Object { $cmd -like ('*' + $_ + '*') } | Where-Object { $_ } | Select-Object -First 1) };" ^
  "if (-not $procs) { Write-Host 'No Neora processes found.'; exit 0 }" ^
  "foreach ($proc in $procs) { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped PID ' + $proc.ProcessId + ': ' + $proc.Name) }"
exit /b %ERRORLEVEL%
