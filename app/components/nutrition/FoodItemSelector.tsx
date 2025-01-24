import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';


type FoodCategory = {
  id: string;
  name: string;
  display_order: number;
};

type FoodItem = {
  id: string;
  name: string;
  base_quantity: number;
  base_unit: string;
  nutrients: Array<{
    nutrient_type: {
      name: string;
      unit: string;
    };
    amount_per_unit: number;
  }>;
};

type Props = {
  onSelect: (item: FoodItem) => void;
};

export default function FoodItemSelector({ onSelect }: Props) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (selectedCategory) {
      fetchFoodItems(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meal/food-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCategories(data.sort((a: FoodCategory, b: FoodCategory) => a.display_order - b.display_order));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFoodItems = async (categoryId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/meal/food-items?categoryId=${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="食品を検索"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <View style={styles.categoryList}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item.id && styles.selectedCategoryText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredFoodItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.foodItem}
              onPress={() => onSelect(item)}
            >
              <View style={styles.foodItemContent}>
                <Text style={styles.foodItemName}>{item.name}</Text>
                <Text style={styles.foodItemQuantity}>
                  {item.base_quantity}{item.base_unit}あたり
                </Text>
                <View style={styles.nutrientsContainer}>
                  {item.nutrients
                    .filter(n => ['カロリー', 'タンパク質', '脂質', '炭水化物'].includes(n.nutrient_type.name))
                    .map((n, index) => (
                      <View key={index} style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>{n.nutrient_type.name}</Text>
                        <Text style={styles.nutrientValue}>
                          {n.amount_per_unit}{n.nutrient_type.unit}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}
          style={styles.foodList}
          contentContainerStyle={styles.foodListContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  foodList: {
    flex: 1,
  },
  foodListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  foodItemContent: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  foodItemQuantity: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 13,
    color: '#666666',
    marginRight: 4,
  },
  nutrientValue: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 