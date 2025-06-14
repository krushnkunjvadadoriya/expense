import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useGuest } from '@/contexts/GuestContext';
import RegistrationPromptModal from './RegistrationPromptModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { state: authState } = useAuth();
  const { state: guestState, incrementAppOpenCount } = useGuest();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  useEffect(() => {
    // Increment app open count for guest users
    if (guestState.isGuest && !authState.isAuthenticated) {
      incrementAppOpenCount();
    }
  }, []);

  useEffect(() => {
    // Show registration prompt when conditions are met
    if (guestState.shouldShowRegistrationPrompt && guestState.isGuest) {
      setShowRegistrationPrompt(true);
    }
  }, [guestState.shouldShowRegistrationPrompt]);

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated && !guestState.isGuest) {
      // User was registered but is now logged out, check if they have a PIN
      checkPinSetup();
    }
  }, [authState.isLoading, authState.isAuthenticated, guestState.isGuest]);

  const checkPinSetup = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const userPin = await AsyncStorage.getItem('userPin');
      
      if (userPin) {
        // User has a PIN, redirect to PIN entry
        router.replace('/(auth)/enter-pin');
      } else {
        // New user, start with email entry
        router.replace('/(auth)/email-entry');
      }
    } catch (error) {
      // Default to email entry if there's an error
      router.replace('/(auth)/email-entry');
    }
  };

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Allow guest users to access the app
  if (guestState.isGuest || authState.isAuthenticated) {
    return (
      <>
        {children}
        <RegistrationPromptModal
          visible={showRegistrationPrompt}
          onClose={() => setShowRegistrationPrompt(false)}
        />
      </>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});