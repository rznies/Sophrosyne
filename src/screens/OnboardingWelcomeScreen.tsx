import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
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
    color: '#2196f3',
  },
});

export default function OnboardingWelcomeScreen({ navigation }: Props) {
  const handleNext = () => {
    navigation.navigate('Accessibility');
  };

  const handleSkip = () => {
    navigation.navigate('Accessibility');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <MaterialIcons name="shield" size={40} color="#2196f3" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to Intent Gate</Text>

        {/* Description */}
        <Text style={styles.description}>
          Intent Gate helps you maintain focus and protect your screen time by intercepting
          distracting apps with a mindfulness prompt.
        </Text>

        {/* Features */}
        <View style={styles.featureList}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="check" size={18} color="#4caf50" />
            </View>
            <Text style={styles.featureText}>Block apps and ask "Why do you want to open this?"</Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="schedule" size={18} color="#ff9800" />
            </View>
            <Text style={styles.featureText}>Set custom time schedules and default durations</Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <MaterialIcons name="analytics" size={18} color="#9c27b0" />
            </View>
            <Text style={styles.featureText}>Track your activity and identify patterns</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
