/**
 * User Types - apps/site
 * Types pour les utilisateurs clients
 */

/**
 * Profil client complet
 */
export interface ClientProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'client';
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
  language: 'fr' | 'en';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

/**
 * Paramètres de notifications
 */
export interface NotificationSettings {
  email: boolean;
  bookingReminders: boolean;
  promotions: boolean;
  newsletter: boolean;
}

/**
 * Paramètres de confidentialité
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
}

/**
 * Statistiques utilisateur
 */
export interface UserStats {
  totalBookings: number;
  totalSpent: number;
  favoriteSpace?: string;
  memberSince: Date;
  loyaltyPoints: number;
}

/**
 * Paramètres utilisateur (pour page settings)
 */
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: 'fr' | 'en';
}

/**
 * Données de mise à jour du profil
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Données de changement de mot de passe
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Session utilisateur (NextAuth)
 */
export interface UserSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'client';
    image?: string;
  };
  expires: string;
}
