'use client';

import { useState, FormEvent } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  bookingId: string;
  amount: number;
  intentType: 'setup_intent' | 'manual_capture';
  clientSecret: string;
}

export default function CheckoutForm({ bookingId, amount, intentType, clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Erreur de chargement du formulaire');
      setProcessing(false);
      return;
    }

    try {
      if (intentType === 'setup_intent') {
        // For setup intent (bookings >7 days): save card for later
        const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
          // Client secret will be passed via the confirmCardSetup method
          // We need to fetch it from the API
          await fetchClientSecret(),
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (setupError) {
          setErrorMessage(setupError.message || 'Une erreur est survenue lors de l\'enregistrement de la carte');
          setProcessing(false);
        } else if (setupIntent && setupIntent.status === 'succeeded') {
          // Setup succeeded, redirect to confirmation page
          router.push(`/booking/confirmation/${bookingId}`);
        } else {
          setErrorMessage('L\'enregistrement de la carte n\'a pas pu être confirmé');
          setProcessing(false);
        }
      } else {
        // For manual capture payment intent (bookings ≤7 days): authorization hold
        const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
          await fetchClientSecret(),
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (paymentError) {
          setErrorMessage(paymentError.message || 'Une erreur est survenue lors du paiement');
          setProcessing(false);
        } else if (paymentIntent) {
          // Check payment intent status - handle both succeeded and requires_capture
          if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
            // Payment succeeded or authorized (manual capture), redirect to confirmation page
            router.push(`/booking/confirmation/${bookingId}`);
          } else {
            setErrorMessage('Le paiement n\'a pas pu être confirmé');
            setProcessing(false);
          }
        } else {
          setErrorMessage('Le paiement n\'a pas pu être confirmé');
          setProcessing(false);
        }
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors du paiement');
      setProcessing(false);
    }
  };

  const fetchClientSecret = async () => {
    return clientSecret;
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1a1a1a',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#df1b41',
              },
            },
          }}
        />
      </div>

      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-success btn-lg"
          disabled={!stripe || processing}
          style={{
            padding: "0.875rem 1.5rem",
            fontSize: "0.9375rem",
            fontWeight: "600"
          }}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Traitement du paiement...
            </>
          ) : (
            <>
              <i className="bi bi-lock me-2"></i>
              Payer {(amount / 100).toFixed(2)}€
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-3">
        <small className="text-muted" style={{ fontSize: "0.8125rem" }}>
          <i className="bi bi-shield-check me-1"></i>
          Paiement sécurisé par Stripe
        </small>
      </div>
    </form>
  );
}
