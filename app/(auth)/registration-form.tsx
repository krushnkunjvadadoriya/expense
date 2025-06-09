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
import { User, Mail, ArrowRight, ArrowLeft, Smartphone } from 'lucide-react-native';

export default function RegistrationForm() {
  const { email, mobile } = useLocalSearchParams<{ 
    email?: string; 
    mobile?: string; 
  }>();
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
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.progressText}>Step 2 of 3</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <User size={48} color="#4facfe" />
            </View>
            
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              We need a few details to set up your account for{'\n'}
              <Text style={styles.contactText}>{formatContact(primaryContact)}</Text>
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Email (if not already provided) */}
              {!email && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Email Address <Text style={styles.optional}>(Optional)</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#6B7280" />
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
                  </View>
                  <Text style={styles.helperText}>
                    We'll use this for account recovery and important updates
                  </Text>
                </View>
              )}

              {/* Mobile (if not already provided) */}
              {!mobile && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Mobile Number <Text style={styles.optional}>(Optional)</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Smartphone size={20} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      value={formData.mobile}
                      onChangeText={(value) => handleInputChange('mobile', value)}
                      placeholder="Enter your mobile number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
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
          </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
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
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    marginBottom: 40,
  },
  contactText: {
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});