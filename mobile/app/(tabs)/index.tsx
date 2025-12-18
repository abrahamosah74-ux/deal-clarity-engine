import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function IndexRedirect() {
  useEffect(() => {
    // Redirect the template index to the real deals tab
    router.replace('/(tabs)/deals');
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LoadingSpinner />
    </View>
  );
}
