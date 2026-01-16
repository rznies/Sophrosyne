import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../store';

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#e65100',
    lineHeight: 18,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionItemLast: {
    borderBottomWidth: 0,
  },
  statusIcon: {
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  permissionStatus: {
    fontSize: 11,
    color: '#999',
  },
  fixButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff9800',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});

export default function PermissionChecklist() {
  const { accessibilityEnabled, overlayEnabled } = useAppStore();

  const handleFixAccessibility = async () => {
    try {
      const url = 'android://accessibility';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(
          'intent://accessibility#Intent;action=com.android.settings.ACCESSIBILITY_SETTINGS;end'
        );
      }
    } catch (error) {
      console.error('[PermissionChecklist] Failed to open accessibility settings:', error);
      Alert.alert(
        'Error',
        'Could not open accessibility settings. Please go to Settings > Accessibility manually.'
      );
    }
  };

  const handleFixOverlay = async () => {
    try {
      const url = 'android://display_overlay';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL('android.settings.action.MANAGE_APP_DRAW_OVERLAY');
      }
    } catch (error) {
      console.error('[PermissionChecklist] Failed to open overlay settings:', error);
      Alert.alert(
        'Error',
        'Could not open settings. Please go to Settings > Apps > Intent Gate > Advanced and enable "Display over other apps".'
      );
    }
  };

  const allPermissionsEnabled = accessibilityEnabled && overlayEnabled;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>

      {!allPermissionsEnabled && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Both permissions are required for Intent Gate to work properly.
          </Text>
        </View>
      )}

      {/* Accessibility */}
      <View style={styles.permissionItem}>
        <View style={styles.statusIcon}>
          <MaterialIcons
            name={accessibilityEnabled ? 'check-circle' : 'error-outline'}
            size={20}
            color={accessibilityEnabled ? '#4caf50' : '#ff9800'}
          />
        </View>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionLabel}>Accessibility Service</Text>
          <Text style={styles.permissionStatus}>
            {accessibilityEnabled ? 'Enabled' : 'Not enabled'}
          </Text>
        </View>
        {!accessibilityEnabled && (
          <TouchableOpacity style={styles.fixButton} onPress={handleFixAccessibility}>
            <Text style={styles.fixButtonText}>Fix</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Overlay */}
      <View style={[styles.permissionItem, styles.permissionItemLast]}>
        <View style={styles.statusIcon}>
          <MaterialIcons
            name={overlayEnabled ? 'check-circle' : 'error-outline'}
            size={20}
            color={overlayEnabled ? '#4caf50' : '#ff9800'}
          />
        </View>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionLabel}>Display Overlay</Text>
          <Text style={styles.permissionStatus}>
            {overlayEnabled ? 'Enabled' : 'Not enabled'}
          </Text>
        </View>
        {!overlayEnabled && (
          <TouchableOpacity style={styles.fixButton} onPress={handleFixOverlay}>
            <Text style={styles.fixButtonText}>Fix</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
