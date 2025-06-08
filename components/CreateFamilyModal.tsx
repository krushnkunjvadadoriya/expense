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
import { X, Check, Users } from 'lucide-react-native';

interface CreateFamilyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateFamilyModal({ visible, onClose }: CreateFamilyModalProps) {
  const [familyName, setFamilyName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');

  const resetForm = () => {
    setFamilyName('');
    setDescription('');
    setMonthlyBudget('');
  };

  const handleSubmit = () => {
    if (!familyName || !monthlyBudget) {
      Alert.alert('Error', 'Please fill in the required fields');
      return;
    }

    const budget = parseFloat(monthlyBudget);
    if (isNaN(budget) || budget <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    // Here you would typically create the family group via API
    Alert.alert('Success', 'Family group created successfully!', [
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
          <Text style={styles.title}>Create Family Group</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Check size={24} color="#4facfe" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Users size={48} color="#4facfe" />
          </View>

          {/* Family Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Name *</Text>
            <TextInput
              style={styles.input}
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="e.g., The Smith Family"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of your family group"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Monthly Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Budget *</Text>
            <TextInput
              style={styles.input}
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>
              This will be the total monthly budget for your family group
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              • You'll become the admin of this family group{'\n'}
              • You can invite family members via email{'\n'}
              • Everyone can add expenses and track the shared budget{'\n'}
              • You can set category-wise budget limits
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
  input: {
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
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});