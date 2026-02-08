'use client';

export default function CheckoutLoading() {
  return (
    <section className="checkout-page py-5">
      <div className="container">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Préparation du paiement...</p>
        </div>
      </div>
    </section>
  );
}
