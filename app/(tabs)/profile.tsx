import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Download, CircleHelp as HelpCircle, Shield, Trash2, CreditCard as Edit3, Check, X, LogOut, Smartphone, BarChart3 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import ChangePinModal from '@/components/ChangePinModal';

export default function Profile() {
  const { state, dispatch } = useApp();
  const { logout, state: authState } = useAuth();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(state.user?.monthlyBudget.toString() || '');
  const [showChangePinModal, setShowChangePinModal] = useState(false);

  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (state.user) {
      const updatedUser = { ...state.user, monthlyBudget: newBudget };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
    setEditingBudget(false);
  };

  const handleBudgetCancel = () => {
    setBudgetInput(state.user?.monthlyBudget.toString() || '');
    setEditingBudget(false);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Clear all data
            dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
            dispatch({ type: 'SET_EMIS', payload: [] });
            Alert.alert('Success', 'All data has been deleted');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleViewReports = () => {
    router.push('/(tabs)/reports');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatMobile = (mobile: string) => {
    if (!mobile) return '';
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 2)}***-***-${cleaned.slice(-4)}`;
    }
    return mobile;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={32} color="#4facfe" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{authState.user?.name || 'User'}</Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Smartphone size={16} color="#6B7280" />
                <Text style={styles.contactText}>
                  {formatMobile(authState.user?.mobile || '')}
                </Text>
              </View>
              {authState.user?.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactText}>{authState.user.email}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.transactions.length}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.emis.length}</Text>
              <Text style={styles.statLabel}>EMIs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{state.categories.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: state.monthlyStats.netSavings >= 0 ? '#4facfe' : '#EF4444' }]}>
                {formatCurrency(Math.abs(state.monthlyStats.netSavings))}
              </Text>
              <Text style={styles.statLabel}>
                {state.monthlyStats.netSavings >= 0 ? 'Savings' : 'Deficit'}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Settings</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>Monthly Budget</Text>
              {!editingBudget && (
                <TouchableOpacity onPress={() => setEditingBudget(true)}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            
            {editingBudget ? (
              <View style={styles.budgetEditContainer}>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.budgetActions}>
                  <TouchableOpacity onPress={handleBudgetCancel} style={styles.budgetCancelButton}>
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleBudgetSave} style={styles.budgetSaveButton}>
                    <Check size={16} color="#4facfe" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.budgetValue}>
                {formatCurrency(state.user?.monthlyBudget || 0)}
              </Text>
            )}
            
            <View style={styles.budgetProgress}>
              <View style={styles.budgetProgressBar}>
                <View 
                  style={[
                    styles.budgetProgressFill, 
                    { 
                      width: `${Math.min(state.monthlyStats.budgetUsed, 100)}%`,
                      backgroundColor: state.monthlyStats.budgetUsed > 80 ? '#EF4444' : '#4facfe'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.budgetProgressText}>
                {state.monthlyStats.budgetUsed.toFixed(1)}% used this month
              </Text>
            </View>
          </View>
        </View>

        {/* Data & Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleViewReports}
            >
              <BarChart3 size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Reports & Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
              <Download size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowChangePinModal(true)}
            >
              <Shield size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Change PIN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <HelpCircle size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteData}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>ExpenseTracker Pro v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Built with React Native & Expo</Text>
        </View>
      </ScrollView>

      <ChangePinModal
        visible={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
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
  logoutButton: {
    padding: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  budgetValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  budgetEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  budgetInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#4facfe',
    paddingBottom: 4,
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetCancelButton: {
    padding: 8,
  },
  budgetSaveButton: {
    padding: 8,
  },
  budgetProgress: {
    marginTop: 8,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetProgressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    padding: 40,
  },
  appInfoText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});