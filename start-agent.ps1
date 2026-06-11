$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not $env:NEORA_AGENT_TOKEN) {
  $env:NEORA_AGENT_TOKEN = 'NEORA-X7-AGENT'
}

if (-not $env:NEORA_HEADLESS) {
  $env:NEORA_HEADLESS = '1'
}

if (-not $env:NEORA_BROKER_URL) {
  $env:NEORA_BROKER_URL = 'http://127.0.0.1:3000'
}

$agentScript = '.\neora_agent.py'
if (Test-Path '.\neora_agent_enhanced.py') {
  $agentScript = '.\neora_agent_enhanced.py'
} elseif (-not (Test-Path '.\neora_agent.py')) {
  throw 'neora_agent.py not found.'
}

python $agentScript
