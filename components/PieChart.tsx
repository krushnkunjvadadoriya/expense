import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';

interface PieChartProps {
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
}

const screenWidth = Dimensions.get('window').width;

export default function PieChart({ data }: PieChartProps) {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  // Truncate long category names and ensure they fit
  const processedData = data.map(item => ({
    ...item,
    name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
    legendFontSize: 11,
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <RNPieChart
        data={processedData}
        width={screenWidth - 80}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true}
        center={[10, 0]}
      />
    </View>
  );
}