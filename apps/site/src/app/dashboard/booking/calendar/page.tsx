"use client";

import { useTopbarContext } from "@/context/useTopbarContext";
import frLocale from "@fullcalendar/core/locales/fr";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Modal } from "react-bootstrap";
import { useSession } from "next-auth/react";
import MoreEventsModal from "./components/MoreEventsModal";
import CreateReservationModal from "./components/CreateReservationModal";
import EditReservationModal from "./components/EditReservationModal";
import CalendarLegend from "./components/CalendarLegend";

interface Reservation {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  spaceType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  attendanceStatus?: "present" | "absent";
  paymentStatus: string;
  contactName?: string;
  contactEmail?: string;
}

interface SpaceConfiguration {
  spaceType: string;
  name: string;
  pricing: {
    hourly: number;
    daily: number;
    perPerson: boolean;
    maxHoursBeforeDaily?: number;
    dailyRatePerPerson?: number;
    tiers?: Array<{
      minPeople: number;
      maxPeople: number;
      hourlyRate: number;
      dailyRate: number;
      extraPersonHourly?: number;
      extraPersonDaily?: number;
    }>;
  };
  requiresQuote?: boolean;
  minCapacity: number;
  maxCapacity: number;
}

const spaceTypeColors: Record<string, string> = {
  "open-space": "#039be5",
  "salle-verriere": "#0b8043",
  "salle-etage": "#f09300",
  evenementiel: "#d50000",
  desk: "#7986cb",
  "meeting-room": "#33b679",
  "private-office": "#8e24aa",
  "event-space": "#e67c73",
};

const spaceTypeGradients: Record<string, string> = {
  "open-space": "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
  "salle-verriere": "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  "salle-etage": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  evenementiel: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
  desk: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
  "meeting-room": "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
  "private-office": "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
  "event-space": "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
};

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Place",
  "salle-verriere": "Verrière",
  "salle-etage": "Étage",
  evenementiel: "Priva",
  desk: "Bureau",
  "meeting-room": "Salle de réunion",
  "private-office": "Bureau privé",
  "event-space": "Espace événementiel",
};

