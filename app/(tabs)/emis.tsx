import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, DollarSign, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import AddEMIModal from '@/components/AddEMIModal';

export default function EMIs() {
  const { state, updateEMI } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (emi: any) => {
    return ((emi.totalPaid / (emi.monthlyAmount * emi.tenure)) * 100);
  };

  const handlePayEMI = (emi: any) => {
    Alert.alert(
      'Pay EMI',
      `Are you sure you want to mark the EMI for ${emi.name} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay',
          onPress: () => {
            const updatedEMI = {
              ...emi,
              totalPaid: emi.totalPaid + emi.monthlyAmount,
              remainingAmount: emi.remainingAmount - emi.monthlyAmount,
              nextDueDate: new Date(new Date(emi.nextDueDate).setMonth(new Date(emi.nextDueDate).getMonth() + 1)).toISOString().split('T')[0],
            };

            if (updatedEMI.totalPaid >= emi.monthlyAmount * emi.tenure) {
              updatedEMI.status = 'completed';
            }

            updateEMI(updatedEMI);
          },
        },
      ]
    );
  };

  const activeEMIs = state.emis.filter(emi => emi.status === 'active');
  const completedEMIs = state.emis.filter(emi => emi.status === 'completed');

  const totalMonthlyEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
  const totalOutstanding = activeEMIs.reduce((sum, emi) => sum + emi.remainingAmount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EMIs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <DollarSign size={24} color="#3B82F6" />
          <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyEMI)}</Text>
          <Text style={styles.summaryLabel}>Monthly EMI</Text>
        </View>
        <View style={styles.summaryCard}>
          <Clock size={24} color="#F59E0B" />
          <Text style={styles.summaryValue}>{formatCurrency(totalOutstanding)}</Text>
          <Text style={styles.summaryLabel}>Outstanding</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active EMIs */}
        {activeEMIs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active EMIs</Text>
            {activeEMIs.map(emi => {
              const daysUntilDue = getDaysUntilDue(emi.nextDueDate);
              const progress = getProgressPercentage(emi);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

              return (
                <View key={emi.id} style={styles.emiCard}>
                  <View style={styles.emiHeader}>
                    <View style={styles.emiTitleContainer}>
                      <Text style={styles.emiName}>{emi.name}</Text>
                      {(isOverdue || isDueSoon) && (
                        <AlertCircle
                          size={16}
                          color={isOverdue ? '#EF4444' : '#F59E0B'}
                        />
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.payButton,
                        { backgroundColor: isOverdue ? '#EF4444' : '#3B82F6' }
                      ]}
                      onPress={() => handlePayEMI(emi)}
                    >
                      <Text style={styles.payButtonText}>
                        {isOverdue ? 'Overdue' : 'Pay'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.emiDetails}>
                    <View style={styles.emiDetailRow}>
                      <Text style={styles.emiDetailLabel}>Monthly Amount:</Text>
                      <Text style={styles.emiDetailValue}>{formatCurrency(emi.monthlyAmount)}</Text>
                    </View>
                    <View style={styles.emiDetailRow}>
                      <Text style={styles.emiDetailLabel}>Next Due:</Text>
                      <Text style={[
                        styles.emiDetailValue,
                        { color: isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : '#6B7280' }
                      ]}>
                        {new Date(emi.nextDueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.emiDetailRow}>
                      <Text style={styles.emiDetailLabel}>Outstanding:</Text>
                      <Text style={styles.emiDetailValue}>{formatCurrency(emi.remainingAmount)}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Completed EMIs */}
        {completedEMIs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed EMIs</Text>
            {completedEMIs.map(emi => (
              <View key={emi.id} style={[styles.emiCard, styles.completedEmiCard]}>
                <View style={styles.emiHeader}>
                  <Text style={styles.emiName}>{emi.name}</Text>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>
                <View style={styles.emiDetails}>
                  <View style={styles.emiDetailRow}>
                    <Text style={styles.emiDetailLabel}>Total Paid:</Text>
                    <Text style={styles.emiDetailValue}>{formatCurrency(emi.totalPaid)}</Text>
                  </View>
                  <View style={styles.emiDetailRow}>
                    <Text style={styles.emiDetailLabel}>Tenure:</Text>
                    <Text style={styles.emiDetailValue}>{emi.tenure} months</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {state.emis.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No EMIs added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first EMI to start tracking your loan payments
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add EMI</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddEMIModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  emiCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedEmiCard: {
    opacity: 0.8,
  },
  emiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emiName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  payButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  emiDetails: {
    marginBottom: 16,
  },
  emiDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emiDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emiDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});