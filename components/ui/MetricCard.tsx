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
  hint?: string;
}

export function MetricCard({ title, value, change, changeUnit, date, hint }: MetricCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isHistory = value.startsWith('過去の記録');

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colorScheme === 'light' ? '#F5F7FA' : '#1A1D1E',
      borderRadius: 16,
      padding: 16,
      flex: 1,
      height: '100%',
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: '#64748B',
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    value: {
      fontSize: isHistory ? 13 : 28,
      fontWeight: isHistory ? '500' : 'bold',
      marginBottom: 6,
      letterSpacing: isHistory ? 0 : -0.3,
      lineHeight: isHistory ? 18 : 34,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    change: {
      fontSize: 14,
      marginLeft: 4,
      fontWeight: '600',
    },
    date: {
      fontSize: 12,
      color: '#94A3B8',
      marginTop: 'auto',
      paddingTop: 8,
    },
    hint: {
      fontSize: 11,
      color: '#94A3B8',
      marginTop: 2,
      fontStyle: 'italic',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      height: '100%',
    },
    upperContent: {
      flex: 0,
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.upperContent}>
                  {hint && <ThemedText style={styles.hint}>{hint}</ThemedText>}
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
        </View>
          {date && <ThemedText style={styles.date}>{date}</ThemedText>}
      </View>
    </View>
  );
} 