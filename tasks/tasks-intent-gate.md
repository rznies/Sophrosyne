# Intent Gate — Task List

**Status**: Parent tasks generated (waiting for sub-task generation)  
**Total Tasks**: 7 (1 setup + 6 feature/dev)

---

## Relevant Files

### Expo/TypeScript Source Files
- `src/app.tsx` - Root component + navigation setup
- `src/screens/OnboardingWelcomeScreen.tsx` - Onboarding welcome screen
- `src/screens/OnboardingAccessibilityScreen.tsx` - Accessibility permission disclosure
- `src/screens/OnboardingOverlayScreen.tsx` - Overlay permission disclosure
- `src/screens/OnboardingTestNowScreen.tsx` - Test gate UI in context
- `src/screens/DashboardScreen.tsx` - Main dashboard with status + stats
- `src/screens/TriggersScreen.tsx` - Trigger apps selection + management
- `src/screens/ScheduleScreen.tsx` - Work Mode schedule editor
- `src/screens/JournalScreen.tsx` - Session history + filtering
- `src/screens/SettingsScreen.tsx` - App settings + permissions checklist
- `src/components/StatusCard.tsx` - Work Mode + Protection status display
- `src/components/TriggerAppsList.tsx` - List of installed apps with toggles
- `src/components/GateOverlay.tsx` - Gate overlay UI component (for demo/mocking)
- `src/components/ChipRow.tsx` - Preset chips layout
- `src/components/DurationButtonGroup.tsx` - Duration selection buttons (5/10/15 min)
- `src/components/JournalEntryCard.tsx` - Single session entry display
- `src/components/PermissionChecklist.tsx` - Permission status checklist
- `src/store/useAppState.ts` - Zustand store for global app state
- `src/native/IntentGateNative.ts` - Native module bridge
- `src/db/schema.ts` - expo-sqlite schema + database helpers
- `src/db/repository.ts` - Database query methods
- `src/utils/formatting.ts` - Text/time formatting utilities
- `src/utils/time.ts` - Duration + schedule time helpers

### Kotlin Native Files
- `android/app/src/main/kotlin/com/intentgate/IntentGateAccessibilityService.kt` - Foreground app detection
- `android/app/src/main/kotlin/com/intentgate/OverlayController.kt` - Overlay window management
- `android/app/src/main/kotlin/com/intentgate/SessionManager.kt` - Session + timer logic
- `android/app/src/main/kotlin/com/intentgate/GateOverlayView.kt` - Gate overlay UI (Kotlin)
- `android/app/src/main/kotlin/com/intentgate/IntentGateModule.kt` - Expo Module definition
- `android/app/src/main/kotlin/com/intentgate/SessionDatabase.kt` - Room database + DAOs
- `android/app/src/main/kotlin/com/intentgate/PermissionHelper.kt` - Permission checking helpers

### Configuration Files
- `app.config.ts` - Expo config with config plugin
- `expo-plugins/IntentGateConfigPlugin.ts` - Config plugin for native integration
- `android/app/src/main/AndroidManifest.xml` - Service declarations + permissions
- `android/app/src/main/res/xml/accessibility_service_config.xml` - Accessibility service metadata

### Test Files
- `src/screens/__tests__/DashboardScreen.test.tsx` - Dashboard screen tests
- `src/screens/__tests__/TriggersScreen.test.tsx` - Trigger apps screen tests
- `src/screens/__tests__/ScheduleScreen.test.tsx` - Schedule logic tests
- `src/screens/__tests__/JournalScreen.test.tsx` - Journal filtering tests
- `src/db/__tests__/repository.test.ts` - Database query tests
- `src/utils/__tests__/time.test.ts` - Time/duration calculation tests
- `android/app/src/test/kotlin/IntentGateAccessibilityServiceTest.kt` - Accessibility service tests
- `android/app/src/test/kotlin/SessionManagerTest.kt` - Session manager tests

---

