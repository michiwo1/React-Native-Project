import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// トレーニング予定日のマーク用オブジェクト
const scheduledDates = {
  '2024-03-30': { marked: true, dotColor: Colors.light.primary },
  '2024-03-31': { marked: true, dotColor: Colors.light.primary },
  '2024-04-03': { marked: true, dotColor: Colors.light.primary },
  '2024-04-04': { marked: true, dotColor: Colors.light.primary },
  '2024-04-06': { marked: true, dotColor: Colors.light.primary },
  '2024-04-13': { marked: true, dotColor: Colors.light.primary },
  '2024-04-14': { marked: true, dotColor: Colors.light.primary },
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.timestamp));
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={scheduledDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          monthTextColor: colors.text,
          arrowColor: colors.text,
        }}
      />

      {/* 選択した日付の表示 */}
      <View style={styles.selectedDateSection}>
        <ThemedText style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>
        <Button 
          label="Create today's workout plan"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
  },
  selectedDateSection: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 