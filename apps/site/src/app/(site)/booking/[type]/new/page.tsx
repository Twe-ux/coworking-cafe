"use client";

import BookingProgressBar from "../../../../../components/site/booking/BookingProgressBar";
import CustomDatePicker from "../../../../../components/site/booking/CustomDatePicker";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../../../[id]/client-dashboard.scss";

// Map URL slugs to database spaceType values
const spaceTypeMapping: Record<string, string> = {
  "open-space": "open-space",
  "meeting-room-glass": "salle-verriere",
  "meeting-room-floor": "salle-etage",
  "event-space": "evenementiel",
};

const spaceTypeInfo: Record<string, { title: string; subtitle: string }> = {
  "open-space": { title: "Place", subtitle: "Open-space" },
  "meeting-room-glass": { title: "Salle de réunion", subtitle: "Verrière" },
  "meeting-room-floor": { title: "Salle de réunion", subtitle: "Étage" },
  "event-space": { title: "Événementiel", subtitle: "Grand espace" },
};

type ReservationType = "hourly" | "daily" | "weekly" | "monthly";

interface SpaceConfiguration {
  spaceType: string;
  name: string;
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    perPerson: boolean;
    maxHoursBeforeDaily?: number;
  };
  availableReservationTypes: {
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  requiresQuote: boolean;
  minCapacity: number;
  maxCapacity: number;
}

interface GlobalHours {
  defaultHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  };
  exceptionalClosures: Array<{
    date: string;
    reason?: string;
    startTime?: string;
    endTime?: string;
    isFullDay: boolean;
  }>;
}

const allReservationTypes = [
  { id: "hourly" as ReservationType, label: "À l'heure", icon: "bi-clock" },
  {
    id: "daily" as ReservationType,
    label: "À la journée",
    icon: "bi-calendar-day",
  },
  {
    id: "weekly" as ReservationType,
    label: "À la semaine",
    icon: "bi-calendar-week",
  },
  {
    id: "monthly" as ReservationType,
    label: "Au mois",
    icon: "bi-calendar-month",
  },
];

// Full time slots
const allTimeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

