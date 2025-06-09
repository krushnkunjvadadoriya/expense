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
import { Shield, Check, ArrowLeft, Sparkles } from 'lucide-react-native';
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

  const getTitle = () => {
    switch (step) {
      case 'create': return 'Create Your PIN';
      case 'confirm': return 'Confirm Your PIN';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'create': return 'Choose a secure 4-digit PIN to protect your account';
      case 'confirm': return 'Enter your PIN again to confirm';
      default: return '';
    }
  };

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
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Shield size={48} color="#4facfe" />
          <View style={styles.sparkleIcon}>
            <Sparkles size={20} color="#4facfe" />
          </View>
        </View>
        
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* PIN Display - Modern circular dots */}
        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map(index => (
            <View
              key={index}
              style={[
                styles.pinDot,
                currentPin.length > index && styles.pinDotFilled,
              ]}
            >
              {currentPin.length > index && (
                <View style={styles.pinDotInner} />
              )}
            </View>
          ))}
        </View>
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
      <View style={styles.bottomSection}>
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

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your PIN is encrypted and stored securely
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 32,
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
    paddingHorizontal: 20,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
  },
  pinDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4facfe',
  },
  numberPadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    maxWidth: 300,
    alignSelf: 'center',
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButton: {
    width: 80,
    height: 80,
  },
  deleteButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  deleteText: {
    fontSize: 28,
    color: '#6B7280',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  securityNote: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});