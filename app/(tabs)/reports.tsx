import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Download, Filter } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import PieChart from '@/components/PieChart';
import LineChart from '@/components/LineChart';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return state.transactions.filter(t => new Date(t.date) >= startDate);
  };

  const getCategoryChartData = () => {
    const periodTransactions = getPeriodData();
    const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');
    
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => {
        const categoryInfo = state.categories.find(c => c.name === category);
        return {
          name: category.length > 15 ? category.substring(0, 15) + '...' : category,
          population: amount,
          color: categoryInfo?.color || '#6B7280',
          legendFontColor: '#374151',
          legendFontSize: 12,
        };
      });
  };

  const getMonthlyTrendData = () => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(date);
    }

    const labels = last6Months.map(date => 
      date.toLocaleDateString('en-US', { month: 'short' })
    );

    const incomeData = last6Months.map(month => {
      const monthTransactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month.getMonth() &&
               transactionDate.getFullYear() === month.getFullYear() &&
               t.type === 'income';
      });
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    const expenseData = last6Months.map(month => {
      const monthTransactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month.getMonth() &&
               transactionDate.getFullYear() === month.getFullYear() &&
               t.type === 'expense';
      });
      return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels,
      datasets: [
        {
          data: incomeData,
          color: (opacity = 1) => `rgba(79, 172, 254, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: expenseData,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const getInsights = () => {
    const periodTransactions = getPeriodData();
    const expenses = periodTransactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) return [];

    const insights = [];
    
    // Top spending category
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        title: 'Top Spending Category',
        value: topCategory[0],
        amount: `$${topCategory[1].toFixed(2)}`,
        color: '#EF4444',
      });
    }

    // Average daily spending
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const daysInPeriod = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    const avgDaily = totalExpenses / daysInPeriod;
    
    insights.push({
      title: 'Average Daily Spending',
      value: `$${avgDaily.toFixed(2)}`,
      amount: `${expenses.length} transactions`,
      color: '#4facfe',
    });

    return insights;
  };

  const categoryChartData = getCategoryChartData();
  const trendData = getMonthlyTrendData();
  const insights = getInsights();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Download size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'year', label: 'Year' },
        ].map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Expense Breakdown */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Expense Breakdown</Text>
          {categoryChartData.length > 0 ? (
            <PieChart data={categoryChartData} />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No expense data for this period</Text>
            </View>
          )}
        </View>

        {/* Monthly Trend */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>6-Month Trend</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4facfe' }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
          <LineChart data={trendData} />
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightDot, { backgroundColor: insight.color }]} />
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightValue}>{insight.value}</Text>
              <Text style={styles.insightAmount}>{insight.amount}</Text>
            </View>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={[styles.summaryValue, { color: '#4facfe' }]}>
                ${state.monthlyStats.totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                ${state.monthlyStats.totalExpenses.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Net Savings</Text>
              <Text style={[
                styles.summaryValue,
                { color: state.monthlyStats.netSavings >= 0 ? '#4facfe' : '#EF4444' }
              ]}>
                ${state.monthlyStats.netSavings.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Transactions</Text>
              <Text style={styles.summaryValue}>
                {state.monthlyStats.transactionCount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4facfe',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  insightsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  insightAmount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: (screenWidth - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});