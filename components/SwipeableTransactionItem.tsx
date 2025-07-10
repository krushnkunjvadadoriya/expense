import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
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

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

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
  const lastOffset = useRef(0);

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
      tension: 100,
      friction: 8,
    }).start();
    lastOffset.current = 0;
  };

  const snapToActions = () => {
    const snapValue = -ACTION_WIDTH * 2; // Two actions
    Animated.spring(translateX, {
      toValue: snapValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    lastOffset.current = snapValue;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx <= 0) {
          const maxSwipe = -ACTION_WIDTH * 2;
          const newValue = Math.max(gestureState.dx, maxSwipe);
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Snap to show actions
          snapToActions();
        } else {
          // Snap back to original position
          resetPosition();
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
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={styles.category}>{transaction.category}</Text>
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
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: ACTION_WIDTH * 2,
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
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});