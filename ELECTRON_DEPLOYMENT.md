# 🖥️ Desktop App Deployment Guide

## Overview
Deal Clarity Engine now supports Windows, macOS, and Linux desktop applications using Electron.

---

## 📋 Prerequisites

1. **Node.js 16+** - Already installed
2. **Git** - For releases
3. **Platform-specific requirements:**

### Windows
- Windows 7 or later
- No additional requirements for testing
- Visual Studio Build Tools (optional, for building from source)

### macOS
- macOS 10.12 or later
- Xcode Command Line Tools: `xcode-select --install`
- (Optional) Apple Developer account for code signing (~$99/year)

### Linux
- glibc 2.26+ (most modern distros)
- libappindicator1 (Ubuntu: `sudo apt-get install libappindicator1`)

---

## 🚀 Quick Start - Development Mode

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Run in development mode
```bash
npm run electron-dev
```

This will:
- Start React dev server on `http://localhost:3000`
- Open Electron window automatically
- Enable hot reload

---

## 🔨 Building Desktop Apps

### Build for current platform
```bash
cd frontend
npm run electron-build
```

Output will be in `frontend/dist/` folder

### Build for Windows (64-bit + 32-bit)
```bash
npm run electron-build-win
```

Creates:
- `Deal Clarity Engine Setup 1.0.0.exe` (NSIS installer)
- `Deal Clarity Engine 1.0.0.msi` (Windows Installer)
- `Deal Clarity Engine 1.0.0 x64.exe` (Portable)

### Build for macOS
```bash
npm run electron-build-mac
```

Creates:
- `Deal Clarity Engine-1.0.0.dmg` (Disk Image)
- `Deal Clarity Engine-1.0.0.pkg` (Package Installer)
- `.zip` file

**Requirements:** Must run on macOS to build

### Build for Linux
```bash
npm run electron-build-linux
```

Creates:
- `deal-clarity-engine-1.0.0.AppImage` (Universal executable)
- `deal-clarity-engine_1.0.0_amd64.deb` (Debian/Ubuntu)

### Build for all platforms
```bash
npm run electron-build-all
```

**Note:** Can only build for current platform + Windows/Linux cross-compilation

---

## 🔐 Code Signing (Production)

### Windows Code Signing

1. **Get a code signing certificate** (Sectigo, DigiCert, etc.)
   - Cost: $100-400/year
   
2. **Set environment variables:**
```bash
# On Windows PowerShell
$env:WIN_CSC_LINK = "C:\path\to\certificate.pfx"
$env:WIN_CSC_KEY_PASSWORD = "your-password"
```

3. **Build with signing:**
```bash
npm run electron-build-win
```

### macOS Code Signing

1. **Get Apple Developer account** ($99/year)

2. **Create certificate in Xcode:**
```bash
xcode-select --install
```

3. **Set environment variables:**
```bash
export MAC_CSC_LINK="path/to/certificate.p12"
export MAC_CSC_KEY_PASSWORD="password"
export APPLE_ID="your-apple-id@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
```

4. **Build with signing:**
```bash
npm run electron-build-mac
```

---

## 📦 Auto-Updates

The app checks for updates on GitHub releases automatically.

### Publish a new version

1. **Update version in `frontend/package.json`:**
```json
"version": "1.1.0"
```

2. **Commit and push:**
```bash
git add .
git commit -m "Release v1.1.0"
git push origin main
```

3. **Create GitHub release:**
   - Go to: https://github.com/abrahamosah74-ux/deal-clarity-engine/releases
   - Click "Create a new release"
   - Tag: `v1.1.0`
   - Upload built executables from `frontend/dist/`
   - Users will auto-update within 24 hours

---

## 📊 Distribution Methods

### Option 1: GitHub Releases (Free, Recommended)
- Users download from releases page
- Auto-updates via electron-updater
- No server needed

### Option 2: Website Download
1. Upload executables to your website
2. Create download page
3. Users manually download and install

### Option 3: Windows/Mac App Stores
- **Microsoft Store:** ~$19 registration fee, 30% commission
- **Mac App Store:** Requires Apple Developer ($99/year), 30% commission
- Easier for users to discover and update

### Option 4: Package Managers
- **Windows:** WinGet, Chocolatey
- **macOS:** Homebrew
- **Linux:** Ubuntu, Fedora repos

---

## 🧪 Testing

### Test on Windows
```bash
# Build
npm run electron-build-win

# Run installer
dist/Deal\ Clarity\ Engine\ Setup\ 1.0.0.exe

# Or run portable
dist/Deal\ Clarity\ Engine\ 1.0.0\ x64.exe
```

### Test on macOS
```bash
npm run electron-build-mac
# Then open .dmg and drag app to Applications
```

### Test on Linux
```bash
npm run electron-build-linux
# Run AppImage
./dist/deal-clarity-engine-1.0.0.AppImage
# Or install .deb
sudo apt install ./dist/deal-clarity-engine_1.0.0_amd64.deb
```

---

## 🐛 Troubleshooting

### "electron not found"
```bash
npm install
npm install -g electron
```

### React not loading in Electron
- Check that `homepage: "./"` is in `package.json`
- Ensure React build output exists: `npm run build`

### Auto-update not working
- Check GitHub releases exist
- Verify ASAR is enabled in electron-builder config

### Windows: "This app can't run on your PC"
- Need code signing certificate
- Or ask users to disable SmartScreen temporarily

---

## 📈 Next Steps

1. **Test builds on all platforms**
2. **Add app icons** (replace `assets/icon.png`, `icon.ico`, `icon.icns`)
3. **Code sign for production** (Windows & macOS)
4. **Create release page on GitHub**
5. **Announce to users**

---

## 💡 Pro Tips

- Keep Electron versions updated for security
- Test updates in staging before releasing
- Monitor crash reports (add Sentry integration)
- Create installers with custom branding (splash screen, etc.)
- Use CI/CD (GitHub Actions) to automate builds

---

**Questions?** Check: https://www.electronjs.org/docs
