# Intent Gate (Android) — Expo (React Native) v1.0 — Complete Specification

**Status**: MVP Specification (Ready for Development)  
**Last Updated**: January 16, 2025  
**Target Delivery**: 7 days (solo development with Expo dev build)

---

## 0) Product Overview

**Intent Gate** is an Android app that reduces doomscrolling by showing an **intent prompt** whenever the user opens selected "Trigger Apps" (YouTube, Instagram, X, etc.), then allowing a **time-boxed session** (5/10/15 minutes) before re-blocking. This is enforced by detecting the foreground app via AccessibilityService and displaying a full-screen overlay on top of the trigger app.

### Core Loop
1. User opens a Trigger App during Work Mode.
2. AccessibilityService detects it as foreground.
3. Full-screen gate overlay appears: "Pause. What are you here to do?"
4. User types intent + selects duration (5/10/15 min).
5. Gate hides until timer expires.
6. When timer expires (or session is already expired), gate reappears if the app is still foreground.

---

## 1) Expo Constraints & Technology Stack

### 1.1 Why Not Expo Go
This app **cannot run in Expo Go** because it requires:
- Custom Android native code (AccessibilityService, overlay window management).
- AndroidManifest modifications (service declarations, permissions).
- Dynamic native module loading.

### 1.2 Required Tools
- **Development Build**: Use `npx expo prebuild` or **EAS Build** to include native modules + manifest changes.
- **Expo Modules API**: Implement native functionality in **Kotlin** via Expo's native module system.
- **Config Plugin**: Apply AndroidManifest + Gradle changes without forking Expo SDK.

### 1.3 Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| JS/TS Runtime | Expo + React Native | Fast iteration, hot reload for UI |
| State Management | Local stores (minimal) | MVP: no Redux; Zustand optional if needed |
| Local Database | expo-sqlite (JS) + Room (Kotlin) | Single-writer pattern: native writes sessions, JS reads |
| Native Module | Kotlin via Expo Modules API | Type-safe, modern Android |
| Overlay Window | TYPE_ACCESSIBILITY_OVERLAY | More reliable across OEMs, fewer permissions |
| Foreground Detection | AccessibilityService | Best practice for detecting app changes |
| Timer Management | Kotlin Coroutines | Native timers avoid JS suspension issues |

---

## 2) Goals (MVP)

### Must Have
- [ ] Let user select trigger apps (YouTube, Instagram, X, etc.) with on/off toggles.
- [ ] Work Mode scheduling (days + start/end times, multiple windows per day).
- [ ] When trigger app comes to foreground during Work Mode, show gate overlay.
- [ ] Require intent text (3–200 chars) + allow-duration selection to unlock temporarily.
- [ ] Gate re-appears when timer expires (if app still foreground).
- [ ] Log intents locally (SQLite) with outcome (ALLOW / NOT_NOW / EXPIRED / BYPASS).
- [ ] Show simple daily/weekly analytics dashboard + journal view.
- [ ] Disclosure + explicit consent for Accessibility/Overlay in onboarding.

### Non-Goals (MVP)
- No AI sentiment analysis or NLP.
- No server, cloud sync, or auth.
- No payments or account management.
- No multi-user account support (per-user device data is acceptable).
- No app rating/review interception.

---

## 3) User Flows

### 3.1 Onboarding (First Launch)
1. **Welcome Screen**: Explain "What is Intent Gate?" + why permissions matter.
2. **Permission Checklist**:
   - "Enable Accessibility" button → deep link to Settings (user manually enables your service).
   - "Enable Overlay Permission" button → deep link to Settings (user manually allows "Draw over other apps").
   - App auto-checks on resume if permissions are enabled (via AccessibilityManager + Settings.canDrawOverlays()).
3. **Select First Trigger App** (optional for MVP, but recommended):
   - Show installed apps list.
   - User picks one (e.g., YouTube).
4. **"Test Now" Flow**:
   - App launches the real trigger app (YouTube).
   - Gate appears with a 30–60 second unlock (skips intent entry to reduce friction).
   - User sees the real gate in context, confirming permissions work.
5. **Done**:
   - User returns to app; dashboard shows "Protection: ON, Accessibility: ✓, Overlay: ✓".

### 3.2 Daily Usage (Steady State)
1. **User opens Trigger App** (e.g., Instagram) during Work Mode.
2. **Gate Overlay Appears** (within 1–2 seconds):
   - Dark scrim (dimmed background).
   - Text field: "What are you here to do?" (placeholder).
   - 8 preset chips in 2-column grid: "Search something", "Reply to messages", "Post / upload", "Watch tutorial", "Check updates (quick)", "Work task", "Take a break", "Other".
   - Text input field below chips.
   - Buttons: "Allow 5 min" / "Allow 10 min" / "Allow 15 min" / "Not now".
3. **User enters intent**:
   - Taps a chip (auto-fills field) or types custom text.
   - Taps duration button (e.g., "Allow 10 min").
