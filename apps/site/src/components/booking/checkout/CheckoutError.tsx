'use client';

interface CheckoutErrorProps {
  error: string;
  onReturnToSpaces: () => void;
}

export default function CheckoutError({ error, onReturnToSpaces }: CheckoutErrorProps) {
  return (
    <section className="checkout-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
            <div className="text-center mt-4">
              <button
                onClick={onReturnToSpaces}
                className="btn btn-primary"
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
