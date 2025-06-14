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
import { Users, Plus, Settings, Crown, UserPlus, DollarSign, TrendingUp, TrendingDown, Calendar, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import CreateFamilyModal from '../../components/CreateFamilyModal';
import InviteMemberModal from '../../components/InviteMemberModal';
import FamilyBudgetModal from '../../components/FamilyBudgetModal';

export default function Family() {
  const { state } = useApp();
  const { state: themeState } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const { colors } = themeState.theme;
  const styles = createStyles(colors);

  // Mock family data - in real app this would come from context/API
  const [familyGroup, setFamilyGroup] = useState({
    id: '1',
    name: 'The Doe Family',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', avatar: '👨' },
      { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'member', avatar: '👩' },
      { id: '3', name: 'Alex Doe', email: 'alex@example.com', role: 'member', avatar: '👦' },
    ],
    budget: {
      monthly: 5000,
      spent: 3250,
      categories: [
        { name: 'Food & Dining', budget: 1200, spent: 850, color: '#EF4444' },
        { name: 'Transportation', budget: 800, spent: 650, color: '#4facfe' },
        { name: 'Shopping', budget: 600, spent: 420, color: '#8B5CF6' },
        { name: 'Entertainment', budget: 400, spent: 280, color: '#F59E0B' },
        { name: 'Bills & Utilities', budget: 1000, spent: 1050, color: '#4facfe' },
      ]
    }
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getBudgetUsedPercentage = () => {
    return (familyGroup.budget.spent / familyGroup.budget.monthly) * 100;
  };

  const handleInviteMember = () => {
    setShowInviteModal(true);
  };

  const handleManageBudget = () => {
    setShowBudgetModal(true);
  };

  const handleMemberAction = (member: any) => {
    Alert.alert(
      'Member Actions',
      `What would you like to do with ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Profile', onPress: () => {} },
        { text: 'Remove Member', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  if (!familyGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Budget</Text>
        </View>

        <View style={styles.emptyState}>
          <Users size={64} color={colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Family Group</Text>
          <Text style={styles.emptyStateSubtext}>
            Create or join a family group to start sharing budgets and expenses
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>Create Family Group</Text>
          </TouchableOpacity>
        </View>

        <CreateFamilyModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Family Budget</Text>
          <Text style={styles.subtitle}>{familyGroup.name}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View style={styles.budgetOverview}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Monthly Budget</Text>
            <TouchableOpacity onPress={handleManageBudget}>
              <Text style={styles.manageBudgetText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.budgetStats}>
            <View style={styles.budgetStatItem}>
              <DollarSign size={24} color="#4facfe" />
              <Text style={styles.budgetStatValue}>{formatCurrency(familyGroup.budget.monthly)}</Text>
              <Text style={styles.budgetStatLabel}>Total Budget</Text>
            </View>
            <View style={styles.budgetStatItem}>
              <TrendingDown size={24} color="#EF4444" />
              <Text style={styles.budgetStatValue}>{formatCurrency(familyGroup.budget.spent)}</Text>
              <Text style={styles.budgetStatLabel}>Spent</Text>
            </View>
            <View style={styles.budgetStatItem}>
              <TrendingUp size={24} color="#4facfe" />
              <Text style={styles.budgetStatValue}>
                {formatCurrency(familyGroup.budget.monthly - familyGroup.budget.spent)}
              </Text>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Budget Used</Text>
              <Text style={styles.progressPercentage}>{getBudgetUsedPercentage().toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(getBudgetUsedPercentage(), 100)}%`,
                    backgroundColor: getBudgetUsedPercentage() > 80 ? '#EF4444' : '#4facfe'
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {familyGroup.budget.categories.map((category, index) => {
            const percentage = (category.spent / category.budget) * 100;
            const isOverBudget = category.spent > category.budget;
            
            return (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <Text style={[
                    styles.categoryAmount,
                    { color: isOverBudget ? '#EF4444' : colors.text }
                  ]}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                  </Text>
                </View>
                <View style={styles.categoryProgressBar}>
                  <View 
                    style={[
                      styles.categoryProgressFill, 
                      { 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : category.color
                      }
                    ]} 
                  />
                </View>
                {isOverBudget && (
                  <Text style={styles.overBudgetText}>
                    Over budget by {formatCurrency(category.spent - category.budget)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Family Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity onPress={handleInviteMember} style={styles.inviteButton}>
              <UserPlus size={16} color="#4facfe" />
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
          
          {familyGroup.members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <View style={styles.memberNameContainer}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {member.role === 'admin' && (
                      <Crown size={16} color="#F59E0B" />
                    )}
                  </View>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleMemberAction(member)}>
                <MoreVertical size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Calendar size={20} color="#4facfe" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityText}>Jane added $45.50 expense for "Grocery Shopping"</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Calendar size={20} color="#4facfe" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityText}>Alex updated the Entertainment budget to $400</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Calendar size={20} color="#EF4444" />
            <View style={styles.activityDetails}>
              <Text style={styles.activityText}>Bills & Utilities exceeded budget limit</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <CreateFamilyModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <InviteMemberModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
      
      <FamilyBudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        budget={familyGroup.budget}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  budgetOverview: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  manageBudgetText: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: '600',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  budgetStatLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
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
    color: colors.textTertiary,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4facfe',
  },
  categoryCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
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
    color: colors.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  overBudgetText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  memberCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
  },
  memberDetails: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});