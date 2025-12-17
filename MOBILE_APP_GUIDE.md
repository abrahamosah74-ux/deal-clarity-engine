# Mobile App Implementation Guide

## Overview

The Deal Clarity Mobile App is a React Native application built with Expo, providing a native mobile experience for iOS and Android. It connects to the existing backend API and includes real-time notifications via Socket.io.

## Tech Stack

- **Framework:** React Native (Expo)
- **Navigation:** Expo Router
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Real-time:** Socket.io
- **Auth Storage:** Expo Secure Store
- **Notifications:** Expo Notifications

## Project Structure

```
mobile/
├── app/                           # Expo Router app directory
│   ├── (tabs)/                   # Tabbed navigation
│   │   ├── deals.tsx             # Deals list screen
│   │   ├── tasks.tsx             # Tasks screen (placeholder)
│   │   ├── contacts.tsx          # Contacts screen (placeholder)
│   │   └── profile.tsx           # User profile screen (placeholder)
│   ├── deal/[id].tsx             # Deal details screen
│   ├── create-deal.tsx           # Create new deal screen
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Sign up screen
│   └── _layout.tsx               # Root layout with auth check
├── components/                    # Reusable components
│   ├── Card.tsx                  # Card wrapper
│   ├── DealCard.tsx              # Deal list card
│   ├── LoadingSpinner.tsx        # Loading indicator
│   └── ErrorMessage.tsx          # Error display
├── services/                      # API and external services
│   ├── api.ts                    # Axios API client
│   └── socketService.ts          # Socket.io connection
├── stores/                        # Zustand state management
│   ├── authStore.ts              # Authentication state
│   ├── dealsStore.ts             # Deals state
│   └── notificationsStore.ts     # Notifications state
├── hooks/                         # Custom React hooks
└── constants/                     # App constants
```

## Core Services

### API Service (`services/api.ts`)

Axios-based API client with:
- Auto token injection from secure storage
- Automatic logout on 401 errors
- All endpoints for deals, tasks, contacts, analytics, notifications
- Error handling

```typescript
// Usage
import { api } from '@/services/api';

const deals = await api.getDeals({ stage: 'prospect' });
const deal = await api.createDeal({ title: 'New Deal', value: 50000 });
```

### Socket Service (`services/socketService.ts`)

Socket.io connection manager for real-time notifications:
- Auto-connect on app start
- Team room management
- Event listeners for notifications
- Fallback polling support

```typescript
// Usage
import socketService from '@/services/socketService';

socketService.connect(userId, teamId);
socketService.on('notification', (data) => {
  // Handle notification
});
```

## State Management (Zustand Stores)

### Auth Store (`stores/authStore.ts`)

Manages user authentication state:
- `login()` - Authenticate user
- `logout()` - Clear auth
- `restoreToken()` - Check for existing session
- `user` - Current user object
- `isSignedIn` - Auth status
- `isLoading` - Loading state

### Deals Store (`stores/dealsStore.ts`)

Manages deal data:
- `fetchDeals()` - Get all deals
- `fetchDealById()` - Get single deal
- `createDeal()` - Create new deal
- `updateDeal()` - Update deal
- `deleteDeal()` - Delete deal
- `deals[]` - Deals list
- `selectedDeal` - Current deal

### Notifications Store (`stores/notificationsStore.ts`)

Manages notifications:
- `fetchNotifications()` - Get notifications
- `markAsRead()` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `addNotification()` - Add from Socket.io
- `notifications[]` - Notifications list
- `unreadCount` - Count of unread

## Screens

### Authentication

#### Login Screen (`app/login.tsx`)
- Email/password input
- Token storage in Secure Store
- Error handling
- Signup link

#### Signup Screen (`app/signup.tsx`)
- First/Last name input
- Email verification
- Password confirmation
- Auto-redirect to login

### Main App (Tabbed Navigation)

#### Deals Screen (`app/(tabs)/deals.tsx`)
- List of all deals
- Pull-to-refresh
- Create deal button
- Tap to view details
- Empty state

#### Deal Details (`app/deal/[id].tsx`)
- Full deal information
- Value and stage
- Probability percentage
- Contact information
- Description
- Edit button
- Contact name
- Created date

#### Create Deal (`app/create-deal.tsx`)
- Title (required)
- Value in dollars (required)
- Stage dropdown
- Probability slider (0-100%)
- Description textarea
- Create/Cancel buttons

### Placeholder Screens (To Be Implemented)
- Tasks (`app/(tabs)/tasks.tsx`)
- Contacts (`app/(tabs)/contacts.tsx`)
- Profile (`app/(tabs)/profile.tsx`)

## Component Library

### Card Component
```typescript
<Card>
  <Text>Card content</Text>
</Card>
```

### DealCard Component
```typescript
<DealCard deal={deal} onPress={handlePress} />
```

