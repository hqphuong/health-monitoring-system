import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Colors';

interface HealthTipCardProps {
  tipContent?: string;
}

const HealthTipCard: React.FC<HealthTipCardProps> = ({ tipContent }) => {
  return (
    <View style={styles.tipsCard}>
      <View style={styles.tipsHeader}>
        <Ionicons name="bulb" size={20} color={Colors.secondary.orange} />
        <Text style={styles.tipsTitle}>Lời khuyên</Text>
      </View>
      <Text style={styles.tipsText}>
        {tipContent || 'Uống đủ nước và ngủ đúng giờ để cơ thể phục hồi tốt nhất.'}
      </Text>
    </View>
  );
};

export default HealthTipCard;

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