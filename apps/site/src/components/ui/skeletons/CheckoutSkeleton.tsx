/**
 * CheckoutSkeleton - Loading skeleton for checkout page
 * Matches the structure of /booking/checkout/[bookingId] page
 */

export default function CheckoutSkeleton() {
  return (
    <section className="checkout-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Skeleton */}
            <div className="mb-4">
              <div className="skeleton" style={{ width: "100px", height: "40px" }} />
            </div>

            {/* Booking Summary Card */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="skeleton" style={{ width: "200px", height: "24px" }} />
              </div>
              <div className="card-body">
                {/* Booking details */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                    <div className="skeleton" style={{ width: "140px", height: "20px" }} />
                    <div className="skeleton" style={{ width: "180px", height: "20px" }} />
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

            {/* Payment Info Card */}
            <div className="card mb-4 border-success">
              <div className="card-header bg-light">
                <div className="skeleton" style={{ width: "180px", height: "24px" }} />
              </div>
              <div className="card-body">
                {/* Stripe Elements placeholder */}
                <div className="mb-3">
                  <div className="skeleton" style={{ width: "150px", height: "20px", marginBottom: "0.5rem" }} />
                  <div className="skeleton" style={{ width: "100%", height: "44px" }} />
                </div>

                {/* Payment method info */}
                <div className="skeleton" style={{ width: "100%", height: "60px" }} />
              </div>
            </div>

            {/* Checkout Actions */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-center">
              <div className="skeleton" style={{ width: "150px", height: "48px" }} />
              <div className="skeleton" style={{ width: "200px", height: "48px" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
