import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants/Colors';
import MetricCard from './MetricCard';

interface CaloriesSectionProps {
  calories?: number;
  timeRange: 'day' | 'week' | 'month';
  goal?: number;
  dailySummary: any[];
}

export default function CaloriesSection({ calories = 0, timeRange, goal = 2000, dailySummary = [] }: CaloriesSectionProps) {

  // 🟢 GIỮ NGUYÊN 100% LOGIC TÍNH TOÁN CŨ CỦA DUY
  const displayCalories = useMemo(() => {
    const baseCalories = calories ?? 0;
    if (timeRange === 'day' && baseCalories > 0) {
      const now = new Date();
      const minutesPassed = now.getHours() * 60 + now.getMinutes();
      const bmrCompensation = Math.round(minutesPassed * 0.08);
      return baseCalories + bmrCompensation;
    }
    return baseCalories;
  }, [calories, timeRange]);

  // Tính % hoàn thành dựa trên logic cũ
  const progress = Math.min((displayCalories / goal) * 100, 100);

  // Tính trung bình cộng cho chu kỳ tuần/tháng
  const avgCalories = useMemo(() => {
    if (timeRange === 'day') return displayCalories;
    const validDays = dailySummary.filter(d => (d.calories || 0) > 0);
    if (validDays.length === 0) return 0;
    const sum = validDays.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    return Math.round(sum / validDays.length);
  }, [dailySummary, displayCalories, timeRange]);

  const progressPercentText = useMemo(() => {
    const activeVal = timeRange === 'day' ? displayCalories : avgCalories;
    return `${Math.round((activeVal / goal) * 100)}%`;
  }, [displayCalories, avgCalories, goal, timeRange]);

  // Vẽ biểu đồ thống kê
  const renderChart = useMemo(() => {
    if (timeRange === 'day') {
      return (
        <View style={styles.chartContainerDay}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      );
    } else {
      const displaySummary = dailySummary.slice(timeRange === 'week' ? -7 : -30);

      if (displaySummary.length === 0) {
        return (
          <View style={styles.noDataChart}>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Chưa có dữ liệu thống kê chu kỳ</Text>
          </View>
        );
      }

      const maxCals = Math.max(...displaySummary.map(d => d.calories || 0), goal);

      return (
        <View style={styles.chartContainerWeek}>
          {displaySummary.map((day: any, index: number) => {
            const hasCals = (day.calories || 0) > 0;
            const barHeight = Math.min(36, ((day.calories || 0) / maxCals) * 36);
            const isGoalAchieved = (day.calories || 0) >= goal;

            const dateLabel = day.date
              ? new Date(day.date).toLocaleDateString([], { month: '2-digit', day: '2-digit' })
              : '';

            return (
              <View key={index} style={styles.barColumn}>
                <View style={[styles.barTrack, { height: barHeight, width: timeRange === 'week' ? 12 : 4 }]}>
                  {hasCals ? (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: isGoalAchieved ? '#EA580C' : '#F97316'
                      }}
                    />
                  ) : (
                    <View style={{ flex: 1, backgroundColor: '#E2E8F0' }} />
                  )}
                </View>
                <Text style={styles.miniLabel}>
                  {timeRange === 'week' ? dateLabel : (index % 5 === 0 ? dateLabel.split('/')[1] : '')}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }
  }, [progress, timeRange, dailySummary, goal]);

  return (
    <MetricCard
      title="Năng lượng tiêu thụ"
      subtitle={timeRange === 'day' ? `Mục tiêu: ${goal.toLocaleString()} kcal` : `Mục tiêu trung bình hằng ngày`}
      value={timeRange === 'day' ? `${displayCalories.toLocaleString()}` : `${avgCalories.toLocaleString()}`}
      icon="flame"
      iconColor="#F97316"
      onPress={() => { }}
      footer={
        <View style={styles.footerContainer}>
          <View style={styles.statItem}>
            <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.statLabel}>
              {timeRange === 'day' ? 'Tiến trình hôm nay: ' : 'Hoàn thành trung bình chu kỳ: '}
            </Text>
            <Text style={styles.statValue}>{progressPercentText}</Text>
          </View>
          {timeRange === 'day' && (
            <Text style={styles.remainText}>
              {displayCalories >= goal ? '🎉 Đạt mục tiêu' : `Còn ${(goal - displayCalories).toLocaleString()} kcal`}
            </Text>
          )}
        </View>
      }
    >
      <View style={styles.chartWrapper}>
        {renderChart}
      </View>
    </MetricCard>
  );
}

const styles = StyleSheet.create({
  chartWrapper: { marginVertical: 12, height: 50, justifyContent: 'center' },
  chartContainerDay: { height: 16, width: '100%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  progressFill: { height: '100%', backgroundColor: '#F97316', borderRadius: 8 },
  chartContainerWeek: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 46, width: '100%', paddingHorizontal: 2 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { borderRadius: 3, overflow: 'hidden', flexDirection: 'column-reverse', backgroundColor: '#F1F5F9' },
  miniLabel: { fontSize: 7, color: '#94A3B8', marginTop: 4, fontWeight: '700', textAlign: 'center' },
  footerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: Spacing.xs },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statLabel: { fontSize: 10, color: '#64748B' },
  statValue: { fontSize: 10, fontWeight: '700', color: '#1E293B' },
  remainText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  noDataChart: { height: 40, width: '100%', justifyContent: 'center', alignItems: 'center' }
});