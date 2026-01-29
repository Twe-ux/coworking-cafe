/**
 * Types partagés pour les Cron Jobs
 *
 * Ce fichier contient tous les types utilisés dans les fichiers cron
 * pour éliminer tous les types `any`.
 */

import { ObjectId } from 'mongoose';
import type { BookingDocument } from '@coworking-cafe/database';
import type { UserDocument } from '@coworking-cafe/database';
import type { SpaceDocument } from '@coworking-cafe/database';

// ============================================================================
// BOOKING POPULATED (avec user et space)
// ============================================================================

/**
 * User populé dans une réservation
 */
export interface PopulatedBookingUser {
  _id: ObjectId;
  email: string;
  givenName?: string;
  username?: string;
}

/**
 * Space populé dans une réservation
 */
export interface PopulatedBookingSpace {
  _id: ObjectId;
  name: string;
  type: string;
}

/**
 * Booking avec user et space populés (utilisé dans tous les cron jobs)
 */
export interface PopulatedBooking extends Omit<BookingDocument, 'user' | 'space'> {
  _id: ObjectId;
  user: PopulatedBookingUser;
  space?: PopulatedBookingSpace;
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel" | "desk" | "meeting-room" | "meeting-room-glass" | "meeting-room-floor" | "private-office" | "event-space";
  date: Date;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  attendanceStatus?: 'present' | 'absent';
  totalPrice: number;
  confirmationNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeSetupIntentId?: string;
  captureMethod?: 'automatic' | 'manual' | 'deferred';
  requiresPayment: boolean;
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed' | 'partial';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Réponse API standard pour les cron jobs
 */
export interface CronApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Résultat du cron send-reminders
 */
export interface SendRemindersResult {
  sent: string[];
  failed: Array<{ bookingId: string; error: string }>;
  skipped: string[];
}

/**
 * Résultat du cron check-attendance
 */
export interface CheckAttendanceResult {
  captured: string[];
  failed: Array<{ bookingId: string; error: string }>;
  skipped: string[];
}

/**
 * Résultat du cron create-holds
 */
export interface CreateHoldsResult {
  success: Array<{
    bookingId: string;
    paymentIntentId: string;
    depositAmount: number;
    customerEmail: string;
  }>;
  failed: Array<{ bookingId: string; error: string }>;
  total: number;
}

/**
 * Résultat du cron capture-deposits
 */
export interface CaptureDepositsResult {
  success: string[];
  failed: Array<{ bookingId: string; error: string }>;
}

// ============================================================================
// DAILY REPORT
// ============================================================================

/**
 * Données pour le rapport quotidien
 */
export interface DailyReportData {
  unvalidatedYesterday: PopulatedBooking[];
  pendingReservations: PopulatedBooking[];
  upcomingReservations: PopulatedBooking[];
  depositPendingReservations: PopulatedBooking[];
  reportDate: Date;
}

/**
 * Statistiques du rapport quotidien
 */
export interface DailyReportStats {
  unvalidatedYesterday: number;
  pending: number;
  upcoming: number;
  depositPending: number;
}

// ============================================================================
// EMAIL DATA
// ============================================================================

/**
 * Données pour l'email de rappel de réservation
 */
export interface BookingReminderEmailData {
  name: string;
  spaceName: string;
  date: string;
  time: string;
}

/**
 * Données pour l'email de confirmation de dépôt
 */
export interface DepositHoldEmailData {
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  depositAmount: number;
  totalPrice: number;
}

/**
 * Données pour l'email de capture de dépôt (no-show)
 */
export interface DepositCapturedEmailData {
  name: string;
  spaceName: string;
  date: string;
  depositAmount: number;
}

// ============================================================================
// STRIPE
// ============================================================================

/**
 * Stripe Payment Intent minimal (uniquement les champs utilisés)
 */
export interface StripePaymentIntentMinimal {
  id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method?: string;
}

/**
 * Stripe Setup Intent minimal (uniquement les champs utilisés)
 */
export interface StripeSetupIntentMinimal {
  id: string;
  status: string;
  payment_method: string | null;
}

// ============================================================================
// SPACE CONFIGURATION
// ============================================================================

/**
 * Politique de dépôt pour un espace
 */
export interface DepositPolicy {
  enabled: boolean;
  fixedAmount?: number;
  percentage?: number;
  minimumAmount?: number;
}

/**
 * Configuration d'espace (minimal pour cron)
 */
export interface SpaceConfigurationMinimal {
  _id: ObjectId;
  spaceType: string;
  name?: string;
  depositPolicy?: DepositPolicy;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Logger data structure
 */
export interface LoggerData {
  component: string;
  data: Record<string, unknown>;
}
