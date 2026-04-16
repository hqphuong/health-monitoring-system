import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import api from '../services/api';

export function useHealthConnect() {
  const [loading, setLoading] = useState(false);

  const syncHealthData = useCallback(async () => {
    if (Platform.OS !== 'android') return false;
    setLoading(true);

    try {
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ]);

      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime: now.toISOString() } };

      const [steps, heart, oxygen, calories, distance] = await Promise.all([
        readRecords('Steps', filter as any),
        readRecords('HeartRate', filter as any),
        readRecords('OxygenSaturation', filter as any),
        readRecords('ActiveCaloriesBurned', filter as any),
        readRecords('Distance', filter as any),
      ]);

      const groupedMap: Record<string, any> = {};
      const addToMap = (time: string, fields: object) => {
        if (!time) return;
        const date = new Date(time);
        const roundedMinutes = Math.floor(date.getMinutes() / 15) * 15;
        date.setMinutes(roundedMinutes, 0, 0);
        const timeKey = date.toISOString();

        if (!groupedMap[timeKey]) {
          groupedMap[timeKey] = {
            record_time: timeKey,
            heart_rate: null, steps: null, blood_oxygen: null,
            calories: null, distance: null, sleep_duration: null
          };
        }

        Object.entries(fields).forEach(([key, value]) => {
          if (['steps', 'calories', 'distance'].includes(key)) {
            groupedMap[timeKey][key] = (groupedMap[timeKey][key] || 0) + (value || 0);
          } else {
            groupedMap[timeKey][key] = value;
          }
        });
      };

      // Đổ dữ liệu vào Map
      steps.records.forEach((r: any) => addToMap(r.startTime, { steps: r.count }));
      heart.records.forEach((r: any) => {
        const lastBpm = r.samples[r.samples.length - 1]?.beatsPerMinute;
        if (lastBpm) addToMap(r.startTime, { heart_rate: lastBpm });
      });
      oxygen.records.forEach((r: any) => addToMap(r.time, { blood_oxygen: r.percentage }));
      calories.records.forEach((r: any) => addToMap(r.startTime, { calories: r.energy.inKilocalories }));
      distance.records.forEach((r: any) => addToMap(r.startTime, { distance: r.distance.inMeters }));

      const finalData = Object.values(groupedMap);
      if (finalData.length > 0) {
        await api.syncMetrics({ data: finalData });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sync failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { syncHealthData, loading };
}