import {
  ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins";

export const withIntentGateConfig: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add AccessibilityService to manifest
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      application.service = [
        {
          $: {
            "android:name": "com.intentgate.IntentGateAccessibilityService",
            "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
            "android:exported": "false",
          },
          "intent-filter": [
            {
              action: [
                {
                  $: {
                    "android:name": "android.accessibilityservice.AccessibilityService",
                  },
                },
              ],
            },
          ],
          "meta-data": [
            {
              $: {
                "android:name": "android.accessibilityservice",
                "android:resource": "@xml/accessibility_service_config",
              },
            },
          ],
        } as any,
      ];
    }

    // Add permissions
    if (!androidManifest.manifest["uses-permission"]) {
      androidManifest.manifest["uses-permission"] = [];
    }
    androidManifest.manifest["uses-permission"].push(
      { $: { "android:name": "android.permission.SYSTEM_ALERT_WINDOW" } },
      { $: { "android:name": "android.permission.QUERY_ALL_PACKAGES" } },
      { $: { "android:name": "android.permission.BIND_ACCESSIBILITY_SERVICE" } }
    );

    return config;
  });
};
