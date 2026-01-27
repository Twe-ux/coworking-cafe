/**
 * Templates email : Export centralisé
 *
 * Nomenclature claire pour identifier rapidement l'origine des actions:
 * - client* : Actions initiées par le client
 * - admin* : Actions initiées par l'administrateur (depuis package partagé)
 * - noShow* : Cas de non-présentation
 */

// ============ Actions du client ============
export { generateBookingInitialEmail } from './clientBookingConfirmation';
export { generateCancellationEmail } from './clientCancellation';

// ============ Actions de l'admin (depuis package partagé) ============
export { generateValidatedEmail, generateReservationRejectedEmail } from '@coworking-cafe/email';
export { generateReservationCancelledEmail } from './adminCancellation';

// ============ Cas spécial: No-show ============
export { generateDepositCapturedEmail } from './noShowPenalty';

// ============ Autres templates ============
export { generateConfirmationEmail } from './confirmation';
export { generateDepositHoldEmail } from './depositHold';
export { generateDepositReleasedEmail } from './depositReleased';
export { generateCardSavedEmail } from './cardSaved';
export { generateReminderEmail } from './reminder';

// ============ Auth templates ============
export { passwordResetEmail } from './passwordReset';
