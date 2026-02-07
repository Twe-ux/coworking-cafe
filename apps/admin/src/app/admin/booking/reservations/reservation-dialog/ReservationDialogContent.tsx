"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  ReservationDialogFooter,
  ReservationDialogSections,
  useReservationForm,
  useReservationSubmit,
  useReservationValidation,
} from "./components";
import type { ReservationDialogProps } from "./types";

export function ReservationDialog({
  open,
  onOpenChange,
  booking,
  onSuccess,
  initialDate,
}: ReservationDialogProps) {
  const [sendEmail, setSendEmail] = useState(true);

  // Custom hooks for form management
  const { formData, setFormData, priceLoading, resetForm } =
    useReservationForm({
      initialDate,
      open,
    });

  const { isFormValid } = useReservationValidation();

  const { submitting, handleSubmit } = useReservationSubmit({
    formData,
    sendEmail,
    onSuccess,
    onClose: () => onOpenChange(false),
    resetForm,
  });

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
          <ReservationDialogSections
            formData={formData}
            priceLoading={priceLoading}
            onFormDataChange={setFormData}
          />
        </ScrollArea>

        <ReservationDialogFooter
          sendEmail={sendEmail}
          onSendEmailChange={setSendEmail}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          isValid={isFormValid(formData)}
          submitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
}
