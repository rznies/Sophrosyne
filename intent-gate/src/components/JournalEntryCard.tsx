import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Session } from '../db/schema';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  intent: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '500',
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outcomeBadgeAllow: {
    backgroundColor: '#c8e6c9',
  },
  outcomeBadgeNotNow: {
    backgroundColor: '#ffe0b2',
  },
  outcomeBadgeExpired: {
    backgroundColor: '#ffcdd2',
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  outcomeBadgeTextAllow: {
    color: '#2e7d32',
  },
  outcomeBadgeTextNotNow: {
    color: '#f57c00',
  },
  outcomeBadgeTextExpired: {
    color: '#c62828',
  },
});

interface Props {
  session: Session;
  appIcon?: string; // Package name - used to generate icon color
  appDisplayName?: string; // Optional display name override
}

export default function JournalEntryCard({
  session,
  appIcon,
  appDisplayName,
}: Props) {
  // Format date: "Jan 16, 2:45 PM"
  const formatDate = (tsMs: number) => {
    const date = new Date(tsMs);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format duration: "Allowed 10 min"
  const formatDuration = (durationSec: number) => {
    const minutes = Math.round(durationSec / 60);
    const outcomeText = session.outcome === 'allowed' ? 'Allowed' : 'Requested';
    return `${outcomeText} ${minutes} min`;
  };

  // Get outcome badge style and text
  const getOutcomeBadge = () => {
    const outcome = session.outcome.toLowerCase();
    if (outcome === 'allowed') {
      return {
        containerStyle: styles.outcomeBadgeAllow,
        textStyle: styles.outcomeBadgeTextAllow,
        icon: 'check-circle',
        text: 'ALLOWED',
      };
    } else if (outcome === 'not_now' || outcome === 'blocked') {
      return {
        containerStyle: styles.outcomeBadgeNotNow,
        textStyle: styles.outcomeBadgeTextNotNow,
        icon: 'schedule',
        text: 'NOT NOW',
      };
    } else if (outcome === 'expired') {
      return {
        containerStyle: styles.outcomeBadgeExpired,
        textStyle: styles.outcomeBadgeTextExpired,
        icon: 'timer-off',
        text: 'EXPIRED',
      };
    }
    return {
      containerStyle: styles.outcomeBadgeNotNow,
      textStyle: styles.outcomeBadgeTextNotNow,
      icon: 'help',
      text: outcome.toUpperCase(),
    };
  };

  const outcomeBadge = getOutcomeBadge();

  // Icon color based on package name hash (simple deterministic coloring)
  const getIconColor = () => {
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];
    let hash = 0;
    for (let i = 0; i < session.packageName.length; i++) {
      hash = session.packageName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
        <MaterialIcons name="apps" size={24} color={getIconColor()} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>{appDisplayName || session.packageName}</Text>
          <Text style={styles.date}>{formatDate(session.tsStartEpochMs)}</Text>
        </View>

        <Text style={styles.intent} numberOfLines={1}>
          {session.intentText}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.duration}>{formatDuration(session.durationSelectedSec)}</Text>
          <View style={[styles.outcomeBadge, outcomeBadge.containerStyle]}>
            <MaterialIcons
              name={outcomeBadge.icon as any}
              size={12}
              color={outcomeBadge.textStyle.color}
            />
            <Text style={[styles.outcomeBadgeText, outcomeBadge.textStyle]}>
              {outcomeBadge.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
