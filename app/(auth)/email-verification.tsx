import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowLeft, RotateCcw, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function EmailVerification() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);

    try {
      // Mock OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any 6-digit OTP
      if (otpCode.length === 6) {
        setIsVerified(true);
        
        // Auto-navigate after verification to profile setup
        setTimeout(() => {
          router.push({
            pathname: '/(auth)/registration-form',
            params: { email: email || '' }
          });
        }, 2000);
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Invalid OTP', 'Please check the code and try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Mock resend email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResendTimer(60);
      setCanResend(false);
      
      Alert.alert('Email Sent', 'A new verification code has been sent to your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (local.length <= 3) return email;
    return `${local.slice(0, 2)}***@${domain}`;
  };

  if (isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedIcon}>
            <CheckCircle size={64} color="#4facfe" />
          </View>
          <Text style={styles.verifiedTitle}>Email Verified!</Text>
          <Text style={styles.verifiedMessage}>
            Your email has been successfully verified. Setting up your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Mail size={48} color="#4facfe" />
          </View>
          
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.emailText}>{formatEmail(email || '')}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  isLoading && styles.otpInputDisabled
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
                data-index={index}
              />
            ))}
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResendEmail}
              >
                <RotateCcw size={16} color="#4facfe" />
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
            Didn't receive the code? Check your spam folder or try resending.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 40,
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
    marginBottom: 8,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 40,
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
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
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
    color: '#4facfe',
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
    backgroundColor: '#4facfe',
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
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  verifiedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  verifiedIcon: {
    marginBottom: 24,
  },
  verifiedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifiedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});