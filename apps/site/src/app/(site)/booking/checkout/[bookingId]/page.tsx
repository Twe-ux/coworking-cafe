'use client';

import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import {
  CheckoutHeader,
  BookingSummary,
  PaymentInfo,
  CheckoutActions,
  CheckoutLoading,
  CheckoutError,
  useCheckout,
} from '@/components/booking/checkout';

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured');
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface CheckoutPageProps {
  params: {
    bookingId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    booking,
    spaceConfig,
    clientSecret,
    intentType,
    loading,
    error,
  } = useCheckout({
    bookingId: params.bookingId,
    sessionStatus: status,
  });

  const handleBack = (): void => {
    router.back();
  };

  const handleReturnToSpaces = (): void => {
    router.push('/booking');
  };

  // Loading state
  if (status === 'loading' || loading) {
    return <CheckoutLoading />;
  }

  // Error state
  if (error) {
    return <CheckoutError error={error} onReturnToSpaces={handleReturnToSpaces} />;
  }

  // Guard: Ensure booking and clientSecret are loaded
  if (!booking || !clientSecret) {
    return null;
  }

  return (
    <section className="checkout-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <CheckoutHeader onBack={handleBack} />

            <BookingSummary booking={booking} spaceConfig={spaceConfig} />

            <PaymentInfo
              stripePromise={stripePromise}
              bookingId={params.bookingId}
              amount={Math.round(booking.totalPrice * 100)}
              intentType={intentType || 'manual_capture'}
              clientSecret={clientSecret}
            />

            <CheckoutActions />
          </div>
        </div>
      </div>
    </section>
  );
}
