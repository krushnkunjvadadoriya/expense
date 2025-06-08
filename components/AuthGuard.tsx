import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      // Check if user has ever set up a PIN
      checkPinSetup();
    }
  }, [state.isLoading, state.isAuthenticated]);

  const checkPinSetup = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const userPin = await AsyncStorage.getItem('userPin');
      
      if (userPin) {
        // User has a PIN, redirect to PIN entry
        router.replace('/(auth)/enter-pin');
      } else {
        // New user, start with email entry (more cost-effective)
        router.replace('/(auth)/email-entry');
      }
    } catch (error) {
      // Default to email entry if there's an error
      router.replace('/(auth)/email-entry');
    }
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
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