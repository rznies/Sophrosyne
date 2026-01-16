import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { getScheduleRules, addScheduleRule, removeScheduleRule } from '../db/repository';
import { minutesToHHMM } from '../utils/time';
import type { ScheduleRule } from '../db/schema';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  daySection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  windowContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  windowTime: {
    fontSize: 14,
    color: '#666',
  },
  removeWindowButton: {
    padding: 8,
  },
  addWindowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginTop: 8,
  },
  addWindowButtonText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
    marginLeft: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 70,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface TimeWindow {
  id: string;
  startMin: number;
  endMin: number;
}

export default function ScheduleScreen() {
  const { scheduleRules, setScheduleRules } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [allRules, setAllRules] = useState<ScheduleRule[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const rules = await getScheduleRules();
      setAllRules(rules);
    } catch (error) {
      console.error('[ScheduleScreen] Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRulesForDay = (dayOfWeek: number): ScheduleRule[] => {
    return allRules.filter((r) => r.dayOfWeek === dayOfWeek);
  };

  const handleAddWindow = async (dayOfWeek: number) => {
    // Parse time inputs (expecting HH:MM format)
    const startParts = editStartTime.split(':');
    const endParts = editEndTime.split(':');

    if (startParts.length !== 2 || endParts.length !== 2) {
      console.error('[ScheduleScreen] Invalid time format, expected HH:MM');
      return;
    }

    const startMin = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    const endMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

    if (isNaN(startMin) || isNaN(endMin) || startMin < 0 || endMin > 1440) {
      console.error('[ScheduleScreen] Invalid time values');
      return;
    }

    try {
      const ruleId = `${dayOfWeek}-${Date.now()}`;
      await addScheduleRule(ruleId, dayOfWeek, startMin, endMin);
      await loadRules();
      setEditingDay(null);
      setEditStartTime('');
      setEditEndTime('');
    } catch (error) {
      console.error('[ScheduleScreen] Failed to add rule:', error);
    }
  };

  const handleRemoveWindow = async (ruleId: string) => {
    try {
      await removeScheduleRule(ruleId);
      await loadRules();
    } catch (error) {
      console.error('[ScheduleScreen] Failed to remove rule:', error);
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
        <Text style={styles.headerTitle}>Work Schedule</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        {DAYS.map((dayName, dayOfWeek) => {
          const dayRules = getRulesForDay(dayOfWeek);
          return (
            <View key={dayOfWeek} style={styles.daySection}>
              <Text style={styles.dayLabel}>{dayName}</Text>

              {dayRules.map((rule) => (
                <View key={rule.id} style={styles.windowContainer}>
                  <Text style={styles.windowTime}>
                    {minutesToHHMM(rule.startTimeMinutes)} - {minutesToHHMM(rule.endTimeMinutes)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeWindowButton}
                    onPress={() => handleRemoveWindow(rule.id)}
                  >
                    <MaterialIcons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}

              {editingDay === dayOfWeek ? (
                <View>
                  <View style={styles.timeInputContainer}>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH:MM"
                      value={editStartTime}
                      onChangeText={setEditStartTime}
                      placeholderTextColor="#999"
                    />
                    <Text style={{ color: '#666' }}>to</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH:MM"
                      value={editEndTime}
                      onChangeText={setEditEndTime}
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.addWindowButton, { flex: 1 }]}
                      onPress={() => handleAddWindow(dayOfWeek)}
                    >
                      <MaterialIcons name="check" size={18} color="#2196f3" />
                      <Text style={styles.addWindowButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addWindowButton, { flex: 1, backgroundColor: '#ffebee' }]}
                      onPress={() => {
                        setEditingDay(null);
                        setEditStartTime('');
                        setEditEndTime('');
                      }}
                    >
                      <MaterialIcons name="close" size={18} color="#c62828" />
                      <Text style={[styles.addWindowButtonText, { color: '#c62828' }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addWindowButton}
                  onPress={() => setEditingDay(dayOfWeek)}
                >
                  <MaterialIcons name="add" size={18} color="#2196f3" />
                  <Text style={styles.addWindowButtonText}>Add Time Window</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
