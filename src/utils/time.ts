/**
 * Time utilities for schedule calculations
 */

/**
 * Convert minutes since midnight to HH:MM format
 * @param minutes Minutes since midnight (0-1439)
 * @returns HH:MM format string
 */
export function minutesToHHMM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Convert seconds to MM:SS format
 * @param seconds Seconds elapsed
 * @returns MM:SS format string
 */
export function secondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Get minutes since midnight for a given date
 * @param date Date object
 * @returns Minutes since midnight
 */
export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Check if current time is within a time window
 * @param now Minutes since midnight (e.g., from getMinutesFromMidnight)
 * @param startMin Window start in minutes since midnight
 * @param endMin Window end in minutes since midnight
 * @returns true if now is within [startMin, endMin)
 */
export function isWithinWindow(now: number, startMin: number, endMin: number): boolean {
  if (startMin < endMin) {
    // Normal case: window doesn't wrap midnight
    return now >= startMin && now < endMin;
  } else {
    // Wraps midnight: start > end
    return now >= startMin || now < endMin;
  }
}

/**
 * Schedule rule for a single day
 */
export interface ScheduleRule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startMin: number; // Minutes since midnight
  endMin: number; // Minutes since midnight
}

/**
 * Check if current date/time is within any of the schedule rules
 * @param date Current date/time
 * @param rules Array of schedule rules
 * @returns true if date/time matches any rule
 */
export function isWithinSchedule(date: Date, rules: ScheduleRule[]): boolean {
  const dayOfWeek = date.getDay();
  const now = getMinutesFromMidnight(date);

  return rules.some((rule) => rule.dayOfWeek === dayOfWeek && isWithinWindow(now, rule.startMin, rule.endMin));
}
