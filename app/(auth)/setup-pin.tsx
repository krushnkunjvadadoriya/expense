import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform,
  Animated,
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
          <ArrowLeft size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Shield size={56} color="#4facfe" />
          <View style={styles.sparkleIcon}>
            <Sparkles size={20} color="#FFFFFF" />
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

        {/* PIN Display - Enhanced circular dots */}
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
              activeOpacity={0.6}
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
            activeOpacity={0.6}
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
            activeOpacity={0.6}
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
    backgroundColor: '#FAFBFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 36,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepDotActive: {
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOpacity: 0.3,
  },
  stepLine: {
    width: 48,
    height: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
    borderRadius: 1.5,
  },
  stepLineActive: {
    backgroundColor: '#4facfe',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  pinDotFilled: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.15 }],
    shadowColor: '#4facfe',
    shadowOpacity: 0.2,
  },
  pinDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4facfe',
  },
  numberPadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    minHeight: 340,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    maxWidth: 340,
    alignSelf: 'center',
  },
  numberButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  numberButtonDisabled: {
    opacity: 0.4,
  },
  emptyButton: {
    width: 88,
    height: 88,
  },
  deleteButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButtonDisabled: {
    opacity: 0.25,
  },
  numberText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  numberTextDisabled: {
    color: '#94A3B8',
  },
  deleteText: {
    fontSize: 32,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteTextDisabled: {
    color: '#CBD5E1',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 44,
  },
  continueButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  continueButtonActive: {
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOpacity: 0.3,
    borderColor: '#4facfe',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continueButtonText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  securityIcon: {
    marginRight: 12,
  },
  securityIconText: {
    fontSize: 18,
  },
  securityText: {
    fontSize: 15,
    color: '#065F46',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});