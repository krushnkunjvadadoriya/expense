import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Check, Mail, UserPlus } from 'lucide-react-native';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ visible, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setEmail('');
    setRole('member');
    setMessage('');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Here you would typically send the invitation via API
    Alert.alert('Success', `Invitation sent to ${email}!`, [
      { text: 'OK', onPress: () => {
        resetForm();
        onClose();
      }}
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Invite Member</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Check size={24} color="#4facfe" />
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
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="member@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'member' && styles.roleButtonActive]}
                onPress={() => setRole('member')}
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
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems:  'center',
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
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