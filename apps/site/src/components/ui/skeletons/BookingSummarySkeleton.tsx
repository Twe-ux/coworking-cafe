/**
 * BookingSummarySkeleton - Loading skeleton for booking summary page
 * Matches the structure of /booking/summary page
 */

export default function BookingSummarySkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="mb-4">
        {/* Back button */}
        <div className="skeleton" style={{ width: "100px", height: "40px", marginBottom: "1rem" }} />

        {/* Progress bar */}
        <div className="skeleton" style={{ width: "100%", height: "8px", marginBottom: "1rem" }} />

        {/* Space title + Booking info */}
        <div className="skeleton" style={{ width: "250px", height: "32px", margin: "0 auto 1rem" }} />
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <div className="skeleton" style={{ width: "120px", height: "24px" }} />
          <div className="skeleton" style={{ width: "120px", height: "24px" }} />
          <div className="skeleton" style={{ width: "120px", height: "24px" }} />
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column - Summary + Price Breakdown */}
        <div className="col-12 col-lg-7 d-flex flex-column" style={{ gap: "1rem" }}>
          {/* Booking Summary Card */}
          <div className="card">
            <div className="card-header">
              <div className="skeleton" style={{ width: "200px", height: "24px" }} />
            </div>
            <div className="card-body">
              {/* Summary items */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                  <div className="skeleton" style={{ width: "140px", height: "20px" }} />
                  <div className="skeleton" style={{ width: "180px", height: "20px" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown Table */}
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="skeleton" style={{ width: "180px", height: "24px" }} />
                <div className="skeleton" style={{ width: "100px", height: "32px" }} />
              </div>
            </div>
            <div className="card-body">
              {/* Price rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="skeleton" style={{ width: "200px", height: "20px" }} />
                  <div className="skeleton" style={{ width: "80px", height: "20px" }} />
                </div>
              ))}
              <hr className="my-3" />
              {/* Total */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="skeleton" style={{ width: "120px", height: "28px" }} />
                <div className="skeleton" style={{ width: "120px", height: "32px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment */}
        <div className="col-12 col-lg-5 d-flex flex-column" style={{ gap: "1rem" }}>
          {/* Payment Section */}
          <div className="card border-success">
            <div className="card-header bg-light">
              <div className="skeleton" style={{ width: "150px", height: "24px" }} />
            </div>
            <div className="card-body">
              {/* Deposit info */}
              <div className="mb-3">
                <div className="skeleton" style={{ width: "100%", height: "60px", marginBottom: "1rem" }} />
              </div>

              {/* Payment form placeholder */}
              <div className="mb-3">
                <div className="skeleton" style={{ width: "120px", height: "20px", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ width: "100%", height: "44px", marginBottom: "1rem" }} />
              </div>

              {/* Terms checkbox */}
              <div className="d-flex align-items-start gap-2 mb-3">
                <div className="skeleton" style={{ width: "20px", height: "20px" }} />
                <div className="skeleton" style={{ width: "calc(100% - 30px)", height: "40px" }} />
              </div>

              {/* Cancellation policy */}
              <div className="mb-3">
                <div className="skeleton" style={{ width: "100%", height: "80px" }} />
              </div>

              {/* Pay button */}
              <div className="skeleton" style={{ width: "100%", height: "48px" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
