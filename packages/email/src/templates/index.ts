/**
 * Templates email : Export centralisé
 *
 * Nomenclature claire pour identifier rapidement l'origine des actions:
 * - adminXxx : Actions initiées par l'administrateur
 * - clientXxx : Actions initiées par le client
 */

// ============ Actions Admin - Validation (UNIFIÉ) ============
export { generateBookingValidationEmail, type BookingValidationEmailData, type BookingValidationVariant } from './bookingValidation';

// ============ Actions Admin - Validation (LEGACY - deprecated, use generateBookingValidationEmail) ============
export { generateValidatedEmail, type ValidatedEmailData } from './adminValidation';
export { generateAdminBookingValidationEmail } from './adminBookingValidation';

// ============ Actions Admin - Rejection ============
export { generateReservationRejectedEmail, type ReservationRejectedData } from './adminRejection';
export { generateAdminBookingRejectionEmail } from './adminBookingRejection';

// ============ Actions Admin - Cancellation ============
export { generateAdminCancelClientBookingEmail, type AdminCancelClientBookingData } from './adminCancelClientBooking';
export { generateAdminCancelAdminBookingEmail, type AdminCancelAdminBookingData } from './adminCancelAdminBooking';

// ============ Confirmations de présence ============
export { generateClientPresentEmail } from './clientPresent';
export { generateClientNoShowEmail, type ClientNoShowEmailData } from './clientNoShow';

// ============ Modifications ============
export { generateBookingModifiedEmail } from './bookingModified';

// ============ Helpers ============
export { getSpaceDisplayName } from './helpers';