## Notes

- All file modifications should be tested locally before merging to main branch.
- Use `npx expo prebuild --clean` and `./gradlew build` to verify native + JS builds compile successfully.
- Device testing on both Pixel and Samsung required before completion.
- Onboarding screens must be tested for clear disclosure + permission flow clarity.

---

## Tasks

### 0.0 Create feature branch

- [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/intent-gate`)

---

### 1.0 Project Setup: Expo App Skeleton + Navigation + Local Database

**Goal**: Initialize the Expo project with basic navigation structure, set up expo-sqlite, and verify the app compiles and runs.

- [ ] 1.1 Initialize new Expo project with TypeScript template (`npx create-expo-app --template with-typescript`)
- [ ] 1.2 Install required dependencies: expo-sqlite, zustand, react-native-gesture-handler, @react-navigation/bottom-tabs, react-native-screens, expo-status-bar
- [ ] 1.3 Create directory structure: `/src/screens`, `/src/components`, `/src/store`, `/src/native`, `/src/db`, `/src/utils`
- [ ] 1.4 Set up bottom tab navigation with 4 tabs: Dashboard, Triggers, Journal, Settings
- [ ] 1.5 Create placeholder/skeleton screens for all 9 screens (OnboardingWelcome, OnboardingAccessibility, OnboardingOverlay, OnboardingTestNow, Dashboard, Triggers, Schedule, Journal, Settings)
- [ ] 1.6 Set up expo-sqlite integration: create `db/schema.ts` with database initialization function
- [ ] 1.7 Create database schema (trigger_apps, schedule_rules, sessions, allow_sessions tables) in SQLite
- [ ] 1.8 Implement basic `db/repository.ts` with CRUD methods for all tables
- [ ] 1.9 Create Zustand store (`store/useAppState.ts`) with global state: workModeOn, accessibilityEnabled, overlayEnabled, selectedTriggerApps, scheduleRules, sessions
- [ ] 1.10 Verify app compiles: `npx expo start`, test on emulator or device
- [ ] 1.11 Verify basic navigation works: tap all tabs, check placeholder screens display

---

### 2.0 Implement Trigger Apps Management + Storage

**Goal**: Allow users to select which apps to gate, store them in SQLite, and display them with toggles. Implement app reconciliation for stale apps.

- [ ] 2.1 Implement `getTriggerApps()` repository function to fetch all apps from trigger_apps table
- [ ] 2.2 Implement `addTriggerApp(packageName, displayName)` repository function to insert new app
- [ ] 2.3 Implement `removeTriggerApp(packageName)` repository function to delete app
- [ ] 2.4 Implement `toggleTriggerApp(packageName, enabled)` repository function to update enabled flag
- [ ] 2.5 Create `components/TriggerAppsList.tsx`: list all installed apps with toggle switches
- [ ] 2.6 Implement app reconciliation logic (`reconcileTriggerApps()`): check installed apps against stored list, mark missing apps as stale
- [ ] 2.7 Create search functionality in TriggerAppsList (filter by app name)
- [ ] 2.8 Add "Not installed" badge to stale apps, with "Remove" button
- [ ] 2.9 Create `screens/TriggersScreen.tsx`: full screen with TriggerAppsList + search bar
- [ ] 2.10 Implement app reconciliation on TriggersScreen mount (auto-detect uninstalled apps)
- [ ] 2.11 Test: add/remove trigger apps, verify stored in SQLite, verify stale app detection works

---

### 3.0 Implement Work Mode Schedule Engine + Rules Logic

**Goal**: Let users create/edit Work Mode schedules (multiple time windows per day), implement the shouldGateNow decision logic, and add manual Work Mode toggle.

- [ ] 3.1 Create `screens/ScheduleScreen.tsx`: UI for adding/removing time windows per weekday
- [ ] 3.2 Implement time picker UI (Material Design or React Native Picker) for start/end times
- [ ] 3.3 Implement `addScheduleRule(dayOfWeek, startTime, endTime)` repository function
- [ ] 3.4 Implement `removeScheduleRule(id)` repository function
- [ ] 3.5 Create `utils/time.ts`: helper functions for time calculations (minutes to HH:MM, check if now within window, etc.)
- [ ] 3.6 Implement `shouldGateNow(packageName, triggerApps, scheduleRules, allowSessions)` function: logic that returns true if:
  - workModeOn (manual toggle) OR within scheduled window
  - AND packageName in triggerApps
  - AND NOT within active allow session
- [ ] 3.7 Add Work Mode manual toggle to Settings screen (Store in Zustand + SQLite)
- [ ] 3.8 Create `components/StatusCard.tsx`: display Work Mode state (ON/OFF) and Protection status
- [ ] 3.9 Add StatusCard to DashboardScreen
- [ ] 3.10 Test: create schedule rule, verify shouldGateNow evaluates correctly at different times
- [ ] 3.11 Test: manual toggle overrides schedule

---

### 4.0 Create Expo Module + Config Plugin + Native Integration Setup

**Goal**: Set up Expo Module in Kotlin, implement config plugin to modify AndroidManifest, and verify dev build compiles with native code.

- [ ] 4.1 Create Expo Module structure: `android/src/main/kotlin/com/intentgate/` directory
- [ ] 4.2 Create `IntentGateModule.kt`: skeleton Expo Module with basic function stubs (startService, stopService, getCurrentStatus, allowSession, getTodayStats, etc.)
- [ ] 4.3 Create `expo-plugins/IntentGateConfigPlugin.ts`: config plugin that modifies AndroidManifest.xml
- [ ] 4.4 Implement plugin logic to add AccessibilityService declaration to AndroidManifest
- [ ] 4.5 Implement plugin logic to add permissions (SYSTEM_ALERT_WINDOW, QUERY_ALL_PACKAGES, BIND_ACCESSIBILITY_SERVICE)
- [ ] 4.6 Create `android/app/src/main/res/xml/accessibility_service_config.xml`: accessibility service metadata
- [ ] 4.7 Update `app.config.ts` to include the config plugin in plugins array
- [ ] 4.8 Create native Bridge file `src/native/IntentGateNative.ts`: TypeScript interface for native module methods
- [ ] 4.9 Add Expo Module + config plugin to `eas.json` (or local prebuild setup)
- [ ] 4.10 Run `npx expo prebuild --clean` to generate native code
- [ ] 4.11 Verify native code compiles: `cd android && ./gradlew build`
- [ ] 4.12 Verify app builds and installs on device

---

### 5.0 Implement AccessibilityService + Foreground App Detection

**Goal**: Build IntentGateAccessibilityService to detect when trigger apps come to foreground, emit events to JS, and verify events are received correctly.

- [ ] 5.1 Create `android/app/src/main/kotlin/com/intentgate/IntentGateAccessibilityService.kt`
- [ ] 5.2 Implement `onAccessibilityEvent()` callback to listen for TYPE_WINDOW_STATE_CHANGED events
- [ ] 5.3 Implement `detectForegroundApp()`: extract package name from accessibility event
- [ ] 5.4 Create `PermissionHelper.kt`: helper to check if service is enabled, check accessibility status
- [ ] 5.5 Implement `shouldGateNow()` check in service (call native DB queries)
- [ ] 5.6 Implement event emission to JS: `onIntercept(packageName, displayName)` event
- [ ] 5.7 Update `IntentGateModule.kt`: add event emitter setup for onIntercept
- [ ] 5.8 Implement `IntentGateNative.ts`: add event listener setup (`onIntercept()`, `onSessionStart()`, `onSessionEnd()`)
- [ ] 5.9 Create JS hook `useIntentGateEvents()` to listen to native events and update Zustand store
- [ ] 5.10 Add `startService()` function to IntentGateModule to start the AccessibilityService
- [ ] 5.11 Add `getCurrentStatus()` function to check if service is running + permissions status
- [ ] 5.12 Test on device: enable Accessibility, open trigger apps, verify `onIntercept` events fire in console logs

---

### 6.0 Implement Gate Overlay UI + Session Management + Allow Sessions

**Goal**: Build the full-screen gate overlay with intent input, preset chips, duration buttons, and implement session persistence + allow-window logic.

- [ ] 6.1 Create `android/app/src/main/kotlin/com/intentgate/OverlayController.kt`: manage overlay window lifecycle (show/hide)
- [ ] 6.2 Create `android/app/src/main/kotlin/com/intentgate/GateOverlayView.kt`: full-screen gate UI (Material Design)
- [ ] 6.3 Implement GateOverlayView layout: dark scrim + centered content with title, text input, preset chips (2-column grid), duration buttons, "Not now" button
- [ ] 6.4 Implement text input field: min 3 chars, max 200 chars, placeholder "What are you here to do?"
- [ ] 6.5 Create preset chips array (8 chips) and implement chip tap logic (auto-fill text field)
- [ ] 6.6 Implement duration buttons (5/10/15 min) with click listeners
- [ ] 6.7 Create `android/app/src/main/kotlin/com/intentgate/SessionManager.kt`: manage allow sessions + timers
- [ ] 6.8 Implement `allow_sessions` table logic: store packageName, allowUntilEpochMs, intentText
- [ ] 6.9 Implement `startSession()`: create session record, persist allowUntilEpochMs, emit event to JS
- [ ] 6.10 Implement timer logic using Kotlin Coroutines to check when session expires
- [ ] 6.11 Implement `allowSession()` in IntentGateModule: called from JS when user taps "Allow X min"
- [ ] 6.12 Implement countdown timer display (top-right, "X:XX remaining") with 5-second update interval
- [ ] 6.13 Implement "Not now" snooze: store snoozeUntil, increment notNowCount, re-gate after delay
- [ ] 6.14 Implement session logging: create `sessions` table entry with outcome (ALLOW / NOT_NOW / EXPIRED)
- [ ] 6.15 Test on device: trigger app appears, gate shows, type intent + tap "Allow 10 min", gate hides, timer counts down, gate re-appears

---

### 7.0 Implement Journal + Analytics + Onboarding Flows + Polish

**Goal**: Build journal screen with filtering, compute dashboard analytics, implement all onboarding screens, handle permission edge cases, and polish UX.

#### 7.1 Journal Screen & Filtering
- [ ] 7.1.1 Create `screens/JournalScreen.tsx`: chronological list of sessions
- [ ] 7.1.2 Create `components/JournalEntryCard.tsx`: single session card (app icon, intent, duration, date, outcome badge)
- [ ] 7.1.3 Implement filters: by app (package), by date range, by outcome (ALLOW/NOT_NOW/EXPIRED)
- [ ] 7.1.4 Implement date range picker (or presets: Today, Last 7 days, Last 30 days)
- [ ] 7.1.5 Test: filter sessions by app, date, outcome

#### 7.2 Dashboard Analytics
- [ ] 7.2.1 Implement `getTodayStats()` in repository: count intercepts, allowed sessions, total allowed minutes
- [ ] 7.2.2 Implement `getWeeklyRollup()`: per-day breakdown of intercepts, allowed minutes
- [ ] 7.2.3 Implement `getChipUsageStats()`: count which preset chips were used most
- [ ] 7.2.4 Create `components/AnalyticsCard.tsx`: display today's stats nicely
- [ ] 7.2.5 Add AnalyticsCard to DashboardScreen (show only if Work Mode is ON)
- [ ] 7.2.6 Test: verify analytics calculations are correct

#### 7.3 Onboarding Screens
- [ ] 7.3.1 Create `screens/OnboardingWelcomeScreen.tsx`: explain what Intent Gate does + why permissions matter
- [ ] 7.3.2 Create `screens/OnboardingAccessibilityScreen.tsx`: clear disclosure about Accessibility usage, checkbox for consent, "Enable Accessibility" button (deep link to Settings)
- [ ] 7.3.3 Create `screens/OnboardingOverlayScreen.tsx`: disclosure for overlay permission, "Enable in Settings" button
- [ ] 7.3.4 Create `screens/OnboardingTestNowScreen.tsx`: "Select an app to test the gate", launch real app, show gate with 30-60 sec unlock
- [ ] 7.3.5 Implement onboarding flow logic: welcome → accessibility → overlay → test (optional) → dashboard
- [ ] 7.3.6 Implement permission checks on app resume: auto-detect if Accessibility + Overlay enabled, advance onboarding or show "Protection: ON"
- [ ] 7.3.7 Test: complete full onboarding flow on device

#### 7.4 Permission Handling & Status
- [ ] 7.4.1 Create `components/PermissionChecklist.tsx`: show status of Accessibility + Overlay permissions with "Fix" buttons
- [ ] 7.4.2 Implement permission checking: `isAccessibilityServiceEnabled()`, `canDrawOverlays()`
- [ ] 7.4.3 Add PermissionChecklist to SettingsScreen
- [ ] 7.4.4 Implement "Fix" button logic: deep link to appropriate Settings page
- [ ] 7.4.5 Implement crash recovery: if Accessibility service dies, show "Protection OFF" banner with "Fix" button

#### 7.5 Settings Screen & Export
- [ ] 7.5.1 Create `screens/SettingsScreen.tsx`: Work Mode toggle, default durations (5/10/15), permissions checklist, "Export CSV", "Clear data", feedback link, app version
- [ ] 7.5.2 Implement "Export CSV": query all sessions from DB, generate CSV file, share via Android share sheet
- [ ] 7.5.3 Implement "Clear data": warn user, delete all sessions/rules from SQLite
- [ ] 7.5.4 Test: export CSV contains all session data, "Clear data" works

#### 7.6 Error Handling & Edge Cases
- [ ] 7.6.1 Implement error toast for when session save fails (ACK timeout)
- [ ] 7.6.2 Implement graceful handling of missing overlay permission: catch WindowManager exception, show "Gate unavailable" banner
- [ ] 7.6.3 Implement "Limited mode" fallback option if Accessibility is disabled (optional, can be deferred)
- [ ] 7.6.4 Implement battery low mode: degrade UI (no animations), slower updates
- [ ] 7.6.5 Test: deny permissions, verify graceful degradation + clear error messages

#### 7.7 UI Polish & Final QA
- [ ] 7.7.1 Review all screens for consistent typography (Material Design 3), spacing, colors
- [ ] 7.7.2 Add loading states to async operations (app listing, session save, etc.)
- [ ] 7.7.3 Add error messages + retry buttons for failed operations
- [ ] 7.7.4 Test all screens on both light and dark modes (if applicable)
- [ ] 7.7.5 Verify all buttons, inputs, filters are responsive + accessible
- [ ] 7.7.6 End-to-end test: complete user flow from onboarding → select trigger app → set schedule → open app → gate → allow → check journal
- [ ] 7.7.7 Test on Pixel device: verify all behaviors work, timing is acceptable
- [ ] 7.7.8 Test on Samsung device: verify overlay + Accessibility work correctly, no crashes
- [ ] 7.7.9 Review disclosure copy for clarity + compliance
- [ ] 7.7.10 Final polish: remove debug logs, optimize performance, prepare for alpha release

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update this file after completing each sub-task, not just after completing a parent task.

Example:
```
- [ ] 1.1 Initialize new Expo project
```
becomes:
```
- [x] 1.1 Initialize new Expo project
```

---

**All sub-tasks have been generated. You are ready to begin implementation!**

**Start with Task 0.1, then proceed through tasks 1.0 – 7.0 in order.**
