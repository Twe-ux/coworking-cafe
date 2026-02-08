import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { useRouter } from "next/navigation";
import type { BookingData } from "@/types/booking";

interface DetailsHeaderProps {
  bookingData: BookingData;
  isLoggedIn: boolean;
  dateLabel: string;
  timeLabel: string;
  peopleLabel: string;
  spaceSubtitle: string;
}

export default function DetailsHeader({
  bookingData,
  isLoggedIn,
  dateLabel,
  timeLabel,
  peopleLabel,
  spaceSubtitle,
}: DetailsHeaderProps) {
  const router = useRouter();

  return (
    <>
      <BookingProgressBar
        currentStep={3}
        customLabels={{
          step1: spaceSubtitle,
          step2: `${dateLabel} ${timeLabel}\n${peopleLabel}`,
        }}
        onStepClick={(step) => {
          if (step === 1) {
            router.push("/booking");
          } else if (step === 2) {
            router.push(`/booking/${bookingData.spaceType}/new`);
          }
        }}
      />

      <hr className="my-3" style={{ opacity: 0.1 }} />

      <div className="custom-breadcrumb d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => router.back()} className="breadcrumb-link">
          <i className="bi bi-arrow-left"></i>
          <span>Retour</span>
        </button>
        <div className="d-flex flex-column gap-2 align-items-center">
          {isLoggedIn ? (
            <h1 className="breadcrumb-current">Informations de contact</h1>
          ) : (
            <div className="d-flex justify-content-center gap-5 align-items-center w-100">
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--main-clr)" }}>
                Déjà client ?
              </span>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: "var(--btn-clr)",
                  color: "var(--secondary-clr)",
                  fontWeight: "600",
                  border: "none",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "10px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--main-clr)";
                  e.currentTarget.style.color = "var(--primary-clr)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--btn-clr)";
                  e.currentTarget.style.color = "var(--secondary-clr)";
                }}
                onClick={() => router.push("/auth/login?callbackUrl=/booking/details")}
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
        <div style={{ width: "80px" }}></div>
      </div>
    </>
  );
}