export default function BookingDatePage({
  params,
}: {
  params: { type: string };
}) {
  const router = useRouter();
  const spaceInfo = spaceTypeInfo[params.type] || {
    title: "Espace",
    subtitle: "",
  };
  const dbSpaceType = spaceTypeMapping[params.type] || params.type;

  const [reservationType, setReservationType] =
    useState<ReservationType>("hourly");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>(""); // For weekly/monthly
  const [arrivalTime, setArrivalTime] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [duration, setDuration] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfiguration | null>(
    null,
  );
  const [globalHours, setGlobalHours] = useState<GlobalHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [appliedDailyRate, setAppliedDailyRate] = useState(false);

  // Accordion states
  const [dateSectionOpen, setDateSectionOpen] = useState(true); // Open by default
  const [dateSectionClosing, setDateSectionClosing] = useState(false);
  const [timeSectionOpen, setTimeSectionOpen] = useState(false);
  const [showTTC, setShowTTC] = useState(true);

  // Refs for auto-scroll
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const priceSectionRef = useRef<HTMLDivElement>(null);

  // Convert price between TTC and HT
  // Hourly rate (1h-4h30) = 10% VAT, Daily rate = 20% VAT
  const getDisplayPrice = () => {
    if (!showTTC) {
      // Calculate HT based on reservation type
      const vatRate =
        appliedDailyRate ||
        reservationType === "daily" ||
        reservationType === "weekly" ||
        reservationType === "monthly"
          ? 1.2
          : 1.1;
      return calculatedPrice / vatRate;
    }
    return calculatedPrice;
  };
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Load existing booking data on mount to restore previous selections
  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        // Only restore if it's the same space type
        if (data.spaceType === params.type) {
          if (data.reservationType) setReservationType(data.reservationType);
          if (data.date) setSelectedDate(data.date);
          if (data.endDate) setEndDate(data.endDate);
          if (data.startTime) {
            if (data.reservationType === "hourly") {
              setStartTime(data.startTime);
            } else if (data.reservationType === "daily") {
              setArrivalTime(data.startTime);
            }
          }
          if (data.endTime) setEndTime(data.endTime);
          if (data.numberOfPeople) setNumberOfPeople(data.numberOfPeople);
          if (data.basePrice) setCalculatedPrice(data.basePrice);
          if (data.duration) setDuration(data.duration);
        }
      } catch (error) {}
    }
  }, [params.type]);

  // Filter available reservation types based on configuration
  const availableReservationTypes = spaceConfig?.availableReservationTypes
    ? allReservationTypes.filter((reservType) => {
        return spaceConfig.availableReservationTypes?.[
          reservType.id as keyof typeof spaceConfig.availableReservationTypes
        ];
      })
    : allReservationTypes;

  // Get available time slots with current time filtering
  const getAvailableStartTimeSlots = (): string[] => {
    if (!globalHours || !selectedDate) {
      return allTimeSlots;
    }

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);
    const isToday = selectedDateObj.getTime() === today.getTime();

    const dayOfWeek = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (
      !dayHours ||
      !dayHours.isOpen ||
      !dayHours.openTime ||
      !dayHours.closeTime
    ) {
      return allTimeSlots;
    }

    // Calculate the latest start time (1 hour before closing for hourly reservations)
    const [closeHour, closeMinute] = dayHours.closeTime!.split(":").map(Number);
    const latestStartMinutes = closeHour * 60 + closeMinute - 60; // 1 hour before closing
    const latestStartHour = Math.floor(latestStartMinutes / 60);
    const latestStartMinuteRemainder = latestStartMinutes % 60;
    const latestStartTime = `${String(latestStartHour).padStart(
      2,
      "0",
    )}:${String(latestStartMinuteRemainder).padStart(2, "0")}`;

    let filteredSlots = allTimeSlots.filter((slot) => {
      // For hourly reservations, start time must be at least 1 hour before closing
      // For daily/weekly/monthly, we can start up until closing time
      const maxTime =
        reservationType === "hourly" ? latestStartTime : dayHours.closeTime!;
      return slot >= dayHours.openTime! && slot <= maxTime;
    });

    // If daily mode, exclude last 5 hours (but include the 5h cutoff time itself)
    if (reservationType === "daily" && dayHours.closeTime) {
      const [closeHour, closeMinute] = dayHours.closeTime
        .split(":")
        .map(Number);
      const closeMinutes = closeHour * 60 + closeMinute;
      const cutoffMinutes = closeMinutes - 5 * 60; // 5 hours before closing

      filteredSlots = filteredSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.split(":").map(Number);
        const slotMinutes = slotHour * 60 + slotMinute;
        return slotMinutes <= cutoffMinutes;
      });
    }

    // If today, filter out past hours + 1h margin
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const minTime = `${String(currentHour + 1).padStart(2, "0")}:${String(
        Math.ceil(currentMinute / 30) * 30,
      ).padStart(2, "0")}`;

      filteredSlots = filteredSlots.filter((slot) => slot >= minTime);
    }

    return filteredSlots;
  };

  const getAvailableEndTimeSlots = () => {
    if (!globalHours || !selectedDate) {
      return allTimeSlots;
    }

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateObj.setHours(0, 0, 0, 0);

    const dayOfWeek = selectedDateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (
      !dayHours ||
      !dayHours.isOpen ||
      !dayHours.openTime ||
      !dayHours.closeTime
    ) {
      return allTimeSlots;
    }

    // Calculate the earliest end time (1 hour after opening)
    const [openHour, openMinute] = dayHours.openTime.split(":").map(Number);
    const earliestEndMinutes = openHour * 60 + openMinute + 60; // 1 hour after opening
    const earliestEndHour = Math.floor(earliestEndMinutes / 60);
    const earliestEndMinuteRemainder = earliestEndMinutes % 60;
    const earliestEndTime = `${String(earliestEndHour).padStart(
      2,
      "0",
    )}:${String(earliestEndMinuteRemainder).padStart(2, "0")}`;

    // For end time: from opening+1h to closing time
    const filteredSlots = allTimeSlots.filter((slot) => {
      return slot >= earliestEndTime && slot <= dayHours.closeTime!;
    });

    return filteredSlots;
  };

  const availableStartTimeSlots = getAvailableStartTimeSlots();
  const availableEndTimeSlots = getAvailableEndTimeSlots();

  // Calculate end date for weekly/monthly
  useEffect(() => {
    if (!selectedDate) return;

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);

    if (reservationType === "weekly") {
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // 7 days total (including start day)
      const endDateStr = `${end.getFullYear()}-${String(
        end.getMonth() + 1,
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      setEndDate(endDateStr);
    } else if (reservationType === "monthly") {
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(end.getDate() + 29); // 30 days total
      const endDateStr = `${end.getFullYear()}-${String(
        end.getMonth() + 1,
      ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      setEndDate(endDateStr);
    }
  }, [selectedDate, reservationType]);

  // Fetch global hours configuration
  useEffect(() => {
    const fetchGlobalHours = async () => {
      try {
        const response = await fetch("/api/global-hours");
        const data = await response.json();

        if (data.success) {
          setGlobalHours(data.data);
        }
      } catch (error) {}
    };

    fetchGlobalHours();
  }, []);

  // Fetch space configuration
  useEffect(() => {
    const fetchSpaceConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/space-configurations/${dbSpaceType}`,
        );
        const data = await response.json();

        if (data.success) {
          setSpaceConfig(data.data);

          if (data.data.requiresQuote) {
            router.push("/contact");
            return;
          }
        } else {
          setError("Configuration de l'espace non disponible");
        }
      } catch (err) {
        setError("Erreur lors du chargement de la configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceConfig();
  }, [dbSpaceType]);

  // Auto-scroll to card top when reservation type is selected
  useEffect(() => {
    if (reservationType && bookingCardRef.current) {
      const scrollTimer = setTimeout(() => {
        const yOffset = -100; // Offset for header
        const element = bookingCardRef.current;
        const y =
          element!.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [reservationType]);

  // Auto-scroll when time section opens
  useEffect(() => {
    if (timeSectionOpen && timeSectionRef.current) {
      const scrollTimer = setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 600); // Wait for animation to complete

      return () => clearTimeout(scrollTimer);
    }
  }, [timeSectionOpen]);

  // Auto-scroll when price appears
  useEffect(() => {
    if (calculatedPrice > 0 && priceSectionRef.current && timeSectionOpen) {
      const scrollTimer = setTimeout(() => {
        priceSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 300);

      return () => clearTimeout(scrollTimer);
    }
  }, [calculatedPrice, timeSectionOpen]);

  // Manage accordion sections
  useEffect(() => {
    // Close date section and open time section when date is selected
    // Only trigger if we have both a date AND a reservation type, and date section is currently open
    if (
      selectedDate &&
      reservationType &&
      dateSectionOpen &&
      !dateSectionClosing
    ) {
      if (reservationType === "hourly" || reservationType === "daily") {
        // Start closing animation
        setDateSectionClosing(true);

        // Wait for closing animation to complete, then close and open time section
        const closeTimer = setTimeout(() => {
          setDateSectionOpen(false);
          setDateSectionClosing(false);
        }, 400); // Match animation duration

        // Open time section after a small delay
        const openTimer = setTimeout(() => {
          setTimeSectionOpen(true);
        }, 500);

        return () => {
          clearTimeout(closeTimer);
          clearTimeout(openTimer);
        };
      } else {
        // For weekly/monthly, close date section with animation
        setDateSectionClosing(true);
        const timer = setTimeout(() => {
          setDateSectionOpen(false);
          setDateSectionClosing(false);
          setTimeSectionOpen(false);
        }, 400);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedDate, reservationType]);

  // Calculate price based on reservation type
  useEffect(() => {
    if (!selectedDate || !spaceConfig) return;

    if (reservationType === "hourly") {
      if (startTime && endTime) {
        calculatePriceAndDuration();
      }
    } else if (reservationType === "daily") {
      if (arrivalTime && globalHours) {
        calculateDailyPrice();
      }
    } else if (reservationType === "weekly") {
      const basePrice = spaceConfig.pricing.weekly;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice,
      );
      setDuration("7 jours");
    } else if (reservationType === "monthly") {
      const basePrice = spaceConfig.pricing.monthly;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice,
      );
      setDuration("30 jours");
    }
  }, [
    startTime,
    endTime,
    arrivalTime,
    selectedDate,
    reservationType,
    spaceConfig,
    globalHours,
    numberOfPeople,
  ]);

  const calculateDailyPrice = async () => {
    if (!spaceConfig || !globalHours || !selectedDate) return;

    // Parse date manually to avoid timezone issues
    const [year, month, day] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayHours = globalHours.defaultHours?.[dayOfWeek];

    if (dayHours && dayHours.closeTime && arrivalTime) {
      setDuration(`${arrivalTime} - ${dayHours.closeTime}`);
      setEndTime(dayHours.closeTime);
      setStartTime(arrivalTime);

      // Use API to calculate price with tier support
      try {
        const startDateTime = new Date(
          year,
          month - 1,
          day,
          parseInt(arrivalTime.split(":")[0]),
          parseInt(arrivalTime.split(":")[1]),
        ).toISOString();
        const endDateTime = new Date(
          year,
          month - 1,
          day,
          parseInt(dayHours.closeTime.split(":")[0]),
          parseInt(dayHours.closeTime.split(":")[1]),
        ).toISOString();

        const response = await fetch("/api/calculate-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            spaceType: dbSpaceType,
            reservationType: "daily",
            startTime: startDateTime,
            endTime: endDateTime,
            numberOfPeople: numberOfPeople,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setCalculatedPrice(data.data.totalPrice);
        }
      } catch (err) {
        // Fallback to simple calculation
        const basePrice = spaceConfig.pricing.daily;
        setCalculatedPrice(
          spaceConfig.pricing.perPerson
            ? basePrice * numberOfPeople
            : basePrice,
        );
      }
    }
  };

  const calculatePriceAndDuration = async () => {
    if (!startTime || !endTime || !spaceConfig) return;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      setDuration("");
      setCalculatedPrice(0);
      return;
    }

    const durationMinutes = endMinutes - startMinutes;
    const durationHours = durationMinutes / 60;

    // Format duration
    const hours = Math.floor(durationHours);
    const minutes = durationMinutes % 60;
    setDuration(
      hours > 0
        ? `${hours}H${
            minutes > 0 ? " " + minutes.toString().padStart(2, "0") : ""
          }`.trim()
        : `${minutes}min`,
    );

    // RÈGLE DES 5H: Si >= 5h, appliquer tarif journée
    if (durationHours >= 5 && spaceConfig.pricing.daily > 0) {
      const basePrice = spaceConfig.pricing.daily;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice,
      );
      setAppliedDailyRate(true);
      return;
    }

    setAppliedDailyRate(false);

    // Calculate price using API
    try {
      // Parse date manually and combine with time to avoid timezone issues
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startDateTime = new Date(
        year,
        month - 1,
        day,
        startHour,
        startMinute,
      ).toISOString();
      const endDateTime = new Date(
        year,
        month - 1,
        day,
        endHour,
        endMinute,
      ).toISOString();

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spaceType: dbSpaceType,
          reservationType,
          startTime: startDateTime,
          endTime: endDateTime,
          numberOfPeople: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCalculatedPrice(data.data.totalPrice);
      }
    } catch (err) {
      const basePrice = durationHours * spaceConfig.pricing.hourly;
      setCalculatedPrice(
        spaceConfig.pricing.perPerson ? basePrice * numberOfPeople : basePrice,
      );
    }
  };

  // Function to automatically set end time to +1 hour after start time
  const handleStartTimeSelection = (time: string) => {
    setStartTime(time);

    // Calculate end time (+1 hour)
    const [hour, minute] = time.split(":").map(Number);
    const endHour = hour + 1;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`;
    setEndTime(endTime);
  };

  const handleContinue = () => {
    // Load existing booking data to preserve contact info and other data
    const existingData = sessionStorage.getItem("bookingData");
    const existingBookingData = existingData ? JSON.parse(existingData) : {};

    let bookingData: any = {
      ...existingBookingData, // Preserve existing data (contact, services, etc.)
      spaceType: params.type,
      reservationType,
      date: selectedDate,
      basePrice: calculatedPrice,
      duration,
      numberOfPeople,
      isDailyRate: reservationType === "daily" || appliedDailyRate, // Nouveau champ
    };

    if (reservationType === "hourly" || reservationType === "daily") {
      bookingData.startTime =
        reservationType === "hourly" ? startTime : arrivalTime;
      bookingData.endTime = endTime;
    } else if (reservationType === "weekly" || reservationType === "monthly") {
      bookingData.startTime = "09:00";
      bookingData.endTime = "18:00";
      bookingData.endDate = endDate;
    }

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    router.push("/booking/details");
  };

  const isValidSelection = () => {
    if (
      !selectedDate ||
      !calculatedPrice ||
      calculatedPrice <= 0 ||
      !numberOfPeople
    )
      return false;

    if (reservationType === "hourly") {
      return startTime && endTime;
    } else if (reservationType === "daily") {
      return arrivalTime;
    } else if (reservationType === "weekly" || reservationType === "monthly") {
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <>
        <section className="booking-date-page py-3">
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

  if (error) {
    return (
      <>
        <section className="booking-date-page py-3">
          <div className="container">
            <div className="alert alert-danger text-center">{error}</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="booking-date-page py-3">
        <div className="container">
          {/* Main Card */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div
                className="booking-card"
                style={{ padding: "1.25rem" }}
                ref={bookingCardRef}
              >
                {/* Progress Bar */}
                <BookingProgressBar
                  currentStep={2}
                  customLabels={{
                    step1: spaceInfo.subtitle,
                    step2: selectedDate
                      ? (() => {
                          // Parse date manually to avoid timezone issues
                          const [year, month, day] = selectedDate
                            .split("-")
                            .map(Number);
                          const dateObj = new Date(year, month - 1, day);
                          const dateLabel = dateObj.toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          );
                          let timeLabel = "";
                          if (
                            reservationType === "hourly" &&
                            startTime &&
                            endTime
                          ) {
                            timeLabel = `${startTime}-${endTime}`;
                          } else if (
                            reservationType === "daily" &&
                            arrivalTime
                          ) {
                            timeLabel = arrivalTime;
                          }
                          const peopleLabel =
                            calculatedPrice > 0
                              ? `${numberOfPeople} pers.`
                              : "";
                          return timeLabel && peopleLabel
                            ? `${dateLabel} ${timeLabel}\n${peopleLabel}`
                            : timeLabel
                              ? `${dateLabel}\n${timeLabel}`
                              : dateLabel;
                        })()
                      : "Date",
                  }}
                  onStepClick={(step) => {
                    if (step === 1) {
                      router.push("/booking");
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
                  <h1 className="breadcrumb-current m-0">
                    Quand voulez-vous venir ?
                  </h1>
                  <div style={{ width: "80px" }}></div>
                </div>

                {/* Reservation Type - Always Visible */}
                <div className="booking-section">
                  <div className="booking-section-content">
                    <label
                      className="form-label fw-semibold mb-2"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Type de réservation
                    </label>
                    <div className="reservation-types-grid">
                      {availableReservationTypes.map((type) => (
                        <button
                          key={type.id}
                          className={`reservation-type-btn ${
                            reservationType === type.id ? "active" : ""
                          }`}
                          style={{
                            padding: "1rem 0.75rem",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => {
                            setReservationType(type.id);
                            setStartTime("");
                            setEndTime("");
                            setArrivalTime("");
                          }}
                        >
                          <i
                            className={type.icon}
                            style={{ fontSize: "1.25rem" }}
                          ></i>
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Selection Section */}
                {reservationType && (
                  <div className="booking-section">
                    <div
                      className={`booking-section-header ${
                        dateSectionOpen ? "active" : ""
                      }`}
                      onClick={() => setDateSectionOpen(!dateSectionOpen)}
                    >
                      <div className="section-header-left">
                        <i className="bi bi-calendar"></i>
                        <span>Date</span>
                      </div>
                      <div
                        className={`section-header-right ${
                          dateSectionOpen ? "expanded" : ""
                        }`}
                      >
                        {!dateSectionOpen && selectedDate && (
                          <span className="section-value">
                            {(() => {
                              const [year, month, day] = selectedDate
                                .split("-")
                                .map(Number);
                              const dateObj = new Date(year, month - 1, day);
                              return dateObj.toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                              });
                            })()}
                          </span>
                        )}
                        <i className="bi bi-chevron-down"></i>
                      </div>
                    </div>
                    {(dateSectionOpen || dateSectionClosing) && (
                      <div
                        className={`booking-section-content ${
                          dateSectionClosing ? "closing" : ""
                        }`}
                      >
                        <CustomDatePicker
                          selectedDate={selectedDate}
                          onDateChange={setSelectedDate}
                          minDate={(() => {
                            const today = new Date();
                            return `${today.getFullYear()}-${String(
                              today.getMonth() + 1,
                            ).padStart(2, "0")}-${String(
                              today.getDate(),
                            ).padStart(2, "0")}`;
                          })()}
                          maxDate={(() => {
                            // 10 semaines = 70 jours
                            const maxDate = new Date();
                            maxDate.setDate(maxDate.getDate() + 70);
                            return `${maxDate.getFullYear()}-${String(
                              maxDate.getMonth() + 1,
                            ).padStart(2, "0")}-${String(
                              maxDate.getDate(),
                            ).padStart(2, "0")}`;
                          })()}
                          reservationType={reservationType}
                          endDate={endDate}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Time Selection Section */}
                {(reservationType === "hourly" ||
                  reservationType === "daily") &&
                  selectedDate && (
                    <div className="booking-section" ref={timeSectionRef}>
                      <div
                        className={`booking-section-header ${
                          timeSectionOpen ? "active" : ""
                        }`}
                        onClick={() => setTimeSectionOpen(!timeSectionOpen)}
                      >
                        <div className="section-header-left">
                          <i className="bi bi-clock"></i>
                          <span>Horaires</span>
                        </div>
                        <div
                          className={`section-header-right ${
                            timeSectionOpen ? "expanded" : ""
                          }`}
                        >
                          {!timeSectionOpen && (
                            <span className="section-value">
                              {reservationType === "hourly" &&
                                startTime &&
                                endTime &&
                                `${startTime} - ${endTime}`}
                              {reservationType === "daily" &&
                                arrivalTime &&
                                `À partir de ${arrivalTime}`}
                            </span>
                          )}
                          <i className="bi bi-chevron-down"></i>
                        </div>
                      </div>
                      {timeSectionOpen && (
                        <div className="booking-section-content">
                          {reservationType === "hourly" && (
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label
                                  className="form-label fw-semibold mb-2"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  Heure de début
                                </label>
                                <div
                                  className="time-slots-grid"
                                  style={{
                                    maxHeight: "200px",
                                    padding: "0.25rem",
                                  }}
                                >
                                  {availableStartTimeSlots.map((time) => (
                                    <button
                                      key={time}
                                      className={`time-slot-btn ${
                                        startTime === time ? "active" : ""
                                      }`}
                                      style={{
                                        padding: "0.5rem 0.35rem",
                                        fontSize: "0.85rem",
                                      }}
                                      onClick={() =>
                                        handleStartTimeSelection(time)
                                      }
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label
                                  className="form-label fw-semibold mb-2"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  Heure de fin
                                </label>
                                <div
                                  className="time-slots-grid"
                                  style={{
                                    maxHeight: "200px",
                                    padding: "0.25rem",
                                  }}
                                >
                                  {availableEndTimeSlots.map((time) => {
                                    let isLessThanOneHour = false;
                                    if (startTime) {
                                      const [startHour, startMinute] = startTime
                                        .split(":")
                                        .map(Number);
                                      const [timeHour, timeMinute] = time
                                        .split(":")
                                        .map(Number);
                                      const startMinutes =
                                        startHour * 60 + startMinute;
                                      const timeMinutes =
                                        timeHour * 60 + timeMinute;
                                      const diff = timeMinutes - startMinutes;
                                      isLessThanOneHour = diff < 60;
                                    }

                                    return (
                                      <button
                                        key={time}
                                        className={`time-slot-btn ${
                                          endTime === time ? "active" : ""
                                        } ${
                                          isLessThanOneHour ? "disabled" : ""
                                        }`}
                                        style={{
                                          padding: "0.5rem 0.35rem",
                                          fontSize: "0.85rem",
                                        }}
                                        onClick={() => setEndTime(time)}
                                        disabled={isLessThanOneHour}
                                      >
                                        {time}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {reservationType === "daily" && (
                            <>
                              <label
                                className="form-label fw-semibold mb-2"
                                style={{ fontSize: "0.85rem" }}
                              >
                                Heure d'arrivée
                              </label>
                              <div
                                className="time-slots-grid"
                                style={{
                                  maxHeight: "200px",
                                  padding: "0.25rem",
                                }}
                              >
                                {availableStartTimeSlots.map((time) => (
                                  <button
                                    key={time}
                                    className={`time-slot-btn ${
                                      arrivalTime === time ? "active" : ""
                                    }`}
                                    style={{
                                      padding: "0.5rem 0.35rem",
                                      fontSize: "0.85rem",
                                    }}
                                    onClick={() => setArrivalTime(time)}
                                  >
                                    {time}
                                  </button>
                                ))}
                              </div>
                              {globalHours &&
                                selectedDate &&
                                (() => {
                                  // Parse date manually to avoid timezone issues
                                  const [year, month, day] = selectedDate
                                    .split("-")
                                    .map(Number);
                                  const dateObj = new Date(
                                    year,
                                    month - 1,
                                    day,
                                  );
                                  const dayOfWeek = dateObj
                                    .toLocaleDateString("en-US", {
                                      weekday: "long",
                                    })
                                    .toLowerCase();
                                  const dayHours =
                                    globalHours.defaultHours?.[dayOfWeek];
                                  if (dayHours?.closeTime) {
                                    const [closeHour, closeMinute] =
                                      dayHours.closeTime.split(":").map(Number);
                                    const closeMinutes =
                                      closeHour * 60 + closeMinute;
                                    const cutoffMinutes = closeMinutes - 5 * 60;
                                    const cutoffHour = Math.floor(
                                      cutoffMinutes / 60,
                                    );
                                    const cutoffMinute = cutoffMinutes % 60;
                                    const cutoffTime = `${String(
                                      cutoffHour,
                                    ).padStart(2, "0")}:${String(
                                      cutoffMinute,
                                    ).padStart(2, "0")}`;
                                    return (
                                      <small
                                        className="text-muted mt-2 d-block"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        À partir de {cutoffTime} optez pour un
                                        forfait horaire
                                      </small>
                                    );
                                  }
                                  return null;
                                })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* Number of People & Price Display */}
                {duration && calculatedPrice > 0 && (
                  <div style={{ marginTop: "0.5rem" }} ref={priceSectionRef}>
                    {appliedDailyRate && (
                      <div
                        className="alert alert-info mb-3 py-2"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="bi bi-info-circle me-2"></i>
                        Tarif journée appliqué (5h ou plus)
                      </div>
                    )}

                    <div className="row g-3">
                      {/* Left card - People counter */}
                      <div className="col-md-6">
                        <div
                          style={{
                            border: "1px solid #e0e0e0",
                            marginBottom: "20px",
                            borderRadius: "8px",
                            padding: "1.5rem 1rem",
                            maxHeight: "200px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <label
                            className="form-label fw-semibold mb-3"
                            style={{ fontSize: "0.9rem" }}
                          >
                            Nombre de personnes
                          </label>
                          <div
                            className="people-counter mx-auto"
                            style={{ maxWidth: "220px" }}
                          >
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() =>
                                setNumberOfPeople(
                                  Math.max(
                                    spaceConfig?.minCapacity || 1,
                                    numberOfPeople - 1,
                                  ),
                                )
                              }
                              style={{ padding: "0.75rem 1rem" }}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <div className="counter-display">
                              <div
                                className="counter-number"
                                style={{ fontSize: "1.75rem" }}
                              >
                                {numberOfPeople}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() =>
                                setNumberOfPeople(
                                  Math.min(
                                    spaceConfig?.maxCapacity || 100,
                                    numberOfPeople + 1,
                                  ),
                                )
                              }
                              style={{ padding: "0.75rem 1rem" }}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          {spaceConfig && (
                            <small
                              className="text-muted mt-3 d-block"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Capacité: {spaceConfig.minCapacity}-
                              {spaceConfig.maxCapacity} pers.
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Right card - Price */}
                      <div className="col-md-6">
                        <div
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "1.5rem 1rem",
                            minHeight: "200px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            {/* <label
                              className="form-label fw-semibold mb-0"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Prix
                            </label> */}
                            {/* TTC/HT Switch */}
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className={`tax-toggle ${
                                  showTTC ? "active" : ""
                                }`}
                                onClick={() => setShowTTC(true)}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                TTC
                              </span>
                              <div className="form-check form-switch mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="taxSwitchPrice"
                                  checked={!showTTC}
                                  onChange={() => setShowTTC(!showTTC)}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                              <span
                                className={`tax-toggle ${
                                  !showTTC ? "active" : ""
                                }`}
                                onClick={() => setShowTTC(false)}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                HT
                              </span>
                            </div>
                          </div>
                          {reservationType !== "daily" && (
                            <div className="mb-2">
                              <span
                                className="text-muted"
                                style={{ fontSize: "0.85rem" }}
                              >
                                <i className="bi bi-clock me-2"></i>
                                {duration}
                              </span>
                            </div>
                          )}
                          <div
                            className="price-display"
                            style={{
                              fontSize: "2.25rem",
                              lineHeight: "1",
                              marginTop:
                                reservationType === "daily" ? "1rem" : "0",
                            }}
                          >
                            {getDisplayPrice().toFixed(2)}€{" "}
                            {showTTC ? "TTC" : "HT"}
                          </div>
                          <p
                            className="text-muted mb-0 small mt-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {spaceConfig?.pricing.perPerson
                              ? "Prix total"
                              : "Prix fixe"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  className="btn btn-success btn-lg w-100"
                  style={{ fontSize: "0.95rem" }}
                  onClick={handleContinue}
                  disabled={!isValidSelection()}
                >
                  Continuer vers les détails
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
