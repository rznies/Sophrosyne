import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * Database types matching schema
 */
export interface TriggerApp {
  packageName: string;
  displayName: string;
  enabled: 0 | 1;
  defaultDurationSec: number;
}

export interface ScheduleRule {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTimeMinutes: number; // 0-1440
  endTimeMinutes: number; // 0-1440
  isActive: 0 | 1;
}

export interface Session {
  id: string;
  packageName: string;
  tsStartEpochMs: number;
  tsEndEpochMs: number;
  intentText: string;
  reasonSource: string; // "manual" | "schedule" | "habit"
  durationSelectedSec: number;
  outcome: string; // "allowed" | "blocked" | "snoozed"
  snoozeCountThisOpen: number;
}

export interface AllowSession {
  packageName: string;
  allowUntilEpochMs: number;
  intentText: string;
}

/**
 * Initialize SQLite database with schema
 * Creates all tables if they don't exist
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  const db = openDatabaseSync('intent_gate.db');

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS trigger_apps (
      packageName TEXT PRIMARY KEY,
      displayName TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      defaultDurationSec INTEGER NOT NULL DEFAULT 600
    );

    CREATE TABLE IF NOT EXISTS schedule_rules (
      id TEXT PRIMARY KEY,
      dayOfWeek INTEGER NOT NULL,
      startTimeMinutes INTEGER NOT NULL,
      endTimeMinutes INTEGER NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      packageName TEXT NOT NULL,
      tsStartEpochMs INTEGER NOT NULL,
      tsEndEpochMs INTEGER NOT NULL,
      intentText TEXT NOT NULL,
      reasonSource TEXT NOT NULL,
      durationSelectedSec INTEGER NOT NULL,
      outcome TEXT NOT NULL,
      snoozeCountThisOpen INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS allow_sessions (
      packageName TEXT PRIMARY KEY,
      allowUntilEpochMs INTEGER NOT NULL,
      intentText TEXT NOT NULL
    );
  `);

  return db;
}
