"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookingConfirmation } from "@/hooks/useBookingConfirmation";
import {
  getStatusBadge,
  getPaymentStatusBadge,
  calculateDepositAmount,
} from "@/utils/booking-helpers";
import ConfirmationHeader from "@/components/booking/confirmation/ConfirmationHeader";
import ConfirmationSuccess from "@/components/booking/confirmation/ConfirmationSuccess";
import BookingDetailsSummary from "@/components/booking/confirmation/BookingDetailsSummary";
import DepositInfo from "@/components/booking/confirmation/DepositInfo";
import ImportantInfo from "@/components/booking/confirmation/ImportantInfo";

export default function ConfirmationPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { booking, spaceConfig, loading, error } = useBookingConfirmation(
    params.bookingId,
    status
  );

  if (status === "loading" || loading) {
    return (
      <section className="confirmation-page py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="confirmation-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push("/booking")}
                  className="btn btn-success"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Retour aux espaces
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return null;
  }

  const statusBadge = getStatusBadge(booking.status);
  const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
  const isPaid = booking.paymentStatus === "paid";
  const isConfirmed = isPaid || !booking.requiresPayment;
  const depositAmount = calculateDepositAmount(booking, spaceConfig);

  return (
    <>
      <section className="confirmation-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <ConfirmationHeader onBackClick={() => router.push("/booking")} />

              {isConfirmed && <ConfirmationSuccess isPaid={isPaid} />}

              <BookingDetailsSummary
                booking={booking}
                spaceConfig={spaceConfig}
                statusBadge={statusBadge}
                paymentBadge={paymentBadge}
              />

              {depositAmount && booking.requiresPayment && (
                <DepositInfo depositAmount={depositAmount} booking={booking} />
              )}

              <ImportantInfo />

              {session?.user && (
                <div className="d-flex justify-content-center mb-3">
                  <Link
                    href={`/${session.user.username}/reservations`}
                    className="btn btn-success"
                    style={{
                      padding: "0.625rem 1.25rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                    }}
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    Voir mes réservations
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: "5rem" }}></div>
    </>
  );
}
