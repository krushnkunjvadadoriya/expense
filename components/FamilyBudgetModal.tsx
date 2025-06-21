import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Check, DollarSign, Plus, Minus } from 'lucide-react-native';
import { FamilyBudget, FamilyBudgetCategory } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface FamilyBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  budget: FamilyBudget;
  onSave: (updatedBudget: { monthly: number; categories: FamilyBudgetCategory[] }) => void;
}

export default function FamilyBudgetModal({ visible, onClose, budget, onSave }: FamilyBudgetModalProps) {
  const { showGlobalAlert, getFamilyCategories, addCategory } = useApp();
  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthly.toString());
  const [categories, setCategories] = useState<FamilyBudgetCategory[]>(budget.categories);

  // Get available family categories from the unified system
  const availableFamilyCategories = getFamilyCategories('expense');

  // Update local state when budget prop changes
  useEffect(() => {
    setMonthlyBudget(budget.monthly.toString());
    setCategories(budget.categories);
  }, [budget]);

  const handleCategoryNameChange = (index: number, name: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      name: name,
    };
    setCategories(updatedCategories);
  };

  const handleCategoryBudgetChange = (index: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      budget: parseFloat(value) || 0,
    };
    setCategories(updatedCategories);
  };

  const addCategoryFromGlobal = (globalCategoryId: string) => {
    const globalCategory = availableFamilyCategories.find(c => c.id === globalCategoryId);
    if (!globalCategory) return;

    // Check if category is already added
    const existingCategory = categories.find(c => c.categoryId === globalCategoryId);
    if (existingCategory) {
      showGlobalAlert({
        type: 'warning',
        title: 'Category Already Added',
        message: `${globalCategory.name} is already in your family budget.`,
      });
      return;
    }

    const newCategory: FamilyBudgetCategory = {
      id: Date.now().toString(),
      categoryId: globalCategoryId,
      name: globalCategory.name,
      budget: 0,
      spent: 0,
      color: globalCategory.color,
    };
    setCategories([...categories, newCategory]);
  };

  const addNewCategory = async () => {
    const newCategoryName = 'New Family Category';
    
    // Create a new global category with family scope
    const newGlobalCategory = {
      name: newCategoryName,
      type: 'expense' as const,
      color: '#6B7280',
      icon: 'circle',
      scopes: ['family' as const],
    };

    try {
      await addCategory(newGlobalCategory);
      
      // Add to local budget categories
      const newBudgetCategory: FamilyBudgetCategory = {
        id: Date.now().toString(),
        categoryId: Date.now().toString(), // This will be updated when the global category is created
        name: newCategoryName,
        budget: 0,
        spent: 0,
        color: '#6B7280',
      };
      setCategories([...categories, newBudgetCategory]);
    } catch (error) {
      showGlobalAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to create new category. Please try again.',
      });
    }
  };

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
  };

  const handleSubmit = () => {
    if (!monthlyBudget) {
      showGlobalAlert({
        type: 'error',
        title: 'Missing Budget',
        message: 'Please enter a monthly budget amount.',
      });
      return;
    }

    const totalBudget = parseFloat(monthlyBudget);
    if (isNaN(totalBudget) || totalBudget <= 0) {
      showGlobalAlert({
        type: 'error',
        title: 'Invalid Budget',
        message: 'Please enter a valid monthly budget amount.',
      });
      return;
    }

    // Validate category names
    const invalidCategories = categories.filter(cat => !cat.name.trim());
    if (invalidCategories.length > 0) {
      showGlobalAlert({
        type: 'error',
        title: 'Invalid Category Names',
        message: 'Please provide names for all categories.',
      });
      return;
    }

    const categoryTotal = categories.reduce((sum, cat) => sum + cat.budget, 0);
    if (categoryTotal > totalBudget) {
      showGlobalAlert({
        type: 'error',
        title: 'Budget Exceeded',
        message: 'Category budgets exceed the total monthly budget.',
      });
      return;
    }

    // Save the updated budget
    onSave({
      monthly: totalBudget,
      categories: categories.map(cat => ({
        ...cat,
        name: cat.name.trim()
      }))
    });

    showGlobalAlert({
      type: 'success',
      title: 'Budget Updated',
      message: 'Family budget has been updated successfully!',
      onConfirm: onClose,
    });
  };

  const totalCategoryBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const remainingBudget = parseFloat(monthlyBudget || '0') - totalCategoryBudget;

  // Get categories that are not yet added to the budget
  const availableToAdd = availableFamilyCategories.filter(
    globalCat => !categories.some(budgetCat => budgetCat.categoryId === globalCat.id)
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Family Budget</Text>
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
              <View style={styles.addButtonsContainer}>
                {availableToAdd.length > 0 && (
                  <TouchableOpacity onPress={() => addCategoryFromGlobal(availableToAdd[0].id)} style={styles.addButton}>
                    <Plus size={16} color="#4facfe" />
                    <Text style={styles.addButtonText}>Add Existing</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={addNewCategory} style={styles.addButton}>
                  <Plus size={16} color="#4facfe" />
                  <Text style={styles.addButtonText}>New</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Available Categories to Add */}
            {availableToAdd.length > 0 && (
              <View style={styles.availableCategoriesContainer}>
                <Text style={styles.availableCategoriesTitle}>Available Categories:</Text>
                <View style={styles.availableCategoriesGrid}>
                  {availableToAdd.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.availableCategoryButton}
                      onPress={() => addCategoryFromGlobal(category.id)}
                    >
                      <View style={[styles.availableCategoryDot, { backgroundColor: category.color }]} />
                      <Text style={styles.availableCategoryText}>{category.name}</Text>
                      <Plus size={14} color="#4facfe" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {categories.map((category, index) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <TextInput
                      style={styles.categoryNameInput}
                      value={category.name}
                      onChangeText={(value) => handleCategoryNameChange(index, value)}
                      placeholder="Category name"
                      placeholderTextColor="#9CA3AF"
                    />
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

            {categories.length === 0 && (
              <View style={styles.noCategoriesContainer}>
                <Text style={styles.noCategoriesText}>No categories added yet</Text>
                <Text style={styles.noCategoriesSubtext}>
                  Add categories to organize your family budget
                </Text>
              </View>
            )}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Family Budget Tips</Text>
            <Text style={styles.tipsText}>
              • Categories are shared across personal and family budgets{'\n'}
              • Set realistic budgets for each category{'\n'}
              • Review spending regularly with family members{'\n'}
              • Adjust budgets monthly based on actual spending
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
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
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
  availableCategoriesContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  availableCategoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  availableCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availableCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  availableCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
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
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryNameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    paddingVertical: 4,
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
  noCategoriesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noCategoriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noCategoriesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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