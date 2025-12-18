import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { router } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isSignedIn, restoreToken } = useAuthStore();

  useEffect(() => {
    const setupAuth = async () => {
      await restoreToken();
    };
    setupAuth();
  }, []);

  // Redirect based on auth status
  useEffect(() => {
    if (!isLoading) {
      if (isSignedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isSignedIn]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="deal/[id]" options={{ title: 'Deal Details' }} />
        <Stack.Screen name="create-deal" options={{ title: 'Create Deal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

