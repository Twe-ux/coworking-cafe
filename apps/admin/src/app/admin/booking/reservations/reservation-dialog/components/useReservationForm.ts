import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import type { ReservationFormData } from "../types";

interface UseReservationFormProps {
  initialDate?: Date;
  open: boolean;
}

export function useReservationForm({ initialDate, open }: UseReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    client: null,
    spaceId: "",
    spaceName: "",
    startDate: initialDate ? format(initialDate, "yyyy-MM-dd") : "",
    endDate: initialDate ? format(initialDate, "yyyy-MM-dd") : "",
    startTime: "09:00",
    endTime: "18:00",
    numberOfPeople: 1,
    totalPrice: 0,
    invoiceOption: false,
    depositRequired: false,
    depositAmount: 0,
    depositFileAttached: false,
    depositFileUrl: "",
    notes: "",
    status: "pending",
  });

  const [priceLoading, setPriceLoading] = useState(false);

  // Update dates when dialog opens with initialDate
  useEffect(() => {
    if (open && initialDate) {
      const formattedDate = format(initialDate, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        startDate: formattedDate,
        endDate: formattedDate,
      }));
    }
  }, [open, initialDate]);

  // Calculate price in real-time
  const calculatePrice = useCallback(async () => {
    // Only calculate if we have all required fields
    if (
      !formData.spaceId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime ||
      formData.numberOfPeople <= 0
    ) {
      setFormData((prev) => ({ ...prev, totalPrice: 0 }));
      return;
    }

    try {
      setPriceLoading(true);

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceType: formData.spaceId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          numberOfPeople: formData.numberOfPeople,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.totalPrice !== undefined) {
        setFormData((prev) => ({ ...prev, totalPrice: data.data.totalPrice }));
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    } finally {
      setPriceLoading(false);
    }
  }, [
    formData.spaceId,
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
    formData.numberOfPeople,
  ]);

  // Trigger price calculation when relevant fields change
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  // Reset price and adjust people count when space changes
  useEffect(() => {
    if (formData.spaceId) {
      // Capacités maximales par salle
      const maxCapacities: Record<string, number> = {
        "open-space": 50,
        "salle-verriere": 5,
        "salle-etage": 10,
        evenementiel: 100,
      };

      const maxCapacity = maxCapacities[formData.spaceId] || 50;

      setFormData((prev) => ({
        ...prev,
        totalPrice: 0,
        // Ajuster le nombre de personnes si dépasse la capacité max
        numberOfPeople:
          prev.numberOfPeople > maxCapacity ? maxCapacity : prev.numberOfPeople,
      }));
    }
  }, [formData.spaceId]);

  // Force status to "pending" when deposit is required
  useEffect(() => {
    if (formData.depositRequired && formData.status !== "pending") {
      setFormData((prev) => ({ ...prev, status: "pending" }));
    }
  }, [formData.depositRequired, formData.status]);

  const resetForm = () => {
    setFormData({
      client: null,
      spaceId: "",
      spaceName: "",
      startDate: initialDate ? format(initialDate, "yyyy-MM-dd") : "",
      endDate: initialDate ? format(initialDate, "yyyy-MM-dd") : "",
      startTime: "09:00",
      endTime: "18:00",
      numberOfPeople: 1,
      totalPrice: 0,
      invoiceOption: false,
      depositRequired: false,
      depositAmount: 0,
      depositFileAttached: false,
      depositFileUrl: "",
      notes: "",
      status: "pending",
    });
  };

  return {
    formData,
    setFormData,
    priceLoading,
    resetForm,
  };
}
