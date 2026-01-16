import { ExpoConfig, ConfigContext } from "expo/config";
import { withAndroidManifest } from "@expo/config-plugins";

const withIntentGateConfig = (config: ExpoConfig): ExpoConfig => {
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

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "intent-gate",
  slug: "intent-gate",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "intentgate",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "com.intentgate",
    supportsTablet: true,
  },
  android: {
    package: "com.intentgate",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.BIND_ACCESSIBILITY_SERVICE",
      "android.permission.READ_LOGS",
    ] as any,
  } as any,
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    withIntentGateConfig as any,
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
