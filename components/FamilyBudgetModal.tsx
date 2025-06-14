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
import { X, Check, DollarSign, Plus, Minus } from 'lucide-react-native';

interface FamilyBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  budget: {
    monthly: number;
    categories: Array<{
      name: string;
      budget: number;
      spent: number;
      color: string;
    }>;
  };
}

export default function FamilyBudgetModal({ visible, onClose, budget }: FamilyBudgetModalProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthly.toString());
  const [categories, setCategories] = useState(budget.categories);

  const handleCategoryBudgetChange = (index: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      budget: parseFloat(value) || 0,
    };
    setCategories(updatedCategories);
  };

  const addCategory = () => {
    const newCategory = {
      name: 'New Category',
      budget: 0,
      spent: 0,
      color: '#6B7280',
    };
    setCategories([...categories, newCategory]);
  };

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
  };

  const handleSubmit = () => {
    if (!monthlyBudget) {
      Alert.alert('Error', 'Please enter a monthly budget');
      return;
    }

    const totalBudget = parseFloat(monthlyBudget);
    if (isNaN(totalBudget) || totalBudget <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly budget');
      return;
    }

    const categoryTotal = categories.reduce((sum, cat) => sum + cat.budget, 0);
    if (categoryTotal > totalBudget) {
      Alert.alert('Error', 'Category budgets exceed the total monthly budget');
      return;
    }

    // Here you would typically update the budget via API
    Alert.alert('Success', 'Budget updated successfully!', [
      { text: 'OK', onPress: onClose }
    ]);
  };

  const totalCategoryBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const remainingBudget = parseFloat(monthlyBudget) - totalCategoryBudget;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Budget</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Check size={24} color="#4facfe" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Monthly Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Budget *</Text>
            <View style={styles.budgetInputContainer}>
              <DollarSign size={20} color="#6B7280" />
              <TextInput
                style={styles.budgetInput}
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Budget Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budget:</Text>
              <Text style={styles.summaryValue}>${parseFloat(monthlyBudget || '0').toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category Total:</Text>
              <Text style={styles.summaryValue}>${totalCategoryBudget.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining:</Text>
              <Text style={[
                styles.summaryValue,
                { color: remainingBudget >= 0 ? '#4facfe' : '#EF4444' }
              ]}>
                ${remainingBudget.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Category Budgets */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Category Budgets</Text>
              <TouchableOpacity onPress={addCategory} style={styles.addButton}>
                <Plus size={16} color="#4facfe" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {categories.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCategory(index)}>
                    <Minus size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.categoryBudgetContainer}>
                  <DollarSign size={16} color="#6B7280" />
                  <TextInput
                    style={styles.categoryBudgetInput}
                    value={category.budget.toString()}
                    onChangeText={(value) => handleCategoryBudgetChange(index, value)}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                <View style={styles.categoryStats}>
                  <Text style={styles.categorySpent}>
                    Spent: ${category.spent.toFixed(2)}
                  </Text>
                  <Text style={styles.categoryRemaining}>
                    Remaining: ${(category.budget - category.spent).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Budget Tips</Text>
            <Text style={styles.tipsText}>
              • Allocate 50% for needs, 30% for wants, 20% for savings{'\n'}
              • Review and adjust budgets monthly{'\n'}
              • Set aside emergency funds{'\n'}
              • Track spending regularly to stay on budget
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4facfe',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  budgetInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryBudgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryBudgetInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categorySpent: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  categoryRemaining: {
    fontSize: 14,
    color: '#4facfe',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});