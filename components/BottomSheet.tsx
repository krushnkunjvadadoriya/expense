import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';

export interface BottomSheetAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color?: string;
  destructive?: boolean;
  onPress: () => void;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: BottomSheetAction[];
}

const { height: screenHeight } = Dimensions.get('window');

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  actions,
}: BottomSheetProps) {
  const { state: themeState } = useTheme();
  const { colors } = themeState.theme;
  const styles = createStyles(colors);

  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleActionPress = (action: BottomSheetAction) => {
    onClose();
    // Small delay to allow sheet to close before executing action
    setTimeout(() => {
      action.onPress();
    }, 100);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={100} style={styles.blurContainer}>
              <View style={styles.content}>
                {/* Handle */}
                <View style={styles.handle} />
                
                {/* Header */}
                {(title || subtitle) && (
                  <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                  </View>
                )}
                
                {/* Actions */}
                <View style={styles.actionsContainer}>
                  {actions.map((action, index) => {
                    const IconComponent = action.icon;
                    const isDestructive = action.destructive;
                    const actionColor = action.color || (isDestructive ? '#EF4444' : colors.text);
                    
                    return (
                      <TouchableOpacity
                        key={action.id}
                        style={[
                          styles.actionButton,
                          index === actions.length - 1 && styles.lastActionButton,
                        ]}
                        onPress={() => handleActionPress(action)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.actionIconContainer,
                          { backgroundColor: actionColor + '15' }
                        ]}>
                          <IconComponent size={20} color={actionColor} />
                        </View>
                        <Text style={[styles.actionText, { color: actionColor }]}>
                          {action.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                
                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <View style={[styles.content, styles.androidContent]}>
              {/* Handle */}
              <View style={styles.handle} />
              
              {/* Header */}
              {(title || subtitle) && (
                <View style={styles.header}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
              )}
              
              {/* Actions */}
              <View style={styles.actionsContainer}>
                {actions.map((action, index) => {
                  const IconComponent = action.icon;
                  const isDestructive = action.destructive;
                  const actionColor = action.color || (isDestructive ? '#EF4444' : colors.text);
                  
                  return (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.actionButton,
                        index === actions.length - 1 && styles.lastActionButton,
                      ]}
                      onPress={() => handleActionPress(action)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.actionIconContainer,
                        { backgroundColor: actionColor + '15' }
                      ]}>
                        <IconComponent size={20} color={actionColor} />
                      </View>
                      <Text style={[styles.actionText, { color: actionColor }]}>
                        {action.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    maxHeight: screenHeight * 0.8,
  },
  blurContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  androidContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lastActionButton: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.borderLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});