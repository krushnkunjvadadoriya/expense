import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { GuestProvider } from '@/contexts/GuestContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import CustomAlert from '@/components/CustomAlert';

function RootLayoutContent() {
  const { state: themeState } = useTheme();
  const { state, hideGlobalAlert } = useApp();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={themeState.theme.isDark ? 'light' : 'dark'} />
      
      {/* Global Alert */}
      {state.currentAlert && (
        <CustomAlert
          visible={true}
          type={state.currentAlert.type}
          title={state.currentAlert.title}
          message={state.currentAlert.message}
          onClose={() => {
            if (state.currentAlert?.onConfirm) {
              state.currentAlert.onConfirm();
            }
            hideGlobalAlert();
          }}
          onConfirm={state.currentAlert.onConfirm}
          confirmText={state.currentAlert.confirmText}
          cancelText={state.currentAlert.cancelText}
          autoHideDelay={state.currentAlert.autoHideDelay}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <GuestProvider>
            <AppProvider>
              <RootLayoutContent />
            </AppProvider>
          </GuestProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}