4. **Gate hides** (overlay removed from screen).
5. **Session Active** (10 minutes):
   - User can use Instagram freely.
   - No countdown timer UI shown (already off-screen).
6. **Timer Expires**:
   - If Instagram is still foreground: gate re-appears immediately.
   - User must enter new intent + duration, or tap "Not now".
7. **"Not now" Snooze Behavior**:
   - First "Not now" tap: snooze for 30 seconds, re-gate after.
   - Track notNowCount per session; after 3 snoozes, escalate: require longer snooze (60s) or force intent entry to continue.
   - This prevents infinite "Not now" spam while respecting autonomy.

### 3.3 Work Mode Override
- User toggles Work Mode ON/OFF manually in Settings (overrides schedule).
- Dashboard shows current state: "Work Mode: ON" or "Work Mode: OFF".

### 3.4 Manual Trigger App Management
1. User opens "Trigger Apps" tab.
2. Shows list of installed apps with toggles (on/off for gating).
3. User can search by name.
4. Stale apps (uninstalled): show "Not installed" badge; user taps "Remove" to delete.

---

## 4) Features & Technical Requirements

### 4.1 Trigger Apps Management

**Data Model** (SQLite):
```sql
CREATE TABLE trigger_apps (
  packageName TEXT PRIMARY KEY,
  displayName TEXT,
  enabled INTEGER (0/1),
  defaultDurationSec INTEGER,
  appIcon BLOB (optional, cache locally)
);
```

**Behavior**:
- On app resume: reconcile against installed packages (PackageManager.getInstalledApplications()).
- Stale entries: mark `isInstalled=false` (or denormalize into a separate field); show "Not installed" badge.
- Auto-clean: optionally delete stale entries after 7 days (or on user tap of "Remove").
- Search: filter by displayName substring, case-insensitive.

### 4.2 Work Mode & Schedule Engine

**Data Model**:
```sql
CREATE TABLE schedule_rules (
  id TEXT PRIMARY KEY,
  dayOfWeek INTEGER (0=Sunday...6=Saturday),
  startTimeMinutes INTEGER (0–1440, e.g., 600 = 10:00 AM),
  endTimeMinutes INTEGER,
  isActive INTEGER (0/1)
);
```

**Behavior**:
- Multiple time windows per day supported (e.g., 9–11 AM and 2–4 PM).
- Schedule is checked every time AccessibilityService detects a foreground app change.
- Decision logic:
  ```
  shouldGateNow = (workModeManuallyON || withinSchedule(now)) 
                  && foregroundAppInTriggerList
                  && !within_active_allow_session(foregroundApp, now)
  ```
- Manual Work Mode toggle overrides schedule:
  - If user explicitly toggles Work Mode OFF, gating stops immediately (ignores schedule).
  - If user toggles ON, gating applies even outside scheduled hours.

### 4.3 Gate Overlay UI

