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
import { router } from 'expo-router';
import { Smartphone, ArrowRight } from 'lucide-react-native';

export default function MobileEntry() {
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isLoading, setIsLoading] = useState(false);

  const validateMobile = (number: string) => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '');
    // Check if it's a valid length (10 digits for US)
    return cleaned.length === 10;
  };

  const formatMobile = (number: string) => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
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

  const handleContinue = async () => {
    const cleanedMobile = mobile.replace(/\D/g, '');
    
    if (!validateMobile(mobile)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to OTP verification with mobile number
      router.push({
        pathname: '/(auth)/otp-verification',
        params: { mobile: `${countryCode}${cleanedMobile}` }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Smartphone size={48} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Welcome to ExpenseTracker</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to get started with secure PIN-based authentication
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                  maxLength={14} // Formatted length
                />
              </View>
              <Text style={styles.helperText}>
                We'll send you a verification code via SMS
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.continueButton, mobile.length >= 14 && styles.continueButtonActive]}
              onPress={handleContinue}
              disabled={mobile.length < 14 || isLoading}
            >
              <Text style={[
                styles.continueButtonText, 
                mobile.length >= 14 && styles.continueButtonTextActive
              ]}>
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </Text>
              {mobile.length >= 14 && !isLoading && (
                <ArrowRight size={20} color="#FFFFFF" style={styles.arrowIcon} />
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
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
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
  inputContainer: {
    marginBottom: 32,
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
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  footer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});