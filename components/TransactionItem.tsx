import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Transaction } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import * as Icons from 'lucide-react-native';
import { CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import CustomAlert from '@/components/CustomAlert';

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
const SWIPE_THRESHOLD = ACTION_WIDTH * 0.3; // 30% of action width to trigger open

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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const IconComponent = (Icons as any)[categoryIcon] || Icons.Circle;
  const translateX = useSharedValue(0);
  const isOpen = useRef(false);
  const startX = useRef(0);
  
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
    }, 150);
  };

  const handleDelete = () => {
    closeSwipe();
    setTimeout(() => {
      setShowDeleteAlert(true);
    }, 150);
  };

  const handleConfirmDelete = () => {
    setShowDeleteAlert(false);
    onDelete?.(transaction);
  };

  const closeSwipe = () => {
    'worklet';
    translateX.value = withSpring(0, {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    });
    runOnJS(() => {
      isOpen.current = false;
    })();
  };

  const openSwipe = () => {
    'worklet';
    translateX.value = withSpring(-ACTION_WIDTH, {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    });
    runOnJS(() => {
      isOpen.current = true;
    })();
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.current = translateX.value;
    })
    .onUpdate((event) => {
      if (!showActions || (!onEdit && !onDelete)) return;
      
      // Calculate new position based on start position and translation
      const newTranslateX = startX.current + event.translationX;
      
      // Constrain the movement: allow left swipe only, with some resistance when going beyond limits
      if (newTranslateX <= 0 && newTranslateX >= -ACTION_WIDTH) {
        translateX.value = newTranslateX;
      } else if (newTranslateX > 0) {
        // Add resistance when trying to swipe right beyond closed position
        translateX.value = newTranslateX * 0.1;
      } else if (newTranslateX < -ACTION_WIDTH) {
        // Add resistance when trying to swipe left beyond open position
        const excess = newTranslateX + ACTION_WIDTH;
        translateX.value = -ACTION_WIDTH + (excess * 0.1);
      }
    })
    .onEnd((event) => {
      if (!showActions || (!onEdit && !onDelete)) return;
      
      const currentPosition = translateX.value;
      const velocity = event.velocityX;
      
      // Determine if we should open or close based on position and velocity
      const shouldOpen = currentPosition < -SWIPE_THRESHOLD || velocity < -800;
      const shouldClose = currentPosition > -SWIPE_THRESHOLD || velocity > 800;
      
      if (shouldOpen && !isOpen.current) {
        openSwipe();
      } else if (shouldClose && isOpen.current) {
        closeSwipe();
      } else if (currentPosition < -SWIPE_THRESHOLD) {
        openSwipe();
      } else {
        closeSwipe();
      }
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (isOpen.current) {
        closeSwipe();
      } else if (onPress) {
        runOnJS(onPress)();
      }
    });

  // Use Race instead of Simultaneous to prevent conflicts
  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedActionsStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-ACTION_WIDTH, -20, 0],
      [1, 0.8, 0],
      'clamp'
    );
    
    return {
      opacity,
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
              <Edit3 size={22} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Trash2 size={22} color={colors.error} strokeWidth={2} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
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
      
      {/* Delete Confirmation Alert */}
      <CustomAlert
        visible={showDeleteAlert}
        type="error"
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction?\n\n"${transaction.description}" - ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}`}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
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
    backgroundColor: colors.background, // Ensure background matches
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
    position: 'absolute',
    width: '100%',
    left: 0,
    top: 0,
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
    backgroundColor: colors.primaryLight, // Light blue background
  },
  deleteButton: {
    backgroundColor: '#FEE2E2', // Light red background
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  editButtonText: {
    color: colors.primary, // Blue text
  },
  deleteButtonText: {
    color: colors.error, // Red text
  },
});