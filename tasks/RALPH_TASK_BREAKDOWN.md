# Ralph Task Breakdown — Intent Gate MVP

This document maps the compound engineering plan into Ralph-sized tasks (completable in one iteration each).

---

## Parent Task: intent-gate-mvp-parent
**Title**: Intent Gate MVP - Production-Ready Android App  
**Description**: Full-stack Expo + React Native + Kotlin implementation of Intent Gate with AccessibilityService, gate overlay, session management, and local analytics.

---

## Task Execution Order

### Phase 1: Setup (Days 1–3)

#### Task 1.0: Create Feature Branch
**No dependencies**
```
Title: Create feature branch for Intent Gate development
Description:
- Run: git checkout -b feature/intent-gate
- Verify: git branch shows current branch as feature/intent-gate
```

#### Task 1.1: Initialize Expo Project with TypeScript
**Depends on**: [Task 1.0]
```
Title: Initialize Expo project with TypeScript template
Description:
What to do:
- Run: npx create-expo-app intent-gate --template with-typescript
- cd intent-gate
- Install: npm install zustand react-native-gesture-handler @react-navigation/bottom-tabs react-native-screens expo-sqlite
- Create directory structure: /src/{screens,components,store,native,db,utils}
- Verify: npx expo start launches without errors

Files to create:
- app.json (Expo config)
- tsconfig.json (TypeScript)
- src/app.tsx (root component)

Acceptance criteria:
- App compiles and runs on emulator
- npx expo start shows "Watching for changes"

Verification:
- npx expo start
- adb logcat | grep "Expo"
```

#### Task 1.2: Set Up SQLite Database Schema
**Depends on**: [Task 1.1]
```
Title: Create SQLite schema and initialization
Description:
What to do:
- Create: src/db/schema.ts
- Define tables: trigger_apps, schedule_rules, sessions, allow_sessions
- Each table must have proper types (INTEGER, TEXT, BLOB)
- Implement initDatabase() function that creates tables on first run
- Add types in TypeScript for each table

Files to create:
- src/db/schema.ts (SQLite schema + types)

Tables to create:
1. trigger_apps(packageName TEXT PK, displayName TEXT, enabled INT, defaultDurationSec INT)
2. schedule_rules(id TEXT PK, dayOfWeek INT, startTimeMinutes INT, endTimeMinutes INT, isActive INT)
3. sessions(id TEXT PK, packageName TEXT, tsStartEpochMs INT, tsEndEpochMs INT, intentText TEXT, reasonSource TEXT, durationSelectedSec INT, outcome TEXT, snoozeCountThisOpen INT)
4. allow_sessions(packageName TEXT PK, allowUntilEpochMs INT, intentText TEXT)

Acceptance criteria:
- Schema file exists with proper types
- initDatabase() can be imported and called
- Tables created without errors
- All columns match spec types

Verification:
- Import and call initDatabase()
- Query each table, verify structure
```

#### Task 1.3: Implement Database Repository
**Depends on**: [Task 1.2]
```
Title: Create repository layer for database queries
Description:
What to do:
- Create: src/db/repository.ts
- Implement CRUD functions:
  - getTriggerApps(): Promise<TriggerApp[]>
  - addTriggerApp(pkg, displayName): Promise<void>
  - removeTriggerApp(packageName): Promise<void>
  - toggleTriggerApp(packageName, enabled): Promise<void>
  - addScheduleRule(dayOfWeek, start, end): Promise<void>
  - removeScheduleRule(id): Promise<void>
  - getSessions(): Promise<Session[]>
  - addSession(session): Promise<void>
  - getTodayStats(): Promise<{intercepts, allowedSessions, allowedMinutes}>
- All functions must be async (Promise-based)
- Use expo-sqlite API (openDatabase, execAsync, allAsync)

Files to create:
- src/db/repository.ts

Acceptance criteria:
- All CRUD functions exist and are async
- Functions use correct expo-sqlite APIs
- TypeScript types match schema
- npx tsc --noEmit passes

Verification:
- npx tsc --noEmit (no type errors)
- Import repository, verify functions exist
```

