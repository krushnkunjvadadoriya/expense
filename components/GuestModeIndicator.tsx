import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Cloud, ArrowRight } from 'lucide-react-native';
import { useGuest } from '@/contexts/GuestContext';
import { router } from 'expo-router';

export default function GuestModeIndicator() {
  const { state } = useGuest();

  if (!state.isGuest) {
    return null;
  }

  const handlePress = () => {
    router.push('/(auth)/email-entry');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Cloud size={16} color="#F59E0B" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Unsaved Progress</Text>
          <Text style={styles.subtitle}>Create an account to save your data</Text>
        </View>
        <ArrowRight size={16} color="#F59E0B" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#B45309',
  },
});