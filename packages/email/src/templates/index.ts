/**
 * Templates email : Export centralisé
 *
 * Nomenclature claire pour identifier rapidement l'origine des actions:
 * - admin* : Actions initiées par l'administrateur
 */

// ============ Actions de l'admin ============
export { generateValidatedEmail } from './adminValidation';
export { generateReservationRejectedEmail } from './adminRejection';

// ============ Helpers ============
export { getSpaceDisplayName } from './helpers';
