import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MyPageScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const badges = [
    { color: '#FFD700' }, // Gold
    { color: '#C0C0C0' }, // Silver
    { color: '#CD7F32' }, // Bronze
  ];

  const settingItems = [
    {
      title: 'アカウント設定',
      items: [
        { label: 'プロフィール編集', icon: 'person-outline' },
      ]
    },
    {
      title: 'アプリ設定',
      items: [
        { label: '通知設定', icon: 'notifications-outline' },
        { label: '単位設定', icon: 'scale-outline' },
        { label: 'プライバシー', icon: 'lock-closed-outline' },
      ]
    },
    {
      title: 'サポート',
      items: [
        { label: 'ヘルプ', icon: 'help-circle-outline' },
        { label: 'アプリについて', icon: 'information-circle-outline' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* プロフィールセクション */}
      <View style={styles.profileSection}>
        <ThemedText style={styles.sectionTitle}>プロフィール</ThemedText>
        
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar} />
              <TouchableOpacity style={styles.editButton}>
                <ThemedText style={styles.editButtonText}>編集</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.userName}>山田太郎</ThemedText>
              <ThemedText style={styles.trainingPeriod}>トレーニング歴: 6ヶ月</ThemedText>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>身長</ThemedText>
              <ThemedText style={styles.statValue}>175cm</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>体重</ThemedText>
              <ThemedText style={styles.statValue}>75.5kg</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>目標</ThemedText>
              <ThemedText style={styles.statValue}>筋肥大</ThemedText>
            </View>
          </View>

          <View style={styles.badgesSection}>
            <ThemedText style={styles.badgesTitle}>獲得バッジ</ThemedText>
            <View style={styles.badgesContainer}>
              {badges.map((badge, index) => (
                <View 
                  key={index} 
                  style={[styles.badge, { backgroundColor: badge.color }]} 
                />
              ))}
              <TouchableOpacity>
                <ThemedText style={styles.showAllBadges}>すべて表示 ></ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 設定セクション */}
      <View style={styles.settingsSection}>
        <ThemedText style={styles.sectionTitle}>設定</ThemedText>
        
        {settingItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsGroup}>
            <ThemedText style={styles.settingsGroupTitle}>{section.title}</ThemedText>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex} 
                style={styles.settingItem}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={colors.text} 
                  />
                  <ThemedText style={styles.settingItemText}>{item.label}</ThemedText>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileSection: {
    paddingTop: 44,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
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
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
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
    marginBottom: 4,
  },
  trainingPeriod: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  badgesSection: {
    marginTop: 8,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  showAllBadges: {
    color: '#007AFF',
    fontSize: 14,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  settingsGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    paddingHorizontal: 16,
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
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 