**Display Properties**:
- Full-screen blocking overlay (TYPE_ACCESSIBILITY_OVERLAY).
- Dark scrim (semi-transparent dark background, e.g., #000000 + 60% opacity).
- Not dismissible by back button or tapping outside (only explicit actions).

**Layout & Components**:
```
┌─────────────────────────────────────┐
│         [Dark Scrim / Dimmed]        │
│                                      │
│        "Pause. What are you          │
│         here to do?"                 │
│                                      │
│  [Text Input Field - 200 char max]   │
│                                      │
│  [Preset Chips - 2-column grid]      │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ Search       │ │ Reply msgs   │  │
│  └──────────────┘ └──────────────┘  │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ Post/Upload  │ │ Watch tut.   │  │
│  └──────────────┘ └──────────────┘  │
│  ... (more chips) ...                │
│                                      │
│  [Allow 5]  [Allow 10]  [Allow 15]   │
│         [Not now]                    │
│                                      │
│         (Duration timer,             │
│          top-right: "4:30 left")     │
└─────────────────────────────────────┘
```

**Intent Text Input**:
- Placeholder: "What are you here to do?"
- Min length: 3 characters (trimmed).
- Max length: 200 characters.
- No keyword blocking (MVP).
- Required (empty entry shows error toast: "Please describe your intent.").

**Preset Chips**:
1. "Search something specific"
2. "Reply to messages"
3. "Post / upload"
4. "Watch a tutorial"
5. "Check updates (quick)"
6. "Work task"
7. "Take a break"
8. "Other"

Tapping a chip auto-fills the text field; tapping "Other" focuses the text input (no extra modal).

**Duration Buttons**:
- Three buttons: "Allow 5 min" / "Allow 10 min" / "Allow 15 min".
- No custom duration in MVP (add only after user feedback).

**Countdown Timer Display**:
- Small label inside overlay (top-right, e.g., "4:30 remaining").
- Compute remaining time on-demand when overlay is visible (no background timekeeping).
- Update every ~5 seconds (tickless for power efficiency).
- Hide timer when overlay is off-screen.

**Button Actions**:
- **"Allow X min"**: emit event to native, which persists allowUntilEpochMs and hides overlay. Instant local response (no network).
- **"Not now"**: snooze gate for 30s (or escalated time), re-gate after. Increment notNowCount.

### 4.4 Timed Allow Sessions

**Data Model**:
```sql
CREATE TABLE allow_sessions (
  packageName TEXT PRIMARY KEY,
  allowUntilEpochMs INTEGER,
  intentText TEXT,
  reasonSource TEXT ('chip' | 'typed'),
  durationSelectedSec INTEGER,
  notNowCountThisSession INTEGER
);
```

**Behavior**:
- On "Allow X min": native writes `allowUntilEpochMs = now + (X * 60 * 1000)`.
- Gate is hidden; user can use the app.
- Session spans foreground/background cycles (wall-clock time, not "one visit").
- If user minimizes app → returns within window: no gate (still within allowUntil).
- If user closes app → reopens within window: no gate (same contract: "Allow 10 min").
- When allowUntilEpochMs is reached: next TYPE_WINDOW_STATE_CHANGED event for that app triggers gate re-show.
- If user explicitly disabled Work Mode while session is active: immediately stop gating (ignore allowUntilEpochMs).

**Atomicity**:
- On "Allow" button tap: native must persist allowUntilEpochMs before hiding overlay.
- If persist fails (e.g., native crash), do not hide overlay.
- Implement 1-second ACK timeout: if native doesn't respond, show "Couldn't start session. Try again."

### 4.5 Session Logging & Analytics

**Session Log Table**:
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  packageName TEXT,
  tsStartEpochMs INTEGER,
  tsEndEpochMs INTEGER,
  intentText TEXT,
  reasonSource TEXT ('chip' | 'typed'),
  durationSelectedSec INTEGER,
  outcome TEXT ('ALLOW' | 'NOT_NOW' | 'EXPIRED' | 'BYPASS'),
  snoozeCountThisOpen INTEGER
);
```

**Logging Rules**:
- Log one entry per "Allow" action (outcome = ALLOW).
- Log "NOT_NOW" as outcome (not every snooze, just the action).
- Log "EXPIRED" if timer ran out and gate re-appeared.
- Do **not** log device identifiers, screen content, or high-frequency "gate shown" events.

**Analytics Views** (computed on-demand, no separate table):
```
Today's Summary:
  - Intercepts: count(sessions where outcome != 'BYPASS')
  - Allowed sessions: count(sessions where outcome = 'ALLOW')
  - Total allowed minutes: sum(durationSelectedSec) / 60
  - Top trigger app: packageName with most intercepts

Weekly Rollup:
  - Per day: intercepts, allowed minutes, work mode on/off
  - Streak: "X days with Work Mode ON"
  - Top intents: group by intentText, count (local only, no sharing)

Chip Usage Analytics (local):
  - group by reasonSource='chip', count
  - show user top 3 chips used
```

### 4.6 Journal View

**UI**:
- Chronological list of sessions (most recent first).
- Per-entry card:
  - App icon + name (e.g., "Instagram").
  - Intent text.
  - Duration: "Allowed 10 min" (show selected, not actual time spent).
  - Date/time.
  - Outcome badge (ALLOW / NOT_NOW / EXPIRED).
- Filters (tap to show/hide):
  - App (package).
  - Date range (start/end date picker or presets: "Today", "Last 7 days", etc.).
  - Outcome (ALLOW / NOT_NOW / EXPIRED / all).
- Search: no full-text search in MVP (low priority).

### 4.7 Dashboard

**Primary View When App Opens**:

**Top Status Card**:
- Work Mode: toggle switch + current state (ON/OFF).
- Protection Status: pill badge ("ON" green / "OFF" red / "LIMITED" amber).
- Next scheduled window (if applicable): e.g., "Work Mode resumes at 9:00 AM".

**Quick Stats** (if Work Mode is ON):
- Intercepts today.
- Allowed sessions today.
- Allowed minutes today.

**Call-to-Action Row**:
- "Trigger Apps" button.
- "Schedule" button.
- "Journal" button.

**Navigation Tabs** (bottom):
- **Dashboard** (current).
- **Triggers** (app selection).
- **Journal** (session history).
- **Settings**.

---

## 5) Permissions & Disclosure

### 5.1 AccessibilityService

**What it's used for**:
- Detect which app is in the foreground (TYPE_WINDOW_STATE_CHANGED events).

**User impact**:
- AccessibilityService can theoretically read content on screen, but Intent Gate **does not** (verified in code review).
- Disclosure must be crystal clear in onboarding + privacy policy.

**Google Play Policy**:
- Google Play requires **prominent in-app disclosure** + explicit user consent before sending to Accessibility settings.
- Implement a dedicated onboarding screen explaining the purpose (no technical jargon).

**Onboarding UX**:
```
Screen: "Enable Accessibility"
Text: "Intent Gate uses Android's Accessibility feature to detect when you open [YouTube, Instagram, etc.]. 
       We do NOT read your content or messages. We only detect the app name."
