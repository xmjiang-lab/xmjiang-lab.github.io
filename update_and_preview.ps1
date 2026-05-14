# Jiang Lab @ SISU - one-shot data sync + preview
# Usage:  Right-click -> Run with PowerShell
# Or in a terminal:  pwsh ./update_and_preview.ps1

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

# Detect Python: prefer PsychoPy bundle, fall back to system python.
$PYTHON = $null
$PsychoPy = "C:\Program Files\PsychoPy\python.exe"
if (Test-Path $PsychoPy) {
    $PYTHON = $PsychoPy
} else {
    $sys = Get-Command python -ErrorAction SilentlyContinue
    if ($sys) { $PYTHON = $sys.Source }
}
if (-not $PYTHON) {
    Write-Host "ERROR: no Python interpreter found." -ForegroundColor Red
    Write-Host "  Install Python 3 or PsychoPy, then re-run." -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Syncing ORCID -> site_data.xlsx -> assets/data/*.json" -ForegroundColor Yellow
Write-Host "      using $PYTHON" -ForegroundColor DarkGray
& $PYTHON scripts\fetch_orcid.py

Write-Host ""
Write-Host "JSON regenerated. Review with ``git diff`` and commit manually." -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] Starting local preview at http://127.0.0.1:4000/" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot'; & '$PYTHON' -m http.server 4000"
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:4000/"

Write-Host ""
Write-Host "Done." -ForegroundColor Green
