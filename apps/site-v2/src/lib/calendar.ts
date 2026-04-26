/**
 * ICS calendar file generation.
 * Dates are always strings (project convention: "YYYY-MM-DD" / "HH:mm").
 * Used in Phase 3 booking confirmation + email attachments (Phase 5).
 */

export interface BookingCalendarEvent {
  id: string
  reference: string
  spaceName: string
  /** Format: "YYYY-MM-DD" */
  date: string
  /** Format: "HH:mm" */
  startTime: string
  /** Format: "HH:mm" */
  endTime: string
}

/** Convert "YYYY-MM-DD" + "HH:mm" → ICS local datetime "YYYYMMDDTHHMMSS" */
function toICSDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-")
  const [hour, minute] = time.split(":")
  return `${year}${month}${day}T${hour}${minute}00`
}

/** Current UTC timestamp for DTSTAMP */
function nowUTC(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/** Generate ICS file content for a booking */
export function generateICS(event: BookingCalendarEvent): string {
  const dtStart = toICSDateTime(event.date, event.startTime)
  const dtEnd = toICSDateTime(event.date, event.endTime)
  const summary = `CoworKing Café — ${event.spaceName}`
  const description = `Réservation #${event.reference}\\nEspace : ${event.spaceName}\\nHoraires : ${event.startTime} – ${event.endTime}`

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CoworKing Café Strasbourg//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@coworkingcafe.fr`,
    `DTSTAMP:${nowUTC()}`,
    `DTSTART;TZID=Europe/Paris:${dtStart}`,
    `DTEND;TZID=Europe/Paris:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "LOCATION:CoworKing Café\\, Strasbourg",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel réservation CoworKing Café",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

/**
 * Trigger a calendar file download in the browser.
 * Usage: downloadICS(booking) on button click.
 */
export function downloadICS(event: BookingCalendarEvent): void {
  const content = generateICS(event)
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `coworking-cafe-${event.reference}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
