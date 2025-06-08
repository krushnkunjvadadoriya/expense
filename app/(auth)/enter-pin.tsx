import React, { useState, useEffect } from 'react';
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
import { Link, router } from 'expo-router';
import { Shield, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function EnterPin() {
  const { verifyPin, state } = useAuth();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 30; // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTime > 0) {
      interval = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTime]);

  const handleNumberPress = (number: string) => {
    if (isLocked || pin.length >= 4) return;

    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Ignore vibration errors
      }
    }

    const newPin = pin + number;
    setPin(newPin);

    if (newPin.length === 4) {
      handleVerifyPin(newPin);
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPin(prev => prev.slice(0, -1));
  };

  const handleVerifyPin = async (pinToVerify: string) => {
    setIsLoading(true);
    try {
      const isValid = await verifyPin(pinToVerify);
      if (isValid) {
        // PIN is correct, navigate to main app
        router.replace('/(tabs)');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockTime(LOCK_DURATION);
          Alert.alert(
            'Too Many Attempts',
            `Account locked for ${LOCK_DURATION} seconds due to multiple failed attempts.`
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${MAX_ATTEMPTS - newAttempts} attempts remaining.`
          );
        }
        
        // Shake animation effect
        if (Platform.OS !== 'web') {
          try {
            Vibration.vibrate([0, 100, 50, 100]);
          } catch (error) {
            // Ignore vibration errors
          }
        }
        
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMobile = (mobile: string) => {
    if (!mobile) return '';
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 2)}***-***-${cleaned.slice(-4)}`;
    }
    return mobile;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, isLocked && styles.iconContainerLocked]}>
          {isLocked ? (
            <AlertCircle size={48} color="#EF4444" />
          ) : (
            <Shield size={48} color="#3B82F6" />
          )}
        </View>
        <Text style={styles.title}>
          {isLocked ? 'Account Locked' : 'Enter Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {isLocked 
            ? `Try again in ${formatTime(lockTime)}`
            : state.user?.mobile 
              ? `Welcome back! Enter your PIN for ${formatMobile(state.user.mobile)}`
              : 'Enter your 4-digit PIN to continue'
          }
        </Text>
      </View>

      {/* PIN Display */}
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
              isLocked && styles.pinDotLocked,
            ]}
          />
        ))}
      </View>

      {/* Attempts Warning */}
      {attempts > 0 && !isLocked && (
        <View style={styles.warningContainer}>
          <AlertCircle size={16} color="#F59E0B" />
          <Text style={styles.warningText}>
            {attempts} of {MAX_ATTEMPTS} attempts used
          </Text>
        </View>
      )}

      {/* Number Pad */}
      <View style={styles.numberPadContainer}>
        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <TouchableOpacity
              key={number}
              style={[styles.numberButton, isLocked && styles.numberButtonDisabled]}
              onPress={() => handleNumberPress(number.toString())}
              disabled={isLocked || pin.length >= 4 || isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.numberText, isLocked && styles.numberTextDisabled]}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.numberButton} />
          
          <TouchableOpacity
            style={[styles.numberButton, isLocked && styles.numberButtonDisabled]}
            onPress={() => handleNumberPress('0')}
            disabled={isLocked || pin.length >= 4 || isLoading}
            activeOpacity={0.7}
          >
            <Text style={[styles.numberText, isLocked && styles.numberTextDisabled]}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.numberButton, isLocked && styles.numberButtonDisabled]}
            onPress={handleDelete}
            disabled={isLocked || pin.length === 0 || isLoading}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteText, isLocked && styles.numberTextDisabled]}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Link href="/(auth)/forgot-pin" asChild>
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotButtonText}>Forgot PIN?</Text>
          </TouchableOpacity>
        </Link>
        
        <Text style={styles.registerText}>
          Not your account?{' '}
          <Link href="/(auth)/mobile-entry" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Switch Account</Text>
            </TouchableOpacity>
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainerLocked: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pinDotLocked: {
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    alignSelf: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
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
    gap: 15,
    paddingHorizontal: 10,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  numberButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  numberTextDisabled: {
    color: '#9CA3AF',
  },
  deleteText: {
    fontSize: 22,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  forgotButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  forgotButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  registerLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});