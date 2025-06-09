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
          <Shield size={52} color="#4facfe" />
          <View style={styles.sparkleIcon}>
            <Sparkles size={18} color="#4facfe" />
          </View>
        </View>
        
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'create' && styles.stepDotActive]} />
          <View style={[styles.stepLine, step === 'confirm' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
        </View>

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
              style={[
                styles.numberButton,
                currentPin.length >= 4 && styles.numberButtonDisabled
              ]}
              onPress={() => handleNumberPress(number.toString())}
              disabled={currentPin.length >= 4}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.numberText,
                currentPin.length >= 4 && styles.numberTextDisabled
              ]}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.emptyButton} />
          
          <TouchableOpacity
            style={[
              styles.numberButton,
              currentPin.length >= 4 && styles.numberButtonDisabled
            ]}
            onPress={() => handleNumberPress('0')}
            disabled={currentPin.length >= 4}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.numberText,
              currentPin.length >= 4 && styles.numberTextDisabled
            ]}>
              0
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.deleteButton,
              currentPin.length === 0 && styles.deleteButtonDisabled
            ]}
            onPress={handleDelete}
            disabled={currentPin.length === 0}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.deleteText,
              currentPin.length === 0 && styles.deleteTextDisabled
            ]}>
              ⌫
            </Text>
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
            <View style={styles.buttonContent}>
              <Check size={24} color="#FFFFFF" />
              <Text style={styles.continueButtonTextActive}>Complete Setup</Text>
            </View>
          ) : (
            <Text style={[styles.continueButtonText, isComplete && styles.continueButtonTextActive]}>
              {isLoading ? 'Setting up...' : step === 'create' ? 'Continue' : 'Confirm PIN'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <View style={styles.securityIcon}>
            <Text style={styles.securityIconText}>🔒</Text>
          </View>
          <Text style={styles.securityText}>
            Your PIN is encrypted and stored securely
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#4facfe',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#4facfe',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pinDotFilled: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.1 }],
  },
  pinDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4facfe',
  },
  numberPadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    minHeight: 320,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    maxWidth: 320,
    alignSelf: 'center',
  },
  numberButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  numberButtonDisabled: {
    opacity: 0.5,
  },
  emptyButton: {
    width: 84,
    height: 84,
  },
  deleteButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deleteButtonDisabled: {
    opacity: 0.3,
  },
  numberText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
  },
  numberTextDisabled: {
    color: '#94A3B8',
  },
  deleteText: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteTextDisabled: {
    color: '#CBD5E1',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  continueButtonActive: {
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOpacity: 0.25,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  securityIcon: {
    marginRight: 12,
  },
  securityIconText: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
  },
});