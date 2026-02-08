import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { triggerTestWebhook } from "./webhookUtils";
import { attemptAutoLogin } from "./autoLoginUtils";

type PollingStatus = "loading" | "error" | "success";

interface UseBookingPollingReturn {
  status: PollingStatus;
  message: string;
  subMessage: string | null;
  retryCount: number;
  initializePolling: (
    paymentIntentId: string | null,
    setupIntentId: string | null,
    redirectStatus: string | null
  ) => void;
  retryPolling: (
    paymentIntentId: string | null,
    setupIntentId: string | null
  ) => void;
}

const MAX_RETRIES = 5;
const POLL_INTERVAL = 2000;
const REDIRECT_DELAY_LOGGED_IN = 1000;
const REDIRECT_DELAY_GUEST = 500;
const REDIRECT_DELAY_PRODUCTION = 3000;

export function useBookingPolling(): UseBookingPollingReturn {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<PollingStatus>("loading");
  const [message, setMessage] = useState(
    "Traitement de votre paiement en cours..."
  );
  const [subMessage, setSubMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const webhookTriggeredRef = useRef(false);
  const isInitializedRef = useRef(false);

  const isDevelopment = (): boolean => {
    return typeof window !== "undefined" && window.location.hostname === "localhost";
  };

  const handleBookingSuccess = async (bookingId: string) => {
    setStatus("success");
    setMessage("Réservation créée avec succès !");

    setSubMessage("Connexion en cours...");
    const loginSuccess = await attemptAutoLogin(session, setMessage);

    if (loginSuccess) {
      setSubMessage("Connecté ! Redirection...");
    } else {
      setSubMessage("Redirection vers votre confirmation...");
    }

    setTimeout(() => {
      router.push(`/booking/confirmation/${bookingId}`);
    }, loginSuccess ? REDIRECT_DELAY_LOGGED_IN : REDIRECT_DELAY_GUEST);
  };

  const handleMaxRetriesReached = () => {
    setStatus("success");
    if (isDevelopment()) {
      setMessage(
        "Webhook non déclenché automatiquement. Veuillez utiliser la commande manuelle ci-dessous."
      );
      setStatus("error");
    } else {
      setMessage("Paiement accepté !");
      setSubMessage(
        "Un email de confirmation vous sera envoyé sous peu. Redirection..."
      );
      setTimeout(() => {
        router.push("/");
      }, REDIRECT_DELAY_PRODUCTION);
    }
  };

  const pollForBooking = async (
    paymentIntentId: string | null,
    setupIntentId: string | null,
    currentRetry: number
  ) => {
    try {
      const intentId = paymentIntentId || setupIntentId;
      const intentType = paymentIntentId ? "payment" : "setup";

      const response = await fetch(
        `/api/bookings/by-intent?intentId=${intentId}&intentType=${intentType}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        await handleBookingSuccess(data.data._id);
        return;
      }

      if (currentRetry < MAX_RETRIES) {
        const nextRetry = currentRetry + 1;
        setRetryCount(nextRetry);
        setMessage("Création de votre réservation en cours...");
        setTimeout(
          () => pollForBooking(paymentIntentId, setupIntentId, nextRetry),
          POLL_INTERVAL
        );
      } else {
        handleMaxRetriesReached();
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        "Une erreur est survenue lors de la création de votre réservation"
      );
    }
  };

  const initializePolling = (
    paymentIntentId: string | null,
    setupIntentId: string | null,
    redirectStatus: string | null
  ) => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (!paymentIntentId && !setupIntentId) {
      setStatus("error");
      setMessage("Aucun paiement trouvé");
      return;
    }

    if (redirectStatus !== "succeeded") {
      setStatus("error");
      setMessage("Le paiement n'a pas été complété avec succès");
      return;
    }

    if (paymentIntentId && !webhookTriggeredRef.current) {
      webhookTriggeredRef.current = true;
      triggerTestWebhook(paymentIntentId);
    }

    pollForBooking(paymentIntentId, setupIntentId, 0);
  };

  const retryPolling = (
    paymentIntentId: string | null,
    setupIntentId: string | null
  ) => {
    setStatus("loading");
    setRetryCount(0);
    pollForBooking(paymentIntentId, setupIntentId, 0);
  };

  return {
    status,
    message,
    subMessage,
    retryCount,
    initializePolling,
    retryPolling,
  };
}
