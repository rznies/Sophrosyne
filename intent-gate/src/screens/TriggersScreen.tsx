import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store';
import { reconcileTriggerApps } from '../db/repository';
import TriggerAppsList from '../components/TriggerAppsList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function TriggersScreen() {
  const { selectedTriggerApps } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reconcileOnMount();
  }, []);

  const reconcileOnMount = async () => {
    try {
      setLoading(true);
      await reconcileTriggerApps();
    } catch (error) {
      console.error('[TriggersScreen] Reconciliation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Triggers</Text>
        <Text style={styles.headerSubtitle}>
          {selectedTriggerApps.length} app{selectedTriggerApps.length !== 1 ? 's' : ''} gated
        </Text>
      </View>
      <TriggerAppsList />
    </View>
  );
}
