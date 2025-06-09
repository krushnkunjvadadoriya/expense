import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { X, Shield, Check, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface ChangePinModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePinModal({ visible, onClose }: ChangePinModalProps) {
  const { changePin } = useAuth();
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setStep('current');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleNumberPress = (number: string) => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Ignore vibration errors
      }
    }

    switch (step) {
      case 'current':
        if (currentPin.length < 4) {
          setCurrentPin(prev => prev + number);
        }
        break;
      case 'new':
        if (newPin.length < 4) {
          setNewPin(prev => prev + number);
        }
        break;
      case 'confirm':
        if (confirmPin.length < 4) {
          setConfirmPin(prev => prev + number);
        }
        break;
    }
  };

  const handleDelete = () => {
    switch (step) {
      case 'current':
        setCurrentPin(prev => prev.slice(0, -1));
        break;
      case 'new':
        setNewPin(prev => prev.slice(0, -1));
        break;
      case 'confirm':
        setConfirmPin(prev => prev.slice(0, -1));
        break;
    }
  };

  const handleContinue = () => {
    switch (step) {
      case 'current':
        if (currentPin.length === 4) {
          setStep('new');
        }
        break;
      case 'new':
        if (newPin.length === 4) {
          setStep('confirm');
        }
        break;
      case 'confirm':
        if (confirmPin.length === 4) {
          if (newPin === confirmPin) {
            handleChangePin();
          } else {
            Alert.alert('Error', 'New PINs do not match. Please try again.');
            setConfirmPin('');
          }
        }
        break;
    }
  };

  const handleChangePin = async () => {
    setIsLoading(true);
    try {
      await changePin(currentPin, newPin);
      Alert.alert('Success', 'Your PIN has been changed successfully!', [
        { text: 'OK', onPress: () => {
          resetForm();
          onClose();
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'Current PIN is incorrect. Please try again.');
      setCurrentPin('');
      setStep('current');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPin = () => {
    switch (step) {
      case 'current': return currentPin;
      case 'new': return newPin;
      case 'confirm': return confirmPin;
      default: return '';
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Enter Current PIN';
      case 'new': return 'Create New PIN';
      case 'confirm': return 'Confirm New PIN';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'current': return 'Enter your current 4-digit PIN to continue';
      case 'new': return 'Choose a new secure 4-digit PIN';
      case 'confirm': return 'Enter your new PIN again to confirm';
      default: return '';
    }
  };

  const currentPinValue = getCurrentPin();
  const isComplete = currentPinValue.length === 4;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            resetForm();
            onClose();
          }} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change PIN</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Shield size={48} color="#4facfe" />
            <View style={styles.sparkleIcon}>
              <Sparkles size={16} color="#4facfe" />
            </View>
          </View>
          
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {['current', 'new', 'confirm'].map((stepName, index) => (
              <View
                key={stepName}
                style={[
                  styles.stepDot,
                  step === stepName && styles.stepDotActive,
                  ['current', 'new', 'confirm'].indexOf(step) > index && styles.stepDotCompleted
                ]}
              />
            ))}
          </View>

          {/* PIN Display */}
          <View style={styles.pinContainer}>
            {[0, 1, 2, 3].map(index => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  currentPinValue.length > index && styles.pinDotFilled,
                ]}
              >
                {currentPinValue.length > index && (
                  <View style={styles.pinDotInner} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Number Pad */}
        <View style={styles.numberPadContainer}>
          <View style={styles.numberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <TouchableOpacity
                key={number}
                style={styles.numberButton}
                onPress={() => handleNumberPress(number.toString())}
                disabled={currentPinValue.length >= 4}
                activeOpacity={0.7}
              >
                <Text style={styles.numberText}>{number}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.emptyButton} />
            
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => handleNumberPress('0')}
              disabled={currentPinValue.length >= 4}
              activeOpacity={0.7}
            >
              <Text style={styles.numberText}>0</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={currentPinValue.length === 0}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.continueButton, isComplete && styles.continueButtonActive]}
            onPress={handleContinue}
            disabled={!isComplete || isLoading}
            activeOpacity={0.8}
          >
            {step === 'confirm' && isComplete ? (
              <Check size={24} color="#FFFFFF" />
            ) : (
              <Text style={[styles.continueButtonText, isComplete && styles.continueButtonTextActive]}>
                {isLoading ? 'Changing PIN...' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    backgroundColor: '#4facfe',
  },
  stepDotCompleted: {
    backgroundColor: '#4facfe',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    borderColor: '#4facfe',
    backgroundColor: '#EFF6FF',
  },
  pinDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4facfe',
  },
  numberPadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    maxWidth: 280,
    alignSelf: 'center',
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButton: {
    width: 72,
    height: 72,
  },
  deleteButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  deleteText: {
    fontSize: 24,
    color: '#6B7280',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonActive: {
    backgroundColor: '#4facfe',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
});