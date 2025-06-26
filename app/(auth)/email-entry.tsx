import React, { useState } from 'react';
import API from '@/config/api';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react-native';
import { useGuest } from '@/contexts/GuestContext';
import { useApp } from '@/contexts/AppContext';

export default function EmailEntry() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { convertToRegisteredUser } = useGuest();
  const { addEMI, showGlobalAlert } = useApp();
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleContinue = async () => {
  setErrorMessage('');

  if (!validateEmail(email)) {
    setErrorMessage('Please enter a valid email address.');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${API.API_BASE_URL}/email-send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : {};

    if (response.ok && data.success) {
      router.push({
        pathname: '/(auth)/email-verification',
        params: { email },
      });
    } else if (response.status === 404) {
      // ⚠️ Show model-style alert for 404
      showGlobalAlert({
        type: 'error',
        title: 'Missing Information',
        message: data?.message || 'The requested endpoint could not be found.',
      });
    } else {
      // Other error
      showGlobalAlert({
        type: 'error',
        title: 'Server Error',
        message: data?.message || 'Unexpected server error occurred.',
      });
    }
  } catch (error) {
    showGlobalAlert({
      type: 'error',
      title: 'Network Error',
      message: 'Unable to reach the server. Please check your internet connection.',
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSignIn = async () => {
    setErrorMessage('Google authentication not implemented yet.');
  };

  const handleAppleSignIn = async () => {
    setErrorMessage('Apple authentication not implemented yet.');
  };

  const handleBackToApp = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToApp}>
              <ArrowLeft size={20} color="#6B7280" />
              <Text style={styles.backButtonText}>Back to App</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.backgroundGradient}>
              <View style={styles.heroContent}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoIcon}>
                    <Sparkles size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.logoText}>ExpenseTracker</Text>
                </View>
                <Text style={styles.heroTitle}>Secure Your Financial Data</Text>
                <Text style={styles.heroSubtitle}>
                  Create a free account to backup and sync your expenses across all devices
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Create Your Account</Text>
              <Text style={styles.welcomeSubtitle}>Enter your email to get started</Text>
            </View>

            <View style={styles.emailSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.emailInputContainer,
                    email && validateEmail(email) && styles.emailInputValid,
                    email && !validateEmail(email) && styles.emailInputInvalid,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Mail
                      size={20}
                      color={email && validateEmail(email) ? '#4facfe' : '#6B7280'}
                    />
                  </View>
                  <TextInput
                    style={styles.emailInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  {email && validateEmail(email) && (
                    <View style={styles.validIcon}>
                      <Text style={styles.validIconText}>✓</Text>
                    </View>
                  )}
                </View>

                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    We'll send you a secure verification code
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  validateEmail(email) && styles.continueButtonActive,
                ]}
                onPress={handleContinue}
                disabled={!validateEmail(email) || isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.continueButtonContent}>
                  <Text
                    style={[
                      styles.continueButtonText,
                      validateEmail(email) && styles.continueButtonTextActive,
                    ]}
                  >
                    {isLoading ? 'Sending verification...' : 'Continue with Email'}
                  </Text>
                  {validateEmail(email) && !isLoading && (
                    <ArrowRight size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerTextContainer}>
                  <Text style={styles.dividerText}>or</Text>
                </View>
                <View style={styles.dividerLine} />
              </View>
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&fit=crop',
                  }}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>Sign in with Google</Text>
                <ArrowRight size={16} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
              >
                <View style={styles.appleIconContainer}>
                  <Text style={styles.appleIcon}>🍎</Text>
                </View>
                <Text style={styles.socialButtonText}>Sign in with Apple</Text>
                <ArrowRight size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.securityBadge}>
              <View style={styles.securityIcon}>
                <Text style={styles.securityIconText}>🔒</Text>
              </View>
              <Text style={styles.securityText}>Your data is encrypted and secure</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  heroSection: {
    height: 280,
    position: 'relative',
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#4facfe',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emailSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emailInputValid: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
  },
  emailInputInvalid: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  validIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonActive: {
    backgroundColor: '#4facfe',
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  dividerContainer: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerTextContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  socialContainer: {
    marginBottom: 32,
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
  },
  appleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appleIcon: {
    fontSize: 18,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  securityIcon: {
    marginRight: 8,
  },
  securityIconText: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: '#4facfe',
    fontWeight: '600',
  },
});