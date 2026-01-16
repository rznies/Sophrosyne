import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getInstalledAppList, removeTriggerApp, getTriggerApps } from '../db/repository';
import { useAppStore } from '../store';
import type { InstalledApp } from '../db/repository';
import type { TriggerApp } from '../db/schema';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  appPackage: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staleBadge: {
    backgroundColor: '#ffebee',
  },
  staleBadgeText: {
    fontSize: 11,
    color: '#c62828',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
    color: '#999',
  },
});

export default function TriggerAppsList() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [triggerApps, setTriggerApps] = useState<TriggerApp[]>([]);
  const { selectedTriggerApps, setSelectedTriggerApps } = useAppStore();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const [installed, triggers] = await Promise.all([
        getInstalledAppList(),
        getTriggerApps(),
      ]);
      setInstalledApps(installed);
      setTriggerApps(triggers);
    } catch (error) {
      console.error('[TriggerAppsList] Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (packageName: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      setSelectedTriggerApps(selectedTriggerApps.filter((p) => p !== packageName));
    } else {
      setSelectedTriggerApps([...selectedTriggerApps, packageName]);
    }
  };

  const handleRemoveStale = async (packageName: string) => {
    try {
      await removeTriggerApp(packageName);
      setTriggerApps(triggerApps.filter((a) => a.packageName !== packageName));
    } catch (error) {
      console.error('[TriggerAppsList] Failed to remove app:', error);
    }
  };

  const filteredApps = installedApps.filter((app) =>
    app.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
    app.packageName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderAppItem = ({ item }: { item: InstalledApp }) => {
    const triggerApp = triggerApps.find((a) => a.packageName === item.packageName);
    const isSelected = selectedTriggerApps.includes(item.packageName);
    const isStale = triggerApp && !installedApps.some((a) => a.packageName === triggerApp.packageName);

    return (
      <View style={styles.appItem}>
        <View style={styles.appIcon}>
          <MaterialIcons name="apps" size={24} color="#666" />
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.displayName}</Text>
          <Text style={styles.appPackage}>{item.packageName}</Text>
        </View>
        <View style={styles.badgeContainer}>
          {isStale && (
            <View style={[styles.badge, styles.staleBadge]}>
              <Text style={styles.staleBadgeText}>Not installed</Text>
            </View>
          )}
          {!isStale && (
            <Switch
              value={isSelected}
              onValueChange={() => handleToggle(item.packageName, isSelected)}
              trackColor={{ false: '#767577', true: '#81c784' }}
              thumbColor={isSelected ? '#4caf50' : '#f4f3f4'}
            />
          )}
          {isStale && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveStale(item.packageName)}
            >
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {filteredApps.length === 0 ? (
        <Text style={styles.emptyText}>No apps found</Text>
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filteredApps}
          keyExtractor={(item) => item.packageName}
          renderItem={renderAppItem}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}
