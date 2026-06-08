$ErrorActionPreference = 'Stop'

$checks = @(
  @{ Name = 'Server'; Match = 'tsx server.ts' },
  @{ Name = 'Agent'; Match = 'neora_agent.py' }
)

foreach ($check in $checks) {
  $proc = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and $_.CommandLine -like "*$($check.Match)*"
  } | Select-Object -First 1

  if ($proc) {
    Write-Host "$($check.Name): running (PID $($proc.ProcessId))"
  } else {
    Write-Host "$($check.Name): not running"
  }
}

Write-Host "Logs: .\logs\server.out.log, .\logs\server.err.log, .\logs\agent.out.log, .\logs\agent.err.log"
