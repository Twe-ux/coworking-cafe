import BookingProgressBar from "@/components/site/booking/BookingProgressBar";

interface ConfirmationHeaderProps {
  onBackClick: () => void;
}

export default function ConfirmationHeader({ onBackClick }: ConfirmationHeaderProps) {
  return (
    <div className="booking-card mb-4">
      <BookingProgressBar currentStep={4} />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      <div
        className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded"
        style={{
          backgroundColor: "#e8eae6",
          minHeight: "50px",
        }}
      >
        <button
          onClick={onBackClick}
          className="breadcrumb-link"
          style={{
            background: "none",
            border: "none",
            color: "#4a5568",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <h1
          className="m-0"
          style={{
            fontSize: "0.95rem",
            fontWeight: "600",
            color: "#4a5568",
          }}
        >
          Confirmation
        </h1>
        <div style={{ width: "70px" }}></div>
      </div>
    </div>
  );
}