### LoadingSpinner Component
```typescript
<LoadingSpinner size="large" color="#0066CC" />
```

### ErrorMessage Component
```typescript
<ErrorMessage 
  message="Error text" 
  onDismiss={handleDismiss}
  onRetry={handleRetry}
/>
```

## Styling

All screens use a consistent design system:
- **Primary Color:** #0066CC (Blue)
- **Background:** #F9FAFB (Light Gray)
- **Card Background:** #FFFFFF (White)
- **Text Primary:** #1F2937 (Dark Gray)
- **Text Secondary:** #6B7280 (Medium Gray)
- **Border Color:** #E5E7EB (Light Gray)
- **Error:** #DC2626 (Red)
- **Success:** #10B981 (Green)

Typography:
- Headings: 24-32px, fontWeight: '700'
- Section titles: 16-18px, fontWeight: '700'
- Body: 14-16px, fontWeight: '400-600'
- Small text: 12-14px

## Setup & Installation

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or Expo Go app
- Android: Android Studio or Expo Go app

### Installation

```bash
cd mobile
npm install
```

### Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://deal-clarity-engine.onrender.com/api
EXPO_PUBLIC_SOCKET_URL=https://deal-clarity-engine.onrender.com
```

### Development

```bash
# Start Expo development server
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on Web (experimental)
npm run web
```

### Build for Production

```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## Features Implemented

### ✅ Authentication
- Login with email/password
- Sign up new accounts
- Token persistence (Secure Store)
- Auto-logout on 401

### ✅ Deals Management
- View all deals (paginated)
- Create new deals
- View deal details
- Update deal status
- Delete deals
- Pull-to-refresh

### ✅ Real-Time Updates
- Socket.io integration
- Live notifications
- Team room broadcasts
- Auto-reconnection

### ✅ UI/UX
- Responsive design
- Native look and feel
- Loading states
- Error handling
- Empty states

## Features To Implement

### Tasks Management
- Task list screen
- Task creation
- Task completion
- Due date filtering
- Priority management

### Contacts Management
- Contact list
- Contact details
- Create/edit contacts
- Search functionality
- Tag management

### Analytics
- Pipeline summary
- Sales forecast
- Win rate chart
- Velocity metrics

### Settings
- User profile editing
- Notification preferences
- App settings
- Logout

### Advanced
- Offline mode (SQLite)
- Image uploads
- Document sharing
- Calendar integration
- Push notifications

## Common Tasks

### Adding a New Screen

1. Create file in `app/` or `app/(tabs)/`
2. Use Expo Router for navigation
3. Import required stores
4. Add to `_layout.tsx` if needed

```typescript
// app/(tabs)/mynewscreen.tsx
import { Text, View } from 'react-native';
import { useMyStore } from '@/stores/myStore';

export default function MyNewScreen() {
  const data = useMyStore((state) => state.data);
  
  return (
    <View>
      <Text>{data}</Text>
    </View>
  );
}
```

### Adding API Endpoint

1. Add method to `services/api.ts`
2. Use in component via `await api.myMethod()`
3. Call from store action

```typescript
// services/api.ts
getMyData: async () => {
  return apiClient.get('/my-endpoint');
},
```

### Managing State

Use Zustand stores for all state management:

```typescript
// stores/myStore.ts
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: [],
  fetchData: async () => {
    const response = await api.getMyData();
    set({ data: response.data });
  },
}));

// Usage in component
const { data, fetchData } = useMyStore();
```

## Troubleshooting

### Metro bundler errors
```bash
npm start -- --reset-cache
```

### Module not found errors
```bash
rm -rf node_modules
npm install
```

### Socket.io connection fails
- Check backend is running
- Verify SOCKET_URL in .env
- Check CORS configuration
- Monitor console logs

### Token errors
- Clear Secure Store: `npx expo prebuild --clean`
- Re-authenticate
- Check token expiration

## Performance Considerations

1. **List Optimization:** Use FlatList for large lists
2. **Image Loading:** Implement lazy loading
3. **API Caching:** Add result caching to stores
4. **State:** Only update relevant state
5. **Re-renders:** Use React.memo for heavy components

## Security

1. **Token Storage:** Tokens stored in Secure Store (encrypted)
2. **HTTPS Only:** All API calls use HTTPS
3. **CORS:** Backend validates origin
4. **Sensitive Data:** No sensitive data in logs
5. **Input Validation:** All inputs validated before API call

## Deployment

### iOS
1. Generate ipa file: `eas build --platform ios`
2. Upload to TestFlight/App Store
3. Configure certificates in Expo

### Android
1. Generate aab file: `eas build --platform android`
2. Upload to Play Store
3. Configure keystore

## Support

For issues or questions:
1. Check Expo documentation: https://docs.expo.dev
2. Check React Native docs: https://reactnative.dev
3. Review Socket.io docs: https://socket.io
4. Check project issues on GitHub

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Alpha (core features implemented)
