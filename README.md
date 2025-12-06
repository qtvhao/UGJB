# Fuel2 Starter - macOS Application

This is a macOS application bundle (`.app`) that launches Visual Studio Code with the Fuel2 Starter project.

## Structure

```
Fuel2Starter.app/
├── Contents/
│   ├── Info.plist          # Application metadata
│   ├── MacOS/
│   │   └── Fuel2Starter    # Launch script (executable)
│   └── Resources/          # (empty - can add icon later)
```

## First-Time Setup (Important!)

**If you extracted this from a ZIP file**, you must run the setup script first:

```bash
cd sample-app
./SETUP.sh
```

This removes macOS quarantine attributes that prevent the app from running.

## Usage

### Method 1: Double-click in Finder
Simply double-click `Fuel2Starter.app` in Finder to launch VS Code with the project.

### Method 2: Open from Terminal
```bash
open Fuel2Starter.app
```

### Method 3: Run the script directly
```bash
./Fuel2Starter.app/Contents/MacOS/Fuel2Starter
```

## Requirements

- macOS 10.13 or later
- Visual Studio Code installed with `code` command in PATH, or VS Code installed in `/Applications/Visual Studio Code.app`

## How It Works

The application:
1. Checks if VS Code is available via the `code` command
2. If not found, looks for VS Code in `/Applications/Visual Studio Code.app`
3. Opens VS Code with the project path: `/Users/haonx/VSCodeProjects/fuel2-starter`
4. Displays an error dialog if VS Code cannot be found

## Customization

To change the project path, edit the launch script at:
```
Fuel2Starter.app/Contents/MacOS/Fuel2Starter
```

And modify the `PROJECT_PATH` variable.

## Adding an Icon (Optional)

To add a custom icon:
1. Create or obtain an `.icns` file
2. Save it as `Fuel2Starter.app/Contents/Resources/AppIcon.icns`
3. Add this line to `Info.plist`:
   ```xml
   <key>CFBundleIconFile</key>
   <string>AppIcon</string>
   ```

## Installation

To install the application:
1. Copy `Fuel2Starter.app` to `/Applications` or `~/Applications`
2. You can now launch it from Spotlight (⌘+Space, type "Fuel2 Starter")
3. You can also add it to the Dock by dragging it there

## Troubleshooting

### "The application 'Fuel2Starter' can't be opened" or "Cannot be opened because the developer cannot be verified"

This is macOS Gatekeeper protection blocking unsigned applications.

**Solution: Run the setup script**
```bash
cd sample-app
./SETUP.sh
```

**Manual fix (if setup script fails):**
```bash
xattr -cr Fuel2Starter.app
chmod +x Fuel2Starter.app/Contents/MacOS/Fuel2Starter
```

**Why this happens:**
- The app is not signed with an Apple Developer certificate
- macOS marks extracted files with a "quarantine" attribute
- This prevents it from running even if you try right-click → Open

**Important:** This happens every time you extract the app from a ZIP file. Always run `./SETUP.sh` after extraction.

### VS Code not found

Make sure VS Code is installed and either:
- The `code` command is in your PATH (run `code --version` in Terminal)
- VS Code is installed at `/Applications/Visual Studio Code.app`

To add `code` to PATH, open VS Code and run:
- Press ⌘+Shift+P
- Type "shell command"
- Select "Shell Command: Install 'code' command in PATH"
