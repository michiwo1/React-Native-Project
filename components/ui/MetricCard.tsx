import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
  changeUnit: string;
  date?: string;
}

export function MetricCard({ title, value, change, changeUnit, date }: MetricCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colorScheme === 'light' ? '#F5F7FA' : '#1A1D1E',
      borderRadius: 12,
      padding: 16,
      flex: 1,
      height: '100%',
    },
    title: {
      fontSize: 14,
      color: '#64748B',
      marginBottom: 8,
    },
    value: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    change: {
      fontSize: 14,
      marginLeft: 4,
      color: '#64748B',
    },
    date: {
      fontSize: 12,
      color: '#94A3B8',
    },
  });

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
      {change !== null && change !== undefined && (
        <View style={styles.changeContainer}>
          <MaterialCommunityIcons
            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={change >= 0 ? '#10B981' : '#EF4444'}
          />
          <ThemedText style={[styles.change, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(change)}{changeUnit}
          </ThemedText>
        </View>
      )}
      {date && <ThemedText style={styles.date}>{date}</ThemedText>}
    </View>
  );
} 