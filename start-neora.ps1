$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$logDir = Join-Path $PSScriptRoot 'logs'
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm not found in PATH.'
}

if (-not (Test-Path '.\node_modules')) {
  throw 'node_modules not found. Run npm install first.'
}

if (-not $env:NEORA_AGENT_TOKEN) {
  $env:NEORA_AGENT_TOKEN = 'NEORA-X7-AGENT'
}

if (-not $env:NEORA_HEADLESS) {
  $env:NEORA_HEADLESS = '0'
}

if (-not $env:NEORA_BROKER_URL) {
  $env:NEORA_BROKER_URL = 'http://127.0.0.1:3000'
}

$serverOut = Join-Path $logDir 'server.out.log'
$serverErr = Join-Path $logDir 'server.err.log'
$agentOut = Join-Path $logDir 'agent.out.log'
$agentErr = Join-Path $logDir 'agent.err.log'

Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run dev' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput $serverOut -RedirectStandardError $serverErr | Out-Null
$agentScript = '.\neora_agent.py'
if (Test-Path '.\neora_agent_enhanced.py') {
  $agentScript = '.\neora_agent_enhanced.py'
}
Start-Process -FilePath 'python' -ArgumentList $agentScript -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput $agentOut -RedirectStandardError $agentErr | Out-Null

Write-Host 'Neora server and agent started.'
Write-Host "Server logs: $serverOut"
Write-Host "Agent logs:  $agentOut"
Write-Host 'Press Ctrl+C to stop this launcher; child processes continue running.'
