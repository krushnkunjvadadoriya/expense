import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { GuestProvider } from '@/contexts/GuestContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function RootLayoutContent() {
  const { state: themeState } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={themeState.theme.isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <GuestProvider>
        <AuthProvider>
          <AppProvider>
            <RootLayoutContent />
          </AppProvider>
        </AuthProvider>
      </GuestProvider>
    </ThemeProvider>
  );
}