Checkbox: "I understand and agree"
Button: "Enable Accessibility" (deep-links to Android Settings)
```

### 5.2 Overlay Permission

**What it's used for**:
- Display the gate overlay on top of other apps.

**Permission Name**: `SYSTEM_ALERT_WINDOW` (Android).
- Requires user to manually enable "Draw over other apps" in Settings (cannot be auto-granted).

**Using TYPE_ACCESSIBILITY_OVERLAY**:
- If using TYPE_ACCESSIBILITY_OVERLAY (preferred), some OEMs allow it without explicit permission check; however, still surface the requirement in onboarding.
- Fallback: if overlay window add fails (e.g., WindowManager exception), gracefully show "Protection OFF" banner.

**Onboarding UX**:
```
Screen: "Enable Overlay Permission"
Text: "Intent Gate needs permission to show the gate overlay on top of your apps."
Button: "Enable in Settings" (deep-links to system settings)
Note: "On your device, look for 'Draw over other apps' or 'Display over other apps'"
```

### 5.3 Optional Fallback: Limited Mode (UsageStats)

**Trigger**:
- If user denies or disables AccessibilityService but wants some protection.

**UX**:
- Show prompt: "Enable Accessibility for full protection, or use Limited mode?"
- If Limited mode selected: show disclaimer warning that detection may be delayed/unreliable.
- Label protection as "Limited" in dashboard.
- Use longer snooze delay (2 minutes) in Limited mode (due to polling delay).

---

## 6) Technical Architecture

### 6.1 JavaScript/TypeScript (Expo App)

**File Structure**:
```
/expo-app
  /src
    /screens
      OnboardingWelcomeScreen.tsx
      OnboardingAccessibilityScreen.tsx
      OnboardingOverlayScreen.tsx
      OnboardingTestNowScreen.tsx
      DashboardScreen.tsx
      TriggersScreen.tsx
      JournalScreen.tsx
      ScheduleScreen.tsx
      SettingsScreen.tsx
    /components
      StatusCard.tsx
      TriggerAppsList.tsx
      GateOverlay.tsx (for demo/mocking)
      ChipRow.tsx
      DurationButtonGroup.tsx
      JournalEntryCard.tsx
      PermissionChecklist.tsx
    /store
      useAppState.ts (Zustand store: work mode, permissions status)
    /native
      IntentGateNative.ts (bridge to native module)
    /db
      schema.ts (expo-sqlite schema + helpers)
      repository.ts (read methods)
    /utils
      formatting.ts
      time.ts (duration helpers)
    app.tsx (root component + navigation)
```

**Key Screens**:
1. **OnboardingWelcomeScreen**: Explains product + why permissions.
2. **OnboardingAccessibilityScreen**: Disclosure + "Enable Accessibility" button.
3. **OnboardingOverlayScreen**: Disclosure + "Enable Overlay" button.
4. **OnboardingTestNowScreen**: "Select an app to test the gate" + real app launch.
5. **DashboardScreen**: Status + quick actions.
6. **TriggersScreen**: App list with toggles + search.
7. **JournalScreen**: Session history + filters.
8. **ScheduleScreen**: Work Mode schedule editor (add/remove time windows).
9. **SettingsScreen**: Work Mode toggle, default durations, permissions checklist, export CSV, clear data, feedback link, app version.

**State Management** (Zustand or local context):
```typescript
interface AppState {
  workModeManuallyOn: boolean;
  accessibilityEnabled: boolean;
  overlayEnabled: boolean;
  selectedTriggerApps: string[]; // packageNames
  scheduleRules: ScheduleRule[];
  sessions: Session[];
  updateWorkMode: (on: boolean) => void;
  // ... other mutations
}
```

**Native Bridge** (IntentGateNative.ts):
```typescript
export const IntentGateNative = {
  // Lifecycle
  startService: () => Promise<void>,
  stopService: () => Promise<void>,
  getCurrentStatus: () => Promise<{
    accessibilityEnabled: boolean;
    overlaySupported: boolean;
    serviceRunning: boolean;
  }>,
  
  // Permissions
  requestAccessibilityPermission: () => Promise<boolean>,
  requestOverlayPermission: () => Promise<boolean>,
  canDrawOverlays: () => Promise<boolean>,
  
  // Gate Control
  showGate: (packageName: string) => Promise<void>,
  hideGate: () => Promise<void>,
  allowSession: (packageName: string, durationMs: number, intent: string) => Promise<boolean>,
  
  // Session Query
  getTodayStats: () => Promise<{
    interceptCount: number;
    allowedSessionsCount: number;
    allowedMinutesTotal: number;
  }>,
  listSessions: (limit: number, cursor?: string) => Promise<Session[]>,
  getChipUsageStats: () => Promise<{chip: string; count: number}[]>,
  
  // Events
  onIntercept: (listener: (event: {packageName: string; displayName: string}) => void) => void,
  onSessionStart: (listener: (event: {packageName: string}) => void) => void,
  onSessionEnd: (listener: (event: {packageName: string; outcome: string}) => void) => void,
};
```

**Gate Overlay UI** (React Component, displayed via native bridge):
- Native controls the overlay window lifecycle (show/hide).
- JS sends UI data (intent, chips, selected duration) to native.
- Native renders the overlay (likely using a WebView or native UI bindings).
- On "Allow" or "Not now", native emits event back to JS.

### 6.2 Android Native (Kotlin via Expo Module)

**Core Modules**:

#### IntentGateAccessibilityService.kt
```kotlin
class IntentGateAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    // Listen for TYPE_WINDOW_STATE_CHANGED
    if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      val foregroundPackage = detectForegroundApp(event)
      val shouldGate = shouldGateNow(foregroundPackage)
      
      if (shouldGate) {
        OverlayController.showGate(foregroundPackage)
      } else {
        OverlayController.hideGate()
      }
    }
  }
  
  override fun onInterrupt() {}
  
  private fun detectForegroundApp(event: AccessibilityEvent): String? {
    // Extract package name from event source
  }
  
  private fun shouldGateNow(packageName: String?): Boolean {
    if (packageName == null) return false
    // Check: workModeEnabled && packageInTriggerList && !within_active_session(packageName, now)
    // Query Room DB, check rules engine
  }
}
```

#### OverlayController.kt
```kotlin
object OverlayController {
  private var overlayView: GateOverlayView? = null
  private var windowManager: WindowManager? = null
  
