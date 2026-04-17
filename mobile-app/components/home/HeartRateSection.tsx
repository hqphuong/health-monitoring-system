import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/Colors';
import MetricCard from './MetricCard';
import { router } from 'expo-router';

interface HeartRateSectionProps {
  current: number;
  avg: number;
  history: number[];
}

const HeartRateSection: React.FC<HeartRateSectionProps> = ({ current, avg, history }) => {
  // --- DEBUG CONSOLE ---
  console.log('--- [DEBUG HEART RATE SECTION] ---');
  console.log('Current (Gần nhất):', current);
  console.log('Avg (Trung bình):', avg);
  console.log('History (Mảng lịch sử):', history);
  console.log('Số lượng điểm đo trong mảng:', history?.length || 0);
  // ---------------------

  // Tính toán các chỉ số bổ sung
  const maxHr = history && history.length > 0 ? Math.max(...history) : 0;
  const minHr = history && history.length > 0 ? Math.min(...history) : 0;
  
  // Tính toán chiều cao cho biểu đồ mini
  const chartMax = maxHr || 100;
  const chartMin = minHr || 40;
  const range = chartMax - chartMin || 1;

  return (
    <MetricCard
      title="Nhịp tim"
      subtitle="Chỉ số đo gần nhất"
      value={current || '--'} 
      unit="BPM"
      icon="heart"
      iconColor={Colors.health.heartRate}
      onPress={() => router.push('/(health)/heart-rate-detail')}
    >
      {/* 1. Biểu đồ xu hướng mini */}
      <View style={styles.chartContainer}>
        <View style={styles.miniChart}>
          {history && history.length > 0 ? (
            history.map((v: number, i: number) => {
                // Log thử chiều cao của bar đầu tiên để check logic vẽ
                if(i === 0) console.log('Mẫu bar height:', ((v - chartMin) / range) * 30 + 5);
                
                return (
                  <View
                    key={i}
                    style={[
                      styles.miniChartBar,
                      {
                        height: ((v - chartMin) / range) * 30 + 5,
                        backgroundColor:
                          i === history.length - 1
                            ? Colors.health.heartRate
                            : Colors.health.heartRate + '40',
                      },
                    ]}
                  />
                );
            })
          ) : (
            <Text style={styles.noDataText}>Chưa có dữ liệu lịch sử</Text>
          )}
        </View>
      </View>

      {/* 2. Hàng chỉ số chi tiết: Min - Avg - Max */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Thấp nhất</Text>
          <Text style={styles.statValue}>{minHr || '--'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trung bình</Text>
          <Text style={styles.statValue}>{avg || '--'}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cao nhất</Text>
          <Text style={styles.statValue}>{maxHr || '--'}</Text>
        </View>
      </View>
    </MetricCard>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 3,
  },
  miniChartBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  noDataText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  }
});

export default HeartRateSection;