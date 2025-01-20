import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type MetricCardProps = {
  title: string;
  value: string;
  change: number;
  changeUnit: string;
  date: string;
};

export function MetricCard({ title, value, change, changeUnit, date }: MetricCardProps) {
  const isPositiveChange = change > 0;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText
        style={[
          styles.change,
          { color: isPositiveChange ? '#34D399' : '#F87171' },
        ]}>
        {isPositiveChange ? '+' : ''}{change}{changeUnit}
      </ThemedText>
      <ThemedText style={styles.date}>{date}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
}); 