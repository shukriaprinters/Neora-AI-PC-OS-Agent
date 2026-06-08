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

if (-not (Test-Path '.\neora_agent.py')) {
  throw 'neora_agent.py not found.'
}

python .\neora_agent.py
