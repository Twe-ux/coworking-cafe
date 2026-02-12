'use client';

import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';

const CheckoutForm = dynamic(
  () => import('@/components/site/booking/CheckoutForm'),
  { ssr: false }
);

interface PaymentInfoProps {
  stripePromise: Promise<Stripe | null> | null;
  bookingId: string;
  amount: number;
  intentType: 'setup_intent' | 'manual_capture';
  clientSecret: string;
}

export default function PaymentInfo({
  stripePromise,
  bookingId,
  amount,
  intentType,
  clientSecret,
}: PaymentInfoProps) {
  const options = {};

  return (
    <div className="booking-card">
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-credit-card text-success" style={{ fontSize: "1.125rem" }}></i>
        <h2 className="h6 mb-0 fw-semibold">Informations de paiement</h2>
      </div>

      {!stripePromise ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Configuration manquante :</strong> La clé publique Stripe n'est pas configurée.
          Veuillez contacter l'administrateur.
        </div>
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            bookingId={bookingId}
            amount={amount}
            intentType={intentType}
            clientSecret={clientSecret}
          />
        </Elements>
      )}
    </div>
  );
}
