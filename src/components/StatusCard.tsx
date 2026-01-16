import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workModeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeOn: {
    backgroundColor: '#c8e6c9',
  },
  badgeOff: {
    backgroundColor: '#ffcdd2',
  },
  badgeLimited: {
    backgroundColor: '#ffe0b2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextOn: {
    color: '#2e7d32',
  },
  badgeTextOff: {
    color: '#c62828',
  },
  badgeTextLimited: {
    color: '#f57c00',
  },
  scheduleText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default function StatusCard() {
  const { workModeOn, setWorkMode, accessibilityEnabled } = useAppStore();

  const protectionStatus = useMemo(() => {
    if (workModeOn && accessibilityEnabled) {
      return {
        status: 'ON',
        style: styles.badgeOn,
        textStyle: styles.badgeTextOn,
        icon: 'shield',
      };
    }
    if (!workModeOn && !accessibilityEnabled) {
      return {
        status: 'OFF',
        style: styles.badgeOff,
        textStyle: styles.badgeTextOff,
        icon: 'shield-off',
      };
    }
    return {
      status: 'LIMITED',
      style: styles.badgeLimited,
      textStyle: styles.badgeTextLimited,
      icon: 'warning',
    };
  }, [workModeOn, accessibilityEnabled]);

  return (
    <View style={styles.container}>
      <View style={styles.workModeRow}>
        <Text style={styles.workModeLabel}>Work Mode: {workModeOn ? 'ON' : 'OFF'}</Text>
        <Switch
          value={workModeOn}
          onValueChange={setWorkMode}
          trackColor={{ false: '#d0d0d0', true: '#81c784' }}
          thumbColor={workModeOn ? '#4caf50' : '#f4f3f4'}
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Protection Status:</Text>
        <View style={[styles.badge, protectionStatus.style]}>
          <MaterialIcons
            name={protectionStatus.icon as any}
            size={14}
            color={protectionStatus.textStyle.color}
          />
          <Text style={[styles.badgeText, protectionStatus.textStyle]}>
            {protectionStatus.status}
          </Text>
        </View>
      </View>

      {workModeOn && (
        <Text style={styles.scheduleText}>
          ✓ Manual override enabled. Protection is active regardless of schedule.
        </Text>
      )}
    </View>
  );
}
