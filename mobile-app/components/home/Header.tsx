import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';

type TimeRange = 'day' | 'week' | 'month';

interface HeaderProps {
  userName: string;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ 
  userName, 
  timeRange, 
  setTimeRange, 
  isSyncing, 
  onRefresh 
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.main} />

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Chào {userName},</Text>
          <Text style={styles.userName}>Dữ liệu hôm nay</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={onRefresh}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={Colors.neutral.white} size="small" />
          ) : (
            <Ionicons name="sync-outline" size={24} color={Colors.neutral.white} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeContainer}>
        {(['day', 'week', 'month'] as TimeRange[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.timeRangeButton, 
              timeRange === r && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange(r)}
          >
            <Text style={[
              styles.timeRangeText, 
              timeRange === r && styles.timeRangeTextActive
            ]}>
              {r === 'day' ? 'Hôm nay' : r === 'week' ? 'Tuần' : 'Tháng'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.white + 'CC',
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.neutral.white,
  },
  timeRangeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.white + 'CC',
  },
  timeRangeTextActive: {
    color: Colors.primary.main,
  },
});