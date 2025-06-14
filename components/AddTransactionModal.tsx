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
import { X, Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useGuest } from '@/contexts/GuestContext';
import CustomAlert from './CustomAlert';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ visible, onClose }: AddTransactionModalProps) {
  const { state, addTransaction } = useApp();
  const { incrementTransactionCount } = useGuest();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const categories = state.categories.filter(c => c.type === type);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const showCustomAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  const handleSubmit = () => {
    if (!amount || !description || !selectedCategory) {
      showCustomAlert('error', 'Missing Information', 'Please fill in all fields to continue.');
      return;
    }

    if (!description.trim()) {
      showCustomAlert('error', 'Invalid Description', 'Please enter a valid description for this transaction.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showCustomAlert('error', 'Invalid Amount', 'Please enter a valid amount greater than zero.');
      return;
    }

    addTransaction({
      amount: numAmount,
      type,
      category: selectedCategory,
      description: description.trim(),
      date,
    });

    // Increment transaction count for guest users
    incrementTransactionCount();

    showCustomAlert('success', 'Transaction Added', 'Your transaction has been successfully added.');
    resetForm();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Transaction</Text>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
              <Check size={24} color="#4facfe" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                  onPress={() => setType('expense')}
                >
                  <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                  onPress={() => setType('income')}
                >
                  <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount *</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description *</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.name && styles.categoryButtonActive,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category.name && { color: category.color }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setShowAlert(false)}
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
  content: {
    flex: 1,
    padding: 20,
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#4facfe',
    backgroundColor: '#4facfe',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    marginBottom: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});