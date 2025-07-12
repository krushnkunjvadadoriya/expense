import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/types';

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  categoryColor?: string;
  categoryIcon?: string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

const SWIPE_THRESHOLD = 60;
const ACTION_WIDTH = 80;
const TOTAL_ACTION_WIDTH = ACTION_WIDTH * 2; // Two actions

export default function SwipeableTransactionItem({
  transaction,
  categoryColor = '#4facfe',
  categoryIcon = 'Circle',
  onEdit,
  onDelete,
}: SwipeableTransactionItemProps) {
  const { state: themeState } = useTheme();
  const { colors } = themeState.theme;
  const styles = createStyles(colors);

  const translateX = useRef(new Animated.Value(0)).current;

  const formatCurrency = (amount: number) => {
    const isWholeNumber = amount % 1 === 0;
    
    if (isWholeNumber) {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const snapToActions = () => {
    Animated.spring(translateX, {
      toValue: -TOTAL_ACTION_WIDTH,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes with sufficient movement
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animation
        translateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Allow both left and right swipes, but clamp the values
        let newValue = gestureState.dx;
        
        // Clamp between 0 (closed) and -TOTAL_ACTION_WIDTH (fully open)
        newValue = Math.max(-TOTAL_ACTION_WIDTH, Math.min(0, newValue));
        
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentValue = gestureState.dx;
        const velocity = gestureState.vx;
        
        // Determine snap direction based on position and velocity
        if (velocity < -0.5 || currentValue < -SWIPE_THRESHOLD) {
          // Snap to show actions (swipe left or fast left swipe)
          snapToActions();
        } else if (velocity > 0.5 || currentValue > -SWIPE_THRESHOLD) {
          // Snap back to closed position (swipe right or not far enough left)
          resetPosition();
        } else {
          // Default to closest position
          if (Math.abs(currentValue) > TOTAL_ACTION_WIDTH / 2) {
            snapToActions();
          } else {
            resetPosition();
          }
        }
      },
    })
  ).current;

  const handleEdit = () => {
    resetPosition();
    setTimeout(() => onEdit?.(transaction), 200);
  };

  const handleDelete = () => {
    resetPosition();
    setTimeout(() => onDelete?.(transaction), 200);
  };

  const IconComponent = (Icons as any)[categoryIcon] || Icons.Circle;

  return (
    <View style={styles.container}>
      {/* Action Buttons (Behind) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Edit3 size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content (Swipeable) */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: categoryColor + '10' }]}>
            <IconComponent size={20} color={categoryColor} />
          </View>
          <View style={styles.details}>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {transaction.category}
            </Text>
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[
            styles.amount,
            {
              color: transaction.type === 'income' ? '#10B981' : '#EF4444'
            }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: TOTAL_ACTION_WIDTH,
  },
  actionButton: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  editButton: {
    backgroundColor: '#4facfe',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    minHeight: 80,
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});