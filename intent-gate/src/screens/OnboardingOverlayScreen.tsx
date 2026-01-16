import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';

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
    backgroundColor: '#f3e5f5',
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
  disclosureBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  disclosureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disclosureText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#9c27b0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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

export default function OnboardingOverlayScreen({ navigation }: Props) {
  const [checked, setChecked] = useState(false);

  const handleEnableOverlay = async () => {
    if (!checked) {
      Alert.alert('Confirmation', 'Please check the box to continue.');
      return;
    }

    // Open overlay settings in system settings
    // Android: Draw over other apps permission
    try {
      // Deep link to display overlay permission
      const url = 'android://display_overlay';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: Open app info page
        const pkgName = 'com.intentgate'; // Will be replaced with actual package name
        await Linking.openURL(`android.settings.action.MANAGE_APP_DRAW_OVERLAY;package=${pkgName}`);
      }
    } catch (error) {
      console.error('[OnboardingOverlayScreen] Failed to open overlay settings:', error);
      Alert.alert('Error', 'Could not open settings. Please go to Settings > Apps > Intent Gate > Advanced and enable "Display over other apps".');
    }

    // In production, the app would check permissions on return and auto-navigate
  };

  const handleSkip = () => {
    navigation.navigate('TestNow');
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
        <Text style={styles.headerTitle}>Enable Display Overlay</Text>
        <Text style={styles.headerSubtitle}>Step 2 of 3</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <MaterialIcons name="layers" size={32} color="#9c27b0" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Enable Display Overlay</Text>

        {/* Description */}
        <Text style={styles.description}>
          Intent Gate needs permission to display the mindfulness prompt overlay when you open
          a trigger app.
        </Text>

        {/* Disclosure */}
        <View style={styles.disclosureBox}>
          <Text style={styles.disclosureTitle}>What this allows:</Text>
          <Text style={styles.disclosureText}>
            • Display a popup window over apps
            • Show only when you open a trigger app{'\n'}
            • No ads or tracking data
          </Text>
        </View>

        {/* Checkbox */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkbox, checked && styles.checkboxChecked]}
            onPress={() => setChecked(!checked)}
          >
            {checked && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I understand and consent to enable the display overlay permission
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, !checked && { opacity: 0.5 }]}
            onPress={handleEnableOverlay}
            disabled={!checked}
          >
            <Text style={styles.primaryButtonText}>Enable in Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