#### Task 1.4: Create Zustand Global State Store
**Depends on**: [Task 1.3]
```
Title: Set up Zustand store for global app state
Description:
What to do:
- Create: src/store/useAppState.ts
- Define interface AppState with:
  - workModeOn: boolean
  - accessibilityEnabled: boolean
  - overlayEnabled: boolean
  - selectedTriggerApps: string[]
  - scheduleRules: ScheduleRule[]
  - sessions: Session[]
  - mutations: setWorkMode, addTriggerApp, removeTriggerApp, etc.
- Use Zustand create() with default state
- Export hook: export const useAppState = create<AppState>(...)

Files to create:
- src/store/useAppState.ts

Acceptance criteria:
- Store exports useAppState hook
- All state fields typed correctly
- All mutations exist
- npx tsc --noEmit passes

Verification:
- Import useAppState in test component
- Verify hook works: const { workModeOn, setWorkMode } = useAppState()
- npx tsc --noEmit
```

#### Task 1.5: Set Up Bottom Tab Navigation
**Depends on**: [Task 1.4]
```
Title: Create bottom tab navigation with 4 tabs
Description:
What to do:
- Create: src/app.tsx as root with NavigationContainer
- Implement BottomTabNavigator with 4 tabs:
  1. Dashboard
  2. Triggers
  3. Journal
  4. Settings
- Create placeholder screens for each (stub component)
- Export root component from app.tsx

Files to create/modify:
- src/app.tsx (root + navigation)
- src/screens/DashboardScreen.tsx (placeholder)
- src/screens/TriggersScreen.tsx (placeholder)
- src/screens/JournalScreen.tsx (placeholder)
- src/screens/SettingsScreen.tsx (placeholder)

Acceptance criteria:
- App compiles
- Navigation works (tap each tab)
- Each tab shows placeholder screen
- npx expo start works

Verification:
- npx expo start
- Tap each tab, verify screen change
```

#### Task 1.6: Create Placeholder Screens (Onboarding)
**Depends on**: [Task 1.5]
```
Title: Create onboarding screen stubs
Description:
What to do:
- Create 4 onboarding screens (stubs):
  1. src/screens/OnboardingWelcomeScreen.tsx
  2. src/screens/OnboardingAccessibilityScreen.tsx
  3. src/screens/OnboardingOverlayScreen.tsx
  4. src/screens/OnboardingTestNowScreen.tsx
- Create: src/screens/ScheduleScreen.tsx
- Each screen: simple Text component with title
- No logic yet, just structure

Files to create:
- src/screens/OnboardingWelcomeScreen.tsx
- src/screens/OnboardingAccessibilityScreen.tsx
- src/screens/OnboardingOverlayScreen.tsx
- src/screens/OnboardingTestNowScreen.tsx
- src/screens/ScheduleScreen.tsx

Acceptance criteria:
- All 5 screens export React components
- Screens can be imported without errors
- npx tsc --noEmit passes

Verification:
- npx tsc --noEmit
```

#### Task 1.7: Create Time Utilities
**Depends on**: [Task 1.6]
```
Title: Implement time calculation utilities
Description:
What to do:
- Create: src/utils/time.ts
- Implement functions:
  - minutesToHHMM(minutes: number): string (e.g., 600 → "10:00")
  - isWithinWindow(now: Date, startMin: number, endMin: number): boolean
  - getMinutesFromMidnight(date: Date): number
  - secondsToMMSS(seconds: number): string
  - isWithinSchedule(date: Date, scheduleRules: ScheduleRule[]): boolean
- Export all functions

Files to create:
- src/utils/time.ts

Acceptance criteria:
- All functions work correctly
- Handle edge cases (midnight, 23:59, etc.)
- Tests pass: npx jest (if Jest set up)

Verification:
- Test: minutesToHHMM(600) === "10:00"
- Test: minutesToHHMM(900) === "15:00"
- Test: isWithinWindow(10:30 AM, 600, 1020) === true
```

