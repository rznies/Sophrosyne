import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  mdBadge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.captionMedium,
  },
  // Variants
  success: {
    backgroundColor: colors.successLight,
  },
  successText: {
    color: colors.success,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  errorText: {
    color: colors.error,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  warningText: {
    color: colors.warning,
  },
  info: {
    backgroundColor: colors.primaryLight,
  },
  infoText: {
    color: colors.primary,
  },
  neutral: {
    backgroundColor: colors.surface,
  },
  neutralText: {
    color: colors.text.primary,
  },
});

export default function Badge({ label, variant = 'neutral', size = 'md', style }: BadgeProps) {
  const variantStyle =
    variant === 'success'
      ? styles.success
      : variant === 'error'
      ? styles.error
      : variant === 'warning'
      ? styles.warning
      : variant === 'info'
      ? styles.info
      : styles.neutral;

  const variantTextStyle =
    variant === 'success'
      ? styles.successText
      : variant === 'error'
      ? styles.errorText
      : variant === 'warning'
      ? styles.warningText
      : variant === 'info'
      ? styles.infoText
      : styles.neutralText;

  const sizeStyle = size === 'sm' ? styles.smBadge : styles.mdBadge;

  return (
    <View style={[styles.badge, variantStyle, sizeStyle, style]}>
      <Text style={[styles.text, variantTextStyle]}>{label}</Text>
    </View>
  );
}
