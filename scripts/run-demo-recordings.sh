#!/usr/bin/env bash
# Quick-start script to record demos
#
# Usage:
#   ./scripts/run-demo-recordings.sh [BASE_URL]
#
# Example:
#   ./scripts/run-demo-recordings.sh http://localhost:5173

set -e

BASE_URL="${1:-http://localhost:3000}"

echo "🎬 Firefly Demo Recording Script"
echo "=================================="
echo ""

# Check if app is running
echo "🔍 Checking if app is running at $BASE_URL..."
if curl -s -f -o /dev/null "$BASE_URL"; then
  echo "✅ App is reachable!"
else
  echo "❌ App is NOT running at $BASE_URL"
  echo ""
  echo "Please start the app first:"
  echo "  cd firefly-fe && npm run dev"
  echo ""
  exit 1
fi

# Check if Playwright is installed
echo ""
echo "🔍 Checking Playwright installation..."
if [ ! -d "node_modules/@playwright" ] && [ ! -d "node_modules/playwright" ]; then
  echo "⚠️  Playwright not found. Installing..."
  npm install -D @playwright/test
  npx playwright install chromium
else
  echo "✅ Playwright is installed!"
fi

# Run the recording script
echo ""
echo "🎥 Recording demos..."
echo ""
BASE_URL="$BASE_URL" node scripts/record-demos.mjs

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All demos recorded successfully!"
  echo ""
  echo "📂 Recordings saved to: docs/qa/demo-recordings/"
  echo ""
  echo "Next steps:"
  echo "  1. Review recordings: open docs/qa/demo-recordings/*.webm"
  echo "  2. Validate: node scripts/check-recordings.mjs"
  echo "  3. Run vision-verify workflow (if available)"
else
  echo ""
  echo "❌ Some demos failed. Check the output above for details."
  echo ""
  exit 1
fi
