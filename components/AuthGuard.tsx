import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
    if (!authState.isAuthenticated) {
      incrementAppOpenCount();
    }
  }, []);

  useEffect(() => {
    // Show registration prompt when conditions are met
    if (guestState.shouldShowRegistrationPrompt && !authState.isAuthenticated) {
      setShowRegistrationPrompt(true);
    }
  }, [guestState.shouldShowRegistrationPrompt]);

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Always render children (main app content) and registration prompt modal
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