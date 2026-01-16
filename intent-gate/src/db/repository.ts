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

  if (!sessions) {
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
