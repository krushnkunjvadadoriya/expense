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
  ScrollView,
  StatusBar,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetAction {
  id: string;
  title: string;
  icon?: React.ComponentType<any>;
  color?: string;
  onPress: () => void;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: BottomSheetAction[];
}

const { height: screenHeight } = Dimensions.get('window');

export default function BottomSheet({ visible, onClose, title, actions }: BottomSheetProps) {
  const { state: themeState } = useTheme();
  const { colors } = themeState.theme;
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset animation values to initial state after hide animation completes
        translateY.setValue(screenHeight);
        opacity.setValue(0);
      });
    }
  }, [visible]);

  const handleActionPress = (action: BottomSheetAction) => {
    onClose();
    // Small delay to allow modal to close before executing action
    setTimeout(() => action.onPress(), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'fullScreen'}
    >
      {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
              paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 20,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Actions */}
          <ScrollView 
            style={[styles.actionsContainer, {
              maxHeight: screenHeight * 0.5 - (Platform.OS === 'ios' ? insets.bottom + 100 : 100)
            }]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.actionsContent}>
              {actions.map((action, index) => {
                const IconComponent = action.icon;
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
                    {IconComponent && (
                      <View style={styles.actionIconContainer}>
                        <IconComponent
                          size={20}
                          color={action.color || colors.text}
                        />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.actionText,
                        { color: action.color || colors.text },
                      ]}
                    >
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: screenHeight * 0.7,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexGrow: 1,
  },
  actionsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastActionButton: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});