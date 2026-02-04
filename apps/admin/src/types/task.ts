/**
 * Types pour les tâches (todo list)
 */

/**
 * Priorité de la tâche
 * - high: Rouge (urgent)
 * - medium: Orange (normal)
 * - low: Vert (faible)
 */
export type TaskPriority = "high" | "medium" | "low";

/**
 * Statut de la tâche
 * - pending: À faire
 * - completed: Terminée
 */
export type TaskStatus = "pending" | "completed";

/**
 * Tâche complète
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  createdBy: string; // User ID
  completedBy?: string; // User ID
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Données pour créer une tâche
 */
export interface TaskCreateData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
}

/**
 * Données pour mettre à jour une tâche
 */
export interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  status?: TaskStatus;
}

/**
 * Filtres pour rechercher des tâches
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
}

/**
 * Tâche avec infos utilisateur (pour affichage)
 */
export interface TaskWithUser extends Task {
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  completedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Couleurs de bordure par priorité (pour UI)
 */
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "border-red-500", // Rouge
  medium: "border-orange-500", // Orange
  low: "border-green-500", // Vert
};

/**
 * Labels de priorité (pour affichage)
 */
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Urgent",
  medium: "Normal",
  low: "Faible",
};
