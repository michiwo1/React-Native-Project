import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';

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
  const { token } = useAuth();

  const badges = [
    { color: '#FFD700', icon: '🏆' }, // Gold
    { color: '#C0C0C0', icon: '🎯' }, // Silver
    { color: '#CD7F32', icon: '💪' }, // Bronze
  ];

  const settingItems: SettingSection[] = [
    {
      title: 'アカウント設定',
      items: [
        { label: 'プロフィール編集', icon: 'person-outline', action: () => {} },
      ]
    },
    {
      title: 'アプリ設定',
      items: [
        { label: '通知設定', icon: 'notifications-outline', action: () => {} },
        { label: '単位設定', icon: 'scale-outline', action: () => {} },
        { label: 'プライバシー', icon: 'shield-outline', action: () => {} },
      ]
    },
    {
      title: 'サポート',
      items: [
        { label: 'ヘルプ', icon: 'help-circle-outline', action: () => {} },
        { label: 'アプリについて', icon: 'information-circle-outline', action: () => {} },
      ]
    },
    {
      title: 'その他',
      items: [
        { 
          label: 'ログアウト', 
          icon: 'log-out-outline', 
          action: async () => {
            Alert.alert(
              'ログアウト',
              'ログアウトしますか？',
              [
                {
                  text: 'キャンセル',
                  style: 'cancel',
                },
                {
                  text: 'ログアウト',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // サーバーにログアウトリクエストを送信
                      const response = await fetch(`${API_URL}/api/auth/logout`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include'
                      });

                      if (!response.ok) {
                        console.error('Logout failed:', await response.text());
                        throw new Error('ログアウトに失敗しました');
                      }

                      // ローカルのトークンを削除
                      await AsyncStorage.removeItem('userToken');
                      
                      // ログインページに遷移
                      router.replace('/auth/sign-in');
                    } catch (error) {
                      console.error('ログアウトエラー:', error);
                      Alert.alert('エラー', 'ログアウトに失敗しました');
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

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* プロフィールセクション */}
      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>山</ThemedText>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <ThemedText style={styles.editButtonText}>編集</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.userName}>山田太郎</ThemedText>
              <View style={styles.trainingBadge}>
                <Ionicons name="time-outline" size={14} color="#666666" />
                <ThemedText style={styles.trainingPeriod}>トレーニング歴: 6ヶ月</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            {[
              { label: '身長', value: '175cm' },
              { label: '体重', value: '75.5kg' },
              { label: '目標', value: '筋肥大' }
            ].map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.badgesSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.badgesTitle}>獲得バッジ</ThemedText>
              <TouchableOpacity style={styles.showAllButton}>
                <ThemedText style={styles.showAllText}>すべて表示</ThemedText>
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

      {/* 設定セクション */}
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
}); 