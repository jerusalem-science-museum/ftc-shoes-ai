#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR"

URL="http://127.0.0.1:5173/create-post"

npm run dev &
DEV_PID=$!

echo "Waiting for dev server at $URL..."
until curl -s --head "$URL" | head -n1 | grep -q "200\|304"; do
    sleep 1
done

echo "Server up — launching Chromium in kiosk mode"

# Detect which chromium binary is available
CHROMIUM_CMD=""
if command -v chromium-browser &>/dev/null; then
  CHROMIUM_CMD="chromium-browser"
elif command -v chromium &>/dev/null; then
  CHROMIUM_CMD="chromium"
else
  echo "ERROR: Chromium not found!"
  exit 1
fi

$CHROMIUM_CMD \
  --kiosk \
  --password-store=basic \
  --noerrdialogs \
  --disable-infobars \
  --no-sandbox \
  --disable-pinch \
  --disable-dev-shm-usage \
  --disable-gpu-sandbox \
  --disable-background-timer-throttling \
  "$URL" &
  
wait $DEV_PID
