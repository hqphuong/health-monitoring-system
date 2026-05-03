import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router'; // Thêm useFocusEffect
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { removeToken } from '../../services/auth';
import { setAuthToken, api } from '../../services/api';
import { setIsAuthenticated } from '../_layout';
import { useProfile } from '../../hooks/useProfile';

type MenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  route?: string;
  badge?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { profile, loading, refresh } = useProfile();
  const [relativesCount, setRelativesCount] = useState<number>(0);

  // Hàm lấy số lượng liên hệ khẩn cấp
  const fetchRelativesCount = async () => {
    try {
      const relatives = await api.getRelatives();
      const list = Array.isArray(relatives) ? relatives : [];
      setRelativesCount(list.length);
    } catch {
      setRelativesCount(0);
    }
  };

  // Tự động làm mới dữ liệu mỗi khi màn hình Profile được hiển thị (Focus)
  useFocusEffect(
    useCallback(() => {
      refresh(); // Cập nhật chỉ số sức khỏe mới nhất từ Backend
      fetchRelativesCount(); // Cập nhật số lượng người thân
    }, [refresh])
  );

  const menuItems: MenuItem[][] = [
    [
      {
        id: 'edit-profile',
        title: 'Thông tin sức khỏe',
        subtitle: 'Chiều cao, cân nặng, BMI',
        icon: 'body',
        iconColor: Colors.primary.main,
        iconBg: Colors.status.infoLight,
        route: '/(profile)/edit',
      },
      {
        id: 'emergency-contacts',
        title: 'Liên hệ khẩn cấp',
        subtitle: 'Quản lý SOS contacts',
        icon: 'call',
        iconColor: Colors.status.error,
        iconBg: Colors.status.errorLight,
        route: '/(profile)/emergency-contacts',
        badge: relativesCount > 0 ? relativesCount.toString() : undefined,
      },
      {
        id: 'health-goals',
        title: 'Mục tiêu sức khỏe',
        subtitle: 'Bước chân, calories, giấc ngủ',
        icon: 'trophy',
        iconColor: Colors.secondary.orange,
        iconBg: Colors.status.warningLight,
        onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
      },
    ],
    [
      {
        id: 'notifications',
        title: 'Thông báo',
        subtitle: 'Cảnh báo, nhắc nhở',
        icon: 'notifications',
        iconColor: Colors.secondary.purple,
        iconBg: '#F3E8FF',
        onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
      },
      {
        id: 'privacy',
        title: 'Quyền riêng tư',
        subtitle: 'Dữ liệu & bảo mật',
        icon: 'shield-checkmark',
        iconColor: Colors.secondary.teal,
        iconBg: '#CCFBF1',
        onPress: () => Alert.alert('Thông báo', 'Tính năng đang được phát triển'),
      },
      {
        id: 'language',
        title: 'Ngôn ngữ',
        subtitle: 'Tiếng Việt',
        icon: 'language',
        iconColor: Colors.primary.light,
        iconBg: Colors.status.infoLight,
      },
    ],
    [
      {
        id: 'help',
        title: 'Trợ giúp & Hỗ trợ',
        icon: 'help-circle',
        iconColor: Colors.neutral.textSecondary,
        iconBg: Colors.neutral.border,
      },
      {
        id: 'about',
        title: 'Về ứng dụng',
        subtitle: 'Phiên bản 1.0.0',
        icon: 'information-circle',
        iconColor: Colors.neutral.textSecondary,
        iconBg: Colors.neutral.border,
      },
    ],
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeToken();
              setAuthToken(null);
              setIsAuthenticated(false);
              router.replace('/(auth)/login');
            } catch (error) {
              setAuthToken(null);
              setIsAuthenticated(false);
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={[styles.menuContent, !isLast && styles.menuContentBorder]}>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.menuRight}>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color={Colors.neutral.placeholder} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={12} color={Colors.neutral.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{profile.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{profile.email || ''}</Text>

          <View style={styles.memberBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.secondary.teal} />
            <Text style={styles.memberText}>HealthGuard Member</Text>
          </View>
        </View>

        {/* Health Stats Card */}
        <View style={styles.healthCard}>
          <Text style={styles.healthCardTitle}>Chỉ số sức khỏe</Text>
          <View style={styles.healthStats}>
            <View style={styles.healthStat}>
              <Text style={styles.healthStatValue}>{profile.height ?? '--'}</Text>
              <Text style={styles.healthStatUnit}>cm</Text>
              <Text style={styles.healthStatLabel}>Chiều cao</Text>
            </View>
            
            <View style={styles.healthStatDivider} />
            
            <View style={styles.healthStat}>
              <Text style={styles.healthStatValue}>{profile.weight ?? '--'}</Text>
              <Text style={styles.healthStatUnit}>kg</Text>
              <Text style={styles.healthStatLabel}>Cân nặng</Text>
            </View>
            
            <View style={styles.healthStatDivider} />
            
            <View style={styles.healthStat}>
              <Text style={[
                styles.healthStatValue, 
                profile.bmiStatus && { color: profile.bmiStatus.color }
              ]}>
                {profile.bmi ?? '--'}
              </Text>
              <Text style={[
                styles.healthStatUnit, 
                profile.bmiStatus && { color: profile.bmiStatus.color }
              ]}>BMI</Text>
              <Text style={[
                styles.healthStatLabel, 
                profile.bmiStatus && { color: profile.bmiStatus.color, fontWeight: 'bold' }
              ]}>
                {profile.bmiStatus?.text || 'Chưa có'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editHealthButton}
            onPress={() => router.push('/(profile)/edit')}
          >
            <Text style={styles.editHealthText}>Cập nhật thông tin</Text>
            <Ionicons name="create-outline" size={16} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            {section.map((item, itemIndex) =>
              renderMenuItem(item, itemIndex === section.length - 1)
            )}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>HealthGuard v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral.background,
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  userEmail: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  memberText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.secondary.teal,
    fontWeight: Typography.fontWeights.medium,
  },
  healthCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  healthCardTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.md,
  },
  healthStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStat: {
    flex: 1,
    alignItems: 'center',
  },
  healthStatValue: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  healthStatUnit: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  healthStatLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  healthStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral.border,
  },
  editHealthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
    gap: Spacing.xs,
  },
  editHealthText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeights.medium,
  },
  menuSection: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    marginLeft: Spacing.md,
  },
  menuContentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
  },
  menuSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.status.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.status.errorLight,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.status.error,
  },
  versionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.placeholder,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
});
