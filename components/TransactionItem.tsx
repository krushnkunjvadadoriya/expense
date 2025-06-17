import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Transaction } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import * as Icons from 'lucide-react-native';
import { CreditCard as Edit3, Trash2 } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  categoryColor?: string;
  categoryIcon?: string;
  showActions?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const ACTION_WIDTH = 160; // Width for both action buttons

export default function TransactionItem({ 
  transaction, 
  onPress, 
  onEdit,
  onDelete,
  categoryColor = '#6B7280',
  categoryIcon = 'circle',
  showActions = true
}: TransactionItemProps) {
  const { state: themeState } = useTheme();
  const { colors } = themeState.theme;
  const styles = createStyles(colors);
  
  const IconComponent = (Icons as any)[categoryIcon] || Icons.Circle;
  const translateX = useSharedValue(0);
  const isOpen = useRef(false);
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = () => {
    closeSwipe();
    setTimeout(() => {
      onEdit?.(transaction);
    }, 200);
  };

  const handleDelete = () => {
    closeSwipe();
    setTimeout(() => {
      Alert.alert(
        'Delete Transaction',
        `Are you sure you want to delete this transaction?\n\n"${transaction.description}" - ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: () => onDelete?.(transaction),
            style: 'destructive'
          },
        ]
      );
    }, 200);
  };

  const closeSwipe = () => {
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    isOpen.current = false;
  };

  const openSwipe = () => {
    translateX.value = withSpring(-ACTION_WIDTH, {
      damping: 20,
      stiffness: 300,
    });
    isOpen.current = true;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!showActions || (!onEdit && !onDelete)) return;
      
      // Only allow left swipe (negative translation)
      const newTranslateX = Math.max(-ACTION_WIDTH, Math.min(0, event.translationX));
      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      if (!showActions || (!onEdit && !onDelete)) return;
      
      const shouldOpen = event.translationX < -ACTION_WIDTH / 3 || event.velocityX < -800;
      
      if (shouldOpen) {
        runOnJS(openSwipe)();
      } else {
        runOnJS(closeSwipe)();
      }
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (isOpen.current) {
        runOnJS(closeSwipe)();
      } else {
        runOnJS(() => onPress?.())();
      }
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedActionsStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < -10 ? 1 : 0,
      transform: [{ translateX: translateX.value + ACTION_WIDTH }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Action Buttons - Behind the card */}
      {showActions && (onEdit || onDelete) && (
        <Animated.View style={[styles.actionsContainer, animatedActionsStyle]}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Edit3 size={22} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Main Transaction Card */}
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
              <IconComponent size={20} color={categoryColor} />
            </View>
            <View style={styles.details}>
              <Text style={styles.description} numberOfLines={1}>
                {transaction.description}
              </Text>
              <Text style={styles.category}>{transaction.category}</Text>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            <Text style={[
              styles.amount,
              { color: transaction.type === 'income' ? '#4facfe' : '#EF4444' }
            ]}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </Text>
            <Text style={styles.date}>{formatDate(transaction.date)}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 8,
    position: 'relative',
    height: 72, // Fixed height for consistent layout
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    height: '100%',
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
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
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    flexDirection: 'row',
    zIndex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#4facfe',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});