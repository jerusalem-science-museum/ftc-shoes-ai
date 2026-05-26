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
chromium-browser --kiosk --noerrdialogs --disable-infobars "$URL" &

wait $DEV_PID
