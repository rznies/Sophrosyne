import { isWithinSchedule, ScheduleRule } from './time';

/**
 * Application state for gating decisions
 */
export interface AppState {
  workModeOn: boolean;
  selectedTriggerApps: string[];
  scheduleRules: ScheduleRule[];
  activeAllowSessions: Map<string, number>; // packageName -> allowUntilEpochMs
}

/**
 * Determine if an app should be gated now
 *
 * Conditions to gate (return true if ALL are met):
 * 1. workModeOn is true OR current time is within a schedule window
 * 2. packageName is in selectedTriggerApps
 * 3. NOT within an active allow_session for this packageName
 *
 * @param packageName Package name to check
 * @param state Current application state
 * @returns true if app should be gated now
 */
export function shouldGateNow(packageName: string, state: AppState): boolean {
  // Check 1: Work mode OR within schedule
  const now = new Date();
  const isWorkModeOrSchedule = state.workModeOn || isWithinSchedule(now, state.scheduleRules);
  if (!isWorkModeOrSchedule) {
    return false;
  }

  // Check 2: Is this package in triggers?
  if (!state.selectedTriggerApps.includes(packageName)) {
    return false;
  }

  // Check 3: Not in an active allow session
  const allowUntilMs = state.activeAllowSessions.get(packageName);
  if (allowUntilMs !== undefined && Date.now() < allowUntilMs) {
    return false;
  }

  return true;
}