  fun showGate(packageName: String) {
    if (overlayView == null) {
      overlayView = GateOverlayView(context, packageName)
      windowManager?.addView(overlayView, layoutParams)
    }
  }
  
  fun hideGate() {
    overlayView?.let { windowManager?.removeView(it) }
    overlayView = null
  }
  
  fun updateCountdown(remainingMs: Long) {
    overlayView?.updateCountdown(remainingMs)
  }
}
```

#### SessionManager.kt
```kotlin
class SessionManager(val db: SessionDatabase) {
  fun startSession(
    packageName: String,
    durationMs: Long,
    intent: String,
    reasonSource: String
  ) {
    val allowUntil = System.currentTimeMillis() + durationMs
    db.insertSession(...)
    emitEvent("onSessionStart", packageName)
    
    // Set up timer using Coroutine
    viewModelScope.launch {
      delay(durationMs)
      emitEvent("onSessionEnd", packageName)
    }
  }
  
  fun getActiveSession(packageName: String): Session? {
    return db.getSessionByPackage(packageName)
      ?.takeIf { System.currentTimeMillis() < it.allowUntilEpochMs }
  }
}
```

#### GateOverlayView.kt
```kotlin
class GateOverlayView(context: Context, packageName: String) : FrameLayout(context) {
  // Render full-screen gate UI using Material Design / Compose
  // - Text input for intent
  // - Chips for presets
  // - Duration buttons
  // - Countdown timer label
  
  fun updateCountdown(remainingMs: Long) {
    // Update timer label every 5 seconds
  }
  
  fun onAllowClicked(durationMs: Long) {
    IntentGateModule.emitEvent("onSessionStart", packageName)
  }
  
  fun onNotNowClicked() {
    // Increment snoozeCount, re-gate after delay
  }
}
```

#### IntentGateModule.kt (Expo Module)
```kotlin
class IntentGateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IntentGateModule")
    
    Function("startService") { promise: Promise ->
      val service = Intent(context, IntentGateAccessibilityService::class.java)
      context.startService(service)
      promise.resolve(null)
    }
    
    Function("allowSession") { packageName: String, durationMs: Long, intent: String, promise: Promise ->
      sessionManager.startSession(packageName, durationMs, intent, "typed")
      promise.resolve(true)
    }
    
    Function("getTodayStats") { promise: Promise ->
      val stats = db.getTodayStats()
      promise.resolve(stats.toMap())
    }
    
    Events("onIntercept", "onSessionStart", "onSessionEnd", ...)
  }
}
```

### 6.3 Config Plugin (Expo)

**File**: `app.config.ts` or `expo-plugins/IntentGateConfigPlugin.ts`

```typescript
export const withIntentGateConfig: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Add AccessibilityService declaration
    androidManifest.manifest.application[0].service = [
      {
        $: {
          'android:name': 'com.intentgate.IntentGateAccessibilityService',
          'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
          'android:exported': 'false',
        },
        'intent-filter': [{
          'action': [{ $: { 'android:name': 'android.accessibilityservice.AccessibilityService' } }]
        }],
        'meta-data': [{
          $: {
            'android:name': 'android.accessibilityservice',
            'android:resource': '@xml/accessibility_service_config',
          }
        }]
      }
    ];
    
    // Add overlay/accessibility permissions
    androidManifest.manifest.uses-permission = [
      { $: { 'android:name': 'android.permission.SYSTEM_ALERT_WINDOW' } },
      { $: { 'android:name': 'android.permission.QUERY_ALL_PACKAGES' } },
    ];
    
    return config;
  });
};
```

**XML Resource** (`android/app/src/main/res/xml/accessibility_service_config.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagReportViewIds"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="100" />
```

---

## 7) Data Model & Local Storage

### 7.1 Database (expo-sqlite + Room)

**Schema** (Room in Kotlin, synced with JS reads):

```kotlin
@Entity(tableName = "trigger_apps")
data class TriggerApp(
  @PrimaryKey val packageName: String,
  val displayName: String,
  val enabled: Boolean,
  val defaultDurationSec: Int
)

