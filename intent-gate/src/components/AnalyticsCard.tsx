import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTodayStats, getWeeklyRollup, getChipUsageStats } from '../db/repository';
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
  section: {
    marginBottom: 16,
  },
  sectionLast: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  weeklyList: {
    gap: 8,
  },
  weeklyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weeklyItemLast: {
    borderBottomWidth: 0,
  },
  weeklyDate: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    minWidth: 80,
  },
  weeklyStats: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  weeklyStat: {
    alignItems: 'flex-end',
  },
  weeklyStatLabel: {
    fontSize: 10,
    color: '#999',
  },
  weeklyStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196f3',
  },
  chipsContainer: {
    gap: 8,
  },
  chipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  chipLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  chipCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196f3',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDataText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default function AnalyticsCard() {
  const { sessions } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    interceptCount: 0,
    allowedSessionCount: 0,
    totalAllowedMinutes: 0,
  });
  const [weeklyData, setWeeklyData] = useState<
    { date: string; intercepts: number; allowedMinutes: number }[]
  >([]);
  const [topChips, setTopChips] = useState<{ chip: string; count: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [sessions]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [stats, weekly, chips] = await Promise.all([
        getTodayStats(),
        getWeeklyRollup(),
        getChipUsageStats(),
      ]);
      setTodayStats(stats);
      setWeeklyData(weekly);
      setTopChips(chips);
    } catch (error) {
      console.error('[AnalyticsCard] Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Intercepted</Text>
            <Text style={styles.statValue}>{todayStats.interceptCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Allowed</Text>
            <Text style={styles.statValue}>{todayStats.allowedSessionCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Minutes</Text>
            <Text style={styles.statValue}>{todayStats.totalAllowedMinutes}</Text>
          </View>
        </View>
      </View>

      {/* Weekly Trend */}
      {weeklyData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <View style={styles.weeklyList}>
            {weeklyData.map((item, index) => (
              <View
                key={item.date}
                style={[styles.weeklyItem, index === weeklyData.length - 1 && styles.weeklyItemLast]}
              >
                <Text style={styles.weeklyDate}>{item.date}</Text>
                <View style={styles.weeklyStats}>
                  <View style={styles.weeklyStat}>
                    <Text style={styles.weeklyStatLabel}>Intercepts</Text>
                    <Text style={styles.weeklyStatValue}>{item.intercepts}</Text>
                  </View>
                  <View style={styles.weeklyStat}>
                    <Text style={styles.weeklyStatLabel}>Minutes</Text>
                    <Text style={styles.weeklyStatValue}>{item.allowedMinutes}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top Chips Used */}
      {topChips.length > 0 && (
        <View style={styles.sectionLast}>
          <Text style={styles.sectionTitle}>Top Chips Used</Text>
          <View style={styles.chipsContainer}>
            {topChips.map((chip) => (
              <View key={chip.chip} style={styles.chipItem}>
                <MaterialIcons name="lightbulb" size={16} color="#2196f3" />
                <Text style={styles.chipLabel}>{chip.chip}</Text>
                <Text style={styles.chipCount}>{chip.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {weeklyData.length === 0 && topChips.length === 0 && (
        <Text style={styles.noDataText}>No activity data yet</Text>
      )}
    </View>
  );
}
