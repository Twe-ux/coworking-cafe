"use client";

import { useState } from "react";
import { generateBookingInitialEmail, type BookingInitialEmailData } from "@/lib/email/templates/clientBookingConfirmation";
import { generateValidatedEmail } from "@/lib/email/templates/adminValidation";
import { generateConfirmationEmail } from "@/lib/email/templates/confirmation";
import { generateCancellationEmail } from "@/lib/email/templates/clientCancellation";
import { generateDepositHoldEmail } from "@/lib/email/templates/depositHold";
import { generateDepositCapturedEmail } from "@/lib/email/templates/noShowPenalty";
import { generateDepositReleasedEmail } from "@/lib/email/templates/depositReleased";
import { generateReminderEmail } from "@/lib/email/templates/reminder";
import { generateReservationCancelledEmail } from "@/lib/email/templates/adminCancellation";
import { generateReservationRejectedEmail } from "@/lib/email/templates/adminRejection";
import { generateCardSavedEmail } from "@/lib/email/templates/cardSaved";
import { passwordResetEmail } from "@/lib/email/templates/passwordReset";

type EmailType =
  | "bookingInitial"
  | "validated"
  | "confirmation"
  | "cancellation"
  | "depositHold"
  | "depositCaptured"
  | "depositReleased"
  | "reminder"
  | "reservationCancelledByAdmin"
  | "reservationRejected"
  | "cardSaved"
  | "passwordReset";

