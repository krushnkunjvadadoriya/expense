import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { X, Shield, Cloud, Smartphone, Mail, ArrowRight } from 'lucide-react-native';
import { useGuest } from '@/contexts/GuestContext';
import { router } from 'expo-router';

interface RegistrationPromptModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RegistrationPromptModal({ visible, onClose }: RegistrationPromptModalProps) {
  const { state, markRegistrationPromptShown } = useGuest();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccount = () => {
    markRegistrationPromptShown();
    onClose();
    router.push('/(auth)/email-entry');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Mock Google sign-in
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Google Sign In', 'Google authentication will be implemented here');
      markRegistrationPromptShown();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      // Mock Apple sign-in
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Apple Sign In', 'Apple authentication will be implemented here');
      markRegistrationPromptShown();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    markRegistrationPromptShown();
    onClose();
  };

  const getPromptReason = () => {
    if (state.transactionCount >= 5) {
      return {
        title: "You're on a roll! 🎉",
        subtitle: `${state.transactionCount} transactions and counting`,
        description: "Don't lose your financial progress"
      };
    } else if (state.appOpenCount >= 3) {
      return {
        title: "Welcome back! 👋",
        subtitle: `${state.appOpenCount} visits and counting`,
        description: "Secure your data across all devices"
      };
    } else {
      return {
        title: "Backup your data 📦",
        subtitle: "Keep your financial data safe",
        description: "Never lose your transactions again"
      };
    }
  };

  const promptReason = getPromptReason();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleMaybeLater} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Cloud size={48} color="#4facfe" />
            <View style={styles.shieldIcon}>
              <Shield size={20} color="#FFFFFF" />
            </View>
          </View>
          
          <Text style={styles.title}>{promptReason.title}</Text>
          <Text style={styles.subtitle}>{promptReason.subtitle}</Text>
          <Text style={styles.description}>{promptReason.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Cloud size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Cloud Backup</Text>
              <Text style={styles.benefitDescription}>Access your data anywhere, anytime</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Shield size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Secure & Private</Text>
              <Text style={styles.benefitDescription}>Bank-level encryption for your data</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Smartphone size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Multi-Device Sync</Text>
              <Text style={styles.benefitDescription}>Seamless experience across devices</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            <Mail size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Create Free Account</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&fit=crop' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.appleIcon}>🍎</Text>
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleMaybeLater} style={styles.laterButton}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Free forever • No credit card required • 2-minute setup
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  shieldIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#4facfe',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4facfe',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  appleIcon: {
    fontSize: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});