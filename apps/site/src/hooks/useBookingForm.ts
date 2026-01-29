// ============================================================================
// useBookingForm Hook
// ============================================================================
// Custom hook to manage booking form state and logic
// Extracts state management from booking page components
// Created: 2026-01-29
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type {
  BookingData,
  BookingFormData,
  ContactFormData,
  ValidationErrors,
  AdditionalService,
  SelectedService,
  SelectedServicesMap,
  PriceBreakdown,
  ServicePriceDetail,
  AdditionalServicesResponse,
  CalculatePriceResponse,
} from "@/types/booking";

// ============================================================================
// Hook Options
// ============================================================================

interface UseBookingFormOptions {
  /**
   * Charger automatiquement les données depuis sessionStorage
   */
  loadFromStorage?: boolean;

  /**
   * Sauvegarder automatiquement les données dans sessionStorage
   */
  autoSave?: boolean;

  /**
   * Charger automatiquement les services additionnels
   */
  loadServices?: boolean;
}

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseBookingFormReturn {
  // Booking Data
  bookingData: BookingData | null;
  setBookingData: (data: BookingData | null) => void;

  // Contact Form
  contactForm: ContactFormData;
  updateContactField: <K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) => void;

  // Password visibility
  showPassword: boolean;
  toggleShowPassword: () => void;
  showConfirmPassword: boolean;
  toggleShowConfirmPassword: () => void;

  // Services
  availableServices: AdditionalService[];
  selectedServices: SelectedServicesMap;
  servicesLoading: boolean;
  addService: (service: AdditionalService, quantity?: number) => void;
  removeService: (serviceId: string) => void;
  updateServiceQuantity: (serviceId: string, quantity: number) => void;
  clearServices: () => void;

  // Service categories
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  getServicesByCategory: (category: string) => AdditionalService[];
  getAllCategories: () => string[];

  // Price calculation
  showTTC: boolean;
  setShowTTC: (show: boolean) => void;
  priceBreakdown: PriceBreakdown | null;
  calculatePrice: () => Promise<void>;
  convertPrice: (priceTTC: number, vatRate: number, toTTC: boolean) => number;

  // Validation
  errors: ValidationErrors;
  validateContactForm: () => boolean;
  validatePasswordMatch: () => boolean;
  clearErrors: () => void;

  // Form submission
  loading: boolean;
  submitBooking: () => Promise<{ success: boolean; bookingId?: string; error?: string }>;

  // Storage management
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBookingForm(
  options: UseBookingFormOptions = {}
): UseBookingFormReturn {
  const {
    loadFromStorage: autoLoadFromStorage = true,
    autoSave = true,
    loadServices: autoLoadServices = true,
  } = options;

  const { data: session } = useSession();

  // ========================================
  // State: Booking Data
  // ========================================

  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // ========================================
  // State: Contact Form
  // ========================================

  const [contactForm, setContactForm] = useState<ContactFormData>({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactCompanyName: "",
    specialRequests: "",
    createAccount: false,
    subscribeNewsletter: false,
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ========================================
  // State: Services
  // ========================================

  const [availableServices, setAvailableServices] = useState<AdditionalService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServicesMap>(new Map());
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ========================================
  // State: Price
  // ========================================

  const [showTTC, setShowTTC] = useState(true);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  // ========================================
  // State: Validation & Loading
  // ========================================

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  // ========================================
  // Effect: Load from session on mount
  // ========================================

  useEffect(() => {
    if (autoLoadFromStorage) {
      loadFromStorageInternal();
    }

    if (autoLoadServices) {
      fetchAdditionalServices();
    }
  }, []); // Only run once on mount

  // ========================================
  // Effect: Pre-fill contact info from session
  // ========================================

  useEffect(() => {
    if (session?.user && !contactForm.contactName) {
      updateContactField("contactName", session.user.name || "");
      updateContactField("contactEmail", session.user.email || "");

      // Fetch additional user data (phone, company)
      fetchUserProfile();
    }
  }, [session]);

  // ========================================
  // Effect: Auto-save to sessionStorage
  // ========================================

  useEffect(() => {
    if (autoSave && bookingData) {
      saveToStorageInternal();
    }
  }, [bookingData, contactForm, selectedServices]);

  // ========================================
  // Storage Functions
  // ========================================

  const saveToStorageInternal = useCallback(() => {
    if (!bookingData) return;

    const dataToSave: BookingData = {
      ...bookingData,
      ...contactForm,
    };

    sessionStorage.setItem("bookingData", JSON.stringify(dataToSave));

    // Save selected services
    const servicesArray = Array.from(selectedServices.entries());
    sessionStorage.setItem("selectedServices", JSON.stringify(servicesArray));
  }, [bookingData, contactForm, selectedServices]);

  const loadFromStorageInternal = useCallback(() => {
    const storedData = sessionStorage.getItem("bookingData");
    if (storedData) {
      const data: BookingData = JSON.parse(storedData);
      setBookingData(data);

      // Restore contact form data
      if (data.contactName) setContactForm((prev) => ({ ...prev, contactName: data.contactName! }));
      if (data.contactEmail) setContactForm((prev) => ({ ...prev, contactEmail: data.contactEmail! }));
      if (data.contactPhone) setContactForm((prev) => ({ ...prev, contactPhone: data.contactPhone! }));
      if (data.contactCompanyName) setContactForm((prev) => ({ ...prev, contactCompanyName: data.contactCompanyName! }));
      if (data.specialRequests) setContactForm((prev) => ({ ...prev, specialRequests: data.specialRequests! }));
      if (data.createAccount !== undefined) setContactForm((prev) => ({ ...prev, createAccount: data.createAccount! }));
      if (data.subscribeNewsletter !== undefined) setContactForm((prev) => ({ ...prev, subscribeNewsletter: data.subscribeNewsletter! }));
    }

    // Load selected services
    const storedServices = sessionStorage.getItem("selectedServices");
    if (storedServices) {
      const servicesArray = JSON.parse(storedServices) as [string, SelectedService][];
      setSelectedServices(new Map(servicesArray));
    }
  }, []);

  const clearStorageInternal = useCallback(() => {
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("selectedServices");
    setBookingData(null);
    setSelectedServices(new Map());
    setContactForm({
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactCompanyName: "",
      specialRequests: "",
      createAccount: false,
      subscribeNewsletter: false,
      password: "",
      confirmPassword: "",
    });
  }, []);

  // ========================================
  // API Calls: Fetch Services
  // ========================================

  const fetchAdditionalServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const response = await fetch("/api/additional-services?isActive=true");
      const data: AdditionalServicesResponse = await response.json();

      if (data.success && data.data) {
        setAvailableServices(data.data);

        // Update selected services with fresh data (for vatRate and other fields)
        if (selectedServices.size > 0) {
          const updatedSelected = new Map(selectedServices);
          selectedServices.forEach((selectedService, serviceId) => {
            const freshService = data.data!.find((s) => s._id === serviceId);
            if (freshService) {
              updatedSelected.set(serviceId, {
                service: freshService,
                quantity: selectedService.quantity,
              });
            }
          });
          setSelectedServices(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Error fetching additional services:", error);
    } finally {
      setServicesLoading(false);
    }
  }, [selectedServices]);

  // ========================================
  // API Calls: Fetch User Profile
  // ========================================

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (data.user) {
        if (data.user.phone) {
          updateContactField("contactPhone", data.user.phone);
        }
        if (data.user.companyName) {
          updateContactField("contactCompanyName", data.user.companyName);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // ========================================
  // Contact Form Management
  // ========================================

  const updateContactField = useCallback(
    <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
      setContactForm((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // ========================================
  // Services Management
  // ========================================

  const addService = useCallback(
    (service: AdditionalService, quantity: number = 1) => {
      setSelectedServices((prev) => {
        const updated = new Map(prev);
        updated.set(service._id, { service, quantity });
        return updated;
      });
    },
    []
  );

  const removeService = useCallback((serviceId: string) => {
    setSelectedServices((prev) => {
      const updated = new Map(prev);
      updated.delete(serviceId);
      return updated;
    });
  }, []);

  const updateServiceQuantity = useCallback((serviceId: string, quantity: number) => {
    setSelectedServices((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(serviceId);

      if (existing) {
        if (quantity <= 0) {
          updated.delete(serviceId);
        } else {
          updated.set(serviceId, { ...existing, quantity });
        }
      }

      return updated;
    });
  }, []);

  const clearServices = useCallback(() => {
    setSelectedServices(new Map());
  }, []);

  // ========================================
  // Services Helpers
  // ========================================

  const getServicesByCategory = useCallback(
    (category: string): AdditionalService[] => {
      return availableServices.filter((service) => service.category === category);
    },
    [availableServices]
  );

  const getAllCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    availableServices.forEach((service) => {
      categories.add(service.category);
    });
    return Array.from(categories);
  }, [availableServices]);

  // ========================================
  // Price Calculation
  // ========================================

  const convertPrice = useCallback(
    (priceTTC: number, vatRate: number, toTTC: boolean): number => {
      if (toTTC) {
        return priceTTC; // Already TTC
      } else {
        return priceTTC / (1 + vatRate / 100); // Convert to HT
      }
    },
    []
  );

  const calculatePrice = useCallback(async () => {
    if (!bookingData) return;

    try {
      const selectedServicesArray = Array.from(selectedServices.values()).map((s) => ({
        serviceId: s.service._id,
        quantity: s.quantity,
      }));

      const response = await fetch("/api/booking/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceType: bookingData.spaceType,
          reservationType: bookingData.reservationType,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          numberOfPeople: bookingData.numberOfPeople,
          selectedServices: selectedServicesArray,
        }),
      });

      const data: CalculatePriceResponse = await response.json();

      if (data.success && data.data) {
        setPriceBreakdown(data.data.breakdown);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  }, [bookingData, selectedServices]);

  // ========================================
  // Validation
  // ========================================

  const validateContactForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!contactForm.contactName.trim()) {
      newErrors.contactName = "Le nom est requis";
    }

    if (!contactForm.contactEmail.trim()) {
      newErrors.contactEmail = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.contactEmail)) {
      newErrors.contactEmail = "Email invalide";
    }

    if (!contactForm.contactPhone.trim()) {
      newErrors.contactPhone = "Le téléphone est requis";
    }

    if (contactForm.createAccount) {
      if (!contactForm.password || contactForm.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }

      if (contactForm.password !== contactForm.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [contactForm]);

  const validatePasswordMatch = useCallback((): boolean => {
    if (contactForm.createAccount && contactForm.password !== contactForm.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Les mots de passe ne correspondent pas",
      }));
      return false;
    }
    return true;
  }, [contactForm]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // ========================================
  // Form Submission
  // ========================================

  const submitBooking = useCallback(async (): Promise<{
    success: boolean;
    bookingId?: string;
    error?: string;
  }> => {
    if (!validateContactForm()) {
      return { success: false, error: "Veuillez corriger les erreurs du formulaire" };
    }

    if (!bookingData) {
      return { success: false, error: "Données de réservation manquantes" };
    }

    setLoading(true);

    try {
      const selectedServicesArray = Array.from(selectedServices.values()).map((s) => ({
        serviceId: s.service._id,
        quantity: s.quantity,
      }));

      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          ...contactForm,
          selectedServices: selectedServicesArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, bookingId: data.data?.booking?._id };
      } else {
        return { success: false, error: data.error || "Erreur lors de la création de la réservation" };
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      return { success: false, error: "Erreur serveur" };
    } finally {
      setLoading(false);
    }
  }, [bookingData, contactForm, selectedServices, validateContactForm]);

  // ========================================
  // Return Hook Interface
  // ========================================

  return {
    // Booking Data
    bookingData,
    setBookingData,

    // Contact Form
    contactForm,
    updateContactField,

    // Password visibility
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,

    // Services
    availableServices,
    selectedServices,
    servicesLoading,
    addService,
    removeService,
    updateServiceQuantity,
    clearServices,

    // Service categories
    selectedCategory,
    setSelectedCategory,
    getServicesByCategory,
    getAllCategories,

    // Price calculation
    showTTC,
    setShowTTC,
    priceBreakdown,
    calculatePrice,
    convertPrice,

    // Validation
    errors,
    validateContactForm,
    validatePasswordMatch,
    clearErrors,

    // Form submission
    loading,
    submitBooking,

    // Storage management
    saveToStorage: saveToStorageInternal,
    loadFromStorage: loadFromStorageInternal,
    clearStorage: clearStorageInternal,
  };
}
