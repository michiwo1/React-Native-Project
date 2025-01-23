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
      borderRadius: 16,
      padding: 20,
      flex: 1,
      height: '100%',
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: '#64748B',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    value: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 12,
      letterSpacing: -0.5,
      lineHeight: 38,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    change: {
      fontSize: 15,
      marginLeft: 4,
      fontWeight: '600',
    },
    date: {
      fontSize: 13,
      color: '#94A3B8',
      marginTop: 'auto',
      paddingTop: 12,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      minHeight: '100%',
    },
    upperContent: {
      flex: 0,
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.upperContent}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.value}>{value}</ThemedText>
          {change !== null && change !== undefined && (
            <View style={styles.changeContainer}>
              <MaterialCommunityIcons
                name={change >= 0 ? 'arrow-up' : 'arrow-down'}
                size={18}
                color={change >= 0 ? '#10B981' : '#EF4444'}
              />
              <ThemedText style={[styles.change, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
                {Math.abs(change)}{changeUnit}
              </ThemedText>
            </View>
          )}
        </View>
        {date && <ThemedText style={styles.date}>{date}</ThemedText>}
      </View>
    </View>
  );
} 