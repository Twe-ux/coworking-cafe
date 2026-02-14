import BookingProgressBar from "@/components/site/booking/BookingProgressBar";

interface ConfirmationHeaderProps {
  onBackClick: () => void;
}

export default function ConfirmationHeader({ onBackClick }: ConfirmationHeaderProps) {
  return (
    <div className="booking-card mb-4">
      <BookingProgressBar currentStep={4} />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      <div className="custom-breadcrumb d-flex justify-content-between align-items-center">
        <button onClick={onBackClick} className="breadcrumb-link">
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <h1 className="breadcrumb-current m-0">Confirmation</h1>
        <div style={{ width: "70px" }}></div>
      </div>
    </div>
  );
}
