"use client";

import BookingProgressBar from "@/components/site/booking/BookingProgressBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../../[id]/client-dashboard.scss";

interface BookingData {
  spaceType: string;
  reservationType: string;
  date: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  duration: string;
  numberOfPeople: number;
  isDailyRate?: boolean;
}

interface AdditionalService {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  dailyPrice?: number;
  priceUnit: "per-person" | "flat-rate";
  vatRate: number;
  icon?: string;
}

interface SelectedService {
  service: AdditionalService;
  quantity: number;
}

const spaceTypeInfo: Record<string, { title: string; subtitle: string }> = {
  "open-space": { title: "Place", subtitle: "Open-space" },
  "meeting-room-glass": { title: "Salle de réunion", subtitle: "Verrière" },
  "meeting-room-floor": { title: "Salle de réunion", subtitle: "Étage" },
  "event-space": { title: "Événementiel", subtitle: "Grand espace" },
};

export default function BookingDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCompanyName, setContactCompanyName] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-save contact data to sessionStorage when fields change
  useEffect(() => {
    if (bookingData) {
      const updatedData = {
        ...bookingData,
        contactName,
        contactEmail,
        contactPhone,
        contactCompanyName,
        specialRequests,
      };
      sessionStorage.setItem("bookingData", JSON.stringify(updatedData));
    }
  }, [contactName, contactEmail, contactPhone, contactCompanyName, specialRequests, bookingData]);
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<
    AdditionalService[]
  >([]);
  const [selectedServices, setSelectedServices] = useState<
    Map<string, SelectedService>
  >(new Map());
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTTC, setShowTTC] = useState(true);

  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Fonction pour convertir un prix entre TTC et HT
  const convertPrice = (
    priceTTC: number,
    vatRate: number,
    toTTC: boolean
  ): number => {
    if (toTTC) {
      return priceTTC; // Already TTC
    } else {
      return priceTTC / (1 + vatRate / 100); // Convert to HT
    }
  };

  useEffect(() => {
    // Load booking data from sessionStorage
    const storedData = sessionStorage.getItem("bookingData");
    if (!storedData) {
      router.push("/booking");
      return;
    }
    const data = JSON.parse(storedData);
    setBookingData(data);

    // Pre-fill with stored contact data if available (from previous step 3 visit)
    if (data.contactName) {
      setContactName(data.contactName);
    } else if (session?.user) {
      setContactName(session.user.name || "");
    }

    if (data.contactEmail) {
      setContactEmail(data.contactEmail);
    } else if (session?.user) {
      setContactEmail(session.user.email || "");
    }

    if (data.contactPhone) {
      setContactPhone(data.contactPhone);
    } else if (session?.user) {
      // Charger le téléphone depuis le profil utilisateur
      fetchUserPhone();
    }

    if (data.contactCompanyName) {
      setContactCompanyName(data.contactCompanyName);
    } else if (session?.user) {
      // Charger la raison sociale depuis le profil utilisateur
      fetchUserProfile();
    }

    if (data.specialRequests) {
      setSpecialRequests(data.specialRequests);
    }

    // Load selected services from sessionStorage if they exist
    const storedServices = sessionStorage.getItem("selectedServices");
    if (storedServices) {
      const servicesArray = JSON.parse(storedServices) as [
        string,
        SelectedService
      ][];
      const servicesMap = new Map<string, SelectedService>(servicesArray);
      setSelectedServices(servicesMap);
    }

    // Fetch available services
    fetchAdditionalServices();
  }, [session]);

  const fetchUserPhone = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (data.user?.phone) {
        setContactPhone(data.user.phone);
      }
    } catch (error) {
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (data.user?.companyName) {
        setContactCompanyName(data.user.companyName);
      }
    } catch (error) {
    }
  };

  const fetchAdditionalServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch("/api/additional-services?isActive=true");
      const data = await response.json();
      if (data.success) {
        setAvailableServices(data.data);

        // Update selected services with fresh data from API (to get vatRate and other new fields)
        if (selectedServices.size > 0) {
          const updatedSelected = new Map(selectedServices);
          selectedServices.forEach((selectedService, serviceId) => {
            const freshService = data.data.find(
              (s: AdditionalService) => s._id === serviceId
            );
            if (freshService) {
              updatedSelected.set(serviceId, {
                service: freshService,
                quantity: selectedService.quantity,
              });
            }
          });
          setSelectedServices(updatedSelected);
          // Update sessionStorage with fresh data
          const servicesArray = Array.from(updatedSelected.entries());
          sessionStorage.setItem(
            "selectedServices",
            JSON.stringify(servicesArray)
          );
        }
      }
    } catch (error) {
    } finally {
      setServicesLoading(false);
    }
  };

  const toggleService = (service: AdditionalService) => {
    const newSelected = new Map(selectedServices);
    if (newSelected.has(service._id)) {
      newSelected.delete(service._id);
    } else {
      newSelected.set(service._id, { service, quantity: 1 });
    }
    setSelectedServices(newSelected);

    // Auto-save to sessionStorage
    const servicesArray = Array.from(newSelected.entries());
    sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));
  };

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    const newSelected = new Map(selectedServices);
    const selected = newSelected.get(serviceId);
    if (selected && quantity >= 1) {
      newSelected.set(serviceId, { ...selected, quantity });
      setSelectedServices(newSelected);

      // Auto-save to sessionStorage
      const servicesArray = Array.from(newSelected.entries());
      sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));
    }
  };

  const isDailyRate = () => {
    if (!bookingData) return false;
    // Utiliser le champ isDailyRate sauvegardé dans les données de réservation
    return bookingData.isDailyRate === true;
  };

  const calculateServicesPrice = () => {
    let total = 0;
    const isDaily = isDailyRate();

    selectedServices.forEach((selected) => {
      const service = selected.service;
      const quantity = selected.quantity;

      // Utiliser le prix forfait jour si disponible et si c'est une réservation à la journée
      const priceToUse =
        isDaily && service.dailyPrice !== undefined
          ? service.dailyPrice
          : service.price;

      if (service.priceUnit === "per-person" && bookingData) {
        total += priceToUse * bookingData.numberOfPeople * quantity;
      } else {
        total += priceToUse * quantity;
      }
    });
    return total;
  };

  const getTotalPrice = () => {
    if (!bookingData) return 0;
    return bookingData.basePrice + calculateServicesPrice();
  };

  // Auto-scroll to center the card when page loads
  useEffect(() => {
    if (bookingData && bookingCardRef.current) {
      const scrollTimer = setTimeout(() => {
        const yOffset = -120; // Offset for header (adjusted down by 40px)
        const element = bookingCardRef.current;
        if (element) {
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [bookingData]);

  const handleContinue = async () => {
    if (!isValidForm()) return;

    setLoading(true);

    // Si utilisateur connecté et téléphone/raison sociale renseigné, sauvegarder dans le profil
    if (session?.user && (contactPhone || contactCompanyName)) {
      try {
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            companyName: contactCompanyName,
          }),
        });
      } catch (error) {        // Continue anyway, don't block the booking flow
      }
    }

    // Update booking data with contact details and account preferences
    const updatedBookingData = {
      ...bookingData,
      contactName,
      contactEmail,
      contactPhone,
      contactCompanyName,
      specialRequests,
      createAccount,
      subscribeNewsletter,
      password: createAccount ? password : undefined,
    };

    sessionStorage.setItem("bookingData", JSON.stringify(updatedBookingData));

    // Save selected services to sessionStorage
    const servicesArray = Array.from(selectedServices.entries());
    sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));

    // Navigate to summary page
    router.push("/booking/summary");
  };

  const isValidForm = () => {
    const basicValid =
      contactName.trim() !== "" &&
      contactEmail.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) &&
      contactPhone.trim() !== "";

    if (!basicValid) return false;

    // If creating account, validate passwords
    if (createAccount) {
      return password.length >= 8 && password === confirmPassword;
    }

    return true;
  };

  if (!bookingData) {
    return null;
  }

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
    <>
      <section className="booking-details-page py-5">
        <div className="container">
          {/* Main Card */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="booking-card" ref={bookingCardRef}>
                {/* Progress Bar */}
                <BookingProgressBar
                  currentStep={3}
                  customLabels={{
                    step1: spaceInfo.subtitle,
                    step2: `${dateLabel} ${timeLabel}\n${peopleLabel}`,
                  }}
                  onStepClick={(step) => {
                    if (step === 1) {
                      router.push("/booking");
                    } else if (step === 2 && bookingData) {
                      router.push(`/booking/${bookingData.spaceType}/new`);
                    }
                  }}
                />

                <hr className="my-3" style={{ opacity: 0.1 }} />

                {/* Navigation and Title */}
                <div className="custom-breadcrumb d-flex justify-content-between align-items-center mb-4">
                  <button
                    onClick={() => router.back()}
                    className="breadcrumb-link"
                  >
                    <i className="bi bi-arrow-left"></i>
                    <span>Retour</span>
                  </button>
                  <div className="d-flex flex-column gap-2 align-items-center">
                    {session && (
                      <h1 className="breadcrumb-current">
                        Informations de contact
                      </h1>
                    )}
                    {!session && (
                      <div className="">
                        <div className="d-flex justify-content-center gap-5 align-items-center w-100">
                          <div className="d-flex align-items-center gap-3">
                            {/* <div
                            className="stat-icon"
                            style={{
                              width: "50px",
                              height: "50px",
                              fontSize: "1.5rem",
                            }}
                          >
                            <i className="bi bi-person-circle"></i>
                          </div> */}
                            <span
                              style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "var(--main-clr)",
                              }}
                            >
                              Déjà client ?
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: "var(--btn-clr)",
                              color: "var(--secondary-clr)",
                              fontWeight: "600",
                              border: "none",
                              padding: "0.5rem 1.25rem",
                              borderRadius: "10px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "var(--main-clr)";
                              e.currentTarget.style.color =
                                "var(--primary-clr)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "var(--btn-clr)";
                              e.currentTarget.style.color =
                                "var(--secondary-clr)";
                            }}
                            onClick={() => {
                              // Save current form data before redirecting
                              if (bookingData) {
                                const updatedData = {
                                  ...bookingData,
                                  contactName,
                                  contactEmail,
                                  contactPhone,
                                  specialRequests,
                                };
                                sessionStorage.setItem(
                                  "bookingData",
                                  JSON.stringify(updatedData)
                                );
                              }
                              router.push(
                                `/auth/login?callbackUrl=/booking/details`
                              );
                            }}
                          >
                            Se connecter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ width: "80px" }}></div>
                </div>

                {/* Contact Information */}
                <div className="mt-4">
                  {/* Already a client? Login section */}

                  {/* Two column layout */}
                  <div className="row mb-4">
                    {/* Left column: Contact info */}
                    <div className={session ? "col-12 mb-4 mb-md-0" : "col-md-6 mb-4 mb-md-0"}>
                      <div className="stat-card h-100">
                        <div className="w-100">
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-person-lines-fill text-success"></i>
                            <h2 className="h6 mb-0 fw-semibold">Coordonnées</h2>
                          </div>

                          {session ? (
                            // Layout en 2 colonnes pour utilisateurs connectés
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  Nom complet <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Votre nom complet"
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  Email <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="vous@email.com"
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="col-md-6 mb-0">
                                <label className="form-label">
                                  Téléphone <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  placeholder="06 XX XX XX XX"
                                  value={contactPhone}
                                  onChange={(e) => setContactPhone(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="col-md-6 mb-0">
                                <label className="form-label">
                                  Raison sociale{" "}
                                  <span className="text-muted">(optionnel)</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nom de votre société"
                                  value={contactCompanyName}
                                  onChange={(e) =>
                                    setContactCompanyName(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            // Layout en 1 colonne pour invités
                            <>
                              <div className="mb-3">
                                <label className="form-label">
                                  Nom complet <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Votre nom complet"
                                  value={contactName}
                                  onChange={(e) => setContactName(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">
                                  Email <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="vous@email.com"
                                  value={contactEmail}
                                  onChange={(e) => setContactEmail(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">
                                  Téléphone <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  placeholder="06 XX XX XX XX"
                                  value={contactPhone}
                                  onChange={(e) => setContactPhone(e.target.value)}
                                  required
                                />
                              </div>

                              <div className="mb-0">
                                <label className="form-label">
                                  Raison sociale{" "}
                                  <span className="text-muted">(optionnel)</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Nom de votre société"
                                  value={contactCompanyName}
                                  onChange={(e) =>
                                    setContactCompanyName(e.target.value)
                                  }
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column: Account options - Only for guests */}
                    {!session && (
                      <div className="col-md-6">
                        <div className="d-flex flex-column h-100">
                          <div className="stat-card flex-grow-1">
                            <div className="w-100">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <i className="bi bi-shield-check text-success"></i>
                                <h2 className="h6 mb-0 fw-semibold">
                                  Informations compte
                                </h2>
                              </div>

                              <div className="form-check custom-checkbox mb-3">
                                <input
                                  type="checkbox"
                                  className="form-check-input "
                                  id="createAccount"
                                  checked={createAccount}
                                  onChange={(e) =>
                                    setCreateAccount(e.target.checked)
                                  }
                                />
                                <label
                                  className="form-check-label mt-1"
                                  htmlFor="createAccount"
                                  style={{
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                    color: "var(--main-clr)",
                                  }}
                                >
                                  Créer un compte client
                                </label>
                              </div>

                              {/* Benefits of creating an account - shown by default */}
                              {!createAccount && (
                                <div
                                  className="mt-3 mb-3 p-3 rounded"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, rgba(242, 211, 129, 0.15) 0%, rgba(65, 121, 114, 0.1) 100%)",
                                    border: "2px solid var(--btn-clr)",
                                  }}
                                >
                                  <h6
                                    className="mb-2"
                                    style={{
                                      fontSize: "0.95rem",
                                      fontWeight: "700",
                                      color: "var(--main-clr)",
                                    }}
                                  >
                                    <i
                                      className="bi bi-star-fill me-2"
                                      style={{ color: "var(--btn-clr)" }}
                                    ></i>
                                    Avantages d'un compte client
                                  </h6>
                                  <ul
                                    className="mb-0 ps-4"
                                    style={{
                                      fontSize: "0.85rem",
                                      lineHeight: "1.8",
                                      color: "var(--gry-clr)",
                                    }}
                                  >
                                    <li>Historique de vos réservations</li>
                                    <li>
                                      Réservations plus rapides (données
                                      pré-remplies)
                                    </li>
                                    <li>
                                      Gestion de vos informations personnelles
                                    </li>
                                    <li>
                                      Suivi en temps réel de vos réservations
                                    </li>
                                    <li>Offres exclusives et promotions</li>
                                  </ul>
                                </div>
                              )}

                              {createAccount && (
                                <div className="ms-4 mb-4">
                                  <div className="mb-4">
                                    <label className="form-label small">
                                      Mot de passe
                                    </label>
                                    <div className="position-relative">
                                      <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Minimum 8 caractères"
                                        value={password}
                                        onChange={(e) =>
                                          setPassword(e.target.value)
                                        }
                                        required={createAccount}
                                        style={{ paddingRight: "2.5rem" }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-link position-absolute"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                          top: "50%",
                                          right: "0.5rem",
                                          transform: "translateY(-50%)",
                                          padding: "0.25rem 0.5rem",
                                          color: "#666",
                                        }}
                                      >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label small">
                                      Confirmer le mot de passe
                                    </label>
                                    <div className="position-relative">
                                      <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Retapez votre mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                          setConfirmPassword(e.target.value)
                                        }
                                        required={createAccount}
                                        style={{ paddingRight: "2.5rem" }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-link position-absolute"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                          top: "50%",
                                          right: "0.5rem",
                                          transform: "translateY(-50%)",
                                          padding: "0.25rem 0.5rem",
                                          color: "#666",
                                        }}
                                      >
                                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                      </button>
                                    </div>
                                    {createAccount &&
                                      password &&
                                      confirmPassword &&
                                      password !== confirmPassword && (
                                        <small className="text-danger">
                                          Les mots de passe ne correspondent pas
                                        </small>
                                      )}
                                  </div>
                                </div>
                              )}

                              <div className="form-check custom-checkbox ">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id="newsletter"
                                  checked={subscribeNewsletter}
                                  onChange={(e) =>
                                    setSubscribeNewsletter(e.target.checked)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="newsletter"
                                  style={{
                                    fontSize: "0.95rem",
                                    fontWeight: "500",
                                    color: "var(--gry-clr)",
                                  }}
                                >
                                  J'accepte de recevoir la{" "}
                                  <strong>newsletter</strong> par email,
                                  conformément à la politique de confidentialité
                                  (désinscription possible à tout moment)
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Services */}
                  {!servicesLoading && availableServices.length > 0 && (
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-plus-circle text-success"></i>
                        <label className="form-label mb-0 fw-semibold">
                          Services supplémentaires{" "}
                          <span className="text-muted fw-normal">
                            (optionnel)
                          </span>
                        </label>
                      </div>

                      {/* Category Buttons */}
                      <div className="d-flex gap-2 flex-wrap mb-3">
                        {["food", "beverage", "equipment", "other"]
                          .map((cat) => ({
                            category: cat,
                            count: availableServices.filter(
                              (s) => s.category === cat
                            ).length,
                          }))
                          .filter((item) => item.count > 0)
                          .map((item) => {
                            const categoryLabels: Record<string, string> = {
                              food: "Nourritures",
                              beverage: "Boissons",
                              equipment: "Équipements",
                              other: "Autres",
                            };
                            return (
                              <button
                                key={item.category}
                                type="button"
                                className="filter-btn"
                                onClick={() =>
                                  setSelectedCategory(item.category)
                                }
                              >
                                {categoryLabels[item.category]} ({item.count})
                              </button>
                            );
                          })}
                      </div>

                      {/* Selected Services Summary */}
                      {selectedServices.size > 0 && (
                        <div className="alert alert-light border">
                          <div
                            className="fw-semibold mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            Services sélectionnés :
                          </div>
                          {Array.from(selectedServices.values()).map(
                            ({ service, quantity }) => {
                              const isDaily = isDailyRate();
                              const displayPrice =
                                isDaily && service.dailyPrice !== undefined
                                  ? service.dailyPrice
                                  : service.price;
                              const totalServicePrice =
                                service.priceUnit === "per-person"
                                  ? displayPrice *
                                    (bookingData?.numberOfPeople || 1) *
                                    quantity
                                  : displayPrice * quantity;

                              return (
                                <div
                                  key={service._id}
                                  className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
                                >
                                  <div className="flex-grow-1">
                                    <div
                                      style={{
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        marginBottom: "0.25rem",
                                      }}
                                    >
                                      {service.name} · {displayPrice.toFixed(2)}
                                      €{" "}
                                      {service.priceUnit === "per-person"
                                        ? "/ pers."
                                        : ""}
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center gap-2">
                                      <div
                                        className="btn-group btn-group-sm"
                                        role="group"
                                      >
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          onClick={() =>
                                            updateServiceQuantity(
                                              service._id,
                                              quantity - 1
                                            )
                                          }
                                          disabled={quantity <= 1}
                                          style={{
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.5rem",
                                          }}
                                        >
                                          <i className="bi bi-dash"></i>
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          disabled
                                          style={{
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.75rem",
                                            minWidth: "40px",
                                          }}
                                        >
                                          {quantity}
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          onClick={() =>
                                            updateServiceQuantity(
                                              service._id,
                                              quantity + 1
                                            )
                                          }
                                          style={{
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.5rem",
                                          }}
                                        >
                                          <i className="bi bi-plus"></i>
                                        </button>
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.875rem",
                                          fontWeight: "700",
                                          color: "#3d6661",
                                          minWidth: "60px",
                                          textAlign: "right",
                                        }}
                                      >
                                        {totalServicePrice.toFixed(2)}€
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-link text-danger p-0"
                                      onClick={() => toggleService(service)}
                                      style={{ fontSize: "0.9rem" }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-chat-left-text text-success"></i>
                      <label className="form-label mb-0 fw-semibold">
                        Demandes particulières{" "}
                        <span className="text-muted fw-normal">
                          (optionnel)
                        </span>
                      </label>
                    </div>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Équipements spéciaux, allergies alimentaires, préférences d'ambiance, etc."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {/* Price Summary */}
                  {bookingData && (
                    <div className="price-breakdown">
                      {/* TTC/HT Switch */}
                      <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                        <span
                          className={`tax-toggle ${showTTC ? "active" : ""}`}
                          onClick={() => setShowTTC(true)}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: showTTC ? "600" : "400",
                          }}
                        >
                          Prix TTC
                        </span>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="taxSwitchDetails"
                            checked={!showTTC}
                            onChange={() => setShowTTC(!showTTC)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                        <span
                          className={`tax-toggle ${!showTTC ? "active" : ""}`}
                          onClick={() => setShowTTC(false)}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: !showTTC ? "600" : "400",
                          }}
                        >
                          Prix HT
                        </span>
                      </div>

                      {/* Header Row */}
                      <div
                        className="price-row"
                        style={{
                          // borderBottom: "2px solid #e0e0e0",
                          paddingBottom: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              color: "#666",
                            }}
                          >
                            Prestation
                          </span>
                          <div className="d-flex gap-4 align-items-center">
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "80px",
                                textAlign: "right",
                              }}
                            >
                              Quantité
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "100px",
                                textAlign: "right",
                              }}
                            >
                              Prix unitaire
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "0.85rem",
                                color: "#666",
                                minWidth: "80px",
                                textAlign: "right",
                              }}
                            >
                              Total
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="price-divider"></div>

                      {/* Base Rate Row */}
                      <div
                        className="price-row"
                        style={{
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <span>Tarif </span>
                          <div className="d-flex gap-4 align-items-center">
                            <span
                              className="text-muted"
                              style={{
                                fontSize: "0.875rem",
                                minWidth: "80px",
                                textAlign: "right",
                              }}
                            >
                              {bookingData.numberOfPeople}{" "}
                              {bookingData.numberOfPeople > 1
                                ? "pers."
                                : "pers."}
                            </span>
                            <span
                              className="text-muted"
                              style={{
                                fontSize: "0.875rem",
                                minWidth: "100px",
                                textAlign: "right",
                              }}
                            >
                              {(() => {
                                const vatRate =
                                  bookingData.reservationType === "hourly"
                                    ? 10
                                    : 20;
                                const unitPrice = convertPrice(
                                  bookingData.basePrice /
                                    bookingData.numberOfPeople,
                                  vatRate,
                                  showTTC
                                );
                                return unitPrice.toFixed(2);
                              })()}
                              €
                            </span>
                            <span
                              className="fw-semibold"
                              style={{ minWidth: "80px", textAlign: "right" }}
                            >
                              {(() => {
                                const vatRate =
                                  bookingData.reservationType === "hourly"
                                    ? 10
                                    : 20;
                                const totalPrice = convertPrice(
                                  bookingData.basePrice,
                                  vatRate,
                                  showTTC
                                );
                                return totalPrice.toFixed(2);
                              })()}
                              €
                            </span>
                          </div>
                        </div>
                      </div>
                      {Array.from(selectedServices.values()).map(
                        ({ service, quantity }) => {
                          const isDaily = isDailyRate();
                          const displayPriceTTC =
                            isDaily && service.dailyPrice !== undefined
                              ? service.dailyPrice
                              : service.price;
                          const vatRate = service.vatRate || 20; // Default to 20% if not specified

                          const displayPrice = convertPrice(
                            displayPriceTTC,
                            vatRate,
                            showTTC
                          );
                          const totalServicePrice =
                            service.priceUnit === "per-person"
                              ? displayPrice *
                                (bookingData?.numberOfPeople || 1) *
                                quantity
                              : displayPrice * quantity;

                          return (
                            <div
                              key={service._id}
                              className="price-row"
                              style={{
                                paddingTop: "0.5rem",
                                paddingBottom: "0.5rem",
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span>
                                  {service.name}{" "}
                                  {service.priceUnit === "per-person"
                                    ? "(par pers.)"
                                    : ""}
                                </span>
                                <div className="d-flex gap-4 align-items-center">
                                  <span
                                    className="text-muted"
                                    style={{
                                      fontSize: "0.875rem",
                                      minWidth: "80px",
                                      textAlign: "right",
                                    }}
                                  >
                                    {quantity}
                                  </span>
                                  <span
                                    className="text-muted"
                                    style={{
                                      fontSize: "0.875rem",
                                      minWidth: "100px",
                                      textAlign: "right",
                                    }}
                                  >
                                    {displayPrice.toFixed(2)}€
                                  </span>
                                  <span
                                    className="fw-semibold"
                                    style={{
                                      minWidth: "80px",
                                      textAlign: "right",
                                    }}
                                  >
                                    {totalServicePrice.toFixed(2)}€
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}

                      <div className="price-row total-row">
                        <span>Total {showTTC ? "TTC" : "HT"}</span>
                        <span className="total-price">
                          {(() => {
                            // Calculate total TTC
                            const totalTTC = getTotalPrice();

                            if (showTTC) {
                              return totalTTC.toFixed(2);
                            } else {
                              // Convert to HT
                              const baseVatRate =
                                bookingData.reservationType === "hourly"
                                  ? 10
                                  : 20;
                              const baseHT = convertPrice(
                                bookingData.basePrice,
                                baseVatRate,
                                false
                              );

                              let servicesHT = 0;
                              selectedServices.forEach((selected) => {
                                const service = selected.service;
                                const quantity = selected.quantity;
                                const isDaily = isDailyRate();
                                const displayPriceTTC =
                                  isDaily && service.dailyPrice !== undefined
                                    ? service.dailyPrice
                                    : service.price;
                                const vatRate = service.vatRate || 20;
                                const displayPriceHT = convertPrice(
                                  displayPriceTTC,
                                  vatRate,
                                  false
                                );

                                if (service.priceUnit === "per-person") {
                                  servicesHT +=
                                    displayPriceHT *
                                    (bookingData?.numberOfPeople || 1) *
                                    quantity;
                                } else {
                                  servicesHT += displayPriceHT * quantity;
                                }
                              });

                              return (baseHT + servicesHT).toFixed(2);
                            }
                          })()}
                          €
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <div className="actions-section mt-4">
                  <button
                    className="btn btn-success btn-lg w-100"
                    onClick={handleContinue}
                    disabled={!isValidForm() || loading}
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

                  {!isValidForm() && (
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

      {/* Services Modal */}
      {selectedCategory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {
                    {
                      food: "Nourritures",
                      beverage: "Boissons",
                      equipment: "Équipements",
                      other: "Autres",
                    }[selectedCategory]
                  }
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCategory(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="services-list">
                  {availableServices
                    .filter((s) => s.category === selectedCategory)
                    .map((service) => {
                      const isSelected = selectedServices.has(service._id);
                      const selected = selectedServices.get(service._id);
                      const isDaily = isDailyRate();
                      const displayPrice =
                        isDaily && service.dailyPrice !== undefined
                          ? service.dailyPrice
                          : service.price;

                      const totalServicePrice =
                        isSelected && selected
                          ? service.priceUnit === "per-person"
                            ? displayPrice *
                              (bookingData?.numberOfPeople || 1) *
                              selected.quantity
                            : displayPrice * selected.quantity
                          : displayPrice;

                      return (
                        <div
                          key={service._id}
                          className={`service-item mb-2 p-3 border rounded ${
                            isSelected ? "border-success bg-light" : ""
                          }`}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleService(service)}
                              id={`service-modal-${service._id}`}
                              className="form-check-input mt-1"
                              style={{ cursor: "pointer", flexShrink: 0 }}
                            />
                            <label
                              htmlFor={`service-modal-${service._id}`}
                              className="flex-grow-1"
                              style={{ cursor: "pointer" }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <div
                                    className="fw-semibold mb-1"
                                    style={{ fontSize: "0.9375rem" }}
                                  >
                                    {service.name}
                                  </div>
                                  {service.description && (
                                    <div
                                      className="text-muted"
                                      style={{ fontSize: "0.8125rem" }}
                                    >
                                      {service.description}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="text-nowrap ms-3"
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: "700",
                                  }}
                                >
                                  {totalServicePrice.toFixed(2)}€
                                  {isDaily &&
                                    service.dailyPrice !== undefined && (
                                      <div
                                        className="text-success"
                                        style={{
                                          fontSize: "0.7rem",
                                          fontWeight: "400",
                                        }}
                                      >
                                        (Prix jour)
                                      </div>
                                    )}
                                </div>
                              </div>
                            </label>
                          </div>

                          {isSelected && selected && (
                            <div className="d-flex align-items-center mt-2 ms-5">
                              <label
                                className="me-2"
                                style={{ fontSize: "0.85rem" }}
                              >
                                Quantité:
                              </label>
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  onClick={() =>
                                    updateServiceQuantity(
                                      service._id,
                                      selected.quantity - 1
                                    )
                                  }
                                  disabled={selected.quantity <= 1}
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  disabled
                                >
                                  {selected.quantity}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  onClick={() =>
                                    updateServiceQuantity(
                                      service._id,
                                      selected.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCategory(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
