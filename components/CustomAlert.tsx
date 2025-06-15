import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  type?: 'error' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoHideDelay?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function CustomAlert({
  visible,
  type = 'error',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  autoHideDelay = 2000,
}: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle visibility with proper state management for Expo Go
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      // Small delay to allow for smooth closing animation
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // Auto-dismiss success alerts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (visible && type === 'success' && !onConfirm) {
      timeoutId = setTimeout(() => {
        onClose();
      }, autoHideDelay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [visible, type, onClose, autoHideDelay, onConfirm]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: '#10B981', bgColor: '#D1FAE5' };
      case 'warning':
        return { icon: '⚠️', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'info':
        return { icon: 'ℹ️', color: '#3B82F6', bgColor: '#DBEAFE' };
      default:
        return { icon: '❌', color: '#EF4444', bgColor: '#FEE2E2' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { maxWidth: screenWidth - 40 }]}>
          {/* Header with icon and close button */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
            {(type !== 'success' || onConfirm) && (
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {type === 'success' && !onConfirm && (
              <Text style={styles.autoHideText}>
                This message will close automatically in {Math.ceil(autoHideDelay / 1000)}s
              </Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {onConfirm ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: color }]}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.singleButton, { backgroundColor: color }]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  autoHideText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});