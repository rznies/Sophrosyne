import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useAppStore } from '../store';
import StatusCard from '../components/StatusCard';
import AnalyticsCard from '../components/AnalyticsCard';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';

type RootTabParamList = {
  Dashboard: undefined;
  Triggers: undefined;
  Journal: undefined;
  Settings: undefined;
};

interface Props {
  navigation: NavigationProp<RootTabParamList>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    minHeight: 56, // Material Design minimum touch target
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  analyticsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  analyticsTitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  analyticsStat: {
    flex: 1,
  },
  analyticsStatLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  analyticsStatValue: {
    ...typography.headline,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBanner: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionBannerText: {
    ...typography.bodyMedium,
    color: colors.white,
    flex: 1,
  },
  permissionFixButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginLeft: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionFixButtonText: {
    ...typography.captionMedium,
    color: colors.error,
  },
});

export default function DashboardScreen({ navigation }: Props) {
  const { workModeOn, accessibilityEnabled, overlayEnabled } = useAppStore();
  const [permissionsLost, setPermissionsLost] = useState(false);

  useEffect(() => {
    const permsMissing = !accessibilityEnabled || !overlayEnabled;
    setPermissionsLost(permsMissing);
  }, [accessibilityEnabled, overlayEnabled]);

  const handleQuickAction = (screen: keyof RootTabParamList) => {
    navigation.navigate(screen);
  };

  const handleFixPermissions = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
         {/* Permission Recovery Banner */}
         {permissionsLost && (
           <View style={styles.permissionBanner}>
             <Text style={styles.permissionBannerText}>
              Protection OFF - Tap to fix
            </Text>
            <TouchableOpacity
              style={styles.permissionFixButton}
              onPress={handleFixPermissions}
            >
              <Text style={styles.permissionFixButtonText}>Fix</Text>
            </TouchableOpacity>
          </View>
        )}

         {/* Status Card */}
         <StatusCard />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
             style={styles.actionButton}
             onPress={() => handleQuickAction('Triggers')}
            >
             <MaterialIcons name="apps" size={28} color={colors.primary} />
             <Text style={styles.actionButtonText}>Trigger Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity
             style={styles.actionButton}
             onPress={() => handleQuickAction('Journal')}
            >
             <MaterialIcons name="schedule" size={28} color={colors.success} />
             <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.quickActionsGrid, { marginTop: 12 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Journal')}
            >
              <MaterialIcons name="book" size={28} color={colors.warning} />
              <Text style={styles.actionButtonText}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Settings')}
            >
              <MaterialIcons name="settings" size={28} color={colors.secondary} />
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Card */}
        {workModeOn ? (
          <AnalyticsCard />
        ) : (
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Enable Work Mode</Text>
            <Text style={styles.analyticsStatLabel}>
              Turn on Work Mode to see analytics and activity stats.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
