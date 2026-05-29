import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  unit?: string; // 1. Thêm dòng này để fix lỗi Property 'unit' does not exist
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  children?: React.ReactNode; 
  footer?: React.ReactNode;   
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  value,
  unit, // 2. Nhận biến unit ở đây
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
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.valueText}>{value}</Text>
          {/* Hiển thị unit nếu có truyền vào */}
          {unit && <Text style={styles.unitText}> {unit}</Text>}
        </View>
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
  // Style cho unit để nó nhỏ hơn giá trị chính, nhìn chuyên nghiệp hơn
  unitText: { fontSize: Typography.fontSizes.sm, color: Colors.neutral.textSecondary, fontWeight: '600' },
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