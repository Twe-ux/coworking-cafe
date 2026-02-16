/**
 * ConfirmationSkeleton - Loading skeleton for booking confirmation page
 * Matches the structure of /booking/confirmation/[bookingId] page
 */

export default function ConfirmationSkeleton() {
  return (
    <section className="confirmation-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Skeleton */}
            <div className="mb-4">
              <div className="skeleton" style={{ width: "150px", height: "40px" }} />
            </div>

            {/* Success Message Skeleton */}
            <div className="card border-success mb-4">
              <div className="card-body text-center py-4">
                <div className="skeleton" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 1rem" }} />
                <div className="skeleton" style={{ width: "250px", height: "32px", margin: "0 auto 1rem" }} />
                <div className="skeleton" style={{ width: "300px", height: "20px", margin: "0 auto" }} />
              </div>
            </div>

            {/* Booking Details Summary Card */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="skeleton" style={{ width: "180px", height: "24px" }} />
                  <div className="skeleton" style={{ width: "100px", height: "28px" }} />
                </div>
              </div>
              <div className="card-body">
                {/* Booking details rows */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                    <div className="skeleton" style={{ width: "150px", height: "20px" }} />
                    <div className="skeleton" style={{ width: "200px", height: "20px" }} />
                  </div>
                ))}

                {/* Services section */}
                <hr className="my-3" />
                <div className="skeleton" style={{ width: "180px", height: "24px", marginBottom: "1rem" }} />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="skeleton" style={{ width: "160px", height: "20px" }} />
                    <div className="skeleton" style={{ width: "80px", height: "20px" }} />
                  </div>
                ))}

                {/* Total */}
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-center">
                  <div className="skeleton" style={{ width: "120px", height: "28px" }} />
                  <div className="skeleton" style={{ width: "140px", height: "32px" }} />
                </div>
              </div>
            </div>

            {/* Deposit Info Card */}
            <div className="card border-info mb-4">
              <div className="card-header bg-info bg-opacity-10">
                <div className="skeleton" style={{ width: "200px", height: "24px" }} />
              </div>
              <div className="card-body">
                <div className="skeleton" style={{ width: "100%", height: "80px", marginBottom: "1rem" }} />
                <div className="skeleton" style={{ width: "100%", height: "40px" }} />
              </div>
            </div>

            {/* Important Info Card */}
            <div className="card border-warning mb-4">
              <div className="card-header bg-warning bg-opacity-10">
                <div className="skeleton" style={{ width: "180px", height: "24px" }} />
              </div>
              <div className="card-body">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ width: "100%", height: "60px", marginBottom: "0.75rem" }} />
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="d-flex justify-content-center mb-3">
              <div className="skeleton" style={{ width: "220px", height: "48px" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
