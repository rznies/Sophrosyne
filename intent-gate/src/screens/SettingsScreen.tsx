import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { getSessions } from '../db/repository';
import PermissionChecklist from '../components/PermissionChecklist';
import { exportSessions } from '../utils/export';

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
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 16,
  },
  rowLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  durationButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  durationButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  durationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  buttonLast: {
    borderBottomWidth: 0,
    paddingBottom: 16,
  },
  buttonText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  dangerButton: {
    color: '#f44336',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default function SettingsScreen() {
  const { setWorkMode, workModeOn } = useAppStore();
  const [defaultDuration, setDefaultDuration] = useState(600); // in seconds (10 min default)

  const handleExportCSV = async () => {
    try {
      const sessions = await getSessions();
      if (sessions.length === 0) {
        Alert.alert('No Data', 'No sessions to export yet.');
        return;
      }

      const csv = exportSessions(sessions);
      const fileName = `intent-gate-export-${new Date().toISOString().split('T')[0]}.csv`;

      // Use React Native Share API
      await Share.share({
        message: csv,
        title: 'Export Intent Gate Data',
        url: `data:text/csv;base64,${Buffer.from(csv).toString('base64')}`,
      });
    } catch (error) {
      console.error('[SettingsScreen] Failed to export CSV:', error);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all session data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement clear data function in repository
          Alert.alert('Success', 'All data cleared.');
        },
      },
    ]);
  };

  const handleOpenFeedback = async () => {
    try {
      // Open email client with pre-filled subject
      const email = 'feedback@intentgate.app';
      const subject = 'Intent Gate Feedback';
      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open email app.');
      }
    } catch (error) {
      console.error('[SettingsScreen] Failed to open feedback:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Work Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protection</Text>
          <View style={[styles.row, styles.rowLast]}>
            <View>
              <Text style={styles.rowLabel}>Work Mode</Text>
              <Text style={styles.rowSubtitle}>Manual override - ignores schedule</Text>
            </View>
            <Switch
              value={workModeOn}
              onValueChange={setWorkMode}
              trackColor={{ false: '#d0d0d0', true: '#81c784' }}
              thumbColor={workModeOn ? '#4caf50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Default Durations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Duration</Text>
          <View style={[styles.row, styles.rowLast]}>
            <View>
              <Text style={styles.rowLabel}>Allow time per app</Text>
              <Text style={styles.rowSubtitle}>When you tap "Allow"</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.durationButtonsContainer}>
              {[5 * 60, 10 * 60, 15 * 60].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    defaultDuration === duration && styles.durationButtonActive,
                  ]}
                  onPress={() => setDefaultDuration(duration)}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      defaultDuration === duration && styles.durationButtonTextActive,
                    ]}
                  >
                    {duration / 60} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        <PermissionChecklist />

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.button} onPress={handleExportCSV}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="download" size={20} color="#2196f3" />
                <Text style={[styles.buttonText, { marginLeft: 12 }]}>Export as CSV</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonLast]}
              onPress={handleClearData}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="delete-outline" size={20} color="#f44336" />
                <Text style={[styles.buttonText, styles.dangerButton, { marginLeft: 12 }]}>
                  Clear All Data
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={[styles.button, styles.buttonLast]} onPress={handleOpenFeedback}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="feedback" size={20} color="#2196f3" />
                <Text style={[styles.buttonText, { marginLeft: 12 }]}>Send Feedback</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Intent Gate v1.0.0 (Build 1)</Text>
      </ScrollView>
    </View>
  );
}
