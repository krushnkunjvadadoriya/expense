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
import { ArrowLeft, Crown, Check, Star, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { formatAmount } from '@/utils/currency';

interface SubscriptionPlan {
  id: string;
  duration: string;
  months: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  badge?: string;
}

export default function Subscription() {
  const { state: themeState } = useTheme();
  const { state, showToast } = useApp();
  const { colors } = themeState.theme;
  const styles = createStyles(colors);
  const userCurrency = state.user?.currency || 'INR';

  const [selectedPlan, setSelectedPlan] = useState<string>('3-month');

  // Common features for all plans
  const commonFeatures = [
    'Unlimited transactions',
    'Advanced analytics & insights',
    'Family budget sharing',
    'Data backup & sync',
    'Custom categories',
    'Export data (CSV, PDF)',
    'Goal tracking',
    'Investment tracking',
    'EMI management',
    'Priority customer support',
    'Ad-free experience',
    'Multi-device sync'
  ];

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: '1-month',
      duration: '1 Month',
      months: 1,
      price: 129,
    },
    {
      id: '3-month',
      duration: '3 Months',
      months: 3,
      price: 369,
      originalPrice: 387, // 129 * 3
      discount: 5,
      popular: true,
      badge: 'Most Popular',
    },
    {
      id: '6-month',
      duration: '6 Months',
      months: 6,
      price: 659,
      originalPrice: 774, // 129 * 6
      discount: 10,
      badge: 'Best Value',
    },
    {
      id: '12-month',
      duration: '1 Year',
      months: 12,
      price: 1083,
      originalPrice: 1548, // 129 * 12
      discount: 30,
      badge: 'Maximum Savings',
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (plan) {
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${plan.duration} plan for ${formatAmount(plan.price, userCurrency)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: () => {
              showToast({
                type: 'success',
                message: `Successfully subscribed to ${plan.duration} plan!`,
              });
              router.back();
            }
          }
        ]
      );
    }
  };

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    return Math.round(plan.price / plan.months);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Crown size={48} color="#4facfe" />
          </View>
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSubtitle}>
            Get advanced analytics, family sharing, and unlimited transactions
          </Text>
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const monthlyPrice = getMonthlyPrice(plan);
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
                onPress={() => handlePlanSelect(plan.id)}
                activeOpacity={0.8}
              >
                {/* Badge */}
                {plan.badge && (
                  <View style={[
                    styles.planBadge,
                    plan.popular && styles.planBadgePopular
                  ]}>
                    {plan.popular && <Star size={12} color="#FFFFFF" />}
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={[styles.planDuration, isSelected && styles.planDurationSelected]}>
                      {plan.duration}
                    </Text>
                    {plan.discount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{plan.discount}% OFF</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.planPricing}>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                        {formatAmount(plan.price, userCurrency)}
                      </Text>
                      {plan.originalPrice && (
                        <Text style={styles.originalPrice}>
                          {formatAmount(plan.originalPrice, userCurrency)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.monthlyPrice}>
                      {formatAmount(monthlyPrice, userCurrency)}/month
                    </Text>
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {commonFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <View style={styles.featureIcon}>
                        <Check size={12} color="#4facfe" />
                      </View>
                      <Text style={styles.featureText}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedIcon}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Choose Premium?</Text>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Zap size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDescription}>
                Get detailed insights into your spending patterns and financial trends
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Crown size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Family Budget Sharing</Text>
              <Text style={styles.benefitDescription}>
                Share budgets with family members and track expenses together
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Star size={20} color="#4facfe" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority Support</Text>
              <Text style={styles.benefitDescription}>
                Get faster response times and dedicated customer support
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            • Cancel anytime{'\n'}
            • 7-day money-back guarantee{'\n'}
            • Secure payment processing{'\n'}
            • No hidden fees
          </Text>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe to {subscriptionPlans.find(p => p.id === selectedPlan)?.duration}
          </Text>
          <Text style={styles.subscribeButtonPrice}>
            {formatAmount(subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0, userCurrency)}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    padding: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginHorizontal: 2,
  },
  planCardSelected: {
    borderColor: '#4facfe',
    backgroundColor: colors.primaryLight,
    transform: [{ scale: 1.03 }],
    shadowColor: '#4facfe',
    shadowOpacity: 0.25,
  },
  planCardPopular: {
    borderColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOpacity: 0.2,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    left: 24,
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  planBadgePopular: {
    backgroundColor: '#4facfe',
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planHeader: {
    marginBottom: 24,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planDuration: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  planDurationSelected: {
    color: '#4facfe',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planPricing: {
    alignItems: 'flex-start',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  planPriceSelected: {
    color: '#4facfe',
  },
  originalPrice: {
    fontSize: 20,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  monthlyPrice: {
    fontSize: 15,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  featureText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  selectedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  benefitsSection: {
    padding: 20,
    backgroundColor: colors.surface,
    marginTop: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  footerNote: {
    padding: 20,
    backgroundColor: colors.borderLight,
    margin: 20,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  subscribeContainer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subscribeButton: {
    backgroundColor: '#4facfe',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscribeButtonPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});