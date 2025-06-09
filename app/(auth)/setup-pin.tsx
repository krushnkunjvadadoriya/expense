import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Shield, Check, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SetupPin() {
  const { mobile, name, email } = useLocalSearchParams<{ 
    mobile: string; 
    name: string; 
    email: string; 
  }>();
  const { setupPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (number: string) => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Ignore vibration errors
      }
    }

    if (step === 'create') {
      if (pin.length < 4) {
        setPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + number);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (step === 'create' && pin.length === 4) {
      setStep('confirm');
    } else if (step === 'confirm' && confirmPin.length === 4) {
      if (pin === confirmPin) {
        handleSetupPin();
      } else {
        Alert.alert('Error', 'PINs do not match. Please try again.');
        setConfirmPin('');
      }
    }
  };

  const handleSetupPin = async () => {
    setIsLoading(true);
    try {
      await setupPin(pin, {
        mobile: mobile || '',
        name: name || '',
        email: email || ''
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to setup PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  const isComplete = currentPin.length === 4;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => step === 'confirm' ? setStep('create') : router.back()}
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={48} color="#4facfe" />
        </View>
        
        <Text style={styles.title}>
          {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'create' 
            ? 'Choose a 4-digit PIN to secure your account'
            : 'Enter your PIN again to confirm'
          }
        </Text>

        {/* PIN Display */}
        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map(index => (
            <View
              key={index}
              style={[
                styles.pinDot,
                currentPin.length > index && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Number Pad */}
        <View style={styles.numberPadContainer}>
          <View style={styles.numberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <TouchableOpacity
                key={number}
                style={styles.numberButton}
                onPress={() => handleNumberPress(number.toString())}
                disabled={currentPin.length >= 4}
                activeOpacity={0.7}
              >
                <Text style={styles.numberText}>{number}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.emptyButton} />
            
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleNumberPress('0')}
              disabled={currentPin.length >= 4}
              activeOpacity={0.7}
            >
              <Text style={styles.numberText}>0</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={currentPin.length === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isComplete && styles.continueButtonActive]}
          onPress={handleContinue}
          disabled={!isComplete || isLoading}
          activeOpacity={0.8}
        >
          {step === 'confirm' && isComplete ? (
            <Check size={24} color="#FFFFFF" />
          ) : (
            <Text style={[styles.continueButtonText, isComplete && styles.continueButtonTextActive]}>
              {isLoading ? 'Setting up...' : step === 'create' ? 'Continue' : 'Confirm PIN'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#4facfe',
    borderColor: '#4facfe',
  },
  numberPadContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    maxWidth: 280,
    alignSelf: 'center',
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButton: {
    width: 72,
    height: 72,
  },
  deleteButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  deleteText: {
    fontSize: 24,
    color: '#6B7280',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: 30,
  },
  continueButtonActive: {
    backgroundColor: '#4facfe',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
});