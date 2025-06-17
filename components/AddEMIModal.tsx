import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Check, Calculator } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import CustomAlert from './CustomAlert';

interface AddEMIModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddEMIModal({ visible, onClose }: AddEMIModalProps) {
  const { addEMI } = useApp();
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'error' as 'error' | 'success',
    title: '',
    message: '',
  });

  const calculateEMI = (p: number, r: number, n: number) => {
    const monthlyRate = r / (12 * 100);
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / 
                (Math.pow(1 + monthlyRate, n) - 1);
    return emi;
  };

  const getMonthlyAmount = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const n = parseInt(tenure);
    
    if (p && r && n) {
      return calculateEMI(p, r, n);
    }
    return 0;
  };

  const getNextDueDate = () => {
    const start = new Date(startDate);
    const nextDue = new Date(start);
    nextDue.setMonth(nextDue.getMonth() + 1);
    return nextDue.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setName('');
    setPrincipal('');
    setInterestRate('');
    setTenure('');
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  const showCustomAlert = (type: 'error' | 'success', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    
    // If it was a success alert, close the modal after a short delay
    if (alertConfig.type === 'success') {
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleSubmit = () => {
    if (!name || !principal || !interestRate || !tenure) {
      showCustomAlert('error', 'Missing Information', 'Please fill in all fields to continue.');
      return;
    }

    if (!name.trim()) {
      showCustomAlert('error', 'Invalid EMI Name', 'Please enter a valid name for this EMI.');
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const n = parseInt(tenure);

    if (isNaN(p) || p <= 0) {
      showCustomAlert('error', 'Invalid Principal', 'Please enter a valid principal amount greater than zero.');
      return;
    }

    if (isNaN(r) || r <= 0) {
      showCustomAlert('error', 'Invalid Interest Rate', 'Please enter a valid interest rate greater than zero.');
      return;
    }

    if (isNaN(n) || n <= 0) {
      showCustomAlert('error', 'Invalid Tenure', 'Please enter a valid tenure in months.');
      return;
    }

    try {
      const monthlyAmount = calculateEMI(p, r, n);

      addEMI({
        name: name.trim(),
        principal: p,
        interestRate: r,
        tenure: n,
        monthlyAmount,
        startDate,
        nextDueDate: getNextDueDate(),
        totalPaid: 0,
        remainingAmount: p,
        status: 'active',
      });

      showCustomAlert('success', 'EMI Added', 'Your EMI has been successfully added.');
      resetForm();
    } catch (error) {
      showCustomAlert('error', 'Error', 'Failed to add EMI. Please try again.');
    }
  };

  const monthlyAmount = getMonthlyAmount();

  return (
    <>
      <Modal 
        visible={visible} 
        animationType="slide" 
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.title}>Add EMI</Text>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
              <Check size={24} color="#4facfe" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* EMI Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EMI Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Home Loan, Car Loan"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Principal Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Principal Amount *</Text>
              <TextInput
                style={styles.input}
                value={principal}
                onChangeText={setPrincipal}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Interest Rate */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interest Rate (% per annum) *</Text>
              <TextInput
                style={styles.input}
                value={interestRate}
                onChangeText={setInterestRate}
                placeholder="0.0"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Tenure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tenure (months) *</Text>
              <TextInput
                style={styles.input}
                value={tenure}
                onChangeText={setTenure}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Start Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* EMI Calculator */}
            {monthlyAmount > 0 && (
              <View style={styles.calculatorCard}>
                <View style={styles.calculatorHeader}>
                  <Calculator size={20} color="#4facfe" />
                  <Text style={styles.calculatorTitle}>EMI Calculation</Text>
                </View>
                <View style={styles.calculatorRow}>
                  <Text style={styles.calculatorLabel}>Monthly EMI:</Text>
                  <Text style={styles.calculatorValue}>${monthlyAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.calculatorRow}>
                  <Text style={styles.calculatorLabel}>Total Amount:</Text>
                  <Text style={styles.calculatorValue}>
                    ${(monthlyAmount * parseInt(tenure || '0')).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.calculatorRow}>
                  <Text style={styles.calculatorLabel}>Total Interest:</Text>
                  <Text style={styles.calculatorValue}>
                    ${((monthlyAmount * parseInt(tenure || '0')) - parseFloat(principal || '0')).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <CustomAlert
        visible={showAlert}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />
    </>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculatorLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  calculatorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});