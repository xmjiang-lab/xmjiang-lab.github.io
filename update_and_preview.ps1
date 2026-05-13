# Jiang Lab @ SISU — one-shot data sync + preview
# Usage:  Right-click → Run with PowerShell
# Or in a terminal:  pwsh ./update_and_preview.ps1

$ErrorActionPreference = "Stop"

# Adjust these two paths if your setup is different.
$REPO   = "E:\website\xmjiang-lab"
$PYTHON = "C:\Program Files\PsychoPy\python.exe"

Set-Location $REPO

Write-Host "[1/3] Syncing ORCID -> site_data.xlsx -> assets/data/*.json" -ForegroundColor Yellow
& $PYTHON scripts\fetch_orcid.py

Write-Host "`n[2/3] Committing & pushing to GitHub" -ForegroundColor Yellow
git add site_data.xlsx assets\data\publications.json assets\data\people.json `
        assets\data\mentorship.json assets\data\funders.json assets\data\projects.json
git diff --staged --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "Update site data ($(Get-Date -Format 'yyyy-MM-dd'))"
    git push
    Write-Host "  Pushed!" -ForegroundColor Green
} else {
    Write-Host "  No data changes to commit." -ForegroundColor Gray
}

Write-Host "`n[3/3] Starting local preview at http://127.0.0.1:4000/" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$REPO'; python -m http.server 4000"
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:4000/"

Write-Host "`nDone." -ForegroundColor Green
