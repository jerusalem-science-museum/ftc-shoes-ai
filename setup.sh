#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

echo "=== Kiosk App Setup ==="
echo "Project directory: $SCRIPT_DIR"
echo "(Run kiosk-base-setup.sh first on a fresh machine if you haven't already.)"
echo "https://raw.githubusercontent.com/wiki/jerusalem-science-museum/.github/kiosk-base-setup.sh"
echo ""

# =========================================================================
# 1. Node.js & npm
# =========================================================================
echo "=== Checking Node.js & npm ==="

REQUIRED_NODE_MAJOR=20

install_node() {
    echo "  Installing Node.js via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x | sudo -E bash -
    sudo apt-get install -y nodejs
}

if command -v node &>/dev/null; then
    CURRENT_NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
    echo "  Found Node.js v$(node --version | tr -d v)"
    if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
        echo "  Node.js is outdated (need >=$REQUIRED_NODE_MAJOR). Upgrading..."
        install_node
    else
        echo "  ✓ Node.js is up to date"
    fi
else
    echo "  Node.js not found. Installing..."
    install_node
fi

echo "  Node.js: $(node --version)   npm: $(npm --version)"

# =========================================================================
# 2. npm run setup
# =========================================================================
echo ""
echo "=== Running npm run setup ==="
cd "$SCRIPT_DIR"
npm run setup

# =========================================================================
# 3. Build client for production
# =========================================================================
echo ""
echo "=== Building client ==="
cd "$SCRIPT_DIR"
npm run build

# =========================================================================
# 4. Remove unclutter (not needed for this exhibit)
# =========================================================================
echo ""
echo "=== Removing unclutter ==="
if [ -f /etc/default/unclutter ]; then
    sudo rm /etc/default/unclutter
    echo "  ✓ Removed /etc/default/unclutter"
fi
if [ -f ~/.config/autostart/unclutter.desktop ]; then
    rm ~/.config/autostart/unclutter.desktop
    echo "  ✓ Removed ~/.config/autostart/unclutter.desktop"
fi

# =========================================================================
# 5. Make scripts executable
# =========================================================================
chmod +x "$SCRIPT_DIR/run.sh"
chmod +x "$SCRIPT_DIR/build.sh"

# =========================================================================
# 6. Autostart: app
# =========================================================================
echo ""
echo "=== Setting up app autostart ==="
mkdir -p ~/.config/autostart

cat > ~/.config/autostart/shoesai.desktop << EOF
[Desktop Entry]
Type=Application
Name=Shoes AI
Exec=bash -c '"$SCRIPT_DIR/run.sh"; read'
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
X-GNOME-Autostart-Delay=5
EOF

echo "  ✓ Autostart entry written to ~/.config/autostart/app.desktop"

# =========================================================================
# 7. Keyboard layouts: English, Hebrew, Arabic
# =========================================================================
echo ""
echo "=== Configuring keyboard layouts ==="
gsettings set org.cinnamon.desktop.input-sources sources "[('xkb', 'us'), ('xkb', 'il'), ('xkb', 'ara')]"
gsettings set org.cinnamon.desktop.keybindings.wm switch-input-source "['<Super>space', '<Alt>Shift_L']"

echo "  ✓ Keyboard layouts set to: English (us), Hebrew (il), Arabic (ara)"

# =========================================================================
# Done
# =========================================================================
echo ""
echo "========================================="
echo "  App setup complete! Reboot to apply."
echo "========================================="
echo ""
echo "What was done:"
echo "  [Node/npm]     Installed/verified Node.js >= $REQUIRED_NODE_MAJOR"
echo "  [App]          npm run setup completed"
echo "  [Build]        Client built for production (client/dist)"
echo "  [Unclutter]    Removed unclutter config/autostart if present"
echo "  [Autostart]    Will auto-launch via run.sh on login"
echo "  [Keyboard]     Layouts set to English, Hebrew, Arabic"
echo ""
echo "Rebooting now is recommended: reboot"
