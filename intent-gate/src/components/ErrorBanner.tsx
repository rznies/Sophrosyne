import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.captionMedium,
    color: colors.white,
  },
  closeButton: {
    marginLeft: spacing.md,
  },
});

export default function ErrorBanner({ message, onRetry, onClose }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={24} color={colors.error} />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
}
