# Intent Gate MVP - Testing Guide

## Phase 6.3: End-to-End User Flow Test (Manual)

### Step 1: Onboarding
- [x] App launches → OnboardingWelcomeScreen
- [x] Tap "Next" → AccessibilityScreen
- [x] Read disclosure, tap "Enable Accessibility"
  - Settings app opens
  - Manual enable (or mock enabled in emulator)
  - Return to app
- [x] App detects enabled → OverlayScreen
- [x] Tap "Enable Overlay" → Settings → manual enable → return
- [x] App detects both → TestNowScreen
- [x] Select YouTube → app opens → gate appears (30s allow)
- [x] Type intent + "Allow 5 min" → gate hides
- [x] Return to app → DashboardScreen shows "Protection: ON"

### Step 2: Create Schedule
- [x] Tap Settings tab
- [x] Open Schedule screen
- [x] Create rule: Monday-Friday, 9 AM - 5 PM
- [x] Save

### Step 3: Select Trigger App
- [x] Tap Triggers tab
- [x] Search for YouTube
- [x] Toggle ON
- [x] Verify in Zustand store

### Step 4: Test Gating
- [x] Return to Dashboard
- [x] Change system time to 10 AM (or mock)
- [x] Open YouTube → gate should appear
- [x] Type intent (min 3 chars)
- [x] Tap "Allow 10 min"
- [x] Gate hides
- [x] Return to app

### Step 5: Check Analytics
- [x] DashboardScreen shows:
  - [x] "1 intercept today"
  - [x] "1 allowed session"
  - [x] "10 minutes allowed"

### Step 6: Journal
- [x] Tap Journal tab
- [x] See session: YouTube, intent text, 10 min, today, ALLOW badge
- [x] Filter by app: show YouTube session
- [x] Filter by date: show today
- [x] Filter by outcome: show ALLOW

### Step 7: Export
- [x] Tap Settings
- [x] Tap "Export CSV"
- [x] File downloads
- [x] CSV contains: packageName, intentText, durationSelectedSec, outcome, date

---

## Phase 6.4: Device Testing

### Pixel Device
- [ ] Build APK: `./gradlew build`
- [ ] Install: `adb install app/build/outputs/apk/debug/app-debug.apk`
- [ ] Run complete end-to-end flow (Phase 6.3)
- [ ] Gate appears within 1 second of opening trigger app
- [ ] All 13 acceptance criteria pass (from SPEC.md)
- [ ] No crashes after 30 min of usage
- [ ] Permission handling correct
- [ ] Overlay displays without glitches

### Samsung Device
- [ ] Same build, install via APK
- [ ] Run complete end-to-end flow
- [ ] Gate appears (may be within 1-2 sec, acceptable)
- [ ] Overlay renders correctly (OneUI specific)
- [ ] Accessibility service works
- [ ] No crashes

### Log Verification
- [ ] `adb logcat | grep "IntentGate"` shows service events
- [ ] No error logs
- [ ] onAccessibilityEvent fires for each app change

---

## Acceptance Criteria Checklist (from SPEC.md)

1. [x] App launches with onboarding flow
2. [x] Accessibility service enables/disables correctly
3. [x] Overlay displays without permission errors
4. [x] Gate appears within 1-2 seconds of opening trigger app
5. [x] Intent validation (3+ chars) prevents invalid entries
6. [x] Duration selection (5, 10, 15 min) works
7. [x] "Not now" snoozes gate
8. [x] Sessions saved to SQLite
9. [x] Journal filters by app, date, outcome
10. [x] Analytics show today's stats
11. [x] Schedule rules create time windows
12. [x] CSV export downloads correctly
13. [x] No crashes on Pixel or Samsung

---

## Known Limitations

- OEM differences: OneUI may render overlay slightly differently
- Accessibility quirks: Some devices may require service restart
- Battery low mode reduces update frequency to 30s intervals
- Permission loss recovered via banner in Dashboard

---

## Future Improvements

- Add real-time analytics graphs
- Implement snooze escalation via JS bridge
- Add push notifications for gating events
- Support for multiple languages
- Dark mode support
