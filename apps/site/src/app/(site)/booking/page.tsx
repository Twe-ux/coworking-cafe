// ============================================================================
// BOOKING PAGE - SPACE SELECTION
// ============================================================================
// Page de sélection d'espace de réservation (étape 1)
// Refactored: 2026-02-08
// ============================================================================

"use client";

import PageTitle from "@/components/site/PageTitle";
import {
  SelectionHeader,
  SpaceGrid,
  useSpaceSelection,
} from "@/components/booking/selection";

export default function BookingPage() {
  const { spaces, loading, showTTC, setShowTTC, convertPrice } =
    useSpaceSelection();

  if (loading) {
    return (
      <>
        <PageTitle title="Réserver un espace" />
        <section className="booking-selection py-5">
          <div className="container">
            <div className="text-center">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Réserver un espace" />

      <section className="booking-selection py__90">
        <div className="container">
          <SelectionHeader showTTC={showTTC} onToggleTTC={setShowTTC} />
          <SpaceGrid
            spaces={spaces}
            showTTC={showTTC}
            onConvertPrice={convertPrice}
          />
        </div>
      </section>
    </>
  );
}
