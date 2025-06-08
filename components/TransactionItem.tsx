import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types';
import * as Icons from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  categoryColor?: string;
  categoryIcon?: string;
}

export default function TransactionItem({ 
  transaction, 
  onPress, 
  categoryColor = '#6B7280',
  categoryIcon = 'circle'
}: TransactionItemProps) {
  const IconComponent = (Icons as any)[categoryIcon] || Icons.Circle;
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
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
          { color: transaction.type === 'income' ? '#3B82F6' : '#EF4444' }
        ]}>
          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#9CA3AF',
    fontWeight: '500',
  },
});