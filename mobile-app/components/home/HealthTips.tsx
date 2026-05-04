import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';
import { API_CONFIG, ENDPOINTS } from '@/config/api';

interface HealthTipCardProps {
  category?: string; // Cho phép lọc theo category nếu muốn
}

const HealthTipCard: React.FC<HealthTipCardProps> = ({ category }) => {
  const [tip, setTip] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRandomTip = async () => {
      try {
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.HEALTH_TIPS_RANDOM}${category ? `?category=${category}` : ''}`;
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.status === 'success' && json.data.length > 0) {
          setTip(json.data[0].content); // Giả sử field là 'content'
        }
      } catch (error) {
        console.error("Lỗi fetch health tips:", error);
        setTip('Hãy uống đủ nước mỗi ngày để duy trì sức khỏe.');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomTip();
  }, [category]);

  return (
    <View style={styles.tipsCard}>
      <View style={styles.tipsHeader}>
        <Ionicons name="bulb" size={20} color={Colors.secondary.orange} />
        <Text style={styles.tipsTitle}>Lời khuyên</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color={Colors.secondary.orange} />
      ) : (
        <Text style={styles.tipsText}>{tip}</Text>
      )}
    </View>
  );
};

export default HealthTipCard;

// Styles giữ nguyên như cũ của bạn...

const styles = StyleSheet.create({
  tipsCard: {
    backgroundColor: Colors.status.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.secondary.orange,
  },
  tipsText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
});