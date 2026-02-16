"use client";

import { useBookingForm } from "@/hooks/useBookingForm";
import { useBookingDetailsPage } from "@/hooks/booking";
import DetailsHeader from "@/components/booking/details/DetailsHeader";
import ContactForm from "@/components/booking/details/ContactForm";
import AccountOptions from "@/components/booking/details/AccountOptions";
import AdditionalServicesSection from "@/components/booking/details/AdditionalServicesSection";
import SpecialRequestsSection from "@/components/booking/details/SpecialRequestsSection";
import PriceSummarySection from "@/components/booking/details/PriceSummarySection";
import { BookingDetailsSkeleton } from "@/components/ui/skeletons";
import "../../[id]/client-dashboard.scss";

export default function BookingDetailsPage() {
  const {
    bookingData,
    contactForm,
    updateContactField,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    availableServices,
    selectedServices,
    servicesLoading,
    addService,
    updateServiceQuantity,
    selectedCategory,
    setSelectedCategory,
    showTTC,
    setShowTTC,
    convertPrice,
    isFormValid,
    validateContactForm,
    loading,
  } = useBookingForm({ loadFromStorage: true, autoSave: true, loadServices: true });

  const {
    isPageLoading,
    bookingCardRef,
    isLoggedIn,
    labels,
    handleContinue,
  } = useBookingDetailsPage({
    bookingData,
    contactForm,
    validateContactForm,
    loading,
  });

  if (isPageLoading || !bookingData || !labels) {
    return (
      <section className="booking-details-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <BookingDetailsSkeleton />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="booking-details-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="booking-card" ref={bookingCardRef}>
              <DetailsHeader
                bookingData={bookingData}
                isLoggedIn={isLoggedIn}
                dateLabel={labels.dateLabel}
                timeLabel={labels.timeLabel}
                peopleLabel={labels.peopleLabel}
                spaceSubtitle={labels.spaceInfo.subtitle}
              />

              <div className="mt-4">
                <div className="row mb-4">
                  <ContactForm
                    isLoggedIn={isLoggedIn}
                    contactForm={contactForm}
                    updateContactField={updateContactField}
                  />

                  {!isLoggedIn && (
                    <AccountOptions
                      contactForm={contactForm}
                      updateContactField={updateContactField}
                      showPassword={showPassword}
                      toggleShowPassword={toggleShowPassword}
                      showConfirmPassword={showConfirmPassword}
                      toggleShowConfirmPassword={toggleShowConfirmPassword}
                    />
                  )}
                </div>

                {!servicesLoading && availableServices.length > 0 && (
                  <AdditionalServicesSection
                    availableServices={availableServices}
                    selectedServices={selectedServices}
                    servicesLoading={servicesLoading}
                    onToggleService={addService}
                    onUpdateQuantity={updateServiceQuantity}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    bookingData={bookingData}
                  />
                )}

                <SpecialRequestsSection
                  value={contactForm.specialRequests || ""}
                  onChange={(value) => updateContactField("specialRequests", value)}
                />

                <PriceSummarySection
                  bookingData={bookingData}
                  selectedServices={selectedServices}
                  showTTC={showTTC}
                  setShowTTC={setShowTTC}
                  convertPrice={convertPrice}
                />
              </div>

              <div className="actions-section mt-4">
                <button
                  className="btn btn-success btn-lg w-100"
                  onClick={handleContinue}
                  disabled={!isFormValid || loading}
                  style={{
                    padding: "0.875rem 1.5rem",
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Chargement...
                    </>
                  ) : (
                    <>
                      Voir le récapitulatif
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>

                {!isFormValid && (
                  <p className="text-danger text-center mt-3 mb-0 small">
                    Veuillez remplir tous les champs obligatoires
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
