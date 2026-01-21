/**
 * Common Types - apps/site
 * Types communs réutilisables dans toute l'application
 */

/**
 * Réponse API standard
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paramètres de tri
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Option de sélection (pour Select/Dropdown)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

/**
 * État de chargement
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Erreur API structurée
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Métadonnées de page (pour SEO)
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/**
 * Item de breadcrumb
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

/**
 * Coordonnées géographiques
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Adresse postale
 */
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Plage horaire
 */
export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

/**
 * Plage de dates
 */
export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Fichier uploadé
 */
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

/**
 * Résultat d'une action (Success/Error)
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Valeur nullable
 */
export type Nullable<T> = T | null;

/**
 * Valeur optionnelle
 */
export type Optional<T> = T | undefined;

/**
 * Rendre toutes les propriétés optionnelles sauf certaines
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Props de base pour tous les composants
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}
