/**
 * Types pour la gestion des messages de contact
 */

export type ContactMailStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMailStatus;
  reply?: string;
  repliedAt?: string; // ISO date string
  repliedBy?: string; // User ID
  userId?: string; // If contact came from authenticated user
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ContactMailFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMailUpdate {
  status?: ContactMailStatus;
  reply?: string;
}

export interface ContactMailFilters {
  status?: ContactMailStatus | 'all';
  page?: number;
  limit?: number;
}

export interface ContactMailPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ContactMailListResponse {
  success: boolean;
  data?: ContactMail[];
  pagination?: ContactMailPagination;
  error?: string;
}

export interface ContactMailResponse {
  success: boolean;
  data?: ContactMail;
  error?: string;
}

export interface ContactMailStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}
