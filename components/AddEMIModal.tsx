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
import { X, Check, Calculator, Calendar, ChevronDown } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

interface AddEMIModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddEMIModal({ visible, onClose }: AddEMIModalProps) {
  const { addEMI, showToast } = useApp();
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const [interestRateError, setInterestRateError] = useState('');
  const [tenureError, setTenureError] = useState('');

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
    setNameError('');
    setPrincipalError('');
    setInterestRateError('');
    setTenureError('');
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (selectedDate: string) => {
    setStartDate(selectedDate);
    setShowDatePicker(false);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Add today and next 30 days
    for (let i = 0; i < 31; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Function to validate and format numeric input (allows decimals)
  const handleNumericChange = (text: string, setter: (value: string) => void, errorSetter: (error: string) => void) => {
    // Remove any non-numeric characters except decimal point
    let cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (cleanedText.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimalIndex = cleanedText.indexOf('.');
      cleanedText = cleanedText.substring(0, firstDecimalIndex + 1) + 
                   cleanedText.substring(firstDecimalIndex + 1).replace(/\./g, '');
    }
    
    // If starts with decimal point, prefix with 0
    if (cleanedText.startsWith('.')) {
      cleanedText = '0' + cleanedText;
    }
    
    // Limit to 2 decimal places for principal and interest rate
    const parts = cleanedText.split('.');
    if (parts.length === 2 && parts[1].length > 2) {
      cleanedText = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    setter(cleanedText);
    errorSetter('');
  };

  // Function to validate and format integer input (tenure)
  const handleIntegerChange = (text: string, setter: (value: string) => void, errorSetter: (error: string) => void) => {
    // Remove any non-numeric characters
    const cleanedText = text.replace(/[^0-9]/g, '');
    setter(cleanedText);
    errorSetter('');
  };
  const handleSubmit = () => {
    // Reset errors
    setNameError('');
    setPrincipalError('');
    setInterestRateError('');
    setTenureError('');
    
    let hasErrors = false;

    if (!name || !principal || !interestRate || !tenure) {
      if (!name.trim()) {
        setNameError('EMI name is required');
        hasErrors = true;
      }
      if (!principal) {
        setPrincipalError('Principal amount is required');
        hasErrors = true;
      }
      if (!interestRate) {
        setInterestRateError('Interest rate is required');
        hasErrors = true;
      }
      if (!tenure) {
        setTenureError('Tenure is required');
        hasErrors = true;
      }
      return;
    }

    if (!name.trim()) {
      setNameError('Please enter a valid EMI name');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const n = parseInt(tenure);

    if (isNaN(p) || p <= 0) {
      setPrincipalError('Please enter a valid amount greater than zero');
      return;
    }

    if (isNaN(r) || r <= 0) {
      setInterestRateError('Please enter a valid interest rate greater than zero');
      return;
    }

    if (isNaN(n) || n <= 0) {
      setTenureError('Please enter a valid tenure in months');
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

      showToast({
        type: 'success',
        message: 'EMI added successfully!',
      });
      resetForm();
      onClose();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to add EMI. Please try again.',
      });
    }
  };

  const monthlyAmount = getMonthlyAmount();

  return (
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
              style={[styles.input, nameError && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              placeholder="e.g., Home Loan, Car Loan"
              placeholderTextColor="#9CA3AF"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Principal Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Principal Amount *</Text>
            <TextInput
              style={[styles.input, principalError && styles.inputError]}
              value={principal}
              onChangeText={(text) => handleNumericChange(text, setPrincipal, setPrincipalError)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {principalError ? <Text style={styles.errorText}>{principalError}</Text> : null}
          </View>

          {/* Interest Rate */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interest Rate (% per annum) *</Text>
            <TextInput
              style={[styles.input, interestRateError && styles.inputError]}
              value={interestRate}
              onChangeText={(text) => handleNumericChange(text, setInterestRate, setInterestRateError)}
              placeholder="0.0"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {interestRateError ? <Text style={styles.errorText}>{interestRateError}</Text> : null}
          </View>

          {/* Tenure */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tenure (months) *</Text>
            <TextInput
              style={[styles.input, tenureError && styles.inputError]}
              value={tenure}
              onChangeText={(text) => handleIntegerChange(text, setTenure, setTenureError)}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
            {tenureError ? <Text style={styles.errorText}>{tenureError}</Text> : null}
          </View>

          {/* Start Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>
                {formatDateForDisplay(startDate)}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
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
                <Text style={styles.calculatorValue}>
                  ${monthlyAmount % 1 === 0 ? monthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 0 }) : monthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>Total Amount:</Text>
                <Text style={styles.calculatorValue}>
                  ${((monthlyAmount * parseInt(tenure || '0')) % 1 === 0) ? 
                    (monthlyAmount * parseInt(tenure || '0')).toLocaleString('en-US', { minimumFractionDigits: 0 }) : 
                    (monthlyAmount * parseInt(tenure || '0')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>Total Interest:</Text>
                <Text style={styles.calculatorValue}>
                  ${(((monthlyAmount * parseInt(tenure || '0')) - parseFloat(principal || '0')) % 1 === 0) ? 
                    ((monthlyAmount * parseInt(tenure || '0')) - parseFloat(principal || '0')).toLocaleString('en-US', { minimumFractionDigits: 0 }) : 
                    ((monthlyAmount * parseInt(tenure || '0')) - parseFloat(principal || '0')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Start Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerScroll}>
                {generateDateOptions().map((dateOption) => (
                  <TouchableOpacity
                    key={dateOption}
                    style={[
                      styles.dateOption,
                      dateOption === startDate && styles.dateOptionSelected
                    ]}
                    onPress={() => handleDateSelect(dateOption)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      dateOption === startDate && styles.dateOptionTextSelected
                    ]}>
                      {formatDateForDisplay(dateOption)}
                    </Text>
                    {dateOption === new Date().toISOString().split('T')[0] && (
                      <Text style={styles.todayLabel}>Today</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
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
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  datePickerScroll: {
    maxHeight: 400,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dateOptionTextSelected: {
    color: '#4facfe',
    fontWeight: '600',
  },
  todayLabel: {
    fontSize: 12,
    color: '#4facfe',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});