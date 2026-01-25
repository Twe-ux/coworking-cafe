/**
 * Format date string YYYY-MM-DD to DD/MM/YYYY
 * No timezone issues since we work with strings
 */
export function formatDateFr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format date string YYYY-MM-DD to locale string
 */
export function formatDateLongFr(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // Force noon to avoid timezone issues
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate number of days between two dates (YYYY-MM-DD)
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end day
}

/**
 * Get month boundaries as strings (YYYY-MM-DD)
 * @param year - Year number
 * @param month - Month number (0-11, JavaScript convention)
 */
export function getMonthBoundaries(year: number, month: number): {
  start: string;
  end: string;
} {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDay = endDate.getDate();
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  return { start, end };
}

/**
 * Get all dates in a month as strings (YYYY-MM-DD)
 * @param year - Year number
 * @param month - Month number (0-11, JavaScript convention)
 */
export function getAllDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }

  return dates;
}

/**
 * Check if a date string is in a date range (inclusive)
 * @param dateStr - Date to check (YYYY-MM-DD)
 * @param startDate - Start of range (YYYY-MM-DD)
 * @param endDate - End of range (YYYY-MM-DD)
 */
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  return dateStr >= startDate && dateStr <= endDate;
}

/**
 * Get day of week from date string (YYYY-MM-DD)
 * @returns 0-6 (0=Monday, 1=Tuesday, ..., 6=Sunday)
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00'); // Force noon to avoid timezone
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday, ..., 6=Sunday
}

/**
 * Convert Date object to string YYYY-MM-DD (safe for display only)
 * WARNING: Only use for display purposes, not for logic
 */
export function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return dateToString(new Date());
}

/**
 * Check if a date string is in the future (compared to today)
 * @param dateStr - Date to check (YYYY-MM-DD)
 */
export function isInFuture(dateStr: string): boolean {
  return dateStr > getTodayString();
}

/**
 * Check if a date string is in the past (compared to today)
 * @param dateStr - Date to check (YYYY-MM-DD)
 */
export function isInPast(dateStr: string): boolean {
  return dateStr < getTodayString();
}
