"use client";

import { Separator } from "@/components/ui/separator";
import type { BookingStatus } from "@/types/booking";
import { ClientSection } from "../ClientSection";
import { DateSection } from "../DateSection";
import { DepositSection } from "../DepositSection";
import { NotesSection } from "../NotesSection";
import { PeopleAndPriceSection } from "../PeopleAndPriceSection";
import { SpaceSection } from "../SpaceSection";
import { StatusSection } from "../StatusSection";
import { TimeSection } from "../TimeSection";
import type { ClientData, ReservationFormData } from "../types";

interface ReservationDialogSectionsProps {
  formData: ReservationFormData;
  priceLoading: boolean;
  onFormDataChange: (formData: ReservationFormData) => void;
}

export function ReservationDialogSections({
  formData,
  priceLoading,
  onFormDataChange,
}: ReservationDialogSectionsProps) {
  const updateFormData = (updates: Partial<ReservationFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Client */}
      <ClientSection
        selectedClient={formData.client}
        onChange={(client: ClientData | null) => updateFormData({ client })}
      />

      <Separator />

      {/* Space */}
      <SpaceSection
        selectedSpace={formData.spaceId}
        onChange={(spaceId: string, spaceName: string) =>
          updateFormData({ spaceId, spaceName })
        }
      />

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dates */}
        <DateSection
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={(date: string) =>
            updateFormData({ startDate: date })
          }
          onEndDateChange={(date: string) => updateFormData({ endDate: date })}
        />

        {/* Times */}
        <TimeSection
          startTime={formData.startTime}
          endTime={formData.endTime}
          onStartTimeChange={(time: string) =>
            updateFormData({ startTime: time })
          }
          onEndTimeChange={(time: string) => updateFormData({ endTime: time })}
        />
      </div>
      <Separator />

      {formData.spaceId === "evenementiel" ? (
        <NotesSection
          spaceId={formData.spaceId}
          notes={formData.notes}
          onChange={(notes: string) => updateFormData({ notes })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* People & Price - Masqué pour événementiel */}
          {formData.spaceId !== "evenementiel" && (
            <PeopleAndPriceSection
              numberOfPeople={formData.numberOfPeople}
              onPeopleChange={(count: number) =>
                updateFormData({ numberOfPeople: count })
              }
              totalPrice={formData.totalPrice}
              priceLoading={priceLoading}
              invoiceOption={formData.invoiceOption}
              onInvoicePaymentChange={(checked: boolean) =>
                updateFormData({ invoiceOption: checked })
              }
            />
          )}

          {/* Notes */}
          <NotesSection
            spaceId={formData.spaceId}
            notes={formData.notes}
            onChange={(notes: string) => updateFormData({ notes })}
          />
        </div>
      )}

      {/* Deposit (conditional) */}
      <DepositSection
        required={formData.depositRequired}
        amount={formData.depositAmount}
        fileAttached={formData.depositFileAttached}
        fileUrl={formData.depositFileUrl}
        onRequiredChange={(required: boolean) => {
          console.log("✅ depositRequired changed to:", required);
          updateFormData({ depositRequired: required });
        }}
        onAmountChange={(amount: number) => {
          console.log("✅ depositAmount changed to:", amount);
          updateFormData({ depositAmount: amount });
        }}
        onFileAttachedChange={(attached: boolean) => {
          console.log("✅ depositFileAttached changed to:", attached);
          updateFormData({
            depositFileAttached: attached,
            depositFileUrl: attached ? formData.depositFileUrl : "",
          });
        }}
        onFileUploaded={(url: string) => {
          console.log("✅ depositFileUrl changed to:", url);
          updateFormData({ depositFileUrl: url });
        }}
        spaceType={formData.spaceId}
      />

      <Separator />

      {/* Status */}
      <StatusSection
        status={formData.status}
        onChange={(status: BookingStatus) => updateFormData({ status })}
        depositRequired={formData.depositRequired}
      />
    </div>
  );
}
