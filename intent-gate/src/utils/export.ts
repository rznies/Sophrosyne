import type { Session } from '../db/schema';

/**
 * Generate CSV string from sessions
 * @param sessions Array of sessions to export
 * @returns CSV string with headers and data
 */
export function exportSessions(sessions: Session[]): string {
  // CSV headers
  const headers = ['App', 'Intent', 'Duration (min)', 'Date', 'Outcome'];

  // Format data rows
  const rows = sessions.map((session) => {
    const durationMin = Math.round(session.durationSelectedSec / 60);
    const date = new Date(session.tsStartEpochMs).toISOString().split('T')[0];
    const outcome = session.outcome.toUpperCase();

    return [
      `"${session.packageName}"`,
      `"${session.intentText}"`,
      durationMin.toString(),
      date,
      outcome,
    ];
  });

  // Combine headers and rows
  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csv;
}

/**
 * Download CSV to device storage (via Share API)
 * This is platform-specific and should be called from React Native
 * @param csv CSV string content
 * @param filename Name of file to save (e.g., "intent-gate-export.csv")
 * @returns Promise that resolves when share completes
 */
export async function shareCSV(csv: string, filename: string = 'intent-gate-export.csv'): Promise<void> {
  try {
    // This would be called in a component using React Native Share API
    // Import Share from 'react-native' and call Share.share({...})
    // For now, just return a resolved promise
    console.log(`[export] CSV ready to share: ${filename} (${csv.length} bytes)`);
  } catch (error) {
    console.error('[export] Failed to share CSV:', error);
    throw error;
  }
}