export default function EmailPreviewPage() {
  const [emailType, setEmailType] = useState<EmailType>("bookingInitial");

  // Sample data for bookingInitial
  const [bookingInitialData, setBookingInitialData] = useState<BookingInitialEmailData>({
    name: "Jean Dupont",
    spaceName: "Salle de l'Étage",
    date: "Lundi 15 janvier 2026",
    time: "14:00 - 18:00",
    price: 72,
    bookingId: "BK-2026-001",
    requiresPayment: true,
    depositAmount: 5040, // 70% de 72€ = 50.40€ = 5040 centimes
    captureMethod: "manual",
    additionalServices: ["Vidéoprojecteur", "Tableau blanc"],
    numberOfPeople: 8,
  });

  // Sample data for validated
  const validatedData = {
    name: "Marie Martin",
    spaceName: "Salle de l'Étage",
    date: "Mardi 16 janvier 2026",
    startTime: "09:00",
    endTime: "12:00",
    numberOfPeople: 6,
    totalPrice: 90,
    confirmationNumber: "CONF-2026-042",
  };

  // Sample data for confirmation
  const confirmationData = {
    name: "Pierre Durand",
    spaceName: "Salle de l'Étage",
    date: "Mercredi 17 janvier 2026",
    startTime: "14:00",
    endTime: "17:00",
    numberOfPeople: 10,
    totalPrice: 150,
    depositAmount: 75,
    confirmationNumber: "CONF-2026-043",
  };

  // Sample data for cancellation
  const [cancellationData, setCancellationData] = useState({
    name: "Jean Dupont",
    spaceName: "Salle de l'Étage",
    date: "Lundi 15 janvier 2026",
    startTime: "14:00",
    endTime: "18:00",
    cancellationFee: 60,
    refundAmount: 60,
    isPending: false,
  });

  // Sample data for depositHold
  const depositHoldData = {
    name: "Sophie Bernard",
    spaceName: "Salle de l'Étage",
    date: "Jeudi 18 janvier 2026",
    startTime: "10:00",
    endTime: "16:00",
    depositAmount: 100,
    totalPrice: 200,
  };

  // Sample data for depositCaptured
  const depositCapturedData = {
    name: "Lucas Petit",
    spaceName: "Salle de l'Étage",
    date: "Vendredi 19 janvier 2026",
    depositAmount: 80,
  };

  // Sample data for reminder
  const reminderData = {
    name: "Thomas Leroy",
    spaceName: "Salle de l'Étage",
    date: "Samedi 20 janvier 2026",
    time: "15:00 - 19:00",
  };

  // Sample data for reservationCancelledByAdmin
  const reservationCancelledByAdminData = {
    name: "Julie Moreau",
    spaceName: "Salle de l'Étage",
    date: "Dimanche 21 janvier 2026",
    startTime: "13:00",
    endTime: "17:00",
    numberOfPeople: 12,
    totalPrice: 180,
    confirmationNumber: "CONF-2026-044",
  };

  // Sample data for reservationRejected
  const reservationRejectedData = {
    name: "Nicolas Laurent",
    spaceName: "Salle de l'Étage",
    date: "Lundi 22 janvier 2026",
    startTime: "11:00",
    endTime: "15:00",
    numberOfPeople: 8,
    totalPrice: 120,
    confirmationNumber: "CONF-2026-045",
    reason: "L'espace n'est pas disponible à cette date en raison de travaux de maintenance. Nous vous invitons à choisir une autre date.",
  };

  // Sample data for cardSaved
  const cardSavedData = {
    name: "Isabelle Simon",
    spaceName: "Salle de l'Étage",
    date: "Mardi 23 janvier 2026",
    startTime: "08:00",
    endTime: "12:00",
    totalPrice: 100,
  };

  // Sample data for depositReleased
  const depositReleasedData = {
    name: "Antoine Dubois",
    spaceName: "Salle de l'Étage",
    date: "Mercredi 24 janvier 2026",
    depositAmount: 90,
  };

  // Sample data for passwordReset
  const passwordResetData = {
    userName: "Marie Durand",
    resetUrl: "http://localhost:3000/auth/reset-password?token=sample-token-12345",
  };

  const getHtmlContent = () => {
    switch (emailType) {
      case "bookingInitial":
        return generateBookingInitialEmail(bookingInitialData);
      case "validated":
        return generateValidatedEmail(validatedData);
      case "confirmation":
        return generateConfirmationEmail(confirmationData);
      case "cancellation":
        return generateCancellationEmail(cancellationData);
      case "depositHold":
        return generateDepositHoldEmail(depositHoldData);
      case "depositCaptured":
        return generateDepositCapturedEmail(depositCapturedData);
      case "depositReleased":
        return generateDepositReleasedEmail(depositReleasedData);
      case "reminder":
        return generateReminderEmail(reminderData);
      case "reservationCancelledByAdmin":
        return generateReservationCancelledEmail(reservationCancelledByAdminData);
      case "reservationRejected":
        return generateReservationRejectedEmail(reservationRejectedData);
      case "cardSaved":
        return generateCardSavedEmail(cardSavedData);
      case "passwordReset":
        return passwordResetEmail(passwordResetData);
      default:
        return "";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", background: "#f3f4f6", padding: "20px", borderRadius: "8px" }}>
        <h1 style={{ marginTop: 0 }}>Prévisualisation Email</h1>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Type d'email</label>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value as EmailType)}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "16px" }}
          >
            <option value="bookingInitial">Réservation Initiale</option>
            <option value="validated">Validation</option>
            <option value="confirmation">Confirmation</option>
            <option value="cancellation">Annulation</option>
            <option value="depositHold">Empreinte créée</option>
            <option value="depositCaptured">Empreinte encaissée</option>
            <option value="depositReleased">Empreinte libérée</option>
            <option value="reminder">Rappel</option>
            <option value="reservationCancelledByAdmin">Annulée par admin</option>
            <option value="reservationRejected">Réservation refusée</option>
            <option value="cardSaved">Carte sauvegardée</option>
            <option value="passwordReset">Réinitialisation mot de passe</option>
          </select>
        </div>

        {emailType === "bookingInitial" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginTop: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Prix (€)</label>
              <input
                type="number"
                value={bookingInitialData.price}
                onChange={(e) => setBookingInitialData({ ...bookingInitialData, price: parseFloat(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Empreinte (centimes)</label>
              <input
                type="number"
                value={bookingInitialData.depositAmount || 0}
                onChange={(e) => setBookingInitialData({ ...bookingInitialData, depositAmount: parseInt(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nb personnes</label>
              <input
                type="number"
                value={bookingInitialData.numberOfPeople || 0}
                onChange={(e) => setBookingInitialData({ ...bookingInitialData, numberOfPeople: parseInt(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nécessite paiement</label>
              <input
                type="checkbox"
                checked={bookingInitialData.requiresPayment}
                onChange={(e) => setBookingInitialData({ ...bookingInitialData, requiresPayment: e.target.checked })}
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          </div>
        )}

        {emailType === "cancellation" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginTop: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Frais d'annulation (€)</label>
              <input
                type="number"
                value={cancellationData.cancellationFee}
                onChange={(e) => setCancellationData({ ...cancellationData, cancellationFee: parseFloat(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Montant non prélevé (€)</label>
              <input
                type="number"
                value={cancellationData.refundAmount}
                onChange={(e) => setCancellationData({ ...cancellationData, refundAmount: parseFloat(e.target.value) })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Réservation pending</label>
              <input
                type="checkbox"
                checked={cancellationData.isPending}
                onChange={(e) => setCancellationData({ ...cancellationData, isPending: e.target.checked })}
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ border: "2px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <iframe
          srcDoc={getHtmlContent()}
          style={{ width: "100%", height: "800px", border: "none" }}
          title="Email Preview"
        />
      </div>
    </div>
  );
}