### Phase 2: Trigger Apps + Schedule Engine (Days 2–3)

#### Task 2.0: Implement Trigger Apps Repository
**Depends on**: [Task 1.3]
```
Title: Add trigger app management to repository
Description:
- Already done in Task 1.3, but this verifies:
  - getTriggerApps() returns all apps
  - addTriggerApp() inserts + returns ID
  - removeTriggerApp() deletes correctly
  - toggleTriggerApp() updates enabled flag
- Add: reconcileTriggerApps() function
  - Query installed packages via PackageManager
  - Compare against DB
  - Mark missing apps as stale (optional: isInstalled field)

Files to modify:
- src/db/repository.ts (add reconcileTriggerApps)

Acceptance criteria:
- reconcileTriggerApps() function exists
- Detects uninstalled apps
- npx tsc --noEmit passes

Verification:
- Call reconcileTriggerApps()
- Verify stale apps are detected
```

#### Task 2.1: Create TriggerAppsList Component
**Depends on**: [Task 2.0]
```
Title: Build UI component for trigger apps list
Description:
What to do:
- Create: src/components/TriggerAppsList.tsx
- Display:
  - List of installed apps from PackageManager
  - Toggle switch for each app (enabled/disabled)
  - Search filter (filter by app name)
  - "Not installed" badge for stale apps
  - "Remove" button for stale apps
- Use Zustand store for state
- Call repository functions on toggle

Files to create:
- src/components/TriggerAppsList.tsx

Acceptance criteria:
- Component renders app list
- Toggle works (calls toggleTriggerApp)
- Search filters by name
- Stale apps show badge
- npx tsc --noEmit passes

Verification:
- Import component in test screen
- Verify list displays
- Toggle an app, verify state change
```

#### Task 2.2: Create TriggersScreen
**Depends on**: [Task 2.1]
```
Title: Build full Triggers tab screen
Description:
What to do:
- Create/populate: src/screens/TriggersScreen.tsx
- Show: TriggerAppsList component
- Add: search input at top
- Implement: reconcileTriggerApps() on screen mount
- Show: loading state while fetching apps

Files to modify:
- src/screens/TriggersScreen.tsx

Acceptance criteria:
- Screen shows app list
- Search works
- Stale apps reconciled on mount
- npx expo start works

Verification:
- npx expo start
- Navigate to Triggers tab
- Verify apps display
```

#### Task 2.3: Implement Schedule Engine Logic
**Depends on**: [Task 1.7]
```
Title: Implement shouldGateNow() decision logic
Description:
What to do:
- Create: src/utils/rules.ts
- Implement: shouldGateNow(packageName, state: AppState): boolean
- Logic:
  - Check if workModeManuallyOn OR within schedule window
  - AND packageName in selectedTriggerApps
  - AND NOT within active allow session (check allow_sessions table)
  - Return true if gate should show
- Use time utilities from time.ts

Files to create:
- src/utils/rules.ts

Acceptance criteria:
- shouldGateNow() returns boolean
- Respects manual toggle
- Respects schedule
- Respects allow sessions
- Edge cases handled (midnight, DST)
- npx tsc --noEmit passes

Verification:
- Test: shouldGateNow(YouTube, {workMode: true}) === true if in trigger list
- Test: shouldGateNow(YouTube, {schedule: false, workMode: false}) === false
```

#### Task 2.4: Create ScheduleScreen
**Depends on**: [Task 2.3]
```
Title: Build schedule editor UI
Description:
What to do:
- Create/populate: src/screens/ScheduleScreen.tsx
- Show: 7 weekday rows
- Each row: start time picker + end time picker
- Add button: "Add time window"
- Remove button: remove time window
- Save: call addScheduleRule/removeScheduleRule
- Use: Material Design time picker or React Native Picker

Files to modify:
- src/screens/ScheduleScreen.tsx

Acceptance criteria:
- Screen shows 7 days
- Time picker works
- Can add multiple windows per day
- Can remove windows
- Times saved to DB
- npx expo start works

Verification:
- npx expo start
- Navigate to Settings → Schedule
- Create rule for 9 AM - 5 PM
- Verify saved in DB
```

