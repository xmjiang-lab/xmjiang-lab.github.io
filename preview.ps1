# ─────────────────────────────────────────────────────────
# Start Jiang Lab @ SISU — local preview
# Usage:  Right-click → Run with PowerShell    OR    .\preview.ps1
# ─────────────────────────────────────────────────────────

# Go to repo root (works no matter where script is invoked from)
Set-Location $PSScriptRoot

$Port = 4000

# Launch HTTP server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; python -m http.server $Port"

# Give the server a beat to bind
Start-Sleep -Seconds 2

# Open Edge (fall back to default browser if Edge isn't where expected)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (Test-Path $edge) {
    Start-Process $edge "http://localhost:$Port/"
} else {
    Start-Process "http://localhost:$Port/"
}

Write-Host ""
Write-Host "Jiang Lab @ SISU running at http://localhost:$Port/" -ForegroundColor Green
Write-Host "Server window is the other PowerShell. Close it, or press Ctrl+C inside it, to stop." -ForegroundColor Yellow
