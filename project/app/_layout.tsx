import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { FontProvider } from '@/contexts/FontContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <FontProvider>
      <SecurityProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" backgroundColor="#0A0B0F" />
        </AuthProvider>
      </SecurityProvider>
    </FontProvider>
  );
}