import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/Colors';
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
  timeRange: 'day' | 'week' | 'month';
  dailySummary: any[];
  rawData?: any[];
}

const SleepSection: React.FC<SleepSectionProps> = ({ duration, stages, timeRange, dailySummary, rawData = [] }) => {

  // 1. TÍNH TOÁN ĐỒNG BỘ SUỐT CÁC TAB ĐƯỢC QUY ĐỔI TRỰC TIẾP TỪ RAW DATA SẠCH
  const sleepMetrics = useMemo(() => {
    // Lọc lấy toàn bộ các bản ghi giấc ngủ có thời lượng và xếp theo timeline tăng dần
    const allSleepRecords = rawData
      .filter((r: any) => (r.sleep_duration || 0) > 0)
      .sort((a: any, b: any) => new Date(a.record_time).getTime() - new Date(b.record_time).getTime());

    if (allSleepRecords.length === 0) {
      return {
        totalDurationHours: '0.0',
        filteredStages: [
          { label: 'Sâu', minutes: 0, percent: 0, color: '#4C1D95' },
          { label: 'REM', minutes: 0, percent: 0, color: '#F472B6' },
          { label: 'Nhẹ', minutes: 0, percent: 0, color: '#8B5CF6' },
        ],
        chartData: []
      };
    }

    // THUẬT TOÁN PHÂN CỤM TUYẾN TÍNH TOÀN CHU KỲ (KHOẢNG CÁCH GAP WAKEUP TRÊN 3 TIẾNG)
    const sessions: any[][] = [];
    let currentGroup: any[] = [];

    allSleepRecords.forEach((r: any, idx: number) => {
      if (idx === 0) {
        currentGroup.push(r);
      } else {
        const prevTime = new Date(allSleepRecords[idx - 1].record_time).getTime();
        const currTime = new Date(r.record_time).getTime();
        const gapMinutes = (currTime - prevTime) / 60000;

        if (gapMinutes <= 180) {
          currentGroup.push(r);
        } else {
          sessions.push(currentGroup);
          currentGroup = [r];
        }
      }
    });
    if (currentGroup.length > 0) sessions.push(currentGroup);

    // Tính toán khoảng cách Interval của từng phiên ngủ độc lập để loại bỏ Overlap chồng lấn trùng đè
    const processedSessions = sessions.map((session) => {
      const firstRecordTime = new Date(session[0].record_time).getTime();
      const lastRecordTime = new Date(session[session.length - 1].record_time).getTime();
      const totalSessionMinutes = Math.round((lastRecordTime - firstRecordTime) / 60000);

      let rawDeep = 0, rawRem = 0, rawLight = 0, rawAwake = 0;
      session.forEach((r: any) => {
        const stage = r.sleep_stage || r.raw_data?.sleep_stages;
        const dur = Number(r.sleep_duration || 0);
        if (stage === 5) rawDeep += dur;
        else if (stage === 6) rawRem += dur;
        else if (stage === 1 || stage === 2) rawAwake += dur;
        else rawLight += dur;
      });

      const rawTotal = rawDeep + rawRem + rawLight + rawAwake || 1;
      const deepMinutes = Math.round((rawDeep / rawTotal) * totalSessionMinutes);
      const remMinutes = Math.round((rawRem / rawTotal) * totalSessionMinutes);
      const awakeMinutes = Math.round((rawAwake / rawTotal) * totalSessionMinutes);
      const lightMinutes = totalSessionMinutes - deepMinutes - remMinutes - awakeMinutes;
      const netSleepMinutes = totalSessionMinutes - awakeMinutes;

      // Sử dụng ngày thức dậy làm mốc gán nhãn khóa cột đồ thị thống kê
      const wakeDateStr = new Date(lastRecordTime).toDateString();
      const wakeDateKey = new Date(lastRecordTime).toLocaleDateString([], { month: '2-digit', day: '2-digit' });

      return {
        wakeDateStr,
        wakeDateKey,
        netSleepMinutes,
        deepMinutes,
        remMinutes,
        lightMinutes,
      };
    });

    // 🟢 RẼ LUỒNG TÍNH TOÁN HIỂN THỊ THEO TỪNG LOẠI TAB CỤ THỂ
    if (timeRange === 'day') {
      const latestSession = processedSessions[processedSessions.length - 1];
      const targetDate = latestSession.wakeDateStr;

      const targetSessions = processedSessions.filter(s => s.wakeDateStr === targetDate);
      let mainSession = targetSessions[0];
      targetSessions.forEach(s => {
        if (s.netSleepMinutes > mainSession.netSleepMinutes) mainSession = s;
      });

      const dayTotalMinutes = targetSessions.reduce((sum, s) => sum + s.netSleepMinutes, 0);
      const totalDurationHours = (dayTotalMinutes / 60).toFixed(1);

      return {
        totalDurationHours,
        filteredStages: [
          { label: 'Sâu', minutes: mainSession.deepMinutes, percent: mainSession.netSleepMinutes ? (mainSession.deepMinutes / mainSession.netSleepMinutes) * 100 : 0, color: '#4C1D95' },
          { label: 'REM', minutes: mainSession.remMinutes, percent: mainSession.netSleepMinutes ? (mainSession.remMinutes / mainSession.netSleepMinutes) * 100 : 0, color: '#F472B6' },
          { label: 'Nhẹ', minutes: mainSession.lightMinutes, percent: mainSession.netSleepMinutes ? (mainSession.lightMinutes / mainSession.netSleepMinutes) * 100 : 0, color: '#8B5CF6' },
        ],
        chartData: []
      };
    } else {
      // TAB TUẦN / THÁNG: Gom nhóm và lấy trung bình cộng thực tế từ rổ Raw phút sạch
      const dailyMap: Record<string, { total: number; deep: number; rem: number; light: number }> = {};

      processedSessions.forEach((s) => {
        const key = s.wakeDateKey;
        if (!dailyMap[key]) {
          dailyMap[key] = { total: 0, deep: 0, rem: 0, light: 0 };
        }
        dailyMap[key].total += s.netSleepMinutes;
        dailyMap[key].deep += s.deepMinutes;
        dailyMap[key].rem += s.remMinutes;
        dailyMap[key].light += s.lightMinutes;
      });

      const daysArray = Object.keys(dailyMap).map((key) => ({
        label: key,
        total: dailyMap[key].total / 60, // Đổi sang giờ hiển thị
        deep: dailyMap[key].deep / 60,
        rem: dailyMap[key].rem / 60,
        light: dailyMap[key].light / 60,
      })).sort((a, b) => a.label.localeCompare(b.label));

      // Cắt lấy số lượng ngày tương thích với phạm vi chu kỳ (7 ngày hoặc 30 ngày)
      const finalChartData = daysArray.slice(timeRange === 'week' ? -7 : -30);

      let sumHours = 0, sumDeep = 0, sumRem = 0, sumLight = 0;
      finalChartData.forEach(d => {
        sumHours += d.total;
        sumDeep += d.deep;
        sumRem += d.rem;
        sumLight += d.light;
      });

      const totalDaysCount = finalChartData.length || 1;
      const avgHours = sumHours / totalDaysCount;
      const avgDeep = sumDeep / totalDaysCount;
      const avgRem = sumRem / totalDaysCount;
      const avgLight = sumLight / totalDaysCount;

      // 🟢 IN LOG SOI CHI TIẾT TÍNH TOÁN TRUNG BÌNH CHU KỲ RA TERMINAL METRO
      console.log("==================================================");
      console.log(`📋 [SleepSection - SOI THỐNG KÊ] Phạm vi tab: ${timeRange.toUpperCase()}`);
      console.log(`📋 Số lượng ngày thực tế nạp dữ liệu ngủ: ${totalDaysCount} ngày`);
      console.log(`📋 Giờ ngủ trung bình thực tế tính toán được: ${avgHours.toFixed(1)}h/đêm`);
      console.log(`📋 TB các thành phần: Sâu: ${(avgDeep * 60).toFixed(0)}m | REM: ${(avgRem * 60).toFixed(0)}m | Nhẹ: ${(avgLight * 60).toFixed(0)}m`);
      console.log("==================================================");

      return {
        totalDurationHours: avgHours.toFixed(1),
        filteredStages: [
          { label: 'Sâu', minutes: Math.round(avgDeep * 60), percent: avgHours ? (avgDeep / avgHours) * 100 : 0, color: '#4C1D95' },
          { label: 'REM', minutes: Math.round(avgRem * 60), percent: avgHours ? (avgRem / avgHours) * 100 : 0, color: '#F472B6' },
          { label: 'Nhẹ', minutes: Math.round(avgLight * 60), percent: avgHours ? (avgLight / avgHours) * 100 : 0, color: '#8B5CF6' },
        ],
        chartData: finalChartData
      };
    }
  }, [rawData, timeRange, duration, stages]);

  // RENDER BIỂU ĐỒ THÀNH PHẦN HOÀN CHỈNH
  const renderChart = useMemo(() => {
    if (timeRange === 'day') {
      return (
        <View style={styles.chartContainerDay}>
          {sleepMetrics.filteredStages.map((stage, index) => (
            stage.percent > 0 && (
              <View
                key={index}
                style={{
                  flex: stage.percent,
                  backgroundColor: stage.color,
                  height: '100%'
                }}
              />
            )
          ))}
        </View>
      );
    } else {
      const chartData = sleepMetrics.chartData || [];

      if (chartData.length === 0) {
        return (
          <View style={styles.noDataChart}>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Chưa có dữ liệu thống kê chu kỳ</Text>
          </View>
        );
      }

      return (
        <View style={styles.chartContainerWeek}>
          {chartData.map((day: any, index: number) => {
            const hasSleep = day.total > 0;
            // Tính toán tỷ lệ chiều cao của thanh cột dựa trên mốc trần 12 tiếng ngủ để tạo tính thống kê chuyên nghiệp
            const barHeight = Math.min(36, (day.total / 12) * 36);

            return (
              <View key={index} style={styles.barColumn}>
                <View style={[styles.barTrack, { height: barHeight, width: timeRange === 'week' ? 12 : 4 }]}>
                  {hasSleep ? (
                    <>
                      <View style={{ flex: day.deep, backgroundColor: '#4C1D95' }} />
                      <View style={{ flex: day.rem, backgroundColor: '#F472B6' }} />
                      <View style={{ flex: day.light, backgroundColor: '#8B5CF6' }} />
                    </>
                  ) : (
                    <View style={{ flex: 1, backgroundColor: '#E2E8F0' }} />
                  )}
                </View>
                {/* 🟢 TỐI ƯU HÓA NHÃN CHỮ CHỐNG CHEN CHÚC: Tab tuần hiện full mốc MM/DD, Tab tháng chỉ hiển thị giãn cách cách nhau 5 ngày */}
                <Text style={styles.miniLabel}>
                  {timeRange === 'week' ? day.label : (index % 5 === 0 ? day.label.split('/')[1] : '')}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }
  }, [sleepMetrics, timeRange]);

  return (
    <MetricCard
      title="Cấu trúc giấc ngủ"
      subtitle={timeRange === 'day' ? `Tổng: ${sleepMetrics.totalDurationHours} giờ` : `Trung bình: ${sleepMetrics.totalDurationHours} giờ/đêm`}
      value={`${sleepMetrics.totalDurationHours}h`}
      icon="moon"
      iconColor={Colors.health.sleep}
      onPress={() => router.push('/(health)/sleep-detail')}
      footer={
        <View style={styles.footerContainer}>
          {sleepMetrics.filteredStages.map((stage, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: stage.color }]} />
              <Text style={styles.statLabel}>{stage.label}: </Text>
              <Text style={styles.statValue}>
                {timeRange === 'day'
                  ? `${(stage.minutes / 60).toFixed(1)}h`
                  : `${Math.round(stage.percent)}%`}
              </Text>
            </View>
          ))}
        </View>
      }
    >
      <View style={styles.chartWrapper}>
        {renderChart}
      </View>
    </MetricCard>
  );
};

export default SleepSection;

const styles = StyleSheet.create({
  chartWrapper: { marginVertical: 12, height: 50, justifyContent: 'center' },
  chartContainerDay: { flexDirection: 'row', height: 16, width: '100%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  // 🟢 STYLE THỐNG KÊ MỚI: Xếp giãn đều cột chồng, tăng tính phân phối toán học dữ liệu
  chartContainerWeek: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 46, width: '100%', paddingHorizontal: 2 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { borderRadius: 3, overflow: 'hidden', flexDirection: 'column-reverse', backgroundColor: '#F1F5F9' },
  miniLabel: { fontSize: 7, color: '#94A3B8', marginTop: 4, fontWeight: '700', textAlign: 'center' },
  footerContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', paddingHorizontal: Spacing.xs },
  statItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statLabel: { fontSize: 10, color: '#64748B' },
  statValue: { fontSize: 10, fontWeight: '700', color: '#1E293B' },
  noDataChart: { height: 40, width: '100%', justifyContent: 'center', alignItems: 'center' }
});