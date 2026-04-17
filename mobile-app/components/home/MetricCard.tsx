import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  children?: React.ReactNode; // Dùng để chứa Chart hoặc Sleep Stages
  footer?: React.ReactNode;   // Dùng cho phần thống kê bên dưới (nếu có)
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  onPress,
  children,
  footer,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.neutral.placeholder} />
      </View>

      <View style={styles.body}>
        <Text style={styles.valueText}>{value}</Text>
        <View style={styles.contentArea}>{children}</View>
      </View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </TouchableOpacity>
  );
};

export default MetricCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  titleContainer: { flex: 1 },
  title: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semibold, color: Colors.neutral.textPrimary },
  subtitle: { fontSize: Typography.fontSizes.xs, color: Colors.neutral.textSecondary },
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueText: { fontSize: Typography.fontSizes['3xl'], fontWeight: Typography.fontWeights.bold, color: Colors.neutral.textPrimary },
  contentArea: { flex: 1, alignItems: 'flex-end' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
});