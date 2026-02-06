/**
 * Utility functions to check if clock-in/out times are within scheduled shifts
 */

interface ScheduledShift {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/**
 * Check if clock-in time is within scheduled shifts (±15min tolerance)
 */
export function isClockInWithinSchedule(
  clockInTime: string,
  scheduledShifts: ScheduledShift[]
): boolean {
  if (scheduledShifts.length === 0) return false;

  const [clockH, clockM] = clockInTime.split(':').map(Number);
  const clockInMinutes = clockH * 60 + clockM;

  for (const shift of scheduledShifts) {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    // Allow ±15min tolerance for start time
    const minAllowed = startMinutes - 15;
    const maxAllowed = startMinutes + 15;

    if (clockInMinutes >= minAllowed && clockInMinutes <= maxAllowed) {
      return true;
    }
  }

  return false;
}

/**
 * Check if clock-out time is within scheduled shifts
 *
 * Logic:
 * - Clock-out within ±15min of shift end: OK without justification
 * - Clock-out within shift but >1h before end: Requires justification
 * - Clock-out outside shift: Requires justification
 *
 * Examples for shift 8:40-12:00:
 * - 11:50 (10min before end): OK ✅
 * - 10:00 (2h before end): Justification required ⚠️
 * - 9:49 (2h11 before end): Justification required ⚠️
 * - 12:10 (10min after end): OK ✅
 * - 13:00 (1h after end): Justification required ⚠️
 */
export function isClockOutWithinSchedule(
  clockOutTime: string,
  scheduledShifts: ScheduledShift[]
): boolean {
  if (scheduledShifts.length === 0) return false;

  const [clockH, clockM] = clockOutTime.split(':').map(Number);
  const clockOutMinutes = clockH * 60 + clockM;

  for (const shift of scheduledShifts) {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Case 1: Clock-out within ±15min of shift end → OK without justification
    const minAllowedEnd = endMinutes - 15;
    const maxAllowedEnd = endMinutes + 15;

    if (clockOutMinutes >= minAllowedEnd && clockOutMinutes <= maxAllowedEnd) {
      return true; // OK without justification
    }

    // Case 2: Clock-out within shift timeframe
    if (clockOutMinutes >= startMinutes && clockOutMinutes < endMinutes) {
      const minutesBeforeEnd = endMinutes - clockOutMinutes;

      // If more than 1h before end → Requires justification
      if (minutesBeforeEnd > 60) {
        return false; // Justification required
      } else {
        // Less than 1h before end → OK
        return true;
      }
    }
  }

  // Clock-out outside all shifts → Requires justification
  return false;
}
