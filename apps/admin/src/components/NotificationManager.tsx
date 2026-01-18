"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  initializeNotifications,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  areNotificationsSupported,
} from "@/lib/notifications";
import { toast } from "sonner";

/**
 * Composant pour gérer les notifications PWA
 * - Initialise le service worker
 * - Demande la permission pour les notifications
 * - Gère l'abonnement aux push notifications
 */
export function NotificationManager() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialiser les notifications au montage du composant
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // Vérifier le support
        const isSupported = areNotificationsSupported();
        setSupported(isSupported);

        if (!isSupported) {
          console.warn("[NotificationManager] Notifications not supported");
          setLoading(false);
          return;
        }

        // Initialiser
        const { enabled, registration } = await initializeNotifications();

        setEnabled(enabled);
        setRegistration(registration);
        setLoading(false);

        if (enabled) {
          console.log("[NotificationManager] Notifications enabled");
        }
      } catch (error) {
        console.error("[NotificationManager] Initialization error:", error);
        setLoading(false);
      }
    }

    init();
  }, []);

  // Activer les notifications
  const handleEnable = async () => {
    try {
      setLoading(true);

      // Demander la permission
      const permission = await requestNotificationPermission();

      if (permission !== "granted") {
        toast.error("Permission refusée", {
          description: "Vous devez autoriser les notifications dans votre navigateur.",
        });
        setLoading(false);
        return;
      }

      // S'abonner aux push notifications
      if (registration) {
        const subscription = await subscribeToPushNotifications(registration);

        if (subscription) {
          setEnabled(true);
          toast.success("Notifications activées", {
            description: "Vous recevrez une notification pour chaque nouveau message de contact.",
          });
        } else {
          toast.error("Erreur d'activation", {
            description: "Impossible d'activer les notifications.",
          });
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("[NotificationManager] Enable error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'activation des notifications.",
      });
      setLoading(false);
    }
  };

  // Désactiver les notifications
  const handleDisable = async () => {
    try {
      setLoading(true);

      if (registration) {
        const success = await unsubscribeFromPushNotifications(registration);

        if (success) {
          setEnabled(false);
          toast.success("Notifications désactivées");
        } else {
          toast.error("Erreur de désactivation");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("[NotificationManager] Disable error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la désactivation des notifications.",
      });
      setLoading(false);
    }
  };

  // Ne rien afficher si les notifications ne sont pas supportées
  if (!supported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!enabled && (
        <Button
          onClick={handleEnable}
          disabled={loading}
          className="shadow-lg"
          size="lg"
        >
          <Bell className="w-5 h-5 mr-2" />
          {loading ? "Chargement..." : "Activer les notifications"}
        </Button>
      )}

      {enabled && (
        <Button
          onClick={handleDisable}
          disabled={loading}
          variant="outline"
          className="shadow-lg"
          size="icon"
          title="Désactiver les notifications"
        >
          <BellOff className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
