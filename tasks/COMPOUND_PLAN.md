# Intent Gate MVP — Compound Engineering Plan

**Status**: Phase 1: PLAN (In Progress)  
**Date**: January 16, 2026  
**Target**: Production-ready Android app with native integration  
**Timeline**: 7 days (solo dev + device testing)

---

## Context

### Problem
Users experience doomscrolling on trigger apps (YouTube, Instagram, X) during Work Mode. No intervention exists to break the habit loop.

### Solution
Intent Gate shows a full-screen overlay when users open trigger apps, requiring them to state their intent + select a time window (5/10/15 min) before allowing access. Sessions are logged locally for analytics.

### Current State
- Detailed SPEC.md exists (17 sections, 40+ pages)
- Task list created (101 sub-tasks across 7 parent tasks)
- Architecture designed (Expo + React Native + Kotlin + AccessibilityService)
- Skills installed and ready

### Desired State
- Fully functional MVP deployed as APK
- Tested on Pixel + Samsung
- All 13 acceptance criteria met
- Production-ready code quality

---

## Research Findings

### Similar Patterns in Ecosystem

**Expo + Native Integration**:
- Expo Modules API is standard for native code
- Config plugins modify AndroidManifest without ejecting
- Development builds (`npx expo prebuild`) standard practice
- Referenced: [Expo Modules Documentation](https://docs.expo.dev/modules/module-api/)

**Android Permissions & Security**:
- AccessibilityService requires explicit user consent + disclosure (Google Play policy)
- TYPE_ACCESSIBILITY_OVERLAY is preferred over TYPE_APPLICATION_OVERLAY (more OEM-compatible)
- Referenced: [Google Play Accessibility Policy](https://support.google.com/googleplay/android-developer/answer/10964491)

**Database Management**:
- expo-sqlite for JS layer (simple, no migrations)
- Room for native layer (type-safe, auto-migrations)
- Single-writer pattern recommended (native writes, JS reads)
- Referenced: [Room Database Best Practices](https://developer.android.com/training/data-storage/room)

**State Management**:
- Zustand lightweight for small apps (< 10 state slices)
- Context API sufficient if state tree is simple
- Both used successfully in production React Native apps

**UI Patterns**:
- Material Design 3 standard for Android
- 2-column chip grid standard for form inputs
- Bottom tab navigation standard for mobile apps

### Prior Art in Codebase
N/A (new project)

### Technical Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| OEM overlay quirks (Samsung, OnePlus) | HIGH | Test on both Pixel + Samsung early (Day 5) |
| AccessibilityService killed by OS | HIGH | Implement Limited Mode fallback (UsageStats polling) |
| Users feel trapped/naggy | HIGH | Allow "Not now" without judgment, escalate gently after 3 taps |
| Play Store rejection (Accessibility policies) | MEDIUM | Implement disclosure + consent in MVP, plan APK distribution |
| Battery drain (Accessibility + overlay) | LOW | Throttle events, use tickless updates, respect Doze |
| Database corruption | LOW | Auto-detect on resume, clear + reinit on error |

---

## Acceptance Criteria (from SPEC.md)

**All must pass before "production-ready" declaration**:

- [ ] **Onboarding**: User completes permission screens; "Protection: ON" shows on dashboard
- [ ] **Trigger Apps**: User can enable/disable YouTube; stale apps marked + removable
- [ ] **Work Mode Schedule**: User creates schedule (9–5 Mon–Fri); manual toggle overrides
- [ ] **Gate Trigger**: YouTube opened during Work Mode → gate appears within 1 sec (Pixel + Samsung)
- [ ] **Intent Entry**: User types intent (3+ chars) + taps "Allow 10 min"; overlay hides
- [ ] **Session Expiry**: After 10 minutes, gate re-appears if YouTube still foreground
- [ ] **Foreground/Background**: User minimizes YouTube, opens Gmail, returns → no gate (still in window)
- [ ] **Snooze Escalation**: User taps "Not now" 4 times; after 3rd, escalated friction appears
- [ ] **Journal Entry**: Session appears in Journal with app name, intent, duration, date/time
- [ ] **Analytics**: Dashboard shows today's intercepts, allowed sessions, allowed minutes (correct)
- [ ] **Limited Mode**: If Accessibility disabled, "Limited mode" works (UsageStats polling)
- [ ] **Disclosure**: Onboarding clearly explains Accessibility/Overlay (no jargon)
- [ ] **Export**: User taps "Export CSV"; file shared via share sheet with all sessions

---

## Technical Approach

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│         React Native / Expo (JS/TS)         │
├─────────────────────────────────────────────┤
│  Screens: Dashboard, Triggers, Journal, etc │
│  State: Zustand (workMode, sessions)        │
│  Navigation: React Navigation (bottom tabs) │
│  DB: expo-sqlite (read-only from JS)        │
├─────────────────────────────────────────────┤
│ Expo Modules Native Bridge (IntentGateNative)
├─────────────────────────────────────────────┤
│         Android Native (Kotlin)             │
├─────────────────────────────────────────────┤
│ AccessibilityService (detects foreground)   │
│ OverlayController (shows gate)              │
│ SessionManager (timers + expiry)            │
│ Room DB (single writer for sessions)        │
└─────────────────────────────────────────────┘
```

### Core Decision: Single-Writer Pattern

**Decision**: Native code owns database writes. JS only reads.

**Rationale**:
- Avoids concurrent write conflicts (SQLite best practice)
- Native can guarantee atomicity (session creation = persist allowUntil before hiding gate)
- JS remains simple (only queries, no mutations)

**Implementation**:
1. Native (Room) = source of truth for sessions, allow_sessions, schedule_rules
2. JS (expo-sqlite) = read-only mirrors of native tables
3. Sync: Native emits events to JS after writes (onSessionStart, onSessionEnd, etc.)

### Core Components & Responsibilities

#### JS Layer (Expo)
- **Screens** (9): UI containers, form inputs, navigation
- **Components** (7): Reusable UI (StatusCard, ChipRow, JournalEntryCard, etc.)
- **Store** (Zustand): Global state (workMode, perms, UI state)
- **Repository**: Query methods (getTodayStats, listSessions, etc.)
- **Native Bridge**: Invoke native module, listen to events

#### Native Layer (Kotlin)
- **IntentGateAccessibilityService**: Listens for foreground app changes
- **OverlayController**: Show/hide overlay window
- **GateOverlayView**: Full-screen gate UI (Material Design)
- **SessionManager**: Manage active sessions, timers, expiry
- **IntentGateModule**: Expo Module interface to JS
- **SessionDatabase** (Room): Persist sessions, rules, allow_sessions

#### Config & Setup
- **Config Plugin**: Modify AndroidManifest (add service, permissions)
- **app.config.ts**: Enable plugin in Expo config
- **Prebuild**: Generate native code, compile with `gradle`

---

## Implementation Breakdown

### Phase 1: Setup (Days 1–3)

#### Day 1: Expo Project Skeleton + Navigation + SQLite
**Tasks**: 1.1–1.11
**Deliverables**:
- New Expo project initialized
- 4-tab bottom navigation (Dashboard, Triggers, Journal, Settings)
- 9 placeholder screens created
- expo-sqlite integrated + schema created
- Zustand store initialized
- App compiles & runs on emulator

**Validation**:
```bash
npx expo start
# Verify: tap each tab, see placeholder screens
```

#### Day 2: Trigger Apps + Schedule Engine
**Tasks**: 2.0–3.0 (2.1–3.11)
**Deliverables**:
- TriggerAppsList component (list + toggle + search)
- TriggersScreen (full screen with reconciliation)
- ScheduleScreen (add/remove time windows)
- shouldGateNow() logic implemented
- Work Mode toggle in Settings
- StatusCard on Dashboard

**Validation**:
```bash
# Add YouTube to triggers, create 9–5 schedule
# Verify: shouldGateNow = true at 10 AM, false at 6 PM
# Manual toggle overrides schedule
```

#### Day 3: Expo Module + Config Plugin Setup
**Tasks**: 4.1–4.12
**Deliverables**:
- Expo Module skeleton (IntentGateModule.kt)
- Config plugin created (modifies AndroidManifest)
- Accessibility service declaration added
- Permissions added (SYSTEM_ALERT_WINDOW, QUERY_ALL_PACKAGES, BIND_ACCESSIBILITY_SERVICE)
- app.config.ts updated with plugin
- Dev build compiles successfully

**Validation**:
```bash
npx expo prebuild --clean
cd android && ./gradlew build
# Verify: no errors, APK generated
```

---

### Phase 2: Native Integration (Days 4–5)

#### Day 4: AccessibilityService + Foreground Detection
**Tasks**: 5.1–5.12
**Deliverables**:
- IntentGateAccessibilityService created
- Listens for TYPE_WINDOW_STATE_CHANGED events
- Detects foreground app package name
- Emits onIntercept event to JS
- PermissionHelper created (check Accessibility status)
- JS hook `useIntentGateEvents()` listens to native events
- startService() + getCurrentStatus() functions

**Validation**:
```bash
adb logcat | grep "intentgate"
# Open YouTube (trigger app)
# Verify: console shows "onIntercept: YouTube"
```

#### Day 5: OverlayController + Gate UI + Sessions
**Tasks**: 6.1–6.15
**Deliverables**:
- OverlayController created (show/hide overlay)
- GateOverlayView created (full-screen gate UI)
  - Dark scrim + centered content
  - Text input (3–200 chars)
  - 8 preset chips in 2-column grid
  - Duration buttons (5/10/15)
  - "Not now" snooze logic
- SessionManager created (timers, expiry)
- allow_sessions table logic
- Session logging (sessions table with outcome)
- Countdown timer display (top-right, 5-sec updates)

**Validation**:
```bash
# Open YouTube during Work Mode
# Verify: gate appears within 1 sec
# Type intent + tap "Allow 10 min"
# Verify: gate hides, countdown shows
# Wait 10 min or manually test
# Verify: gate re-appears
```

---

### Phase 3: Features + Analytics (Day 6)

#### Day 6: Journal + Analytics + Onboarding + Permissions
**Tasks**: 7.1–7.5 (Journal, Analytics, Onboarding, Permissions, Settings)
**Deliverables**:
- JournalScreen with filters (app, date range, outcome)
- AnalyticsCard on Dashboard (today's stats)
- All 4 onboarding screens (Welcome, Accessibility, Overlay, TestNow)
- Onboarding flow logic (permission checks on resume)
- PermissionChecklist component
- SettingsScreen (toggle, durations, permissions, export, clear data)
- CSV export functionality

**Validation**:
```bash
# Complete onboarding flow
# Verify: "Protection: ON" on dashboard
# Open trigger app, allow session
# Verify: session appears in Journal
# Verify: dashboard shows correct stats
# Test export: CSV file contains all sessions
```

---

### Phase 4: QA + Polish (Day 7)

#### Day 7: Error Handling + OEM Testing + Final Polish
**Tasks**: 7.6–7.7 (Error Handling, UI Polish, QA)
**Deliverables**:
- Error toast for session save failures (ACK timeout)
- Graceful handling of missing permissions (banners, recovery)
- Battery low mode (degrade UI, slower updates)
- All screens reviewed for Material Design 3 consistency
- Loading states on async operations
- End-to-end user flow tested
- Test on Pixel device (all criteria pass)
- Test on Samsung device (all criteria pass)
- Disclosure copy reviewed for compliance
- All debug logs removed
- Production build signed + ready

**Validation**:
```bash
# Run through all 13 acceptance criteria on Pixel
# Run through all 13 acceptance criteria on Samsung
# Verify no crashes, no permission errors
# Verify timing requirements met (gate within 1 sec)
# Verify onboarding disclosure is clear
```

---

## Code Examples (Pattern Reference)

### Pattern 1: Zustand Store
```typescript
import create from 'zustand';

interface AppState {
  workModeOn: boolean;
  accessibilityEnabled: boolean;
  overlayEnabled: boolean;
  selectedTriggerApps: string[];
  scheduleRules: ScheduleRule[];
  setWorkMode: (on: boolean) => void;
  addTriggerApp: (packageName: string) => void;
}

export const useAppState = create<AppState>((set) => ({
  workModeOn: false,
  accessibilityEnabled: false,
  overlayEnabled: false,
  selectedTriggerApps: [],
  scheduleRules: [],
  setWorkMode: (on) => set({ workModeOn: on }),
  addTriggerApp: (pkg) => set((state) => ({
    selectedTriggerApps: [...state.selectedTriggerApps, pkg],
  })),
}));
```

### Pattern 2: Native Event Listener (JS)
```typescript
import { emitter } from './IntentGateNative';
import { useEffect } from 'react';

export function useIntentGateEvents() {
  useEffect(() => {
    const subscription = emitter.addListener('onIntercept', (event) => {
      console.log('Gate should show for:', event.packageName);
      // Update state, trigger overlay
    });
    return () => subscription.remove();
  }, []);
}
```

### Pattern 3: Repository Query (JS)
```typescript
import { SQLiteDatabase } from 'expo-sqlite';

export async function getTodayStats(db: SQLiteDatabase) {
  const today = new Date().toLocaleDateString();
  const result = await db.allAsync(
    `SELECT 
      COUNT(*) as intercepts,
      SUM(CASE WHEN outcome = 'ALLOW' THEN 1 ELSE 0 END) as allowedSessions,
      SUM(durationSelectedSec) / 60 as allowedMinutes
     FROM sessions WHERE DATE(tsStartEpochMs / 1000) = ?`,
    [today]
  );
  return result[0];
}
```

### Pattern 4: AccessibilityService (Kotlin)
```kotlin
class IntentGateAccessibilityService : AccessibilityService() {
  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      val foregroundPackage = event?.packageName?.toString()
      if (shouldGateNow(foregroundPackage)) {
        OverlayController.showGate(foregroundPackage!!)
      } else {
        OverlayController.hideGate()
      }
    }
  }
  
  override fun onInterrupt() {}
}
```

---

## Testing Strategy

### Unit Tests (Optional for MVP)
- `TriggerAppsList.test.tsx`: Toggles work, search filters
- `shouldGateNow.test.ts`: Logic tests (schedule, allow sessions)
- `time.test.ts`: Duration calculations

### Integration Tests
- Accessibility service fires events when app changes foreground
- Native session save triggers JS state update
- Permission checks trigger correct UI states

### Manual Verification (Required)

**Onboarding**:
```
✓ Welcome screen shows
✓ Tap "Enable Accessibility" → goes to Settings
✓ User enables, returns → next screen
✓ Repeat for Overlay
✓ Test flow works (gate appears)
✓ Dashboard shows "Protection: ON"
```

**Daily Usage**:
```
✓ Create trigger app (YouTube)
✓ Create schedule (9–5)
✓ Open YouTube at 10 AM → gate appears
✓ Type intent (min 3 chars)
✓ Tap "Allow 10 min" → gate hides
✓ Wait 10 min or fast-forward time
✓ Open YouTube again → gate re-appears
```

**Journal**:
```
✓ Filter by app (YouTube)
✓ Filter by date (Today)
✓ Filter by outcome (ALLOW)
✓ Export CSV → file downloads
```

**Edge Cases**:
```
✓ Disable Accessibility → shows "Protection: OFF" banner
✓ Tap "Not now" 4 times → escalated friction
✓ Minimize app during session → no re-gate
✓ Kill app + reopen → still in session window
```

---

## Risks & Mitigations (Detailed)

### Risk 1: OEM Overlay Behavior Varies
**Severity**: HIGH  
**Symptom**: Overlay shows on Pixel but not on Samsung  
**Root Cause**: OEM-specific WindowManager behavior, overlay permission handling differs  
**Mitigation**:
- Use TYPE_ACCESSIBILITY_OVERLAY (more compatible)
- Test on Samsung by Day 5
- Have fallback: if overlay fails, show banner "Gate unavailable"

### Risk 2: AccessibilityService Killed by OS
**Severity**: HIGH  
**Symptom**: Gate doesn't show after app backgrounded  
**Root Cause**: OS kills service under memory pressure  
**Mitigation**:
- Implement Limited Mode (UsageStats fallback)
- Show persistent notification "Protection: ON"
- User can manually restart service via Settings

### Risk 3: Session Save Race Condition
**Severity**: MEDIUM  
**Symptom**: User taps "Allow" but session not created, gate stays visible  
**Root Cause**: Native crash before DB write completes  
**Mitigation**:
- Implement 1-second ACK timeout
- Show error: "Couldn't start session. Retry?"
- Only hide gate after native confirms save

### Risk 4: Play Store Rejection
**Severity**: MEDIUM  
**Symptom**: App rejected for AccessibilityService misuse  
**Root Cause**: Missing disclosure or intent seems deceptive  
**Mitigation**:
- Implement disclosure screens (done in onboarding)
- Update privacy policy with clear language
- Distribute via direct APK initially, not Play Store
- Have video evidence of gate behavior ready for Play review

### Risk 5: Battery Drain
**Severity**: LOW  
**Symptom**: Battery depletes quickly with app running  
**Root Cause**: AccessibilityService polling + overlay updates  
**Mitigation**:
- Throttle Accessibility events (early return unless needed)
- Use tickless countdown (compute on draw, not every second)
- Respect OS Doze/App Standby (don't use wake locks)

---

## Success Metrics (Post-Launch)

- ✅ All 13 acceptance criteria met
- ✅ 0 crashes on Pixel + Samsung
- ✅ Gate appears within 1 second (99th percentile)
- ✅ Session persist succeeds on first tap (no ACK timeouts)
- ✅ Permissions handle gracefully (no surprises)
- ✅ Disclosure is clear (user understands what/why)

---

## Next Steps (After Plan Approval)

1. **PROCEED TO WORK PHASE**: Start task 0.1 (create feature branch)
2. **Daily checkpoints**: End-of-day review against task list
3. **Device testing**: Begin on Day 5 (don't wait for Day 7)
4. **Bug log**: Document all issues found, categorize for compounding
5. **Final review**: Day 7 before production declaration

---

**PLAN COMPLETE. Ready for WORK phase?**

**Respond "WORK" to begin execution.**
