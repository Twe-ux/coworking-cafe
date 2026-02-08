"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingState from "@/components/booking/success/LoadingState";
import SuccessState from "@/components/booking/success/SuccessState";
import ErrorState from "@/components/booking/success/ErrorState";
import { useBookingPolling } from "@/components/booking/success/useBookingPolling";

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    status,
    message,
    subMessage,
    initializePolling,
    retryPolling,
  } = useBookingPolling();

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    const setupIntentId = searchParams.get("setup_intent");
    const redirectStatus = searchParams.get("redirect_status");

    initializePolling(paymentIntentId, setupIntentId, redirectStatus);
  }, []);

  const handleRetry = () => {
    const paymentIntentId = searchParams.get("payment_intent");
    const setupIntentId = searchParams.get("setup_intent");
    retryPolling(paymentIntentId, setupIntentId);
  };

  const handleBack = () => {
    router.push("/booking");
  };

  return (
    <section
      className="confirmation-page py-5"
      style={{ minHeight: "100vh", paddingBottom: "200px" }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="booking-card text-center">
              {status === "loading" && <LoadingState message={message} />}

              {status === "success" && (
                <SuccessState message={message} subMessage={subMessage} />
              )}

              {status === "error" && (
                <ErrorState
                  message={message}
                  paymentIntentId={searchParams.get("payment_intent")}
                  onRetry={handleRetry}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
