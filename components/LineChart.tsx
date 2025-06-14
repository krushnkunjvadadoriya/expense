import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
}

const screenWidth = Dimensions.get('window').width;

export default function LineChart({ data }: LineChartProps) {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 172, 254, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4facfe',
    },
  };

  return (
    <View style={{ alignItems: 'center', overflow: 'hidden' }}>
      <RNLineChart
        data={data}
        width={screenWidth - 80}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
    </View>
  );
}