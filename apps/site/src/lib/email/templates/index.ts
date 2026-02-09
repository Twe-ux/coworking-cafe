/**
 * Templates email : Export centralisé
 *
 * Nomenclature claire pour identifier rapidement l'origine des actions:
 * - clientXxx : Actions initiées par le client
 * - adminXxx : Actions initiées par l'administrateur
 * - noShowXxx : Cas de non-présentation
 */

// ============ Helpers (depuis package partagé) ============
export { getSpaceDisplayName } from '@coworking-cafe/email';

// ============ Actions Client ============
export { generateBookingInitialEmail, generateBookingInitialEmail as generateClientBookingConfirmationEmail } from './clientBookingConfirmation';
export { generateClientCancelBookingEmail } from './clientCancelBooking';

// ============ Actions Admin (depuis package partagé) ============
export {
  // Validation (UNIFIÉ)
  generateBookingValidationEmail,
  // Validation (LEGACY - deprecated, use generateBookingValidationEmail)
  generateValidatedEmail,
  generateAdminBookingValidationEmail,
  // Rejection
  generateReservationRejectedEmail,
  generateAdminBookingRejectionEmail,
  // Cancellation
  generateAdminCancelClientBookingEmail,
  generateAdminCancelAdminBookingEmail,
  // Présence/absence
  generateClientPresentEmail,
  generateClientNoShowEmail,
  // Modifications
  generateBookingModifiedEmail,
} from '@coworking-cafe/email';

// ============ Autres templates ============
export { generateReminderEmail } from './reminder';

// ============ Auth templates ============
export { passwordResetEmail } from './passwordReset';
