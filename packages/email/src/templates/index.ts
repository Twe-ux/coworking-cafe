/**
 * Templates email : Export centralisé
 *
 * Nomenclature claire pour identifier rapidement l'origine des actions:
 * - admin* : Actions initiées par l'administrateur
 */

// ============ Actions de l'admin ============
export { generateValidatedEmail } from './adminValidation';
export { generateReservationRejectedEmail } from './adminRejection';

// ============ Réservations Admin (sans empreinte bancaire) ============
export { generateAdminBookingValidationEmail } from './adminBookingValidation';
export { generateAdminBookingRejectionEmail } from './adminBookingRejection';
export { generateAdminBookingCancellationEmail } from './adminBookingCancellation';

// ============ Réservations en attente ============
export { generatePendingWithDepositEmail } from './pendingWithDeposit';

// ============ Confirmations de présence ============
export { generateClientPresentEmail } from './clientPresent';
export { generateClientNoShowEmail } from './clientNoShow';

// ============ Modifications ============
export { generateBookingModifiedEmail } from './bookingModified';

// ============ Helpers ============
export { getSpaceDisplayName } from './helpers';
