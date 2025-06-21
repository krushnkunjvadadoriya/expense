import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Check, Mail, UserPlus } from 'lucide-react-native';
import CustomAlert from './CustomAlert';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ visible, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const resetForm = () => {
    setEmail('');
    setRole('member');
    setMessage('');
    setEmailError('');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showCustomAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    
    // If it was a success alert, close the modal after a short delay
    if (alertConfig.type === 'success') {
      setTimeout(() => {
        resetForm();
        onClose();
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // Clear any existing email error
    setEmailError('');

    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!email.trim()) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call to send invitation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showCustomAlert('success', 'Invitation Sent', `Invitation has been sent to ${email} successfully!`);
    } catch (error) {
      showCustomAlert('error', 'Failed to Send Invitation', 'There was an error sending the invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Invite Member</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              disabled={isLoading}
            >
              <Check size={24} color={isLoading ? "#9CA3AF" : "#4facfe"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <UserPlus size={48} color="#4facfe" />
            </View>

            {/* Email */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email Address *</Text>
              <View style={[
                styles.inputContainer,
                emailError && styles.inputContainerError
              ]}>
                <Mail size={20} color={emailError ? "#EF4444" : "#6B7280"} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                      setEmailError(''); // Clear error when user starts typing
                    }
                  }}
                  placeholder="member@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Role Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Role</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'member' && styles.roleButtonActive]}
                  onPress={() => setRole('member')}
                  disabled={isLoading}
                >
                  <Text style={[styles.roleButtonText, role === 'member' && styles.roleButtonTextActive]}>
                    Member
                  </Text>
                  <Text style={styles.roleDescription}>
                    Can add expenses and view family budget
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
                  onPress={() => setRole('admin')}
                  disabled={isLoading}
                >
                  <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
                    Admin
                  </Text>
                  <Text style={styles.roleDescription}>
                    Can manage budget, invite members, and all member permissions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Personal Message */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Message (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Add a personal message to the invitation..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            {/* Preview Card */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Invitation Preview</Text>
              <Text style={styles.previewText}>
                You've been invited to join "The Doe Family" budget group as a {role}.
                {message && `\n\n"${message}"`}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleContainer: {
    gap: 12,
  },
  roleButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleButtonActive: {
    borderColor: '#4facfe',
    backgroundColor: '#DBEAFE',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  roleButtonTextActive: {
    color: '#4facfe',
  },
  roleDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});