#### Task 2.5: Create StatusCard Component
**Depends on**: [Task 2.4]
```
Title: Build status display card
Description:
What to do:
- Create: src/components/StatusCard.tsx
- Display:
  - Work Mode toggle (ON/OFF)
  - Protection status badge (ON green / OFF red / LIMITED amber)
  - Next scheduled window (if applicable)
- Use Zustand for state
- Call setWorkMode on toggle

Files to create:
- src/components/StatusCard.tsx

Acceptance criteria:
- Shows work mode toggle
- Shows protection status
- Toggling updates state
- Next window displays correctly
- npx tsc --noEmit passes

Verification:
- Render component
- Toggle switch, verify state change
- Verify correct status badge color
```

#### Task 2.6: Update DashboardScreen
**Depends on**: [Task 2.5]
```
Title: Add StatusCard to Dashboard
Description:
What to do:
- Update: src/screens/DashboardScreen.tsx
- Import + render StatusCard at top
- Add placeholder for quick actions (Triggers, Schedule, Journal buttons)
- Add placeholder for analytics card (show dummy stats for now)

Files to modify:
- src/screens/DashboardScreen.tsx

Acceptance criteria:
- StatusCard displays on dashboard
- Work Mode toggle works
- Navigation buttons present (not functional yet)
- npx expo start works

Verification:
- npx expo start
- Navigate to Dashboard tab
- Verify StatusCard shows
- Toggle work mode
```

### Phase 3: Expo Module + Native Setup (Day 3)

#### Task 3.0: Create Expo Module Structure
**Depends on**: [Task 1.1]
```
Title: Set up Expo Module in Kotlin
Description:
What to do:
- Create directory: android/app/src/main/kotlin/com/intentgate/
- Create: IntentGateModule.kt (skeleton)
- Implement: class IntentGateModule : Module()
- Add stub functions:
  - startService(): Promise<void>
  - stopService(): Promise<void>
  - getCurrentStatus(): Promise<{accessibilityEnabled, overlaySupported, serviceRunning}>
  - allowSession(packageName, durationMs, intent): Promise<boolean>
- All functions return Promise or emit events
- Events: onIntercept, onSessionStart, onSessionEnd

Files to create:
- android/app/src/main/kotlin/com/intentgate/IntentGateModule.kt

Acceptance criteria:
- Module class exists
- Functions match Expo Module API
- Can be imported from JS
- npx tsc --noEmit passes

Verification:
- npx expo prebuild --clean
- Verify gradle compiles (cd android && ./gradlew build)
```

#### Task 3.1: Create Config Plugin
**Depends on**: [Task 3.0]
```
Title: Create config plugin to modify AndroidManifest
Description:
What to do:
- Create: expo-plugins/IntentGateConfigPlugin.ts
- Implement: withIntentGateConfig(config): ConfigPlugin
- Add to AndroidManifest:
  - AccessibilityService declaration
  - Service name: com.intentgate.IntentGateAccessibilityService
  - Permissions: SYSTEM_ALERT_WINDOW, QUERY_ALL_PACKAGES, BIND_ACCESSIBILITY_SERVICE
- Create: android/app/src/main/res/xml/accessibility_service_config.xml with metadata
- Update: app.config.ts to include plugin

Files to create:
- expo-plugins/IntentGateConfigPlugin.ts
- android/app/src/main/res/xml/accessibility_service_config.xml

Files to modify:
- app.config.ts (add plugin to plugins array)

Acceptance criteria:
- Plugin file exists
- app.config.ts includes plugin
- AndroidManifest has service declaration
- Accessibility metadata file created
- npx expo prebuild --clean works

Verification:
- npx expo prebuild --clean
- Check android/app/src/main/AndroidManifest.xml for service declaration
- ./gradlew build passes
```

