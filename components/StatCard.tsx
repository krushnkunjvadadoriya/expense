import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor?: string;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  backgroundColor 
}: StatCardProps) {
  const { state: themeState } = useTheme();
  const { colors } = themeState.theme;
  const styles = createStyles(colors, backgroundColor);

  // Determine font size based on value length for better fitting
  const getValueFontSize = (value: string) => {
    const valueLength = value.length;
    
    if (valueLength > 12) {
      return 14; // Very small for extremely long values
    } else if (valueLength > 10) {
      return 16; // Small for long values
    } else if (valueLength > 8) {
      return 18; // Medium-small for medium-long values
    } else {
      return 20; // Default size for normal values
    }
  };

  const dynamicValueStyle = {
    fontSize: getValueFontSize(value),
    lineHeight: getValueFontSize(value) + 2,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <Text 
        style={[styles.value, { color }, dynamicValueStyle]} 
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.5}
      >
        {value}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const createStyles = (colors: any, backgroundColor?: string) => StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: backgroundColor || colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 120, // Ensure consistent height
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
    lineHeight: 18,
  },
});