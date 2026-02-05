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
 * Check if clock-out time is within scheduled shifts (±15min tolerance)
 */
export function isClockOutWithinSchedule(
  clockOutTime: string,
  scheduledShifts: ScheduledShift[]
): boolean {
  if (scheduledShifts.length === 0) return false;

  const [clockH, clockM] = clockOutTime.split(':').map(Number);
  const clockOutMinutes = clockH * 60 + clockM;

  for (const shift of scheduledShifts) {
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;

    // Allow ±15min tolerance for end time
    const minAllowed = endMinutes - 15;
    const maxAllowed = endMinutes + 15;

    if (clockOutMinutes >= minAllowed && clockOutMinutes <= maxAllowed) {
      return true;
    }
  }

  return false;
}
