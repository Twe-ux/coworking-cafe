import type { ReservationFormData } from "../types";

export function useReservationValidation() {
  const isFormValid = (formData: ReservationFormData): boolean => {
    const isEventSpace = formData.spaceId === "evenementiel";

    console.log("🔍 Validation - formData:", {
      client: !!formData.client,
      spaceId: formData.spaceId,
      isEventSpace,
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

    // Pour l'événementiel, numberOfPeople et totalPrice ne sont pas requis
    if (!isEventSpace) {
      if (formData.numberOfPeople <= 0) {
        console.log("❌ Nombre de personnes invalide");
        return false;
      }
      if (formData.totalPrice <= 0) {
        console.log("❌ Prix invalide");
        return false;
      }
    }

    // Deposit validation (if required)
    if (formData.depositRequired) {
      console.log("🔍 Acompte requis - validation:", {
        amount: formData.depositAmount,
        fileUrl: formData.depositFileUrl,
      });

      if (formData.depositAmount <= 0) {
        console.log(
          "❌ Validation échoue: depositAmount =",
          formData.depositAmount,
        );
        return false;
      }
      if (!formData.depositFileUrl) {
        console.log(
          "❌ Validation échoue: depositFileUrl =",
          formData.depositFileUrl,
        );
        return false;
      }
    }

    console.log("✅ Validation réussie!");
    return true;
  };

  return { isFormValid };
}
