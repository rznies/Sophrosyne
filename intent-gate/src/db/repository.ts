import { SQLiteDatabase } from 'expo-sqlite';
import { TriggerApp, ScheduleRule, Session, AllowSession } from './schema';

let db: SQLiteDatabase | null = null;

/**
 * Set the database instance
 */
export function setDatabase(database: SQLiteDatabase): void {
  db = database;
}

/**
 * Get current database instance
 */
function getDb(): SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Trigger Apps CRUD
 */
export async function getTriggerApps(): Promise<TriggerApp[]> {
  const result = await getDb().getAllAsync<TriggerApp>(
    'SELECT * FROM trigger_apps'
  );
  return result || [];
}

export async function addTriggerApp(
  packageName: string,
  displayName: string,
  defaultDurationSec: number = 600
): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO trigger_apps (packageName, displayName, enabled, defaultDurationSec) VALUES (?, ?, ?, ?)',
    [packageName, displayName, 1, defaultDurationSec]
  );
}

export async function removeTriggerApp(packageName: string): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM trigger_apps WHERE packageName = ?',
    [packageName]
  );
}

export async function toggleTriggerApp(
  packageName: string,
  enabled: boolean
): Promise<void> {
  await getDb().runAsync(
    'UPDATE trigger_apps SET enabled = ? WHERE packageName = ?',
    [enabled ? 1 : 0, packageName]
  );
}

/**
 * Schedule Rules CRUD
 */
export async function getScheduleRules(): Promise<ScheduleRule[]> {
  const result = await getDb().getAllAsync<ScheduleRule>(
    'SELECT * FROM schedule_rules'
  );
  return result || [];
}

export async function addScheduleRule(
  id: string,
  dayOfWeek: number,
  startTimeMinutes: number,
  endTimeMinutes: number
): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO schedule_rules (id, dayOfWeek, startTimeMinutes, endTimeMinutes, isActive) VALUES (?, ?, ?, ?, ?)',
    [id, dayOfWeek, startTimeMinutes, endTimeMinutes, 1]
  );
}

export async function removeScheduleRule(id: string): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM schedule_rules WHERE id = ?',
    [id]
  );
}

/**
 * Sessions CRUD
 */
export async function getSessions(): Promise<Session[]> {
  const result = await getDb().getAllAsync<Session>(
    'SELECT * FROM sessions ORDER BY tsStartEpochMs DESC'
  );
  return result || [];
}

export async function addSession(session: Session): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO sessions 
     (id, packageName, tsStartEpochMs, tsEndEpochMs, intentText, reasonSource, durationSelectedSec, outcome, snoozeCountThisOpen) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.packageName,
      session.tsStartEpochMs,
      session.tsEndEpochMs,
      session.intentText,
      session.reasonSource,
      session.durationSelectedSec,
      session.outcome,
      session.snoozeCountThisOpen,
    ]
  );
}

/**
 * Allow Sessions CRUD
 */
export async function getAllowSessions(): Promise<AllowSession[]> {
  const result = await getDb().getAllAsync<AllowSession>(
    'SELECT * FROM allow_sessions'
  );
  return result || [];
}