@Entity(tableName = "schedule_rules")
data class ScheduleRule(
  @PrimaryKey val id: String,
  val dayOfWeek: Int, // 0=Sunday...6=Saturday
  val startTimeMinutes: Int,
  val endTimeMinutes: Int,
  val isActive: Boolean
)

@Entity(tableName = "sessions")
data class Session(
  @PrimaryKey val id: String,
  val packageName: String,
  val tsStartEpochMs: Long,
  val tsEndEpochMs: Long?,
  val intentText: String,
  val reasonSource: String, // "chip" or "typed"
  val durationSelectedSec: Int,
  val outcome: String, // "ALLOW" | "NOT_NOW" | "EXPIRED" | "BYPASS"
  val snoozeCountThisOpen: Int
)

@Entity(tableName = "allow_sessions")
data class AllowSession(
  @PrimaryKey val packageName: String,
  val allowUntilEpochMs: Long,
  val intentText: String
)
```

### 7.2 Migrations (Append-Only for MVP)

- Start with the full schema above.
- If changes needed: only add new columns or tables.
- Use a `schema_version` column in a metadata table to track version.

### 7.3 Export Functionality

**CSV Export**:
- Button in Settings: "Export my data".
- Generates CSV from `sessions` table (all fields).
- Uses Android's share intent: `Intent.ACTION_SEND` + `text/csv`.
- File saved to app cache, then shared.

---

## 8) Permissions & Runtime Behavior

### 8.1 Permission Checks (on App Resume)

```kotlin
fun checkAndUpdatePermissions() {
  val accessibility = isAccessibilityServiceEnabled()
  val overlay = canDrawOverlays()
  
  appState.updatePermissions(accessibility, overlay)
  
  if (!accessibility && !overlay) {
    showPermissionsBanner("Both permissions required. Tap to enable.")
  } else if (!accessibility) {
    showPermissionsBanner("Enable Accessibility for full protection.")
  }
}
```

### 8.2 Limited Mode (Fallback)

**Trigger**: Accessibility disabled, but user wants some protection.

**Implementation** (UsageStats polling):
```kotlin
class UsageStatsPoller {
  fun startPolling() {
    val handler = Handler(Looper.getMainLooper())
    handler.postDelayed({
      val foregroundPackage = detectForegroundViaUsageStats()
      if (foregroundPackage in triggerApps && !withinSession(foregroundPackage)) {
        // Show gate
      }
      handler.postDelayed(this, 2000) // 2-second polling interval
    }, 2000)
  }
}
```

**UX Differences**:
- Dashboard shows "Protection: LIMITED (may miss some app switches)".
- Snooze delay: 2 minutes (not 30s) due to polling delay.
- No countdown timer (polling is less reliable).

### 8.3 Crash Recovery

**If AccessibilityService Dies**:
1. JS checks on next app resume (via `getCurrentStatus()`).
2. If service not running, show banner: "Protection OFF. Tap to fix."
3. Tapping "Fix" opens Settings (user manually re-enables service).
4. On resume, app re-checks; banner disappears.

---

## 9) Analytics & Instrumentation

### 9.1 Local Analytics (No Network)

All analytics computed on-device, no external calls.

**Dashboard Summary**:
- Today's intercepts: count(sessions where outcome != 'BYPASS').
- Allowed sessions: count(sessions where outcome = 'ALLOW').
- Total allowed minutes: sum(durationSelectedSec) / 60.

**Weekly Rollup**:
- Per day: intercepts, allowed minutes, Work Mode on/off.
- Streak: consecutive days with Work Mode ON.

**Chip Usage**:
- Top 3 presets used (group by reasonSource='chip').
- Show to user as: "You use 'research' 40%, 'reply' 25%, 'tutorial' 20%".

### 9.2 Debug Info (In Settings)

- Tap "Copy diagnostics": logs last 20 sessions + permission status + service status to clipboard.
- For support: user can paste into email for debugging.

---

## 10) UI/UX Specifications

### 10.1 Colors & Styling

| Element | Color | Notes |
|---------|-------|-------|
| Primary Action | #2563EB (blue) | Allow buttons |
| Warning / Protection OFF | #F59E0B (amber) | Status badge |
| Dark Scrim | #000000 + 60% opacity | Gate overlay background |
| Text Input | Material TextField | Standard Material Design |
| Chips | Outlined / Filled | Toggle appearance on tap |
| Chart / Stats | Muted colors | Don't overwhelm |

**Typography**:
- Use Material Design 3 (or System font on Android).
- Body: 16sp, regular.
- Headlines: 20sp, medium.
- Captions: 12sp, regular (muted gray).

### 10.2 Gate Overlay (Design)

- Full-screen (MATCH_PARENT width/height).
- Safe insets: avoid notch/status bar (use View.SYSTEM_UI_FLAG_LAYOUT_STABLE).
- Dark scrim: drawn as background (no transparency to accidentally show app behind).
- Content centered: title + input + chips + buttons.
- Button layout: 3 duration buttons side-by-side, "Not now" centered below.

### 10.3 Dashboard Layout

**Top**:
- Status card (Work Mode + Protection status).

**Middle**:
- Quick stats (if Work Mode ON): "3 intercepts today", "Allowed 25 min".

**Bottom**:
- Navigation tabs (Dashboard / Triggers / Journal / Settings).

### 10.4 Onboarding Clarity

- All permission screens show a clear, calm explanation (no jargon).
- Checkboxes / confirmations before sending user to Settings.
- On return from Settings, auto-detect permission state + show next step or "All set!".

---

## 11) Failure Modes & Error Handling

| Scenario | Behavior |
|----------|----------|
| Accessibility disabled | Show persistent "Protection OFF" banner. Offer "Enable" button → Settings. |
| Overlay permission revoked | Catch WindowManager exception, show "Gate unavailable" banner. |
| Native module crash | JS detects `getCurrentStatus()` returns error; show "Service error, try restarting app." |
| Session save fails (ACK timeout) | Show error toast: "Couldn't start session. Try again." Retry button available. |
| Database corruption | On app resume, detect and log. Show banner: "Local data corrupted. Clearing." Proceed with fresh DB. |
| Device DND mode | Respect OS intent: no sound/vibration alerts. Gate still shows visually. |
| Battery low | Degrade UI: no animations, slower countdown updates. Keep gating active (this is when users need it most). |
| Used uninstall app | Mark stale in DB; show "Not installed" badge. Auto-clean after 7 days or user tap "Remove". |

---

## 12) Acceptance Criteria (MVP)

### Must-Pass Tests
- [ ] **Onboarding**: User completes permission screens; "Protection: ON" shows on dashboard.
- [ ] **Trigger App Selection**: User can enable/disable YouTube in Trigger Apps list; stale apps are marked + removable.
- [ ] **Work Mode Schedule**: User creates schedule (e.g., 9–5 Mon–Fri); manual toggle overrides.
- [ ] **Gate Trigger**: User opens YouTube during Work Mode; gate appears within 1 second on tested devices (Pixel + Samsung).
- [ ] **Intent Entry**: User types intent (3+ chars) + taps "Allow 10 min"; overlay hides.
- [ ] **Session Expiry**: After 10 minutes, gate re-appears if YouTube is still foreground.
- [ ] **Foreground/Background Cycles**: User minimizes YouTube, opens Gmail, returns; still within session window → no gate.
- [ ] **Snooze Escalation**: User taps "Not now" 4 times; after 3rd, escalated friction appears (longer snooze or force intent).
- [ ] **Journal Entry**: Session appears in Journal with app name, intent text, duration, date/time.
- [ ] **Daily Analytics**: Dashboard shows today's intercept count, allowed sessions, total allowed minutes (computed correctly).
- [ ] **Limited Mode**: If Accessibility disabled, "Limited mode" option works (UsageStats polling).
- [ ] **Disclosure**: Onboarding screen clearly explains why Accessibility/Overlay are needed (no jargon).
- [ ] **Export**: User taps "Export CSV"; file is shared via Android share sheet with all session data.
- [ ] **Permission Recovery**: If Accessibility is disabled mid-session, app shows "Protection OFF" + "Fix" button; user re-enables; app resumes protection.

### Device Testing
- [ ] Pixel (latest): all behaviors work within spec timing.
- [ ] Samsung (OneUI): gate appears, overlay permission works, no crashes.

---

## 13) Build & Development Plan (7 Days)

### Day 1: UI Skeleton + Local Storage + App Picker
- [ ] Expo project init + navigation structure.
- [ ] DashboardScreen + TriggersScreen skeleton (no native yet).
- [ ] expo-sqlite integration: create tables, insert test data.
- [ ] Trigger app picker: use PackageManager to list installed apps.
- [ ] Test: basic navigation + app list loads.

### Day 2: Schedule Engine + Rules
- [ ] ScheduleScreen: add/remove time windows per day.
- [ ] Store schedule rules in Room DB.
- [ ] Implement shouldGateNow logic (JS + native side).
- [ ] Work Mode toggle in Settings.
- [ ] Test: schedule evaluates correctly at different times of day.

### Day 3: Expo Module Setup + Config Plugin
- [ ] Create Expo Module skeleton (Kotlin).
- [ ] Config plugin: add AccessibilityService to AndroidManifest.
- [ ] `npx expo prebuild` + `npx gradle build`: dev build compiles.
- [ ] Test on device: app installs, no crashes.

### Day 4: AccessibilityService Detects Foreground App
- [ ] Implement IntentGateAccessibilityService (detect TYPE_WINDOW_STATE_CHANGED).
- [ ] Emit events to JS (onIntercept).
- [ ] JS listens + logs to console.
- [ ] Test: open YouTube → log shows "foreground: YouTube".

### Day 5: OverlayController + Gate UI + Allow Session
- [ ] Implement OverlayController + GateOverlayView (Kotlin UI).
- [ ] Show gate on foreground event.
- [ ] User enters intent + taps "Allow 10 min".
- [ ] SessionManager: persist allow session, hide overlay.
- [ ] Test: gate appears, accepts input, hides on allow.

### Day 6: Journal + Analytics + Onboarding Flows
- [ ] JournalScreen: list sessions, filters by app/date/outcome.
- [ ] Dashboard: compute + display today's stats.
- [ ] OnboardingWelcomeScreen, AccessibilityScreen, OverlayScreen, TestNowScreen.
- [ ] Permission checks on resume.
- [ ] Test: journal shows logged sessions; onboarding completes; permissions check works.

### Day 7: QA, OEM Testing, Polish, Failure Modes
- [ ] End-to-end test on Pixel + Samsung.
- [ ] Handle crashes + permission edge cases.
- [ ] Disclosure copywriting review.
- [ ] CSV export + "Clear data" button.
- [ ] Polish: loading states, error messages, animations.
- [ ] Final build + sign + archive.

---

## 14) Deployment & Distribution

### Dev/Testing
- Build via EAS Build or local `expo prebuild`:
  ```bash
  npx expo prebuild --clean
  cd android && ./gradlew assembleDebug
  adb install -r app/build/outputs/apk/debug/app-debug.apk
  ```

### Release Build
- Sign with release keystore.
- Generate signed APK for distribution.

### Distribution Path (MVP)
- **Internal alpha**: direct APK to testers.
- **Public alpha**: consider direct APK or Google Play Internal Testing (no Play Store review friction initially).
- **Play Store submission**: plan for review (AccessibilityService policies may require resubmission + evidence of disclosure).

---

## 15) Risk Assessment & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| OEM overlay quirks | High | Test on Pixel + Samsung. Use TYPE_ACCESSIBILITY_OVERLAY (more reliable). |
| Accessibility Service flakiness | High | Implement Limited mode fallback (UsageStats). Show status on dashboard. |
| Users feel trapped / "naggy" | High | Allow "Not now" without judgment. Escalate friction gently (after 3 taps). Offer clear "Emergency bypass" if needed. |
| Play Store rejection (AccessibilityService) | Medium | Implement disclosure + consent in MVP. Video evidence of intent-gate behavior may be needed for review. Plan to distribute via direct APK initially. |
| Data loss (SQLite crash) | Low | Auto-detect corruption; clear DB on resume. Non-critical app (no financial/health data). |
| Battery drain | Low | Throttle AccessibilityService events. Use tickless countdown updates. Respect OS Doze/App Standby. |

---

## 16) Future Roadmap (Post-MVP)

- Cloud backup / sync (with encryption + privacy promise).
- AI intent analysis (sentiment, categorization).
- Social accountability (share weekly stats with friends, optional).
- Custom preset chips per user.
- Time-of-day warmth/focus analysis (heatmaps).
- Integration with calendar (auto-pause Work Mode during meetings).
- Wearable notifications (watch alert when gate is triggered).

---

## 17) Success Metrics (Post-Launch)

- [ ] User retention: 30% of installs active after 2 weeks.
- [ ] Engagement: avg. 10+ intercepts/day during Work Mode hours.
- [ ] Satisfaction: NPS > 30 (via optional in-app survey).
- [ ] Stability: crash rate < 0.1%, no major permission bugs reported.

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Trigger App** | An app (e.g., YouTube, Instagram) that the user selects for gating. |
| **Work Mode** | User-defined schedule (or manual toggle) during which gating is active. |
| **Gate** | Full-screen overlay prompting user for intent + duration before allowing access. |
| **Allow Session** | Time window (e.g., 10 min) during which gate is hidden for a trigger app. |
| **Intercept** | Moment when user opens a trigger app during Work Mode (gate trigger). |
| **Intent** | User-entered (or chip-selected) text describing why they're opening the app. |
| **Snooze** | "Not now" action; pauses gate for 30s–2min, then re-gates. |
| **Limited Mode** | Fallback gating using UsageStats polling (less reliable than AccessibilityService). |
| **Outcome** | Session result: ALLOW, NOT_NOW, EXPIRED, BYPASS. |

---

## Appendix B: Links & References

- [Android AccessibilityService](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService)
- [TYPE_ACCESSIBILITY_OVERLAY](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_ACCESSIBILITY_OVERLAY)
- [Expo Modules API](https://docs.expo.dev/modules/module-api/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Google Play Accessibility Policy](https://support.google.com/googleplay/android-developer/answer/10964491)

---

**End of Specification Document**
