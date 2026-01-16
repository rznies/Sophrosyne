import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Text,
} from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
});

export default function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
