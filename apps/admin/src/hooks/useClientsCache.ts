import { useState, useEffect, useCallback } from "react";

interface ClientData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface ApiUserData {
  id: string;
  givenName?: string;
  username?: string;
  email: string;
  phone?: string;
  companyName?: string;
}

const CACHE_KEY = "clients-cache";
const CACHE_TIMESTAMP_KEY = "clients-cache-timestamp";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache global partagé entre toutes les instances du hook
let clientsCache: ClientData[] | null = null;
let cachePromise: Promise<ClientData[]> | null = null;

// Charger le cache depuis sessionStorage
function loadCacheFromStorage(): ClientData[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);

      // Si le cache a moins de 30 minutes, l'utiliser
      if (age < CACHE_DURATION) {
        console.log("📦 Cache chargé depuis sessionStorage (âge:", Math.round(age / 1000), "s)");
        return JSON.parse(cached);
      } else {
        console.log("⏰ Cache expiré, suppression...");
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erreur lors du chargement du cache:", error.message);
    } else {
      console.error("Erreur inconnue lors du chargement du cache");
    }
  }
  return null;
}

// Sauvegarder le cache dans sessionStorage
function saveCacheToStorage(data: ClientData[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log("💾 Cache sauvegardé dans sessionStorage");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erreur lors de la sauvegarde du cache:", error.message);
    } else {
      console.error("Erreur inconnue lors de la sauvegarde du cache");
    }
  }
}

// Initialiser le cache depuis sessionStorage au chargement du module
if (typeof window !== "undefined") {
  clientsCache = loadCacheFromStorage();
}

/**
 * Hook pour gérer le cache des clients
 * - Charge les clients une seule fois par session
 * - Partage le cache entre toutes les instances
 * - Permet de rafraîchir manuellement si nécessaire
 */
export function useClientsCache() {
  const [clients, setClients] = useState<ClientData[]>(clientsCache || []);
  const [loading, setLoading] = useState(!clientsCache);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (force = false) => {
    // Si on a déjà un cache et qu'on ne force pas le refresh, retourner le cache
    if (clientsCache && !force) {
      setClients(clientsCache);
      setLoading(false);
      return clientsCache;
    }

    // Si un fetch est déjà en cours, attendre sa résolution
    if (cachePromise && !force) {
      try {
        const data = await cachePromise;
        setClients(data);
        setLoading(false);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setLoading(false);
        return [];
      }
    }

    // Démarrer un nouveau fetch
    setLoading(true);
    setError(null);

    cachePromise = (async () => {
      try {
        const response = await fetch("/api/users?excludeNewsletterOnly=true");
        const data = await response.json();

        if (data.success) {
          const clientsData: ClientData[] = data.data.map((user: ApiUserData) => ({
            id: user.id,
            name: user.givenName || user.username || user.email,
            email: user.email,
            phone: user.phone || "",
            company: user.companyName || "",
          }));

          // Mettre à jour le cache global et sessionStorage
          clientsCache = clientsData;
          saveCacheToStorage(clientsData);
          setClients(clientsData);
          console.log("👥 Clients chargés et mis en cache:", clientsData.length);
          return clientsData;
        } else {
          throw new Error(data.error || "Erreur lors du chargement");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur de chargement";
        setError(errorMessage);
        console.error("Error fetching clients:", err);
        return [];
      } finally {
        setLoading(false);
        cachePromise = null;
      }
    })();

    return cachePromise;
  }, []);

  // Charger les clients au montage si pas en cache
  useEffect(() => {
    if (!clientsCache) {
      fetchClients();
    }
  }, [fetchClients]);

  // Fonction pour rafraîchir le cache
  const refresh = useCallback(() => {
    return fetchClients(true);
  }, [fetchClients]);

  // Fonction pour ajouter un client au cache
  const addToCache = useCallback((newClient: ClientData) => {
    if (clientsCache) {
      clientsCache = [newClient, ...clientsCache];
      saveCacheToStorage(clientsCache);
      setClients(clientsCache);
    }
  }, []);

  // Fonction pour mettre à jour un client dans le cache
  const updateInCache = useCallback((updatedClient: ClientData) => {
    if (clientsCache && updatedClient.id) {
      clientsCache = clientsCache.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      );
      saveCacheToStorage(clientsCache);
      setClients(clientsCache);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    refresh,
    addToCache,
    updateInCache,
  };
}