#### Task 3.2: Create Native Bridge (TypeScript)
**Depends on**: [Task 3.1]
```
Title: Create TypeScript bridge to native module
Description:
What to do:
- Create: src/native/IntentGateNative.ts
- Define interface matching IntentGateModule:
  - All async functions (return Promise<T>)
  - All events (onIntercept, onSessionStart, onSessionEnd)
- Import NativeModules from react-native
- Export const IntentGateNative = NativeModules.IntentGateModule
- Add event emitter setup

Files to create:
- src/native/IntentGateNative.ts

Acceptance criteria:
- Bridge exports IntentGateNative
- All functions typed correctly
- Event listeners work
- npx tsc --noEmit passes

Verification:
- Import IntentGateNative in component
- Call startService() (will fail until native impl, but type checks)
- npx tsc --noEmit
```

#### Task 3.3: Verify Dev Build Compiles
**Depends on**: [Task 3.2]
```
Title: Verify dev build compiles successfully
Description:
What to do:
- Run: npx expo prebuild --clean
- Run: cd android && ./gradlew build
- Verify: No build errors
- Check: APK generated at android/app/build/outputs/apk/debug/app-debug.apk

Acceptance criteria:
- Prebuild succeeds
- Gradle build succeeds
- APK exists
- No errors in logs

Verification:
- npx expo prebuild --clean (output: "✅ Prebuild succeeded")
- ./gradlew build (output: "✅ Build successful")
- ls android/app/build/outputs/apk/debug/ (file exists)
```

---

## Remaining Tasks (Phase 4–5)

These will follow after the above tasks complete. Each is ~1 iteration, ~2-3 hours.

### Phase 4: AccessibilityService + Overlay (Days 4–5)
- Task 4.0: Implement IntentGateAccessibilityService
- Task 4.1: Implement OverlayController + GateOverlayView
- Task 4.2: Implement SessionManager + Timers
- Task 4.3: Test on device (Accessibility events fire)
- Task 4.4: Test on device (Overlay shows + accepts input)

### Phase 5: Journal + Analytics + Onboarding (Day 6)
- Task 5.0: Implement JournalScreen + filtering
- Task 5.1: Implement analytics (getTodayStats, getWeeklyRollup)
- Task 5.2: Implement onboarding flow (all 4 screens)
- Task 5.3: Implement permission checks + recovery
- Task 5.4: Implement SettingsScreen + CSV export

### Phase 6: QA + Polish (Day 7)
- Task 6.0: Error handling (toast, banners, recovery)
- Task 6.1: UI polish (Material Design 3 consistency)
- Task 6.2: Device testing (Pixel + Samsung)
- Task 6.3: Final review + cleanup

---

## Task Status

| Task | Title | Status | Dependencies |
|------|-------|--------|--------------|
| 1.0 | Create feature branch | Ready | None |
| 1.1 | Initialize Expo | Ready | 1.0 |
| 1.2 | SQLite schema | Ready | 1.1 |
| 1.3 | Database repository | Ready | 1.2 |
| 1.4 | Zustand store | Ready | 1.3 |
| 1.5 | Bottom navigation | Ready | 1.4 |
| 1.6 | Placeholder screens | Ready | 1.5 |
| 1.7 | Time utilities | Ready | 1.6 |
| 2.0 | Trigger apps repo | Ready | 1.3 |
| 2.1 | TriggerAppsList component | Ready | 2.0 |
| 2.2 | TriggersScreen | Ready | 2.1 |
| 2.3 | Schedule engine logic | Ready | 1.7 |
| 2.4 | ScheduleScreen | Ready | 2.3 |
| 2.5 | StatusCard component | Ready | 2.4 |
| 2.6 | Update DashboardScreen | Ready | 2.5 |
| 3.0 | Expo Module structure | Ready | 1.1 |
| 3.1 | Config plugin | Ready | 3.0 |
| 3.2 | Native bridge | Ready | 3.1 |
| 3.3 | Verify dev build | Ready | 3.2 |

---

**Ralph is ready to execute! Start with Task 1.0.**
