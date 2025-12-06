#!/bin/bash

# Fuel2Starter Setup Script
# Run this script after extracting the ZIP file to prepare the app for use

set -e

echo "======================================"
echo "Fuel2Starter - Post-Extraction Setup"
echo "======================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_PATH="$SCRIPT_DIR/Fuel2Starter.app"

# Check if the app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: Fuel2Starter.app not found in the current directory"
    echo "   Expected location: $APP_PATH"
    echo ""
    echo "Make sure you run this script from the sample-app directory."
    exit 1
fi

echo "📦 Found Fuel2Starter.app"
echo ""

# Remove quarantine attribute
echo "🔓 Removing macOS quarantine attribute..."
if xattr -cr "$APP_PATH" 2>/dev/null; then
    echo "✅ Quarantine attribute removed"
else
    echo "⚠️  Could not remove quarantine attribute (this is normal if it wasn't set)"
fi

# Verify executable permissions
EXECUTABLE="$APP_PATH/Contents/MacOS/Fuel2Starter"
if [ -f "$EXECUTABLE" ]; then
    echo ""
    echo "🔧 Checking executable permissions..."
    chmod +x "$EXECUTABLE" 2>/dev/null || true

    if [ -x "$EXECUTABLE" ]; then
        echo "✅ Executable permissions verified"
    else
        echo "❌ Warning: Could not set executable permissions"
    fi
else
    echo "❌ Error: Executable not found at $EXECUTABLE"
    exit 1
fi

echo ""
echo "======================================"
echo "✨ Setup complete!"
echo "======================================"
echo ""
echo "You can now:"
echo "  1. Double-click Fuel2Starter.app to launch VS Code"
echo "  2. Copy the app to /Applications:"
echo "     cp -r Fuel2Starter.app /Applications/"
echo "  3. Run from terminal:"
echo "     open Fuel2Starter.app"
echo ""
echo "If you still get security warnings:"
echo "  Right-click → Open → Click 'Open' in the dialog"
echo ""
