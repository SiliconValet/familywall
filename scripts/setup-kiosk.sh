#!/bin/bash
# FamilyWall kiosk installation script for Raspberry Pi
# Run with: sudo bash scripts/setup-kiosk.sh

set -euo pipefail

echo "FamilyWall Kiosk Setup"
echo "======================"

# Check if running on Raspberry Pi
ARCH=$(uname -m)
if [[ ! "$ARCH" =~ ^(aarch64|armv.*)$ ]]; then
  echo "WARNING: This script is designed for Raspberry Pi (ARM architecture)"
  echo "Detected architecture: $ARCH"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Determine the actual user (not root if using sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"
USER_HOME=$(eval echo "~$ACTUAL_USER")

echo "Installing for user: $ACTUAL_USER"
echo "Home directory: $USER_HOME"

# Create labwc config directory
echo "Setting up labwc configuration..."
mkdir -p "$USER_HOME/.config/labwc"

# Copy autostart configuration
echo "Installing labwc autostart..."
cp config/labwc-autostart.example "$USER_HOME/.config/labwc/autostart"
chmod +x "$USER_HOME/.config/labwc/autostart"

# Handle rc.xml configuration
RC_XML="$USER_HOME/.config/labwc/rc.xml"
if [ -f "$RC_XML" ]; then
  echo "Existing rc.xml found, creating backup..."
  cp "$RC_XML" "$RC_XML.backup.$(date +%s)"

  # Check if idle section already exists
  if grep -q "<idle>" "$RC_XML"; then
    echo "WARNING: <idle> section already exists in rc.xml"
    echo "Please manually merge config/labwc-rc.xml.example into $RC_XML"
  else
    echo "Merging idle configuration into rc.xml..."
    # Insert idle section before closing labwc_config tag
    sed -i '/<\/labwc_config>/i\  <idle>\n    <timeout>0</timeout>\n    <inhibitIdleHints>yes</inhibitIdleHints>\n  </idle>' "$RC_XML"
  fi
else
  echo "Creating new rc.xml..."
  cp config/labwc-rc.xml.example "$RC_XML"
fi

# Set ownership
chown -R "$ACTUAL_USER:$ACTUAL_USER" "$USER_HOME/.config/labwc"

# Install systemd units
echo "Installing systemd timer and service..."
cp systemd/kiosk-restart.timer /etc/systemd/system/
cp systemd/kiosk-restart.service /etc/systemd/system/

# Reload systemd
echo "Reloading systemd daemon..."
systemctl daemon-reload

# Enable and start timer
echo "Enabling kiosk-restart timer..."
systemctl enable kiosk-restart.timer
systemctl start kiosk-restart.timer

echo ""
echo "Systemd timer status:"
systemctl status kiosk-restart.timer --no-pager

# Set up PM2 startup
echo ""
echo "Setting up PM2 startup..."
echo "Run the following commands as user $ACTUAL_USER:"
echo ""
echo "  pm2 startup systemd -u $ACTUAL_USER --hp $USER_HOME"
echo "  # Then run the command PM2 outputs"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo ""

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Complete PM2 setup using the commands above"
echo "2. Reboot the system to test kiosk autostart"
echo "3. Verify timer: systemctl status kiosk-restart.timer"
echo "4. Check logs: journalctl -u kiosk-restart.service"
