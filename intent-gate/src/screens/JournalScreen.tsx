import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { getTriggerApps } from '../db/repository';
import type { Session, TriggerApp } from '../db/schema';
import JournalEntryCard from '../components/JournalEntryCard';

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
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterOptions: {
    gap: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCheckboxChecked: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#333',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  presetButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  presetButtonText: {
    fontSize: 12,
    color: '#333',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

type DatePreset = 'all' | 'today' | 'week' | 'month';

export default function JournalScreen() {
  const { sessions } = useAppStore();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([
    'allowed',
    'not_now',
    'expired',
  ]);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [triggerApps, setTriggerApps] = useState<TriggerApp[]>([]);

  useEffect(() => {
    loadTriggerApps();
  }, []);

  const loadTriggerApps = async () => {
    try {
      const apps = await getTriggerApps();
      setTriggerApps(apps);
    } catch (error) {
      console.error('[JournalScreen] Failed to load trigger apps:', error);
    }
  };

  // Get date range based on preset
  const getDateRange = () => {
    const now = Date.now();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    switch (datePreset) {
      case 'today':
        return { start: startOfToday.getTime(), end: now };
      case 'week': {
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo.getTime(), end: now };
      }
      case 'month': {
        const monthAgo = new Date(startOfToday);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return { start: monthAgo.getTime(), end: now };
      }
      default:
        return { start: 0, end: now };
    }
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const dateRange = getDateRange();
    return sessions.filter((session) => {
      // Date filter
      if (
        session.tsStartEpochMs < dateRange.start ||
        session.tsStartEpochMs > dateRange.end
      ) {
        return false;
      }

      // App filter (if any selected)
      if (selectedApps.length > 0 && !selectedApps.includes(session.packageName)) {
        return false;
      }

      // Outcome filter
      const outcomeKey = session.outcome.toLowerCase().replace(' ', '_');
      if (!selectedOutcomes.includes(outcomeKey)) {
        return false;
      }

      return true;
    });
  }, [sessions, selectedApps, selectedOutcomes, datePreset]);

  // Get unique app packages from sessions
  const uniqueApps = useMemo(() => {
    const packages = new Set(sessions.map((s) => s.packageName));
    return Array.from(packages).sort();
  }, [sessions]);

  const toggleApp = (packageName: string) => {
    setSelectedApps((prev) =>
      prev.includes(packageName) ? prev.filter((p) => p !== packageName) : [...prev, packageName]
    );
  };

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const getAppDisplayName = (packageName: string) => {
    const app = triggerApps.find((a) => a.packageName === packageName);
    return app?.displayName || packageName;
  };

  const renderFilterContent = () => (
    <View style={styles.filterContent}>
      {/* Date Preset Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Date Range</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetsRow}
        >
          {(['all', 'today', 'week', 'month'] as DatePreset[]).map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                datePreset === preset && styles.presetButtonActive,
              ]}
              onPress={() => setDatePreset(preset)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  datePreset === preset && styles.presetButtonTextActive,
                ]}
              >
                {preset === 'all'
                  ? 'All Time'
                  : preset === 'today'
                    ? 'Today'
                    : preset === 'week'
                      ? 'Last 7 Days'
                      : 'Last 30 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* App Filter */}
      {uniqueApps.length > 0 && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>App</Text>
          <View style={styles.filterOptions}>
            {uniqueApps.map((packageName) => (
              <TouchableOpacity
                key={packageName}
                style={styles.filterOption}
                onPress={() => toggleApp(packageName)}
              >
                <View
                  style={[
                    styles.filterCheckbox,
                    selectedApps.includes(packageName) && styles.filterCheckboxChecked,
                  ]}
                >
                  {selectedApps.includes(packageName) && (
                    <MaterialIcons name="check" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.filterOptionText}>{getAppDisplayName(packageName)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Outcome Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Outcome</Text>
        <View style={styles.filterOptions}>
          {['allowed', 'not_now', 'expired'].map((outcome) => (
            <TouchableOpacity
              key={outcome}
              style={styles.filterOption}
              onPress={() => toggleOutcome(outcome)}
            >
              <View
                style={[
                  styles.filterCheckbox,
                  selectedOutcomes.includes(outcome) && styles.filterCheckboxChecked,
                ]}
              >
                {selectedOutcomes.includes(outcome) && (
                  <MaterialIcons name="check" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.filterOptionText}>
                {outcome === 'allowed'
                  ? 'Allowed'
                  : outcome === 'not_now'
                    ? 'Not Now'
                    : 'Expired'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFiltersExpanded(!filtersExpanded)}
        >
          <Text style={styles.filterToggleText}>
            Filters {filteredSessions.length !== sessions.length && `(${filteredSessions.length})`}
          </Text>
          <MaterialIcons
            name={filtersExpanded ? 'expand-less' : 'expand-more'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
        {filtersExpanded && renderFilterContent()}
      </View>

      {/* Sessions List */}
      <View style={styles.listContainer}>
        {filteredSessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="book" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No sessions found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JournalEntryCard
                session={item}
                appDisplayName={getAppDisplayName(item.packageName)}
              />
            )}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}
