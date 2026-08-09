# Cloudflare Tunnel launcher for cloud-based-banking
# Starts backend + frontend and exposes the frontend via a secure HTTPS tunnel.
# The tunnel URL is written back into backend\.env so CORS / email links work.

param(
  [string]$Port = "5173",
  [string]$BackendPort = "5000"
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$envFile = Join-Path $backend ".env"
$logDir = Join-Path $root ".tunnel"
$cloudflaredOut = Join-Path $logDir "cloudflared.out.log"
$cloudflaredErr = Join-Path $logDir "cloudflared.err.log"
$backendOut = Join-Path $logDir "backend.out.log"
$backendErr = Join-Path $logDir "backend.err.log"
$frontendOut = Join-Path $logDir "frontend.out.log"
$frontendErr = Join-Path $logDir "frontend.err.log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Get-CloudflaredPath {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $fallback = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
  if (Test-Path $fallback) { return $fallback }
  throw "cloudflared not found. Install it with: winget install Cloudflare.cloudflared"
}

function Set-EnvValue {
  param([string]$Key, [string]$Value)
  $content = Get-Content -Raw -LiteralPath $envFile
  $pattern = "(?m)^${Key}=.*$"
  $replacement = "${Key}='${Value}'"
  if ($content -match $pattern) {
    $content = [regex]::Replace($content, $pattern, { param($m) $replacement })
  } else {
    $content = $content.TrimEnd() + "`r`n" + $replacement
  }
  Set-Content -LiteralPath $envFile -Value $content -NoNewline
}

$cloudflared = Get-CloudflaredPath
Write-Host "Using cloudflared: $cloudflared"
Write-Host "Starting Cloudflare Tunnel -> http://localhost:$Port ..."
Write-Host ""

# 1. Start cloudflared quick tunnel
$tunnel = Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--url", "http://localhost:$Port", "--no-autoupdate" `
  -RedirectStandardOutput $cloudflaredOut -RedirectStandardError $cloudflaredErr -PassThru -WindowStyle Hidden

# 2. Wait for the tunnel URL
$tunnelUrl = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  if ($tunnel.HasExited) {
    Write-Host "cloudflared exited unexpectedly. See $cloudflaredErr" -ForegroundColor Red
    Get-Content -LiteralPath $cloudflaredErr
    exit 1
  }
  $m = Select-String -LiteralPath $cloudflaredOut, $cloudflaredErr -Pattern "https://[\w-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue | Select-Object -Last 1
  if ($m) {
    $tunnelUrl = $m.Matches[0].Value
    break
  }
}

if (-not $tunnelUrl) {
  Write-Host "Timed out waiting for tunnel URL. See $cloudflaredOut / $cloudflaredErr" -ForegroundColor Red
  Stop-Process -Id $tunnel.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "Tunnel URL: $tunnelUrl" -ForegroundColor Green

# 3. Inject tunnel origin into backend .env (CORS + email links), keeping local origins
$localOrigins = (Select-String -LiteralPath $envFile -Pattern "^CORS_ORIGINS='([^']*)'" -ErrorAction SilentlyContinue |
  ForEach-Object { $_.Matches[0].Groups[1].Value }) -join ","
$origins = if ($localOrigins -and $localOrigins -notlike "*$tunnelUrl*") { "$localOrigins,$tunnelUrl" } else { $tunnelUrl }
Set-EnvValue "CORS_ORIGINS" $origins
Set-EnvValue "FRONTEND_URL" $tunnelUrl
Write-Host "Updated backend\.env (CORS_ORIGINS=$origins / FRONTEND_URL=$tunnelUrl)"

# 4. Start backend
Write-Host "Starting backend on port $BackendPort ..."
$inUse = Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
  Write-Host "Port $BackendPort is already in use. Kill the stale process and re-run." -ForegroundColor Red
  & taskkill.exe /PID $tunnel.Id /T /F 2>$null | Out-Null
  exit 1
}
$be = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backend `
  -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr -PassThru -WindowStyle Hidden
Write-Host "  backend pid $($be.Id)"

# 5. Start frontend
Write-Host "Starting frontend dev server ..."
$inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
  Write-Host "Port $Port is already in use. Kill the stale process and re-run." -ForegroundColor Red
  & taskkill.exe /PID $be.Id /T /F 2>$null | Out-Null
  & taskkill.exe /PID $tunnel.Id /T /F 2>$null | Out-Null
  exit 1
}
$fe = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $frontend `
  -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr -PassThru -WindowStyle Hidden
Write-Host "  frontend pid $($fe.Id)"

# Wait until both are reachable
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 500
  $beUp = Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue
  $feUp = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if ($beUp -and $feUp) { break }
}
Write-Host ""

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  Secure app URL:  $tunnelUrl" -ForegroundColor Cyan
Write-Host "  Local app URL:   http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop all processes and the tunnel." -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan

try {
  Wait-Process -Id $tunnel.Id -Timeout 2147483647 -ErrorAction Stop
} catch {
  # Ctrl+C
} finally {
  Write-Host ""
  Write-Host "Shutting down ..."
  foreach ($p in @($be, $fe, $tunnel)) {
    if ($p) {
      & taskkill.exe /PID $p.Id /T /F 2>$null | Out-Null
    }
  }
  Write-Host "Done. Logs in $logDir"}
