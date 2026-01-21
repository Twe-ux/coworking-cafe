/**
 * Confidentiality Page - Redirect to politique-confidentialite
 * Redirige vers la page française de politique de confidentialité
 */

import { redirect } from 'next/navigation';

export default function ConfidentialityPage() {
  redirect('/politique-confidentialite');
}
