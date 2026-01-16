import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useAppStore } from '../store';
import { getTriggerApps } from '../db/repository';
import type { TriggerApp } from '../db/schema';

type OnboardingNavigatorParamList = {
  Welcome: undefined;
  Accessibility: undefined;
  Overlay: undefined;
  TestNow: undefined;
};

interface Props {
  navigation: NavigationProp<OnboardingNavigatorParamList>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  appsList: {
    gap: 8,
    marginBottom: 24,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  appItemSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  appPackage: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default function OnboardingTestNowScreen({ navigation }: Props) {
  const { addTriggerApp } = useAppStore();
  const [triggerApps, setTriggerApps] = useState<TriggerApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const apps = await getTriggerApps();
      setTriggerApps(apps);
    } catch (error) {
      console.error('[OnboardingTestNowScreen] Failed to load trigger apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = (packageName: string) => {
    setSelectedApp(selectedApp === packageName ? null : packageName);
  };

  const handleTestNow = () => {
    if (!selectedApp) {
      Alert.alert('Select an App', 'Please select an app to test');
      return;
    }

    // Mark app as selected in store
    addTriggerApp(selectedApp);

    // Show success message
    Alert.alert('Ready!', 'Selected app will now be gated. Try opening it!', [
      {
        text: 'Done',
        onPress: () => {
          // Navigation to main app happens in parent based on onboarding status
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#2196f3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Intent Gate</Text>
        <Text style={styles.headerSubtitle}>Step 3 of 3</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <MaterialIcons name="launch" size={32} color="#4caf50" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Select an App to Test</Text>

        {/* Description */}
        <Text style={styles.description}>
          Choose an app and try opening it. You'll see the Intent Gate prompt (optional).
        </Text>

        {/* Apps List */}
        <Text style={styles.sectionTitle}>Your Trigger Apps</Text>
        {loading ? (
          <Text style={styles.emptyText}>Loading apps...</Text>
        ) : triggerApps.length === 0 ? (
          <Text style={styles.emptyText}>
            No trigger apps added yet. Go to Triggers to add apps.
          </Text>
        ) : (
          <View style={styles.appsList}>
            {triggerApps.map((app) => (
              <TouchableOpacity
                key={app.packageName}
                style={[
                  styles.appItem,
                  selectedApp === app.packageName && styles.appItemSelected,
                ]}
                onPress={() => handleSelectApp(app.packageName)}
              >
                <View style={styles.appIcon}>
                  <MaterialIcons name="apps" size={20} color="#2196f3" />
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.displayName}</Text>
                  <Text style={styles.appPackage}>{app.packageName}</Text>
                </View>
                {selectedApp === app.packageName && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check-circle" size={24} color="#4caf50" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Buttons */}
        {triggerApps.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, !selectedApp && styles.primaryButtonDisabled]}
              onPress={handleTestNow}
              disabled={!selectedApp}
            >
              <Text style={styles.primaryButtonText}>Test Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
              <Text style={styles.secondaryButtonText}>Skip Test</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
