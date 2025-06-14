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
import { router, useLocalSearchParams } from 'expo-router';
import { User, Mail, ArrowRight, ArrowLeft, Smartphone, Sparkles } from 'lucide-react-native';
import { useGuest } from '@/contexts/GuestContext';

export default function RegistrationForm() {
  const { email, mobile } = useLocalSearchParams<{ 
    email?: string; 
    mobile?: string; 
  }>();
  const { convertToRegisteredUser } = useGuest();
  const [formData, setFormData] = useState({
    name: '',
    email: email || '',
    mobile: mobile || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) return true; // Email is optional if mobile is provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call to save user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert from guest to registered user
      convertToRegisteredUser();
      
      // Navigate to PIN setup with user data
      router.push({
        pathname: '/(auth)/setup-pin',
        params: { 
          email: formData.email,
          mobile: formData.mobile,
          name: formData.name,
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatContact = (contact: string) => {
    if (!contact) return '';
    if (contact.includes('@')) {
      // Email
      const [local, domain] = contact.split('@');
      if (local.length <= 3) return contact;
      return `${local.slice(0, 2)}***@${domain}`;
    } else {
      // Mobile
      const cleaned = contact.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        return `${cleaned.slice(0, 2)}***-***-${cleaned.slice(-4)}`;
      }
      return contact;
    }
  };

  const primaryContact = email || mobile || '';

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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Sparkles size={32} color="#4facfe" />
            </View>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Just a few details to secure your financial data
            </Text>
            {primaryContact && (
              <View style={styles.contactBadge}>
                <Text style={styles.contactBadgeText}>
                  {formatContact(primaryContact)}
                </Text>
              </View>
            )}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                formData.name && styles.inputWrapperFocused
              ]}>
                <User size={20} color={formData.name ? "#4facfe" : "#6B7280"} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoComplete="name"
                />
                {formData.name && (
                  <View style={styles.validIcon}>
                    <Text style={styles.validIconText}>✓</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Email (if not already provided) */}
            {!email && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.optional}>(Optional)</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  formData.email && styles.inputWrapperFocused
                ]}>
                  <Mail size={20} color={formData.email ? "#4facfe" : "#6B7280"} />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  {formData.email && validateEmail(formData.email) && (
                    <View style={styles.validIcon}>
                      <Text style={styles.validIconText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.helperText}>
                  For account recovery and important updates
                </Text>
              </View>
            )}

            {/* Mobile (if not already provided) */}
            {!mobile && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Mobile Number <Text style={styles.optional}>(Optional)</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  formData.mobile && styles.inputWrapperFocused
                ]}>
                  <Smartphone size={20} color={formData.mobile ? "#4facfe" : "#6B7280"} />
                  <TextInput
                    style={styles.input}
                    value={formData.mobile}
                    onChangeText={(value) => handleInputChange('mobile', value)}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                  {formData.mobile && (
                    <View style={styles.validIcon}>
                      <Text style={styles.validIconText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.helperText}>
                  For account recovery and security alerts
                </Text>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              formData.name.trim() && styles.continueButtonActive
            ]}
            onPress={handleContinue}
            disabled={!formData.name.trim() || isLoading}
          >
            <Text style={[
              styles.continueButtonText,
              formData.name.trim() && styles.continueButtonTextActive
            ]}>
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
            {formData.name.trim() && !isLoading && (
              <ArrowRight size={20} color="#FFFFFF" style={styles.arrowIcon} />
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your information is secure and will only be used to personalize your experience
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
    marginBottom: 20,
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
    paddingVertical: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  contactBadge: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  form: {
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
  required: {
    color: '#EF4444',
  },
  optional: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  inputWrapper: {
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
  inputWrapperFocused: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
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
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 32,
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
  arrowIcon: {
    marginLeft: 8,
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});