import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Bell,
  Calendar,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useGuest } from '@/contexts/GuestContext';
import { useTheme } from '@/contexts/ThemeContext';
import StatCard from '@/components/StatCard';
import TransactionItem from '@/components/TransactionItem';
import AddTransactionModal from '@/components/AddTransactionModal';
import GuestModeIndicator from '@/components/GuestModeIndicator';

export default function Dashboard() {
  const { state, calculateStats } = useApp();
  const { state: guestState } = useGuest();
  const { state: themeState } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = themeState.theme;
  const styles = createStyles(colors);

  const recentTransactions = state.transactions.slice(0, 5);
  const upcomingEMIs = state.emis
    .filter(emi => emi.status === 'active')
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    calculateStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  const getUserName = () => {
    if (guestState.isGuest) {
      return 'Visitor';
    }
    return state.user?.name || 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning!';
    } else if (hour < 17) {
      return 'Good Afternoon!';
    } else {
      return 'Good Evening!';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{getUserName()}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Guest Mode Indicator */}
        <GuestModeIndicator />

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Balance"
            value={formatCurrency(state.monthlyStats.netSavings)}
            subtitle="This month"
            icon={DollarSign}
            color="#4facfe"
            backgroundColor={colors.surface}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statCardHalf}>
              <StatCard
                title="Income"
                value={formatCurrency(state.monthlyStats.totalIncome)}
                icon={TrendingUp}
                color="#4facfe"
                backgroundColor={colors.surface}
              />
            </View>
            <View style={styles.statCardHalf}>
              <StatCard
                title="Expenses"
                value={formatCurrency(state.monthlyStats.totalExpenses)}
                icon={TrendingDown}
                color="#EF4444"
                backgroundColor={colors.surface}
              />
            </View>
          </View>

          <StatCard
            title="Budget Used"
            value={`${state.monthlyStats.budgetUsed.toFixed(1)}%`}
            subtitle={`${formatCurrency(state.monthlyStats.totalExpenses)} of ${formatCurrency(state.user?.monthlyBudget || 0)}`}
            icon={PiggyBank}
            color={state.monthlyStats.budgetUsed > 80 ? '#EF4444' : '#4facfe'}
            backgroundColor={colors.surface}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => {
              const category = state.categories.find(c => c.name === transaction.category);
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  categoryColor={category?.color}
                  categoryIcon={category?.icon}
                />
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first transaction to get started</Text>
            </View>
          )}
        </View>

        {/* Upcoming EMIs */}
        {upcomingEMIs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming EMIs</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {upcomingEMIs.map(emi => {
              const daysUntilDue = getDaysUntilDue(emi.nextDueDate);
              return (
                <View key={emi.id} style={styles.emiCard}>
                  <View style={styles.emiHeader}>
                    <Calendar size={20} color="#4facfe" />
                    <Text style={styles.emiName}>{emi.name}</Text>
                  </View>
                  <View style={styles.emiDetails}>
                    <Text style={styles.emiAmount}>{formatCurrency(emi.monthlyAmount)}</Text>
                    <Text style={[
                      styles.emiDue,
                      { color: daysUntilDue <= 3 ? '#EF4444' : colors.textTertiary }
                    ]}>
                      Due in {daysUntilDue} days
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
  },
  greeting: {
    fontSize: 16,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardHalf: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  emiCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emiName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  emiDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emiAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4facfe',
  },
  emiDue: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});