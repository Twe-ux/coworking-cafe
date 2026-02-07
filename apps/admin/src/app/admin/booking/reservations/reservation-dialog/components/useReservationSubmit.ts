import { useState } from "react";
import type { ReservationFormData } from "../types";

interface UseReservationSubmitProps {
  formData: ReservationFormData;
  sendEmail: boolean;
  onSuccess: () => void;
  onClose: () => void;
  resetForm: () => void;
}

export function useReservationSubmit({
  formData,
  sendEmail,
  onSuccess,
  onClose,
  resetForm,
}: UseReservationSubmitProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      console.log("🔍 formData.client au moment de submit:", formData.client);
      console.log("🔑 formData.client?.id:", formData.client?.id);

      const payload = {
        // API expects these field names
        userId: formData.client?.id || null,
        spaceType: formData.spaceId,
        spaceId: formData.spaceId,
        date: formData.startDate, // Use startDate as main date
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.numberOfPeople,
        totalPrice: formData.totalPrice,
        invoiceOption: formData.invoiceOption,
        status: formData.status,
        // Contact info
        contactName: formData.client?.name,
        contactEmail: formData.client?.email,
        contactPhone: formData.client?.phone,
        clientCompany: formData.client?.company,
        // Deposit info
        depositRequired: formData.depositRequired,
        depositAmount: formData.depositAmount,
        depositFileUrl: formData.depositFileUrl,
        // Other fields
        notes: formData.notes,
        isAdminBooking: true,
        sendEmail: sendEmail, // Contrôler l'envoi d'email
      };

      console.log("📤 Payload envoyé à l'API:", payload);
      console.log("🔍 Champs requis:", {
        spaceType: payload.spaceType,
        userId: payload.userId,
        date: payload.date,
        numberOfPeople: payload.numberOfPeople,
        totalPrice: payload.totalPrice,
      });

      const response = await fetch("/api/booking/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        console.error("Error creating booking:", data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    handleSubmit,
  };
}
