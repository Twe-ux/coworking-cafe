import { describe, it, expect } from "vitest"
import { generateICS } from "./calendar"

const baseEvent = {
  id: "test-123",
  reference: "CWK-2026-001",
  spaceName: "Open-space",
  date: "2026-05-10",
  startTime: "09:00",
  endTime: "12:00",
}

describe("generateICS", () => {
  it("generates a valid ICS file structure", () => {
    const ics = generateICS(baseEvent)
    expect(ics).toContain("BEGIN:VCALENDAR")
    expect(ics).toContain("END:VCALENDAR")
    expect(ics).toContain("BEGIN:VEVENT")
    expect(ics).toContain("END:VEVENT")
  })

  it("formats DTSTART and DTEND correctly", () => {
    const ics = generateICS(baseEvent)
    expect(ics).toContain("DTSTART;TZID=Europe/Paris:20260510T090000")
    expect(ics).toContain("DTEND;TZID=Europe/Paris:20260510T120000")
  })

  it("includes the space name in the summary", () => {
    const ics = generateICS(baseEvent)
    expect(ics).toContain("SUMMARY:CoworKing Café — Open-space")
  })

  it("includes the booking reference in the UID", () => {
    const ics = generateICS(baseEvent)
    expect(ics).toContain("UID:test-123@coworkingcafe.fr")
  })

  it("includes a 30-minute reminder alarm", () => {
    const ics = generateICS(baseEvent)
    expect(ics).toContain("TRIGGER:-PT30M")
  })
})
