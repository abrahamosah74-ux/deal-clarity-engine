# Mobile App Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Set Up Environment
Create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://deal-clarity-engine.onrender.com/api
EXPO_PUBLIC_SOCKET_URL=https://deal-clarity-engine.onrender.com
```

### Step 3: Start Development Server
```bash
npm start
```

### Step 4: Run on Your Device

**iOS (macOS only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**iOS/Android without Mac (Expo Go app):**
1. Download Expo Go from App Store or Play Store
2. Scan QR code from terminal

**Web (experimental):**
```bash
npm run web
```

## 📱 Key Screens

| Screen | Path | Purpose |
|--------|------|---------|
| Login | `/login` | Authenticate user |
| Sign Up | `/signup` | Create new account |
| Deals | `/(tabs)/deals` | View all deals |
| Deal Details | `/deal/[id]` | View single deal |
| Create Deal | `/create-deal` | Add new deal |

## 🔑 Demo Credentials

Use any of these to test:
```
Email: demo@example.com
Password: demo123
```

Or sign up with any email address.

## 🎯 What You Can Do

### Deals Management
- ✅ View all deals in a list
- ✅ Pull down to refresh
- ✅ Tap deal to view details
- ✅ Create new deals
- ✅ See deal value, stage, probability
- ✅ Add deal descriptions

### Real-Time Updates
- ✅ Receive notifications in real-time
- ✅ Socket.io WebSocket support
- ✅ Automatic reconnection
- ✅ Team notifications

### Authentication
- ✅ Login with email/password
- ✅ Sign up new account
- ✅ Token auto-saved (secure)
- ✅ Auto-logout on 401

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native | Cross-platform mobile framework |
| Expo | Managed React Native platform |
| Expo Router | File-based navigation |
| Zustand | State management |
| Axios | HTTP client |
| Socket.io | Real-time notifications |
| Secure Store | Encrypted token storage |

## 🛠️ Development Tips

### Hot Reload
Changes auto-reload on save. If not:
```bash
Press 'r' in terminal to reload
```

### View Logs
```bash
# In development terminal
npm start

# Then press 'j' for iOS logs or 'a' for Android
```

### Debugging
1. Open developer menu:
   - iOS: Cmd+D
   - Android: Cmd+M (or Ctrl+M on Windows)

2. Select "Debug JS Remotely"

3. Browser DevTools opens for debugging

### Troubleshooting

**Port already in use:**
```bash
npm start -- --port 19001
```

**Clear cache:**
```bash
npm start -- --reset-cache
```

**Module errors:**
```bash
rm -rf node_modules
npm install
```

## 📋 Project Structure

```
mobile/
├── app/                 # Screens (Expo Router)
├── components/          # Reusable components
├── services/           # API & Socket.io
├── stores/             # Zustand state
├── hooks/              # Custom hooks
└── constants/          # Constants
```

## 🔗 API Integration

All API calls go through `services/api.ts`:

```typescript
// Example: Get deals
const response = await api.getDeals();

// Example: Create deal
await api.createDeal({
  title: 'New Deal',
  value: 50000,
  stage: 'prospect'
});
```

## 🌐 Real-Time Features

Socket.io automatically connects on app start:

```typescript
// Notifications arrive in real-time
useNotificationsStore().addNotification(notification);
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Guide](https://expo.github.io/router/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## 🚢 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

Then submit to App Store / Play Store.

## 🆘 Common Issues

### Login fails
- Check backend is running
- Verify API URL in `.env`
- Check network connectivity

### Socket.io not connecting
- Verify SOCKET_URL in `.env`
- Check backend has Socket.io enabled
- Look at browser console for CORS errors

### Build fails
- Run: `npm install --force`
- Clear cache: `npm start -- --reset-cache`
- Check Node version: `node -v` (should be 18+)

## 📞 Support

For issues:
1. Check [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md) for detailed info
2. Review [Expo documentation](https://docs.expo.dev)
3. Check GitHub issues
4. Review console logs for errors

## ✅ Next Steps

1. **Run the app** - `npm start`
2. **Test login** - Create or use demo account
3. **View deals** - Browse your pipeline
4. **Create deals** - Add a new opportunity
5. **Check real-time** - Notifications sync instantly

Happy coding! 🎉

---

**Mobile App Status:** ✅ Alpha (Core Features Complete)  
**Platforms:** iOS, Android, Web (experimental)  
**Current Version:** 1.0.0  
**Last Updated:** December 2024
