# 🖥️ Deal Clarity Engine - Desktop App

This guide explains how to build and distribute the desktop version of Deal Clarity Engine for Windows, macOS, and Linux.

## Prerequisites

- Node.js 16+ installed
- Git installed
- For macOS: Xcode Command Line Tools
- For Windows: Visual Studio Build Tools (optional, for better performance)

## Installation

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --save-dev electron electron-builder electron-updater concurrently wait-on
```

## Development

Run the desktop app in development mode:
```bash
npm run electron-dev
```

This will:
- Start the React development server on `http://localhost:3000`
- Launch Electron window pointing to the dev server
- Open DevTools for debugging

## Building

### Build for all platforms (Windows, Mac, Linux)
```bash
npm run electron-build-all
```

### Build for specific platform

**Windows:**
```bash
npm run electron-build-win
```
Creates: `.exe` installer and portable `.exe`

**macOS:**
```bash
npm run electron-build-mac
```
Creates: `.dmg` installer and `.zip` archive

**Linux:**
```bash
npm run electron-build-linux
```
Creates: `.AppImage` and `.deb` package

## Build Output

Installers are saved in the `dist/` folder:

```
dist/
├── Deal Clarity Engine 1.0.0.exe          (Windows installer)
├── Deal Clarity Engine 1.0.0.exe.blockmap (Windows update manifest)
├── Deal Clarity Engine-1.0.0.dmg          (macOS installer)
├── Deal Clarity Engine-1.0.0.zip          (macOS portable)
├── deal-clarity-engine-1.0.0.AppImage     (Linux)
└── deal-clarity-engine-1.0.0.deb          (Linux Debian package)
```

## Auto-Updates

The app checks for updates automatically via GitHub releases. To enable updates:

1. Create a GitHub release with the version in the tag (e.g., `v1.0.1`)
2. Upload the `.exe.blockmap` (Windows) or `.yml` file to the release
3. App will detect and download updates automatically

## Code Signing

### Windows Code Signing
To sign Windows installers:

1. Get a code signing certificate
2. Update `electron-builder.json`:
```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password",
  "signingHashAlgorithms": ["sha256"]
}
```

### macOS Code Signing
To sign for macOS:

1. Get an Apple Developer certificate
2. Update `electron-builder.json`:
```json
"mac": {
  "sign": "Developer ID Application: Your Name (TEAM_ID)",
  "notarize": true
}
```

## Distribution

### Windows
1. Build: `npm run electron-build-win`
2. Upload `Deal Clarity Engine 1.0.0.exe` to your website/distribution platform
3. Users can download and run the installer

### macOS
1. Build: `npm run electron-build-mac`
2. Code sign and notarize
3. Upload `.dmg` to your website
4. Provide installation instructions

### Linux
1. Build: `npm run electron-build-linux`
2. Upload `.AppImage` and `.deb` to your repositories
3. AppImage users can run directly; `.deb` can be installed via:
```bash
sudo apt install ./deal-clarity-engine-1.0.0.deb
```

## Publishing Installers

### Option 1: GitHub Releases (Recommended)
1. Create a release on GitHub
2. Upload installers as release assets
3. Auto-updater will find them automatically

### Option 2: Website
1. Host installers on your website
2. Users download and install manually
3. Create update checker to notify users of new versions

### Option 3: App Stores
- **Windows Store:** Submit `.msix` package
- **Mac App Store:** Submit through Xcode
- **Linux:** Submit to Flathub or Snap store

## Troubleshooting

**Build fails with missing dependencies:**
```bash
npm install --legacy-peer-deps
rm -rf node_modules
npm install
```

**Electron won't start:**
- Check that `public/electron.js` exists
- Verify `main` entry in `package.json` points to `public/electron.js`
- Check logs: `npm run electron-dev` shows errors

**Build size too large:**
- Use `electron-builder` with `asar` option to compress app bundle
- Exclude unnecessary files in `electron-builder.json` `files` array

## File Structure

```
frontend/
├── public/
│   ├── electron.js       (Electron main process)
│   ├── preload.js        (IPC bridge)
│   └── index.html        (React root)
├── src/                  (React source code)
├── build/                (Built app - created after `npm run build`)
├── dist/                 (Installers - created after build)
├── package.json          (Includes Electron config)
└── electron-builder.json (Build configuration)
```

## Next Steps

1. Test the desktop app locally: `npm run electron-dev`
2. Build installers: `npm run electron-build-all`
3. Distribute installers to your users
4. Set up auto-updates via GitHub releases

## Support

For issues or questions, check:
- Electron documentation: https://www.electronjs.org/docs
- Electron Builder: https://www.electron.build/
- GitHub Issues: https://github.com/abrahamosah74-ux/deal-clarity-engine/issues
