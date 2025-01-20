import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Library Screen</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 