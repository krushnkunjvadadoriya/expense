import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageSquare, ArrowLeft, RotateCcw } from 'lucide-react-native';

export default function OtpVerification() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);

    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Ignore vibration errors
      }
    }

    try {
      // Mock OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any 6-digit OTP
      if (otpCode.length === 6) {
        // Check if user exists (mock check)
        const userExists = Math.random() > 0.5; // 50% chance for demo
        
        if (userExists) {
          // Existing user - go to PIN entry
          router.replace('/(auth)/enter-pin');
        } else {
          // New user - go to registration form
          router.push({
            pathname: '/(auth)/registration-form',
            params: { mobile: mobile || '' }
          });
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Invalid OTP', 'Please check the code and try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      // Mock resend OTP
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      Alert.alert('OTP Sent', 'A new verification code has been sent to your mobile number.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const formatMobile = (number: string) => {
    if (!number) return '';
    // Hide middle digits for privacy
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 2)}***-***-${cleaned.slice(-4)}`;
    }
    return number;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MessageSquare size={48} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to{'\n'}
          <Text style={styles.mobileText}>{formatMobile(mobile || '')}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                isLoading && styles.otpInputDisabled
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </View>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendOtp}
            >
              <RotateCcw size={16} color="#3B82F6" />
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in {resendTimer}s
            </Text>
          )}
        </View>

        {/* Manual Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.every(digit => digit !== '') && styles.verifyButtonActive
          ]}
          onPress={() => handleVerifyOtp(otp.join(''))}
          disabled={!otp.every(digit => digit !== '') || isLoading}
        >
          <Text style={[
            styles.verifyButtonText,
            otp.every(digit => digit !== '') && styles.verifyButtonTextActive
          ]}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Didn't receive the code? Check your SMS or try resending.
        </Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
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
  mobileText: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: '#3B82F6',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});