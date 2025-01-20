import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// トレーニング予定日のマーク用オブジェクト
const scheduledDates = {
  '2024-03-30': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-03-31': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-04-03': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-04-04': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-04-06': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-04-13': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
  '2024-04-14': { 
    marked: true, 
    dotColor: Colors.light.primary,
    customStyles: {
      container: {
        borderRadius: 8,
      },
      text: {
        color: Colors.light.text,
      }
    }
  },
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
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={scheduledDates}
          markingType={'custom'}
          style={styles.calendar}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,
            dotColor: colors.primary,
            monthTextColor: colors.text,
            arrowColor: colors.text,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
            'stylesheet.calendar.header': {
              header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 10,
                paddingRight: 10,
                marginTop: 6,
                alignItems: 'center',
              },
            },
            'stylesheet.day.basic': {
              base: {
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              },
              selected: {
                backgroundColor: colors.primary,
                borderRadius: 8,
              },
              today: {
                backgroundColor: colors.secondary + '20',
                borderRadius: 8,
              },
            },
          }}
        />
      </View>

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
    backgroundColor: Colors.light.background,
  },
  calendarContainer: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  calendar: {
    padding: 12,
  },
  selectedDateSection: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 