import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48, // WCAG AA touch target
  },
  baseText: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  // Size variants
  smButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mdButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lgButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  // Color variants
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  successText: {
    color: colors.white,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  errorText: {
    color: colors.white,
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  warningText: {
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const sizeStyle =
    size === 'sm' ? styles.smButton : size === 'lg' ? styles.lgButton : styles.mdButton;

  const variantButtonStyle =
    variant === 'secondary'
      ? styles.secondaryButton
      : variant === 'success'
      ? styles.successButton
      : variant === 'error'
      ? styles.errorButton
      : variant === 'warning'
      ? styles.warningButton
      : styles.primaryButton;

  const variantTextStyle =
    variant === 'secondary'
      ? styles.secondaryText
      : variant === 'success'
      ? styles.successText
      : variant === 'error'
      ? styles.errorText
      : variant === 'warning'
      ? styles.warningText
      : styles.primaryText;

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        sizeStyle,
        variantButtonStyle,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && <ActivityIndicator color={colors.white} style={{ marginRight: spacing.sm }} />}
      <Text style={[styles.baseText, variantTextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
