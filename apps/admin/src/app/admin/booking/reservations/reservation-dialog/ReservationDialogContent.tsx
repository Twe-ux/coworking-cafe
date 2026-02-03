"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientSection } from "./ClientSection";
import { SpaceSection } from "./SpaceSection";
import { DateSection } from "./DateSection";
import { TimeSection } from "./TimeSection";
import { PeopleAndPriceSection } from "./PeopleAndPriceSection";
import { DepositSection } from "./DepositSection";
import { NotesSection } from "./NotesSection";
import { StatusSection } from "./StatusSection";
import type {
  ReservationDialogProps,
  ReservationFormData,
  ClientData,
} from "./types";
import type { BookingStatus } from "@/types/booking";

export function ReservationDialog({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: ReservationDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ReservationFormData>({
    client: null,
    spaceId: "",
    spaceName: "",
    startDate: "",
    endDate: "",
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

  const [sendEmail, setSendEmail] = useState(true); // Par défaut, envoyer l'email

  const [priceLoading, setPriceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Force status to "pending" when deposit is required
  useEffect(() => {
    if (formData.depositRequired && formData.status !== "pending") {
      setFormData((prev) => ({ ...prev, status: "pending" }));
    }
  }, [formData.depositRequired, formData.status]);

  // Form validation
  const isFormValid = (): boolean => {
    console.log("🔍 Validation - formData:", {
      client: !!formData.client,
      spaceId: formData.spaceId,
      dates: { start: formData.startDate, end: formData.endDate },
      times: { start: formData.startTime, end: formData.endTime },
      people: formData.numberOfPeople,
      price: formData.totalPrice,
      depositRequired: formData.depositRequired,
      depositAmount: formData.depositAmount,
      depositFileUrl: formData.depositFileUrl,
    });

    // Required fields
    if (!formData.client) {
      console.log("❌ Client manquant");
      return false;
    }
    if (!formData.spaceId) {
      console.log("❌ Espace manquant");
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      console.log("❌ Dates manquantes");
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      console.log("❌ Heures manquantes");
      return false;
    }
    if (formData.numberOfPeople <= 0) {
      console.log("❌ Nombre de personnes invalide");
      return false;
    }
    if (formData.totalPrice <= 0) {
      console.log("❌ Prix invalide");
      return false;
    }

    // Deposit validation (if required)
    if (formData.depositRequired) {
      console.log("🔍 Acompte requis - validation:", {
        amount: formData.depositAmount,
        fileUrl: formData.depositFileUrl,
      });

      if (formData.depositAmount <= 0) {
        console.log("❌ Validation échoue: depositAmount =", formData.depositAmount);
        return false;
      }
      if (!formData.depositFileUrl) {
        console.log("❌ Validation échoue: depositFileUrl =", formData.depositFileUrl);
        return false;
      }
    }

    console.log("✅ Validation réussie!");
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) return;

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
        onOpenChange(false);
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

  const resetForm = () => {
    setFormData({
      client: null,
      spaceId: "",
      spaceName: "",
      startDate: "",
      endDate: "",
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

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6 p-4">
            {/* Client */}
            <ClientSection
              selectedClient={formData.client}
              onChange={(client: ClientData | null) =>
                setFormData((prev) => ({ ...prev, client }))
              }
            />

            <Separator />

            {/* Space */}
            <SpaceSection
              selectedSpace={formData.spaceId}
              onChange={(spaceId: string, spaceName: string) =>
                setFormData((prev) => ({ ...prev, spaceId, spaceName }))
              }
            />

            <Separator />

            {/* Dates */}
            <DateSection
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={(date: string) =>
                setFormData((prev) => ({ ...prev, startDate: date }))
              }
              onEndDateChange={(date: string) =>
                setFormData((prev) => ({ ...prev, endDate: date }))
              }
            />

            <Separator />

            {/* Times */}
            <TimeSection
              startTime={formData.startTime}
              endTime={formData.endTime}
              onStartTimeChange={(time: string) =>
                setFormData((prev) => ({ ...prev, startTime: time }))
              }
              onEndTimeChange={(time: string) =>
                setFormData((prev) => ({ ...prev, endTime: time }))
              }
            />

            <Separator />

            {/* People & Price */}
            <PeopleAndPriceSection
              numberOfPeople={formData.numberOfPeople}
              onPeopleChange={(count: number) =>
                setFormData((prev) => ({ ...prev, numberOfPeople: count }))
              }
              totalPrice={formData.totalPrice}
              priceLoading={priceLoading}
              invoiceOption={formData.invoiceOption}
              onInvoicePaymentChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, invoiceOption: checked }))
              }
            />

            <Separator />

            {/* Deposit (conditional) */}
            <DepositSection
              required={formData.depositRequired}
              amount={formData.depositAmount}
              fileAttached={formData.depositFileAttached}
              fileUrl={formData.depositFileUrl}
              onRequiredChange={(required: boolean) => {
                console.log("✅ depositRequired changed to:", required);
                setFormData((prev) => ({ ...prev, depositRequired: required }));
              }}
              onAmountChange={(amount: number) => {
                console.log("✅ depositAmount changed to:", amount);
                setFormData((prev) => ({ ...prev, depositAmount: amount }));
              }}
              onFileAttachedChange={(attached: boolean) => {
                console.log("✅ depositFileAttached changed to:", attached);
                setFormData((prev) => ({ ...prev, depositFileAttached: attached, depositFileUrl: attached ? prev.depositFileUrl : "" }));
              }}
              onFileUploaded={(url: string) => {
                console.log("✅ depositFileUrl changed to:", url);
                setFormData((prev) => ({ ...prev, depositFileUrl: url }));
              }}
              spaceType={formData.spaceId}
            />

            <Separator />

            {/* Notes */}
            <NotesSection
              notes={formData.notes}
              onChange={(notes: string) =>
                setFormData((prev) => ({ ...prev, notes }))
              }
            />

            <Separator />

            {/* Status */}
            <StatusSection
              status={formData.status}
              onChange={(status: BookingStatus) =>
                setFormData((prev) => ({ ...prev, status }))
              }
              depositRequired={formData.depositRequired}
            />
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="sendEmail" className="text-sm">
              Envoyer un email au client
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || submitting}
            >
              {submitting ? "Création..." : "Valider la réservation"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
