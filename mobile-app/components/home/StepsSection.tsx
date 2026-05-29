import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepsSectionProps {
  steps?: number;
  goal?: number;
  timeRange: 'day' | 'week' | 'month';
  dailySummary: any[];
  rawData?: any[]; // Nhận processedRawData từ HomeScreen truyền xuống
}

export default function StepsSection({ steps = 0, goal = 10000, timeRange, dailySummary, rawData = [] }: StepsSectionProps) {

  // 1. LUỒNG TÍNH TOÁN DỮ LIỆU BƯỚC CHÂN ĐỒNG BỘ CHUẨN KHOA HỌC
  const stepsMetrics = useMemo(() => {
    // TAB NGÀY: Hiển thị tiến trình dạng % mục tiêu
    if (timeRange === 'day') {
      const progress = Math.min((steps / goal) * 100, 100);
      return {
        displayValue: steps.toLocaleString(),
        labelSubtitle: `Mục tiêu hằng ngày: ${goal.toLocaleString()} bước`,
        progress,
        chartData: []
      };
    }

    // TAB TUẦN / THÁNG: Tính toán trung bình cộng thực tế từ rổ dữ liệu thô
    const targetRangeLimit = timeRange === 'week' ? -7 : -30;
    const stepRecords = rawData.filter((r: any) => (r.steps || 0) > 0);

    // Gom nhóm số bước chân theo ngày
    const dailyStepsMap: Record<string, number> = {};
    stepRecords.forEach((r: any) => {
      const dayKey = r.display_date || new Date(r.record_time).toLocaleDateString([], { month: '2-digit', day: '2-digit' });
      dailyStepsMap[dayKey] = (dailyStepsMap[dayKey] || 0) + Number(r.steps || 0);
    });

    const daysArray = Object.keys(dailyStepsMap).map((key) => ({
      label: key,
      value: dailyStepsMap[key]
    })).sort((a, b) => a.label.localeCompare(b.label));

    // Cắt mốc theo phạm vi chu kỳ chọn
    const finalChartData = daysArray.slice(targetRangeLimit);

    // Tính trung bình cộng hằng ngày thực tế
    const totalStepsSum = finalChartData.reduce((sum, d) => sum + d.value, 0);
    const totalDaysCount = finalChartData.length || 1;
    const avgStepsDaily = Math.round(totalStepsSum / totalDaysCount);

    return {
      displayValue: avgStepsDaily.toLocaleString(),
      labelSubtitle: `Trung bình hằng ngày (${timeRange === 'week' ? 'Tuần này' : 'Tháng này'})`,
      progress: 0,
      chartData: finalChartData
    };
  }, [steps, goal, timeRange, rawData]);

  // 2. RENDER NỘI DUNG BIỂU ĐỒ CHI TIẾT DÀNH CHO THẺ LỚN
  const renderChart = useMemo(() => {
    if (timeRange === 'day') {
      return (
        <View style={styles.progressWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stepsMetrics.progress}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressPercentText}>Đã hoàn thành {Math.round(stepsMetrics.progress)}%</Text>
            <Text style={styles.progressRemainText}>
              {steps >= goal ? '🎉 Đạt mục tiêu!' : `Còn ${(goal - steps).toLocaleString()} bước`}
            </Text>
          </View>
        </View>
      );
    }

    const chartData = stepsMetrics.chartData || [];
    if (chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chưa có dữ liệu thống kê chu kỳ này</Text>
        </View>
      );
    }

    const maxStepsInPeriod = Math.max(...chartData.map(d => d.value), goal);

    return (
      <View style={styles.chartContainerLarge}>
        {chartData.map((day: any, index: number) => {
          const barHeight = Math.max(6, (day.value / maxStepsInPeriod) * 45);
          const isGoalAchieved = day.value >= goal;

          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.trackField}>
                <View
                  style={[
                    styles.largeBar,
                    {
                      height: barHeight,
                      backgroundColor: isGoalAchieved ? '#059669' : '#10B981',
                      width: timeRange === 'week' ? 14 : 5
                    }
                  ]}
                />
              </View>
              <Text style={styles.xAxisLabel}>
                {timeRange === 'week' ? day.label : (index % 5 === 0 ? day.label.split('/')[1] : '')}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }, [stepsMetrics, timeRange, steps, goal]);

  return (
    <View style={styles.largeCard}>
      {/* Cụm Header Thẻ Lớn */}
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="footsteps" size={20} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Bước chân</Text>
          <Text style={styles.cardSubtitle}>{stepsMetrics.labelSubtitle}</Text>
        </View>
        {timeRange === 'day' && steps >= goal && (
          <View style={styles.achievedBadge}>
            <Ionicons name="trophy" size={12} color="#D97706" />
            <Text style={styles.badgeText}>Đạt mục tiêu</Text>
          </View>
        )}
      </View>

      {/* Cụm Số Liệu Lớn */}
      <View style={styles.valueRow}>
        <Text style={styles.mainValue}>{stepsMetrics.displayValue}</Text>
        <Text style={styles.valueUnit}>bước</Text>
      </View>

      {/* Vùng chứa biểu đồ chi tiết */}
      <View style={styles.chartWrapper}>
        {renderChart}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
    gap: 4,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
  },
  valueUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  chartWrapper: {
    marginTop: 16,
    justifyContent: 'center',
  },
  progressWrapper: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  progressRemainText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  chartContainerLarge: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 65,
    width: '100%',
    paddingTop: 5,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trackField: {
    height: 45,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  largeBar: {
    borderRadius: 4,
  },
  xAxisLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  noDataContainer: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  }
});