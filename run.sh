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

# Disable Ctrl, Super, Esc at X11 level
# xmodmap -e "keycode 37 = NoSymbol"   # Left Ctrl
# xmodmap -e "keycode 105 = NoSymbol"  # Right Ctrl
# xmodmap -e "keycode 133 = NoSymbol"  # Left Super
# xmodmap -e "keycode 134 = NoSymbol"  # Right Super
# xmodmap -e "keycode 9 = NoSymbol"    # Escape
# # Disable F keys
# xmodmap -e "keycode 67 = NoSymbol"   # F1
# xmodmap -e "keycode 68 = NoSymbol"   # F2
# xmodmap -e "keycode 69 = NoSymbol"   # F3
# xmodmap -e "keycode 70 = NoSymbol"   # F4
# xmodmap -e "keycode 71 = NoSymbol"   # F5
# xmodmap -e "keycode 72 = NoSymbol"   # F6
# xmodmap -e "keycode 73 = NoSymbol"   # F7
# xmodmap -e "keycode 74 = NoSymbol"   # F8
# xmodmap -e "keycode 75 = NoSymbol"   # F9
# xmodmap -e "keycode 76 = NoSymbol"   # F10
# xmodmap -e "keycode 95 = NoSymbol"   # F11
# xmodmap -e "keycode 96 = NoSymbol"   # F12

# useful: returns layout back to normal.
# setxkbmap -layout us

CHROMIUM_FLAGS=(
  --kiosk
  --password-store=basic
  --use-mock-keychain
  --noerrdialogs
  --disable-infobars
  --no-sandbox
  --disable-pinch
  --disable-dev-shm-usage
  --disable-gpu-sandbox
  --disable-background-timer-throttling
)

$CHROMIUM_CMD "${CHROMIUM_FLAGS[@]}" --user-data-dir=/tmp/chromium-kiosk "$URL" &

# Open second Chromium window on the screen above the primary
SECOND_URL="http://127.0.0.1:5173"
# xrandr gives offset as WxH+X+Y; grab X,Y of the non-primary connected screen
SECOND_OFFSET=$(xrandr --query 2>/dev/null \
  | grep ' connected' | grep -v 'primary' | head -1 \
  | grep -oP '\d+x\d+\+\K\d+\+\d+' | tr '+' ',')

if [ -n "$SECOND_OFFSET" ]; then
  echo "Launching second Chromium on screen at offset $SECOND_OFFSET"
  $CHROMIUM_CMD "${CHROMIUM_FLAGS[@]}" \
    --user-data-dir=/tmp/chromium-kiosk-2 \
    --window-position="$SECOND_OFFSET" \
    "$SECOND_URL" &
else
  echo "WARNING: No second screen detected — skipping second Chromium window"
fi

wait $DEV_PID
