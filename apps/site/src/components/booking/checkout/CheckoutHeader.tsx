'use client';

import BookingProgressBar from '@/components/site/booking/BookingProgressBar';

interface CheckoutHeaderProps {
  onBack: () => void;
}

export default function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
  return (
    <div className="booking-card mb-4">
      <BookingProgressBar currentStep={4} />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      <div className="custom-breadcrumb d-flex justify-content-between align-items-center mb-4">
        <button
          onClick={onBack}
          className="breadcrumb-link"
        >
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <h1 className="breadcrumb-current m-0">
          Paiement sécurisé
        </h1>
        <div style={{ width: "80px" }}></div>
      </div>
    </div>
  );
}
