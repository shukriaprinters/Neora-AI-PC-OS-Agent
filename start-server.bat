@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo node_modules not found. Run npm install first.
  exit /b 1
)
npm run dev