const statusLabels: Record<string, string> = {
  pending: "À confirmer",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
  present: "Présenté",
  absent: "Non présenté",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

const CalendarPage = () => {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [moreEvents, setMoreEvents] = useState<Reservation[]>([]);
  const [moreEventsDate, setMoreEventsDate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [currentView, setCurrentView] = useState("Mois");
  const [paymentType, setPaymentType] = useState("unpaid");
  const [spaceConfigurations, setSpaceConfigurations] = useState<
    SpaceConfiguration[]
  >([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(0);
  const [isPendingStatus, setIsPendingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [selectedSpaceType, setSelectedSpaceType] = useState<string>("");
  const [isPartialPrivatization, setIsPartialPrivatization] = useState(false);
  const [exceptionalClosures, setExceptionalClosures] = useState<any[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { setPageTitle, setPageActions } = useTopbarContext();

  // Check if user is admin (level >= 80)
  const isAdmin = (session?.user?.role?.level ?? 0) >= 80;

  // Get selected space configuration
  const selectedSpaceConfig = spaceConfigurations.find(
    (c) => c.spaceType === selectedSpaceType
  );

  // Fix calendar size when sidebar changes
  useEffect(() => {
    const handleResize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        setTimeout(() => {
          calendarApi.updateSize();
        }, 350); // Wait for sidebar animation to complete
      }
    };

    // Listen for data-menu-size attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-menu-size"
        ) {
          handleResize();
        }
      });
    });

    const htmlElement = document.documentElement;
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["data-menu-size"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Update title with current view date
  const updatePageTitle = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const view = calendarApi.view;

      let dateStr = "";
      if (view.type === "dayGridMonth") {
        dateStr = currentDate.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        });
      } else if (view.type === "timeGridWeek") {
        const start = view.activeStart;
        const end = new Date(view.activeEnd);
        end.setDate(end.getDate() - 1);
        dateStr = `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString(
          "fr-FR",
          { month: "long", year: "numeric" }
        )}`;
      } else if (view.type === "timeGridDay") {
        dateStr = currentDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      setPageTitle(`Calendrier - ${dateStr}`);
    }
  };

  useEffect(() => {
    updatePageTitle();
    setPageActions(
      <>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.today();
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            padding: "8px 16px",
            background: "rgba(102, 126, 234, 0.1)",
            border: "1px solid #667eea",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#667eea",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#667eea";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
            e.currentTarget.style.color = "#667eea";
          }}
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.prev();
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            width: "40px",
            height: "40px",
            padding: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "20px",
            color: "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          ‹
        </button>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.next();
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            width: "40px",
            height: "40px",
            padding: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "20px",
            color: "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          ›
        </button>
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "#e5e7eb",
            margin: "0 8px",
          }}
        ></div>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            const viewMap: Record<string, string> = {
              Jour: "timeGridDay",
              Semaine: "timeGridWeek",
              Mois: "dayGridMonth",
            };
            calendarApi?.changeView(viewMap["Jour"]);
            setCurrentView("Jour");
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            padding: "8px 16px",
            background: currentView === "Jour" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: currentView === "Jour" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (currentView !== "Jour") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== "Jour") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Jour
        </button>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            const viewMap: Record<string, string> = {
              Jour: "timeGridDay",
              Semaine: "timeGridWeek",
              Mois: "dayGridMonth",
            };
            calendarApi?.changeView(viewMap["Semaine"]);
            setCurrentView("Semaine");
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            padding: "8px 16px",
            background: currentView === "Semaine" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: currentView === "Semaine" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (currentView !== "Semaine") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== "Semaine") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Semaine
        </button>
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            const viewMap: Record<string, string> = {
              Jour: "timeGridDay",
              Semaine: "timeGridWeek",
              Mois: "dayGridMonth",
            };
            calendarApi?.changeView(viewMap["Mois"]);
            setCurrentView("Mois");
            setTimeout(updatePageTitle, 100);
          }}
          style={{
            padding: "8px 16px",
            background: currentView === "Mois" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: currentView === "Mois" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (currentView !== "Mois") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== "Mois") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Mois
        </button>
      </>
    );

    return () => {
      setPageTitle("Dashboard");
      setPageActions(null);
    };
  }, [currentView, setPageTitle, setPageActions]);

  useEffect(() => {
    fetchReservations();
    fetchSpaceConfigurations();
    fetchExceptionalClosures();

    // Update title when calendar loads
    const timer = setTimeout(() => {
      updatePageTitle();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchSpaceConfigurations = async () => {
    try {
      const response = await fetch("/api/space-configurations");
      const data = await response.json();
      if (data.success) {
        setSpaceConfigurations(data.data);
      }
    } catch (error) {
    }
  };

  // Calculate price based on space type, number of people, and duration
  const calculatePrice = (
    spaceType: string,
    numberOfPeople: number,
    startTime: string,
    endTime: string
  ): number | null => {
    const config = spaceConfigurations.find((c) => c.spaceType === spaceType);
    if (!config) return 0;

    // If requires quote, return null to indicate "Sur devis"
    if (config.requiresQuote) {
      return null;
    }

    // Calculate duration in hours
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const durationHours = endHour + endMin / 60 - (startHour + startMin / 60);

    // Check if using tier-based pricing
    if (config.pricing.tiers && config.pricing.tiers.length > 0) {
      const tier = config.pricing.tiers.find(
        (t) => numberOfPeople >= t.minPeople && numberOfPeople <= t.maxPeople
      );

      if (tier) {
        // Check if should use daily rate (if duration >= 5 hours or similar threshold)
        const isDailyRate = durationHours >= 5;

        if (isDailyRate) {
          // Use daily rate
          return tier.dailyRate;
        } else {
          // Use hourly rate
          return tier.hourlyRate * durationHours;
        }
      } else {
        // Person count exceeds tier max, calculate with extra person charges
        const maxTier = config.pricing.tiers[config.pricing.tiers.length - 1];
        const extraPeople = numberOfPeople - maxTier.maxPeople;
        const isDailyRate = durationHours >= 5;

        if (isDailyRate) {
          return (
            maxTier.dailyRate + extraPeople * (maxTier.extraPersonDaily || 0)
          );
        } else {
          return (
            maxTier.hourlyRate * durationHours +
            extraPeople * (maxTier.extraPersonHourly || 0) * durationHours
          );
        }
      }
    }

    // Simple per-person pricing with max hours threshold (e.g., open-space)
    if (
      config.pricing.maxHoursBeforeDaily &&
      durationHours > config.pricing.maxHoursBeforeDaily
    ) {
      return numberOfPeople * (config.pricing.dailyRatePerPerson || 0);
    }

    // Standard calculation: hourly rate * duration * number of people
    const hourlyRate = config.pricing.hourly;
    if (config.pricing.perPerson) {
      return hourlyRate * durationHours * numberOfPeople;
    }
    return hourlyRate * durationHours;
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/reservations");
      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des réservations",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExceptionalClosures = async () => {
    try {
      const response = await fetch("/api/admin/global-hours");
      const data = await response.json();

      if (data.success && data.data && data.data.exceptionalClosures) {
        setExceptionalClosures(data.data.exceptionalClosures);
      }
    } catch (error) {
    }
  };

  const updateReservationStatus = async (
    id: string,
    status: string,
    paymentStatus?: string,
    attendanceStatus?: string
  ) => {
    try {
      const updates: any = { status, attendanceStatus };
      if (paymentStatus) {
        updates.paymentStatus = paymentStatus;
      }

      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Statut mis à jour avec succès" });
        setShowModal(false);
        fetchReservations();
        fetchExceptionalClosures(); // Reload closures in case one was added
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    }
  };

  const handleEventDrop = async (info: any) => {
    const reservation = info.event.extendedProps.reservation;
    const newDate = new Date(info.event.start);

    // Format new date and times
    const date = formatDateForAPI(newDate);
    const startTime = newDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(info.event.end).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reservation._id,
          date,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réservation déplacée avec succès",
        });
        fetchReservations();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du déplacement",
        });
        info.revert(); // Revert the event to its original position
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du déplacement" });
      info.revert();
    }
  };

  const handleEventResize = async (info: any) => {
    const reservation = info.event.extendedProps.reservation;
    const startTime = new Date(info.event.start).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(info.event.end).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reservation._id,
          startTime,
          endTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Horaires mis à jour avec succès",
        });
        fetchReservations();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la modification",
        });
        info.revert();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la modification" });
      info.revert();
    }
  };

  // Convert reservations to calendar events
  const reservationEvents = reservations
    .filter((reservation) => {
      // Admin: show all except cancelled
      if (isAdmin) {
        return reservation.status !== "cancelled";
      }
      // Staff: show confirmed and completed reservations (to manage attendance)
      return reservation.status === "confirmed" || reservation.status === "completed";
    })
    .map((reservation) => {
      const date = new Date(reservation.date);

      // Handle full day reservations (no specific times)
      const isFullDay = !reservation.startTime || !reservation.endTime;
      const [startHour, startMin] = isFullDay
        ? ["0", "0"]
        : (reservation.startTime || "0:0").split(":");
      const [endHour, endMin] = isFullDay
        ? ["23", "59"]
        : (reservation.endTime || "23:59").split(":");

      const start = new Date(date);
      start.setHours(parseInt(startHour), parseInt(startMin));

      const end = new Date(date);
      end.setHours(parseInt(endHour), parseInt(endMin));

      // Title enrichi avec plus d'informations et statut
      let statusIcon = "";
      let statusText = "";

      if (reservation.status === "pending") {
        statusIcon = "⏳";
        statusText = statusLabels.pending;
      } else if (reservation.status === "confirmed") {
        statusIcon = "✓";
        statusText = statusLabels.confirmed;
      } else if (reservation.status === "completed") {
        if (reservation.attendanceStatus === "present") {
          statusIcon = "✓✓";
          statusText = statusLabels.present;
        } else if (reservation.attendanceStatus === "absent") {
          statusIcon = "✗";
          statusText = statusLabels.absent;
        } else {
          statusIcon = "";
          statusText = statusLabels.completed;
        }
      }

      const title = `${statusIcon} ${spaceTypeLabels[reservation.spaceType]} • ${
        reservation.contactName || reservation.user.name
      } (${reservation.numberOfPeople}p)`;

      // Get gradient based on space type
      const gradient =
        spaceTypeGradients[reservation.spaceType] ||
        spaceTypeGradients["open-space"];

      return {
        id: reservation._id,
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: spaceTypeColors[reservation.spaceType] || "#667eea",
        borderColor: "transparent",
        textColor: "#ffffff",
        extendedProps: {
          reservation,
          gradient,
          statusText,
        },
        classNames: [
          reservation.status === "pending" ? "event-pending" : "",
          reservation.status === "confirmed" ? "event-confirmed" : "",
          reservation.status === "completed" ? "event-completed" : "",
          reservation.attendanceStatus === "present" ? "event-present" : "",
          reservation.attendanceStatus === "absent" ? "event-absent" : "",
          `event-${reservation.spaceType}`,
        ].filter(Boolean),
      };
    });

  // Convert exceptional closures to calendar events
  const closureEvents = exceptionalClosures.map((closure, index) => {
    const date = new Date(closure.date);

    if (closure.isFullDay !== false) {
      // Full day closure
      return {
        id: `closure-${index}`,
        title: `🚫 FERMÉ${closure.reason ? ` - ${closure.reason}` : ""}`,
        start: date.toISOString().split("T")[0],
        end: date.toISOString().split("T")[0],
        allDay: true,
        backgroundColor: "#FEE2E2",
        borderColor: "#EF4444",
        textColor: "#991B1B",
        color: "#991B1B",
        classNames: ["exceptional-closure-fullday"],
        extendedProps: {
          isClosure: true,
          isFullDay: true,
          closure,
        },
      };
    } else {
      // Partial closure with time range
      const [startHour, startMin] = (closure.startTime || "00:00").split(":");
      const [endHour, endMin] = (closure.endTime || "23:59").split(":");

      const start = new Date(date);
      start.setHours(parseInt(startHour), parseInt(startMin));

      const end = new Date(date);
      end.setHours(parseInt(endHour), parseInt(endMin));

      return {
        id: `closure-${index}`,
        title: `🚫 FERMÉ${closure.reason ? ` - ${closure.reason}` : ""}`,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: "#EF4444",
        borderColor: "transparent",
        textColor: "#ffffff",
        extendedProps: {
          isClosure: true,
          closure,
        },
      };
    }
  });

  // Combine both types of events
  const events = [...reservationEvents, ...closureEvents];

  const handleEventClick = (info: any) => {
    // Don't open modal for exceptional closures
    if (info.event.extendedProps.isClosure) {
      return;
    }

    const reservation = info.event.extendedProps.reservation;
    setSelectedEvent(reservation);
    setIsEditMode(false);
    setEditForm(null);
    setShowModal(true);
  };

  const handleEditClick = () => {
    if (selectedEvent) {
      setEditForm({
        spaceType: selectedEvent.spaceType,
        date: new Date(selectedEvent.date).toISOString().split("T")[0],
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        numberOfPeople: selectedEvent.numberOfPeople,
        totalPrice: selectedEvent.totalPrice,
        status: selectedEvent.status,
        paymentStatus: selectedEvent.paymentStatus,
        contactName: selectedEvent.contactName || selectedEvent.user.name,
        contactEmail: selectedEvent.contactEmail || selectedEvent.user.email,
      });
      setIsEditMode(true);
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev: any) => {
      const updated = { ...prev, [field]: value };

      // Recalculate price if relevant fields change
      if (
        ["spaceType", "numberOfPeople", "startTime", "endTime"].includes(field)
      ) {
        const price = calculatePrice(
          updated.spaceType,
          updated.numberOfPeople,
          updated.startTime,
          updated.endTime
        );
        updated.totalPrice = price;
      }

      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || !editForm) return;

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEvent._id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réservation mise à jour avec succès",
        });
        setShowModal(false);
        setIsEditMode(false);
        setEditForm(null);
        fetchReservations();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    }
  };

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date || info.start);

    // Check if the clicked date has an exceptional closure
    const dateStr = clickedDate.toISOString().split("T")[0];
    const hasClosure = exceptionalClosures.some((closure) => {
      const closureDate = new Date(closure.date).toISOString().split("T")[0];
      if (closureDate !== dateStr) return false;

      // If full day closure, block entirely
      if (closure.isFullDay !== false) return true;

      // If partial closure with times, check if it overlaps
      // For now, we'll block the entire day if there's any closure
      // You could make this more sophisticated to only block specific hours
      return true;
    });

    if (hasClosure) {
      setMessage({
        type: "error",
        text: "Impossible de créer une réservation : jour fermé",
      });
      return;
    }

    setSelectedDate(clickedDate);

    // Si c'est une vue avec heures (timeGrid), on peut récupérer l'heure
    if (info.start && info.end) {
      const startTime = new Date(info.start).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endTime = new Date(info.end).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSelectedTimeSlot({ start: startTime, end: endTime });
    } else {
      // Par défaut, 9h-10h
      setSelectedTimeSlot({ start: "09:00", end: "10:00" });
    }

    // Reset calculated price and payment type
    setCalculatedPrice(0);
    setPaymentType("unpaid");
    setShowCreateModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Format date to YYYY-MM-DD without UTC conversion
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
      }}
    >
      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Calendar */}
      <Card
        className="border-0 shadow-sm flex-grow-1"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Card.Body
          className="p-0"
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <div
            className="p-0"
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              titleFormat={{ year: "numeric", month: "long" }}
              dayHeaderFormat={(args) => {
                const view = calendarRef.current?.getApi().view;
                const date = args.date.marker || args.date;
                if (view?.type === "dayGridMonth") {
                  // Vue mois : juste le nom du jour
                  return new Date(date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                  });
                } else {
                  // Vues jour/semaine : jour + date
                  return new Date(date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                }
              }}
              buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
              }}
              locale={frLocale}
              events={events}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              height="100%"
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              nowIndicator={true}
              weekends={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              select={handleDateClick}
              dateClick={handleDateClick}
              dayMaxEvents={3}
              moreLinkClick={(info) => {
                // Get all events for this day
                const dayEvents = info.allSegs.map(
                  (seg) => seg.event.extendedProps.reservation
                );
                const dateStr = new Date(info.date).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                );
                setMoreEvents(dayEvents);
                setMoreEventsDate(dateStr);
                setShowMoreModal(true);
                return "popover";
              }}
              moreLinkText={(num) => `+${num} resa${num > 1 ? "s" : ""}`}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
              eventContent={(arg) => {
                // Handle closure events differently
                if (arg.event.extendedProps.isClosure) {
                  return {
                    html: `
                    <div style="
                      padding: 2px 6px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      font-size: 13px;
                      line-height: 1.4;
                      font-weight: 700;
                      color: #991B1B;
                    ">
                      ${arg.event.title}
                    </div>
                  `,
                  };
                }

                // Handle reservation events
                // const reservation = arg.event.extendedProps.reservation;

                // Google Calendar style - just time and title on one line
                return {
                  html: `
                  <div style="
                    padding: 1px 4px 1px 8px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 11px;
                    line-height: 1.4;
                    padding-right: 28px;
                  ">
                    <span style="font-weight: 600;">${arg.timeText}</span>
                    <span style="margin: 0 4px;">•</span>
                    <span>${arg.event.title}</span>
                  </div>
                `,
                };
              }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Legend */}
      <CalendarLegend
        spaceConfigurations={spaceConfigurations}
        spaceTypeColors={spaceTypeColors}
      />

      {/* Event Details Modal */}
      <EditReservationModal
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        editForm={editForm}
        spaceTypeColors={spaceTypeColors}
        spaceTypeLabels={spaceTypeLabels}
        statusLabels={statusLabels}
        formatDate={formatDate}
        handleEditClick={handleEditClick}
        handleEditFormChange={handleEditFormChange}
        handleSaveEdit={handleSaveEdit}
        updateReservationStatus={updateReservationStatus}
      />


      {/* Modal for More Events */}
      <MoreEventsModal
        show={showMoreModal}
        onHide={() => setShowMoreModal(false)}
        moreEventsDate={moreEventsDate}
        moreEvents={moreEvents}
        spaceTypeColors={spaceTypeColors}
        spaceTypeLabels={spaceTypeLabels}
        statusLabels={statusLabels}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setShowMoreModal(false);
          setShowModal(true);
        }}
      />

      {/* Modal for Creating Reservation */}
      <CreateReservationModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        spaceConfigurations={spaceConfigurations}
        isPendingStatus={isPendingStatus}
        setIsPendingStatus={setIsPendingStatus}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        isPartialPrivatization={isPartialPrivatization}
        setIsPartialPrivatization={setIsPartialPrivatization}
        selectedSpaceType={selectedSpaceType}
        setSelectedSpaceType={setSelectedSpaceType}
        selectedSpaceConfig={selectedSpaceConfig}
        calculatedPrice={calculatedPrice}
        setCalculatedPrice={setCalculatedPrice}
        calculatePrice={calculatePrice}
        formatDateForAPI={formatDateForAPI}
        setMessage={setMessage}
        setShowCreateModal={setShowCreateModal}
        fetchReservations={fetchReservations}
        fetchExceptionalClosures={fetchExceptionalClosures}
      />
    </div>
  );
};

export default CalendarPage;
