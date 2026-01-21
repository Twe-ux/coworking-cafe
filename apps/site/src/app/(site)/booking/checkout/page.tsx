/**
 * Booking Checkout Page - apps/site
 * Step 3: Paiement Stripe avec Elements
 */

'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Charger Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
}
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface PaymentFormProps {
  clientSecret: string;
  bookingId: string;
}

function PaymentForm({ clientSecret, bookingId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError('Élément de carte non trouvé');
        return;
      }

      const { error: submitError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue');
      } else {
        // Rediriger vers page success
        router.push(`/booking/success?id=${bookingId}`);
      }
    } catch (err) {
      setError('Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-form__header">
        <h2 className="checkout-form__title">Informations de paiement</h2>
        <p className="checkout-form__subtitle">
          Entrez vos informations de carte bancaire
        </p>
      </div>

      <div className="checkout-form__card">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                '::placeholder': {
                  color: '#999',
                },
              },
              invalid: {
                color: '#dc3545',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {error && (
        <div className="checkout-form__error">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn--primary btn--lg"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <span className="spinner spinner--sm" />
            Traitement en cours...
          </>
        ) : (
          <>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
            </svg>
            Payer maintenant
          </>
        )}
      </button>

      <div className="checkout-form__security">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
        </svg>
        <div className="checkout-form__security-text">
          <strong>Paiement 100% sécurisé</strong>
          <p>Vos données sont cryptées et sécurisées par Stripe</p>
        </div>
      </div>
    </form>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');
  const bookingId = searchParams.get('bookingId');

  if (!clientSecret || !bookingId) {
    return (
      <main className="page-checkout">
        <div className="page-checkout__error">
          <div className="alert alert--error">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <p>Données de paiement invalides</p>
          </div>
          <button onClick={() => router.push('/booking')} className="btn btn--outline">
            Retour à la réservation
          </button>
        </div>
      </main>
    );
  }

  if (!stripePromise) {
    return (
      <main className="page-checkout">
        <div className="page-checkout__error">
          <div className="alert alert--error">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <p>Configuration Stripe manquante</p>
          </div>
        </div>
      </main>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <main className="page-checkout">
      <div className="page-checkout__container">
        <div className="page-checkout__header">
          <button
            onClick={() => router.back()}
            className="page-checkout__back"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Retour
          </button>
          <h1 className="page-checkout__title">Paiement sécurisé</h1>
        </div>

        <div className="page-checkout__content">
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm clientSecret={clientSecret} bookingId={bookingId} />
          </Elements>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="page-checkout">
          <div className="page-checkout__loading">
            <div className="spinner" />
            <p>Chargement...</p>
          </div>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
