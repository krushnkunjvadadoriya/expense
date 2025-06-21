import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Check, Calendar } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useGuest } from '@/contexts/GuestContext';
import { Transaction } from '@/types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction | null; // For editing existing transactions
}

export default function AddTransactionModal({ visible, onClose, transaction }: AddTransactionModalProps) {
  const { state, addTransaction, updateTransaction, showGlobalAlert } = useApp();
  const { incrementTransactionCount } = useGuest();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const isEditing = !!transaction;
  const categories = state.categories.filter(c => c.type === type);

  // Pre-fill form when editing
  useEffect(() => {
    if (transaction && visible) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setSelectedCategory(transaction.category);
      setDate(transaction.date);
    } else if (!transaction && visible) {
      // Reset form for new transaction
      resetForm();
    }
  }, [transaction, visible]);

  // Reset category when type changes and not editing
  useEffect(() => {
    if (!isEditing) {
      setSelectedCategory('');
    }
  }, [type, isEditing]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    if (!isEditing) {
      setSelectedCategory(''); // Reset category when type changes for new transactions
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (inputDate: string) => {
    // inputDate comes in YYYY-MM-DD format from the input
    setDate(inputDate);
  };

  const handleSubmit = () => {
    if (!amount || !description || !selectedCategory) {
      showGlobalAlert({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all fields to continue.',
      });
      return;
    }

    if (!description.trim()) {
      showGlobalAlert({
        type: 'error',
        title: 'Invalid Description',
        message: 'Please enter a valid description for this transaction.',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showGlobalAlert({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than zero.',
      });
      return;
    }

    try {
      if (isEditing && transaction) {
        // Update existing transaction
        const updatedTransaction: Transaction = {
          ...transaction,
          amount: numAmount,
          type,
          category: selectedCategory,
          description: description.trim(),
          date,
          updatedAt: new Date().toISOString(),
        };
        
        updateTransaction(updatedTransaction);
        showGlobalAlert({
          type: 'success',
          title: 'Transaction Updated',
          message: 'Your transaction has been successfully updated.',
          onConfirm: onClose,
        });
      } else {
        // Add new transaction
        addTransaction({
          amount: numAmount,
          type,
          category: selectedCategory,
          description: description.trim(),
          date,
        });

        // Increment transaction count for guest users
        incrementTransactionCount();
        showGlobalAlert({
          type: 'success',
          title: 'Transaction Added',
          message: 'Your transaction has been successfully added.',
          onConfirm: onClose,
        });
      }
      
      if (!isEditing) {Add a unique id property to the FamilyBudgetCategory interface. This will allow for proper identification and manipulation of individual categories within the budget management modal.

        resetForm();
      }
    } catch (error) {
      showGlobalAlert({
        type: 'error',
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'add'} transaction. Please try again.`,
      });
    }
  };

  const getSelectedCategoryInfo = () => {
    return categories.find(c => c.name === selectedCategory);
  };

  const selectedCategoryInfo = getSelectedCategoryInfo();

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </Text>
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
                onPress={() => handleTypeChange('expense')}
              >
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                onPress={() => handleTypeChange('income')}
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

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.dateContainer}>
              <View style={styles.dateInputWrapper}>
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={styles.dateInput}
                  value={formatDateForDisplay(date)}
                  onChangeText={(text) => {
                    // Handle manual text input - convert DD-MM-YYYY to YYYY-MM-DD
                    const parts = text.split('-');
                    if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length <= 4) {
                      if (parts[2].length === 4) {
                        const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        setDate(isoDate);
                      }
                    }
                  }}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {Platform.OS === 'web' && (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              )}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            
            {/* Selected Category Display */}
            {selectedCategoryInfo && (
              <View style={styles.selectedCategoryContainer}>
                <View style={[styles.selectedCategoryCard, { borderColor: selectedCategoryInfo.color }]}>
                  <View style={styles.selectedCategoryContent}>
                    <View style={[styles.selectedCategoryIcon, { backgroundColor: selectedCategoryInfo.color + '20' }]}>
                      {React.createElement((Icons as any)[selectedCategoryInfo.icon] || Icons.Circle, {
                        size: 20,
                        color: selectedCategoryInfo.color
                      })}
                    </View>
                    <Text style={styles.selectedCategoryText}>{selectedCategoryInfo.name}</Text>
                  </View>
                  <View style={[styles.selectedCategoryCheck, { backgroundColor: selectedCategoryInfo.color }]}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            )}

            {/* Category Grid */}
            <View style={styles.categoryGrid}>
              {categories.map(category => {
                const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
                const isSelected = selectedCategory === category.name;
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonActive,
                      { borderColor: isSelected ? category.color : '#E5E7EB' }
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      { backgroundColor: isSelected ? category.color + '20' : '#F3F4F6' }
                    ]}>
                      <IconComponent 
                        size={20} 
                        color={isSelected ? category.color : '#6B7280'} 
                      />
                    </View>
                    <Text style={[
                      styles.categoryButtonText,
                      { color: isSelected ? category.color : '#6B7280' }
                    ]}>
                      {category.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.categoryCheckmark, { backgroundColor: category.color }]}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
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
  dateContainer: {
    position: 'relative',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  selectedCategoryContainer: {
    marginBottom: 16,
  },
  selectedCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  selectedCategoryCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.98 }],
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  categoryCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});