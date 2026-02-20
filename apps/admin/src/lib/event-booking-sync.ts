/**
 * Event-Booking Synchronization
 *
 * Automatically creates/updates/deletes booking reservations when events are managed.
 * This blocks the calendar for event dates/times/locations.
 */

import { Event, Booking } from "@coworking-cafe/database";
import type { EventDocument } from "@coworking-cafe/database";
import mongoose from "mongoose";

/**
 * Maps event location to booking spaceType
 */
function mapLocationToSpaceType(location?: string): string | null {
  if (!location) return null;

  // Normalize: lowercase + remove accents
  const normalized = location
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Use includes() for flexible matching
  if (normalized.includes("open") || normalized.includes("space")) {
    return "open-space";
  }
  if (normalized.includes("verriere") || normalized.includes("glass")) {
    return "meeting-room-glass";
  }
  if (normalized.includes("etage") || normalized.includes("floor")) {
    return "meeting-room-floor";
  }
  if (normalized.includes("evenement") || normalized.includes("event")) {
    return "event-space";
  }

  console.warn(
    `[Event-Booking] Location "${location}" did not match any spaceType`
  );
  return null;
}

/**
 * Create a booking reservation for an event
 * This blocks the calendar for the event date/time/location
 */
export async function createEventBooking(
  event: EventDocument,
  createdByUserId: string
): Promise<void> {
  // Only create booking if event has all required fields
  if (!event.date || !event.startTime || !event.endTime || !event.location) {
    console.log(
      `[Event-Booking] Skipping booking creation for event ${event._id} - missing required fields (date, startTime, endTime, or location)`
    );
    return;
  }

  const spaceType = mapLocationToSpaceType(event.location);
  if (!spaceType) {
    console.log(
      `[Event-Booking] Skipping booking creation for event ${event._id} - location "${event.location}" does not map to a valid spaceType`
    );
    return;
  }

  try {
    // Convert date string (YYYY-MM-DD) to Date object
    const eventDate = new Date(event.date);

    // Create booking
    const booking = await Booking.create({
      user: new mongoose.Types.ObjectId(createdByUserId),
      spaceType,
      date: eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      numberOfPeople: event.maxParticipants || 1,
      status: "confirmed", // Auto-confirmed for events
      basePrice: event.price || 0,
      servicesPrice: 0,
      totalPrice: event.price || 0,
      contactName: event.organizer || "Événement",
      contactEmail: event.contactEmail,
      notes: `Réservation automatique pour l'événement: ${event.title}`,
      requiresPayment: false, // No payment required for event bookings
      paymentStatus: "paid", // Mark as paid to avoid payment flow
      isAdminBooking: true,
      relatedEvent: event._id,
    });

    // Link booking to event
    await Event.findByIdAndUpdate(event._id, {
      relatedBooking: booking._id,
    });

    console.log(
      `[Event-Booking] Created booking ${booking._id} for event ${event._id}`
    );
  } catch (error) {
    console.error(
      `[Event-Booking] Failed to create booking for event ${event._id}:`,
      error
    );
    throw error;
  }
}

/**
 * Update the linked booking when an event is updated
 */
export async function updateEventBooking(
  eventId: string,
  updatedData: Partial<EventDocument>
): Promise<void> {
  try {
    // Find the event with its related booking
    const event = await Event.findById(eventId);
    if (!event || !event.relatedBooking) {
      console.log(
        `[Event-Booking] No related booking found for event ${eventId}`
      );
      return;
    }

    // Check if we need to delete the booking (missing required fields)
    if (
      updatedData.date === undefined ||
      updatedData.startTime === undefined ||
      updatedData.endTime === undefined ||
      updatedData.location === undefined
    ) {
      // If any required field is being removed, delete the booking
      await deleteEventBooking(eventId);
      return;
    }

    const spaceType = mapLocationToSpaceType(updatedData.location);
    if (!spaceType) {
      // If location doesn't map to a valid spaceType, delete the booking
      await deleteEventBooking(eventId);
      return;
    }

    // Update the booking
    const updatePayload: any = {};

    if (updatedData.date) {
      updatePayload.date = new Date(updatedData.date);
    }
    if (updatedData.startTime) {
      updatePayload.startTime = updatedData.startTime;
    }
    if (updatedData.endTime) {
      updatePayload.endTime = updatedData.endTime;
    }
    if (updatedData.location) {
      updatePayload.spaceType = spaceType;
    }
    if (updatedData.maxParticipants) {
      updatePayload.numberOfPeople = updatedData.maxParticipants;
    }
    if (updatedData.price !== undefined) {
      updatePayload.basePrice = updatedData.price;
      updatePayload.totalPrice = updatedData.price;
    }
    if (updatedData.organizer) {
      updatePayload.contactName = updatedData.organizer;
    }
    if (updatedData.contactEmail) {
      updatePayload.contactEmail = updatedData.contactEmail;
    }
    if (updatedData.title) {
      updatePayload.notes = `Réservation automatique pour l'événement: ${updatedData.title}`;
    }

    await Booking.findByIdAndUpdate(event.relatedBooking, updatePayload);

    console.log(
      `[Event-Booking] Updated booking ${event.relatedBooking} for event ${eventId}`
    );
  } catch (error) {
    console.error(
      `[Event-Booking] Failed to update booking for event ${eventId}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete the linked booking when an event is deleted
 */
export async function deleteEventBooking(eventId: string): Promise<void> {
  try {
    const event = await Event.findById(eventId);
    if (!event || !event.relatedBooking) {
      console.log(
        `[Event-Booking] No related booking found for event ${eventId}`
      );
      return;
    }

    await Booking.findByIdAndDelete(event.relatedBooking);

    console.log(
      `[Event-Booking] Deleted booking ${event.relatedBooking} for event ${eventId}`
    );
  } catch (error) {
    console.error(
      `[Event-Booking] Failed to delete booking for event ${eventId}:`,
      error
    );
    throw error;
  }
}
