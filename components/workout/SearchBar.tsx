import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type SearchBarProps = {
  onSearch?: (text: string) => void;
};

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        <TextInput
          style={styles.searchInput}
          placeholder="Find exercise"
          placeholderTextColor="#8E8E93"
          onChangeText={onSearch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#8E8E93',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 17,
    color: '#000000',
  },
}); 