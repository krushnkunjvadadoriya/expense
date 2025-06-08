import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, ArrowLeft, RotateCcw, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function EmailVerification() {
  const { email } = useLocalSearchParams<{ email: string }>();
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

  // Simulate email verification check
  useEffect(() => {
    const checkVerification = setInterval(() => {
      // In a real app, you'd poll your backend or use websockets
      // For demo, randomly verify after some time
      if (Math.random() > 0.95) {
        setIsVerified(true);
        clearInterval(checkVerification);
        
        // Auto-navigate after verification
        setTimeout(() => {
          handleVerificationComplete();
        }, 2000);
      }
    }, 2000);

    return () => clearInterval(checkVerification);
  }, []);

  const handleVerificationComplete = () => {
    // Check if user exists (mock check)
    const userExists = Math.random() > 0.5; // 50% chance for demo
    
    if (userExists) {
      // Existing user - go to PIN entry
      router.replace('/(auth)/enter-pin');
    } else {
      // New user - go to registration form
      router.push({
        pathname: '/(auth)/registration-form',
        params: { email: email || '' }
      });
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
      
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerification = () => {
    Alert.alert(
      'Manual Verification',
      'Click the verification link in your email to continue. The link will automatically redirect you back to the app.',
      [
        { text: 'OK' },
        { 
          text: 'I clicked the link', 
          onPress: handleVerificationComplete 
        }
      ]
    );
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
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text style={styles.verifiedTitle}>Email Verified!</Text>
          <Text style={styles.verifiedMessage}>
            Your email has been successfully verified. Redirecting you now...
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
            <Mail size={48} color="#10B981" />
          </View>
          
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{'\n'}
            <Text style={styles.emailText}>{formatEmail(email || '')}</Text>
          </Text>
          <Text style={styles.description}>
            Click the link in the email to verify your account. The verification will happen automatically.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleManualVerification}
            >
              <Text style={styles.primaryButtonText}>I clicked the link</Text>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendEmail}
                  disabled={isLoading}
                >
                  <RotateCcw size={16} color="#10B981" />
                  <Text style={styles.resendButtonText}>
                    {isLoading ? 'Sending...' : 'Resend Email'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend available in {resendTimer}s
                </Text>
              )}
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Didn't receive the email?</Text>
            <Text style={styles.helpText}>
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Wait a few minutes for delivery{'\n'}
              • Try resending the email
            </Text>
          </View>
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
    backgroundColor: '#D1FAE5',
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
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  actionContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#64748B',
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