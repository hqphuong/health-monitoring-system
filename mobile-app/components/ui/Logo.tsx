import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/Colors';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  style?: ViewStyle;
}

const logoSizes = {
  sm: { icon: 32, text: Typography.fontSizes.lg },
  md: { icon: 48, text: Typography.fontSizes['2xl'] },
  lg: { icon: 72, text: Typography.fontSizes['3xl'] },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  style,
}) => {
  const { icon: iconSize, text: textSize } = logoSizes[size];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { width: iconSize * 1.5, height: iconSize * 1.5 }]}>
        <Ionicons
          name="heart-circle"
          size={iconSize}
          color={Colors.neutral.white}
        />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: textSize }]}>
          Health<Text style={styles.textAccent}>Guard</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    backgroundColor: Colors.primary.main,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary.main,
  },
  textAccent: {
    color: Colors.primary.light,
  },
});

export default Logo;
