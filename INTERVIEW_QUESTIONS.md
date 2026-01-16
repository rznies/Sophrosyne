# Intent Gate Interview Questions

## Round 1: Architecture & Performance

**Q1: The spec says the overlay should appear "within ~1s" on tested devices. This assumes the AccessibilityService callback → native event → JS bridge → re-render cycle is fast. Have you considered:**
- What happens if the user rapidly opens/closes the trigger app? Will multiple overlay instances stack, or will there be flickering during the transition?
- Do you plan to debounce the foreground app detection, or show the gate *immediately* (even if it means potentially brief phantom overlays)?

**Q2: On session expiry (e.g., after 10 minutes), the spec says "show overlay again if trigger app is still foreground." But:**
- Should the timer *pause* if the user minimizes the app, or does it keep ticking in the background?
- If they minimize, then reopen 2 min later, and 8 min have passed—do they see the gate immediately, or is there a grace period?
- Who's responsible for the timer? Native side (Handler/coroutine) or JS side (setTimeout)? Implications for battery/memory if JS process is killed?

**Q3: You chose SQLite + expo-sqlite for local storage. But:**
- What's your backup strategy if the user reinstalls the app? Do intents/sessions disappear forever, or does the spec assume data loss is acceptable for MVP?
- How many sessions do you plan to store before pruning? (The spec mentions "last N sessions" but doesn't define N or rotation policy.)
- Have you considered that SQLite on Android can be slow for real-time updates during high-frequency gating? Or is session logging expected to be async/non-blocking?

---

## Round 2: UX & Intent capture

**Q4: The Gate overlay shows "Pause. What are you here to do?" + text input. But:**
- Is the input field pre-focused (keyboard auto-open)? If so, what if the user has accessibility settings that auto-hide keyboards? Will this confuse them?
- Do you want to validate intent quality (e.g., reject single-character inputs, or detect filler text like "lol" / "random")? Or accept anything?
- Should there be a character limit, and if so, should long intents be truncated in the Journal, or show full text?

**Q5: The spec mentions "preset chips to speed entry" for common intents (e.g., "Research," "Kill time," "Check news"). But:**
- Should preset chips be customizable per user (e.g., learn from past intents), or static defaults?
- If a user taps a preset chip, should the gate immediately close, or do they still have to select a duration? (Different UX flows here.)
- What if the user never taps a chip and only uses the text input? Will you later regret not building a recommendation engine for presets?

---

## Round 3: Permissions & Platform risk

**Q6: The spec flags Play Store policy risk around AccessibilityService. You mention two distribution paths (Play Store vs. direct APK):**
- Have you thought about *future* policy tightening? What if Google bans accessibility-based app-blocking entirely in 2 years? Is there a fallback to UsageStats-only mode, even if it's less reliable?
- Are you prepared to build an in-app legal disclosure that users must *actively accept* before using Accessibility? (Not just a permission prompt.) How prominent should it be—onboarding-blocking or just a one-time dialog?

**Q7: The overlay permission (`SYSTEM_ALERT_WINDOW`) requires the user to manually enable it in Settings. But:**
- Have you planned deep-linking to the exact Settings screen? Android fragmentation means the path varies by OEM.
- What's the UX for users who enable overlay but *disable* Accessibility later? Should you show both warnings, or prioritize one?

---

## Round 4: Analytics & insight

**Q8: The analytics screen shows "interceptCount", "allowedSessionsCount", "allowedMinutesTotal". But:**
- Are you *intentionally* not tracking things like "most gated app" or "average intent length"? Could these insights be useful later without being creepy?
- Should the Journal show a breakdown of "Allowed vs. Not Now" outcomes? (The spec stores `outcome` but doesn't say if you'll display it.)
- Do you want daily/weekly rollup analytics, or just today's snapshot? (Impacts how you query SQLite.)

---

## Round 5: Edge cases & reliability

**Q9: The spec mentions OEM battery optimization killing background behavior. But:**
- Have you tested on Samsung (Knox) / Xiaomi (MIUI) devices where aggressive background killing is notorious? Or is that post-MVP?
- If AccessibilityService is killed by the OS, what's the recovery mechanism? Auto-restart on boot? User notification?
- What if the user force-stops the Intent Gate app itself? Should there be a "Service stopped" persistent notification reminding them to re-enable?

**Q10: The "Not now" button — what should it do?**
- Option A: Keep the overlay visible (blocking the app indefinitely).
- Option B: Dismiss it but re-show after, say, 30 seconds if the app is still foreground.
- Option C: Redirect to Intent Gate home screen (app switcher out + back into Intent Gate).
- Which did you envision, and why? This affects whether users feel in *control* vs. *trapped*.

---

## Your Answers

[Add your responses here]
