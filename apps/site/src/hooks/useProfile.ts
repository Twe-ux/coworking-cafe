import { useState, useCallback } from 'react';
import type { ClientProfile, UpdateProfileData, ApiResponse } from '@/types';

interface UseProfileReturn {
  profile: ClientProfile | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
}

/**
 * Hook pour gérer le profil utilisateur
 * Fetch, update, loading states
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  /**
   * Récupérer le profil utilisateur
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile');
      const result: ApiResponse<ClientProfile> = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors du chargement du profil');
        return;
      }

      setProfile(result.data || null);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour le profil utilisateur
   * @returns true si succès, false sinon
   */
  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors de la mise à jour');
        return false;
      }

      // Optimistic update: mettre à jour le profil localement
      if (profile) {
        setProfile({
          ...profile,
          ...data
        });
      }

      return true;
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updating,
    fetchProfile,
    updateProfile
  };
}