export async function setAllowSession(
  packageName: string,
  allowUntilEpochMs: number,
  intentText: string
): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO allow_sessions (packageName, allowUntilEpochMs, intentText) 
     VALUES (?, ?, ?)`,
    [packageName, allowUntilEpochMs, intentText]
  );
}

export async function removeAllowSession(packageName: string): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM allow_sessions WHERE packageName = ?',
    [packageName]
  );
}

/**
 * Trigger Apps - Advanced operations
 */

export interface InstalledApp {
  packageName: string;
  displayName: string;
  icon?: string; // base64 or uri - optional for MVP
}

/**
 * Reconcile trigger apps with installed applications
 * Detects uninstalled apps and marks them (without deletion)
 * To be enhanced in Phase 3 with native bridge to PackageManager
 */
export async function reconcileTriggerApps(): Promise<void> {
  // TODO: In Phase 3, integrate with native PackageManager
  // For now, this is a placeholder that verifies DB is healthy
  const apps = await getTriggerApps();
  // In production: query PackageManager.getInstalledApplications()
  // Compare with apps in DB, mark stale ones
}

/**
 * Get list of installed applications
 * Returns apps from native PackageManager (or fallback list for testing)
 * To be wired with native bridge in Phase 3
 */
export async function getInstalledAppList(): Promise<InstalledApp[]> {
  // TODO: In Phase 3, integrate with native PackageManager via Expo Module
  // For now, return empty list (will be populated from native bridge)
  // Example response:
  // [
  //   { packageName: "com.youtube.android.tv", displayName: "YouTube" },
  //   { packageName: "com.spotify.music", displayName: "Spotify" },
  // ]
  return [];
}

/**
 * Analytics queries
 */
export async function getTodayStats(): Promise<{
  interceptCount: number;
  allowedSessionCount: number;
  totalAllowedMinutes: number;
}> {
  const now = Date.now();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startTsMs = startOfToday.getTime();

  // All sessions started today
  const sessions = await getDb().getAllAsync<{
    outcome: string;
    durationSelectedSec: number;
  }>(
    `SELECT outcome, durationSelectedSec FROM sessions 
     WHERE tsStartEpochMs >= ? AND tsStartEpochMs < ?`,
    [startTsMs, now]
  );

  if (!sessions || sessions.length === 0) {
    return {
      interceptCount: 0,
      allowedSessionCount: 0,
      totalAllowedMinutes: 0,
    };
  }

  const interceptCount = sessions.length;
  const allowedSessions = sessions.filter((s) => s.outcome === 'allowed');
  const allowedSessionCount = allowedSessions.length;
  const totalAllowedMinutes = allowedSessions.reduce((sum, s) => {
    return sum + (s.durationSelectedSec || 0) / 60;
  }, 0);

  return {
    interceptCount,
    allowedSessionCount,
    totalAllowedMinutes: Math.round(totalAllowedMinutes),
  };
}

/**
 * Get weekly rollup (per day, last 7 days)
 */
export async function getWeeklyRollup(): Promise<
  {
    date: string;
    intercepts: number;
    allowedMinutes: number;
  }[]
> {
  const now = Date.now();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 7);
  startDate.setHours(0, 0, 0, 0);

  const results = await getDb().getAllAsync<{
    dateStr: string;
    intercepts: number;
    allowedMinutes: number;
  }>(
    `
    SELECT 
      DATE(tsStartEpochMs / 1000, 'unixepoch', 'localtime') as dateStr,
      COUNT(*) as intercepts,
      CAST(COALESCE(SUM(CASE WHEN outcome = 'allowed' THEN durationSelectedSec ELSE 0 END) / 60, 0) AS INTEGER) as allowedMinutes
    FROM sessions
    WHERE tsStartEpochMs >= ?
    GROUP BY dateStr
    ORDER BY dateStr DESC
    `,
    [startDate.getTime()]
  );

  if (!results || results.length === 0) {
    return [];
  }

  return results.map((r) => ({
    date: r.dateStr,
    intercepts: r.intercepts,
    allowedMinutes: r.allowedMinutes,
  }));
}

/**
 * Get chip usage stats (top preset chips used)
 */
export async function getChipUsageStats(): Promise<
  {
    chip: string;
    count: number;
  }[]
> {
  const results = await getDb().getAllAsync<{
    reasonSource: string;
    count: number;
  }>(
    `
    SELECT reasonSource, COUNT(*) as count
    FROM sessions
    WHERE reasonSource = 'chip'
    GROUP BY reasonSource
    ORDER BY count DESC
    LIMIT 3
    `
  );

  if (!results || results.length === 0) {
    return [];
  }

  // Map reasonSource to chip names (in production, store chip name in sessions table)
  return results.map((r) => ({
    chip: r.reasonSource,
    count: r.count,
  }));
}

/**
 * Get snooze count for package in time window
 * Used to escalate snooze duration after repeated "Not now" taps
 */
export async function getNotNowCount(
  packageName: string,
  timeWindowMinutes: number
): Promise<number> {
  const now = Date.now();
  const windowStartMs = now - timeWindowMinutes * 60 * 1000;

  const result = await getDb().getAllAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sessions 
     WHERE packageName = ? AND outcome = 'snoozed' AND tsStartEpochMs >= ?`,
    [packageName, windowStartMs]
  );

  return result && result.length > 0 ? result[0].count : 0;
}
