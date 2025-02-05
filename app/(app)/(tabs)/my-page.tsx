import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import { useEffect, useState } from 'react';

type GoalType = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  toString: () => string;
};

type UserProfile = {
  id: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  goal_type: string | null;
  training_level: string | null;
  display_name: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
};

type SettingItem = {
  label: string;
  icon: string;
  action: () => void;
  textColor?: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function MyPageScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { token, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const badges = [
    { color: '#FFD700', icon: '🏆' }, // Gold
    { color: '#C0C0C0', icon: '🎯' }, // Silver
    { color: '#CD7F32', icon: '💪' }, // Bronze
  ];

  const settingItems: SettingSection[] = [
    {
      title: 'Account Settings',
      items: [
        { label: 'Edit Profile', icon: 'person-outline', action: () => {} },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { label: 'Notifications', icon: 'notifications-outline', action: () => {} },
        { label: 'Units', icon: 'scale-outline', action: () => {} },
        { label: 'Privacy', icon: 'shield-outline', action: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help', icon: 'help-circle-outline', action: () => {} },
        { label: 'About', icon: 'information-circle-outline', action: () => {} },
      ]
    },
    {
      title: 'Other',
      items: [
        { 
          label: 'Logout', 
          icon: 'log-out-outline', 
          action: () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // First remove local token
                      await AsyncStorage.removeItem('userToken');
                      await signOut();

                      // Send logout request to server (continue even if error occurs)
                      try {
                        await fetch(`${API_URL}/api/auth/logout`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          credentials: 'include'
                        });
                      } catch (serverError) {
                        console.error('Server logout error:', serverError);
                      }
                      
                      // Navigate to login page
                      router.replace('/auth/sign-in');
                    } catch (error) {
                      console.error('Logout error:', error);
                      Alert.alert('Error', 'Failed to logout');
                    }
                  },
                },
              ],
              { cancelable: false }
            );
          }, 
          textColor: '#FF3B30' 
        },
      ]
    }
  ];

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      ) : (
        <>
          {/* プロフィールセクション */}
          <View style={styles.profileSection}>
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <ThemedText style={styles.avatarText}>
                      {profile?.user?.name ? profile.user.name.charAt(0) : '?'}
                    </ThemedText>
                  </View>
                  <TouchableOpacity style={styles.editButton}>
                    <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.userName}>{profile?.display_name || 'Username not set'}</ThemedText>
                  <View style={styles.trainingBadge}>
                    <Ionicons name="time-outline" size={14} color="#666666" />
                    <ThemedText style={styles.trainingPeriod}>
                      Training Level: {profile?.training_level || 'Not set'}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.statsContainer}>
                {[
                  { label: 'Height', value: profile?.height ? `${profile.height}cm` : 'Not set' },
                  { label: 'Weight', value: profile?.weight ? `${profile.weight}kg` : 'Not set' },
                  { label: 'Goal', value: profile?.goal_type || 'Not set' }
                ].map((stat, index) => (
                  <View key={index} style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                    <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  </View>
                ))}
              </View>

              <View style={styles.badgesSection}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.badgesTitle}>Badges</ThemedText>
                  <TouchableOpacity style={styles.showAllButton}>
                    <ThemedText style={styles.showAllText}>Show All</ThemedText>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.badgesContainer}>
                  {badges.map((badge, index) => (
                    <View key={index} style={styles.badgeWrapper}>
                      <View style={[styles.badge, { backgroundColor: badge.color }]}>
                        <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.settingsSection}>
            {settingItems.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.settingsGroup}>
                <ThemedText style={styles.settingsGroupTitle}>{section.title}</ThemedText>
                <View style={styles.settingsCard}>
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity 
                      key={itemIndex} 
                      style={[
                        styles.settingItem,
                        itemIndex === section.items.length - 1 && styles.settingItemLast
                      ]}
                      onPress={item.action}
                    >
                      <View style={styles.settingItemLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons name={item.icon as any} size={22} color={colors.text} />
                        </View>
                        <ThemedText style={[styles.settingItemText, item.textColor && styles.settingItemTextRed]}>{item.label}</ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: Colors.light.text,
  },
  trainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  trainingPeriod: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  badgesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeWrapper: {
    marginRight: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 20,
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  settingsGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  settingItemTextRed: {
    color: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
}); 