import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useAppStore } from '../store';
import { getTodayStats } from '../db/repository';
import StatusCard from '../components/StatusCard';

type RootTabParamList = {
  Dashboard: undefined;
  Triggers: undefined;
  Journal: undefined;
  Settings: undefined;
};

interface Props {
  navigation: NavigationProp<RootTabParamList>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  analyticsCard: {
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
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsStat: {
    flex: 1,
  },
  analyticsStatLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  analyticsStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function DashboardScreen({ navigation }: Props) {
  const { workModeOn } = useAppStore();
  const [statsLoading, setStatsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    interceptCount: 0,
    allowedSessionCount: 0,
    totalAllowedMinutes: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error('[DashboardScreen] Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleQuickAction = (screen: keyof RootTabParamList) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Status Card */}
        <StatusCard />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Triggers')}
            >
              <MaterialIcons name="apps" size={28} color="#2196f3" />
              <Text style={styles.actionButtonText}>Trigger Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Journal')}
            >
              <MaterialIcons name="schedule" size={28} color="#4caf50" />
              <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.quickActionsGrid, { marginTop: 12 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Journal')}
            >
              <MaterialIcons name="book" size={28} color="#ff9800" />
              <Text style={styles.actionButtonText}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Settings')}
            >
              <MaterialIcons name="settings" size={28} color="#9c27b0" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Card */}
        {statsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2196f3" />
          </View>
        ) : (
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Today's Stats</Text>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsStat}>
                <Text style={styles.analyticsStatLabel}>Intercepted</Text>
                <Text style={styles.analyticsStatValue}>{todayStats.interceptCount}</Text>
              </View>
              <View style={styles.analyticsStat}>
                <Text style={styles.analyticsStatLabel}>Allowed</Text>
                <Text style={styles.analyticsStatValue}>{todayStats.allowedSessionCount}</Text>
              </View>
              <View style={styles.analyticsStat}>
                <Text style={styles.analyticsStatLabel}>Minutes Used</Text>
                <Text style={styles.analyticsStatValue}>{todayStats.totalAllowedMinutes}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
