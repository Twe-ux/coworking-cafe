/**
 * Idempotency system for webhook events
 * Prevents duplicate processing of same event
 */

interface ProcessedEvent {
  eventId: string;
  processedAt: Date;
}

// In-memory store for processed events (last 24h)
// In production, consider using Redis or database
const processedEvents = new Map<string, ProcessedEvent>();

// Cleanup interval: 24 hours
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Cleanup old events periodically
setInterval(() => {
  const now = Date.now();
  const expiredThreshold = now - CLEANUP_INTERVAL_MS;

  for (const [eventId, event] of processedEvents.entries()) {
    if (event.processedAt.getTime() < expiredThreshold) {
      processedEvents.delete(eventId);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Check if event has already been processed
 * @returns true if event is new (should be processed)
 */
export function isNewEvent(eventId: string): boolean {
  return !processedEvents.has(eventId);
}

/**
 * Mark event as processed
 */
export function markEventAsProcessed(eventId: string): void {
  processedEvents.set(eventId, {
    eventId,
    processedAt: new Date(),
  });
}

/**
 * Get number of processed events in memory
 * (for monitoring/debugging)
 */
export function getProcessedEventsCount(): number {
  return processedEvents.size;
}
