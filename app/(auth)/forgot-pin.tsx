import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Smartphone, ArrowLeft, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPin() {
  const { resetPin } = useAuth();
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validateMobile = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const formatMobile = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const handleMobileChange = (text: string) => {
    const formatted = formatMobile(text);
    setMobile(formatted);
  };

  const handleResetPin = async () => {
    if (!validateMobile(mobile)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const cleanedMobile = mobile.replace(/\D/g, '');
      await resetPin(`${countryCode}${cleanedMobile}`);
      setOtpSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (otpSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Smartphone size={48} color="#3B82F6" />
            </View>
            <Text style={styles.successTitle}>Instructions Sent</Text>
            <Text style={styles.successMessage}>
              We've sent PIN reset instructions to{'\n'}
              <Text style={styles.mobileText}>{countryCode} {mobile}</Text>
            </Text>
            <Text style={styles.successSubtext}>
              Follow the instructions in the SMS to reset your PIN. If you don't receive the message, please try again.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => setOtpSent(false)}
            >
              <Text style={styles.resendButtonText}>Send Again</Text>
            </TouchableOpacity>

            <Link href="/(auth)/enter-pin" asChild>
              <TouchableOpacity style={styles.backButton}>
                <ArrowLeft size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back to PIN Entry</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Link href="/(auth)/enter-pin" asChild>
              <TouchableOpacity style={styles.backButton}>
                <ArrowLeft size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.form}>
            <View style={styles.iconContainer}>
              <Shield size={48} color="#3B82F6" />
            </View>
            
            <Text style={styles.title}>Reset PIN</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number and we'll send you instructions to reset your PIN.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.mobileInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>
                <TextInput
                  style={styles.mobileInput}
                  value={mobile}
                  onChangeText={handleMobileChange}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.resetButton, 
                mobile.length >= 14 && styles.resetButtonActive,
                isLoading && styles.resetButtonDisabled
              ]}
              onPress={handleResetPin}
              disabled={mobile.length < 14 || isLoading}
            >
              <Text style={[
                styles.resetButtonText,
                mobile.length >= 14 && styles.resetButtonTextActive
              ]}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 40,
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
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 500,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonActive: {
    backgroundColor: '#3B82F6',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  resetButtonTextActive: {
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 400,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  mobileText: {
    fontWeight: '600',
    color: '#111827',
  },
  successSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  resendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});