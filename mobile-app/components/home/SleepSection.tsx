import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import MetricCard from './MetricCard';

interface SleepStage {
  label: string;
  minutes: number;
  percent: number;
  color: string;
}

interface SleepSectionProps {
  duration: string;
  stages: SleepStage[];
}

const SleepSection: React.FC<SleepSectionProps> = ({ duration, stages }) => {
  return (
    <MetricCard
      title="Cấu trúc giấc ngủ"
      subtitle={`Tổng: ${duration} giờ`}
      value={`${duration}h`}
      icon="moon"
      iconColor={Colors.health.sleep}
      onPress={() => router.push('/(health)/sleep-detail')}
      footer={
        <View style={styles.footerContainer}>
          {stages.map((stage, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: stage.color }]} />
              <Text style={styles.statLabel}>{stage.label}: </Text>
              <Text style={styles.statValue}>{(stage.minutes / 60).toFixed(1)}h</Text>
              <Text style={styles.percentText}>({Math.round(stage.percent)}%)</Text>
            </View>
          ))}
        </View>
      }
    >
      {/* Sơ đồ minh họa tỉ lệ chính xác */}
      <View style={styles.chartContainer}>
        {stages.map((stage, index) => (
          stage.percent > 0 && (
            <View 
              key={index} 
              style={{ 
                flex: stage.percent, // Dùng flex dựa trên phần trăm để chia tỉ lệ
                backgroundColor: stage.color,
                height: '100%' 
              }} 
            />
          )
        ))}
      </View>
    </MetricCard>
  );
};

export default SleepSection;

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    height: 12, // Tăng độ dày cho dễ nhìn
    width: 120,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6', // Nền nếu không có dữ liệu
  },
  footerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  statValue: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  percentText: {
    fontSize: 10,
    color: Colors.neutral.placeholder,
    marginLeft: 2,
  }
});