# Quick-start script to record demos (PowerShell version)
#
# Usage:
#   .\scripts\run-demo-recordings.ps1 [BASE_URL]
#
# Example:
#   .\scripts\run-demo-recordings.ps1 http://localhost:5173

param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "🎬 Firefly Demo Recording Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if app is running
Write-Host "🔍 Checking if app is running at $BaseUrl..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $BaseUrl -Method Head -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ App is reachable!" -ForegroundColor Green
} catch {
    Write-Host "❌ App is NOT running at $BaseUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the app first:" -ForegroundColor Yellow
    Write-Host "  cd firefly-fe && npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if Playwright is installed
Write-Host ""
Write-Host "🔍 Checking Playwright installation..." -ForegroundColor Yellow
if (!(Test-Path "node_modules\@playwright") -and !(Test-Path "node_modules\playwright")) {
    Write-Host "⚠️  Playwright not found. Installing..." -ForegroundColor Yellow
    npm install -D "@playwright/test"
    npx playwright install chromium
} else {
    Write-Host "✅ Playwright is installed!" -ForegroundColor Green
}

# Run the recording script
Write-Host ""
Write-Host "🎥 Recording demos..." -ForegroundColor Yellow
Write-Host ""

$env:BASE_URL = $BaseUrl
node scripts\record-demos.mjs

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All demos recorded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Recordings saved to: docs\qa\demo-recordings\" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review recordings: open docs\qa\demo-recordings\*.webm" -ForegroundColor White
    Write-Host "  2. Validate: node scripts\check-recordings.mjs" -ForegroundColor White
    Write-Host "  3. Run vision-verify workflow (if available)" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Some demos failed. Check the output above for details." -ForegroundColor Red
    Write-Host ""
    exit 1
}
