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
    backgroundColor: '#fff3e0',
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
    borderLeftColor: '#ff9800',
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
    backgroundColor: '#ff9800',
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
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 12,
    color: '#2196f3',
  },
});

export default function OnboardingAccessibilityScreen({ navigation }: Props) {
  const [checked, setChecked] = useState(false);

  const handleEnableAccessibility = async () => {
    if (!checked) {
      Alert.alert('Confirmation', 'Please check the box to continue.');
      return;
    }

    // Open accessibility settings
    // Android deep link to accessibility settings
    const url = 'android://accessibility';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: Open settings app
        await Linking.openURL('intent://accessibility#Intent;action=com.android.settings.ACCESSIBILITY_SETTINGS;end');
      }
    } catch (error) {
      console.error('[OnboardingAccessibilityScreen] Failed to open accessibility settings:', error);
      Alert.alert('Error', 'Could not open accessibility settings. Please go to Settings > Accessibility manually.');
    }

    // In production, the app would check permissions on return and auto-navigate
  };

  const handleSkip = () => {
    navigation.navigate('Overlay');
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
        <Text style={styles.headerTitle}>Enable Accessibility</Text>
        <Text style={styles.headerSubtitle}>Step 1 of 3</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <MaterialIcons name="accessibility" size={32} color="#ff9800" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Enable Accessibility Service</Text>

        {/* Description */}
        <Text style={styles.description}>
          Intent Gate uses accessibility service to detect when you open apps and show the
          mindfulness prompt.
        </Text>

        {/* Disclosure */}
        <View style={styles.disclosureBox}>
          <Text style={styles.disclosureTitle}>What we access:</Text>
          <Text style={styles.disclosureText}>
            • Package name of open apps (not content)
            • Window title changes{'\n'}
            • No personal data is collected or stored
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
            I understand and consent to enable the accessibility service
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, !checked && { opacity: 0.5 }]}
            onPress={handleEnableAccessibility}
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
