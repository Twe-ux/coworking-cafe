"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, TestTube, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  areNotificationsSupported,
  areNotificationsEnabled,
} from "@/lib/notifications";

export function NotificationDebug() {
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [swRegistered, setSwRegistered] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Vérifier support
    const isSupported = areNotificationsSupported();
    setSupported(isSupported);

    // Vérifier permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Vérifier Service Worker
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (reg) {
        setSwRegistered(true);
        setRegistration(reg);

        // Vérifier subscription
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    }
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);

    if (perm === "granted") {
      toast({
        title: "Permission accordée",
        description: "Vous pouvez maintenant recevoir des notifications",
      });
    } else {
      toast({
        title: "Permission refusée",
        description: "Vous devez autoriser les notifications dans les paramètres",
        variant: "destructive",
      });
    }
  };

  const handleRegisterSW = async () => {
    const reg = await registerServiceWorker();
    if (reg) {
      setSwRegistered(true);
      setRegistration(reg);
      toast({
        title: "Service Worker enregistré",
        description: "Le service worker est maintenant actif",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le service worker",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async () => {
    if (!registration) {
      toast({
        title: "Erreur",
        description: "Service Worker non enregistré",
        variant: "destructive",
      });
      return;
    }

    const sub = await subscribeToPushNotifications(registration);
    if (sub) {
      setSubscribed(true);
      toast({
        title: "Abonné aux notifications",
        description: "Vous recevrez maintenant les notifications push",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner aux notifications",
        variant: "destructive",
      });
    }
  };

  const handleTestLocalNotification = async () => {
    if (Notification.permission !== "granted") {
      toast({
        title: "Permission requise",
        description: "Accordez d'abord la permission pour les notifications",
        variant: "destructive",
      });
      return;
    }

    // Test avec notification locale (pas de service worker)
    try {
      const notif = new Notification("Test de notification locale", {
        body: "Ceci est une notification de test directe (sans service worker)",
        icon: "/web-app-manifest-192x192.png",
        badge: "/favicon-96x96.png",
        tag: "test-local",
        requireInteraction: false,
      });

      notif.onclick = () => {
        notif.close();
        window.focus();
      };

      toast({
        title: "Notification envoyée",
        description: "Une notification locale devrait apparaître",
      });
    } catch (error) {
      console.error("Erreur notification locale:", error);
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleTestServiceWorkerNotification = async () => {
    if (!registration) {
      toast({
        title: "Erreur",
        description: "Service Worker non enregistré",
        variant: "destructive",
      });
      return;
    }

    try {
      await registration.showNotification("Test via Service Worker", {
        body: "Notification affichée via le service worker",
        icon: "/web-app-manifest-192x192.png",
        badge: "/favicon-96x96.png",
        tag: "test-sw",
        requireInteraction: false,
        data: {
          url: window.location.href,
        },
      });

      toast({
        title: "Notification envoyée",
        description: "Une notification via SW devrait apparaître",
      });
    } catch (error) {
      console.error("Erreur notification SW:", error);
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleTestBadge = async () => {
    try {
      // Import dynamique pour éviter les erreurs SSR
      const { updateAppBadge } = await import("@/lib/notifications");

      // Tester avec le nombre 5
      await updateAppBadge(5);

      toast({
        title: "Badge mis à jour",
        description: "Le badge devrait afficher '5'. Vérifiez la console pour les logs.",
      });

      // Après 3 secondes, le supprimer
      setTimeout(async () => {
        await updateAppBadge(0);
        toast({
          title: "Badge supprimé",
          description: "Le badge a été effacé",
        });
      }, 3000);
    } catch (error) {
      console.error("Erreur test badge:", error);
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const StatusBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {condition ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      )}
      <span className="text-sm">{label}</span>
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? "OK" : "NON"}
      </Badge>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Debug Notifications
        </CardTitle>
        <CardDescription>
          Outil de diagnostic pour les notifications push PWA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-3">
          <h3 className="font-semibold">État du système</h3>
          <div className="space-y-2 pl-4">
            <StatusBadge condition={supported} label="Notifications supportées" />
            <StatusBadge condition={permission === "granted"} label="Permission accordée" />
            <StatusBadge condition={swRegistered} label="Service Worker enregistré" />
            <StatusBadge condition={subscribed} label="Abonné aux push notifications" />
          </div>
        </div>

        {/* Info navigateur */}
        <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
          <div><strong>Navigateur:</strong> {navigator.userAgent.includes('Safari') ? 'Safari' : navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Autre'}</div>
          <div><strong>iOS:</strong> {/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'Oui' : 'Non'}</div>
          <div><strong>Standalone (Installée):</strong> {
            ('standalone' in window.navigator && (window.navigator as any).standalone) ||
            window.matchMedia('(display-mode: standalone)').matches ? 'Oui ✅' : 'Non ❌'
          }</div>
          <div><strong>Permission:</strong> {permission}</div>
          <div><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supporté ✅' : 'Non supporté ❌'}</div>
          <div><strong>Push Manager:</strong> {'PushManager' in window ? 'Supporté ✅' : 'Non supporté ❌'}</div>
          <div><strong>Notification API:</strong> {'Notification' in window ? 'Supporté ✅' : 'Non supporté ❌'}</div>
          <div><strong>Badge API:</strong> {'setAppBadge' in navigator ? 'Supporté ✅' : 'Non supporté ❌'}</div>
        </div>

        {/* Limitation iOS */}
        {/iPhone|iPad|iPod/.test(navigator.userAgent) && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Limitation iOS
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Les Web Push Notifications ne sont pas supportées sur iOS/iPhone, même en PWA.
                  Seule la Badge API fonctionne (pastille sur l'icône).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleRequestPermission}
              disabled={permission === "granted"}
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Demander permission
            </Button>

            <Button
              onClick={handleRegisterSW}
              disabled={swRegistered}
              variant="outline"
            >
              Enregistrer SW
            </Button>

            <Button
              onClick={handleSubscribe}
              disabled={!swRegistered || subscribed || permission !== "granted"}
              variant="outline"
            >
              S'abonner aux push
            </Button>

            <Button onClick={checkStatus} variant="outline">
              Rafraîchir statut
            </Button>
          </div>
        </div>

        {/* Tests */}
        <div className="space-y-3">
          <h3 className="font-semibold">Tests de notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={handleTestLocalNotification}
              disabled={permission !== "granted"}
              variant="secondary"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test notification locale
            </Button>

            <Button
              onClick={handleTestServiceWorkerNotification}
              disabled={!swRegistered || permission !== "granted"}
              variant="secondary"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test via Service Worker
            </Button>

            <Button
              onClick={handleTestBadge}
              variant="secondary"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Badge (iOS/PWA)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Le test Badge affiche '5' pendant 3 secondes puis efface. Regardez la console pour les logs détaillés.
          </p>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-muted rounded-lg text-xs space-y-2">
          <p className="font-semibold">Comment tester :</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Cliquez sur "Demander permission" et acceptez</li>
            <li>Cliquez sur "Test notification locale" - une notification doit apparaître</li>
            <li>Si elle n'apparaît pas, vérifiez les paramètres système</li>
            <li>Ensuite testez "Test via Service Worker"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
