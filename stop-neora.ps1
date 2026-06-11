$ErrorActionPreference = 'Stop'

$patterns = @(
  'tsx server.ts',
  'neora_agent'
)

$procs = Get-CimInstance Win32_Process | Where-Object {
  $cmd = $_.CommandLine
  $cmd -and ($patterns | ForEach-Object { $cmd -like "*$_*" } | Where-Object { $_ } | Select-Object -First 1)
}

if (-not $procs) {
  Write-Host 'No Neora processes found.'
  exit 0
}

foreach ($proc in $procs) {
  Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped PID $($proc.ProcessId): $($proc.Name)"
}
