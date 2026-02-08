interface SuccessStateProps {
  message: string;
  subMessage: string | null;
}

export default function SuccessState({ message, subMessage }: SuccessStateProps) {
  return (
    <>
      <div className="success-icon mb-3">
        <i
          className="bi bi-check-circle-fill text-success"
          style={{ fontSize: "4rem" }}
        ></i>
      </div>
      <h2
        className="mb-3"
        style={{ fontSize: "1.5rem", fontWeight: "700" }}
      >
        {message}
      </h2>
      {subMessage && (
        <p
          className="text-muted mb-0"
          style={{ fontSize: "0.9375rem" }}
        >
          {subMessage}
        </p>
      )}

      <style jsx>{`
        .success-icon {
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
