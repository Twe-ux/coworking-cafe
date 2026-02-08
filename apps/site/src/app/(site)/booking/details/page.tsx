"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBookingForm } from "@/hooks/useBookingForm";
import type { SPACE_TYPE_INFO } from "@/types/booking";
import DetailsHeader from "@/components/booking/details/DetailsHeader";
import ContactForm from "@/components/booking/details/ContactForm";
import AccountOptions from "@/components/booking/details/AccountOptions";
import AdditionalServicesSection from "@/components/booking/details/AdditionalServicesSection";
import SpecialRequestsSection from "@/components/booking/details/SpecialRequestsSection";
import PriceSummarySection from "@/components/booking/details/PriceSummarySection";
import "../../[id]/client-dashboard.scss";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

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
    removeService,
    updateServiceQuantity,
    selectedCategory,
    setSelectedCategory,
    showTTC,
    setShowTTC,
    convertPrice,
    errors,
    isFormValid,
    validateContactForm,
    loading,
  } = useBookingForm({ loadFromStorage: true, autoSave: true, loadServices: true });

  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Redirection si pas de données
  useEffect(() => {
    if (bookingData) {
      setIsLoading(false);
      return;
    }

    const hasStoredData = typeof window !== "undefined" && sessionStorage.getItem("bookingData");
    const timer = setTimeout(() => {
      if (!bookingData && !hasStoredData) {
        router.push("/booking");
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [bookingData, router]);

  // Auto-scroll
  useEffect(() => {
    if (bookingData && bookingCardRef.current) {
      const scrollTimer = setTimeout(() => {
        const yOffset = -120;
        const element = bookingCardRef.current;
        if (element) {
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [bookingData]);

  const handleContinue = async (): Promise<void> => {
    if (!validateContactForm()) return;

    // Sauvegarder profil si connecté
    if (session?.user && (contactForm.contactPhone || contactForm.contactCompanyName)) {
      try {
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactForm.contactName,
            email: contactForm.contactEmail,
            phone: contactForm.contactPhone,
            companyName: contactForm.contactCompanyName,
          }),
        });
      } catch (error) {
        // Continue anyway
      }
    }

    // Stocker credentials pour auto-login
    if (contactForm.createAccount && contactForm.password) {
      try {
        sessionStorage.setItem(
          "autoLogin",
          JSON.stringify({
            email: contactForm.contactEmail,
            password: contactForm.password,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("[Auto-login] Failed to store credentials:", error);
      }
    }

    router.push("/booking/summary");
  };

  if (isLoading || !bookingData) {
    return (
      <section className="booking-details-page py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-card text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement de vos informations...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const spaceTypeInfo: typeof SPACE_TYPE_INFO = {
    "open-space": { title: "Place", subtitle: "Open-space" },
    "meeting-room-glass": { title: "Salle de réunion", subtitle: "Verrière" },
    "meeting-room-floor": { title: "Salle de réunion", subtitle: "Étage" },
    "event-space": { title: "Événementiel", subtitle: "Grand espace" },
  };

  const spaceInfo = spaceTypeInfo[bookingData.spaceType] || {
    title: "Espace",
    subtitle: "",
  };
  const dateLabel = new Date(bookingData.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = `${bookingData.startTime}-${bookingData.endTime}`;
  const peopleLabel = `${bookingData.numberOfPeople} pers.`;

  return (
    <section className="booking-details-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="booking-card" ref={bookingCardRef}>
              <DetailsHeader
                bookingData={bookingData}
                isLoggedIn={!!session}
                dateLabel={dateLabel}
                timeLabel={timeLabel}
                peopleLabel={peopleLabel}
                spaceSubtitle={spaceInfo.subtitle}
              />

              <div className="mt-4">
                <div className="row mb-4">
                  <ContactForm
                    isLoggedIn={!!session}
                    contactForm={contactForm}
                    updateContactField={updateContactField}
                  />

                  {!session && (
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
                    addService={addService}
                    removeService={removeService}
                    updateServiceQuantity={updateServiceQuantity}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    bookingData={bookingData}
                  />
                )}

                <SpecialRequestsSection
                  specialRequests={contactForm.specialRequests}
                  updateContactField={updateContactField}
                />

                {bookingData && (
                  <PriceSummarySection
                    bookingData={bookingData}
                    selectedServices={selectedServices}
                    showTTC={showTTC}
                    setShowTTC={setShowTTC}
                    convertPrice={convertPrice}
                  />
                )}
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
