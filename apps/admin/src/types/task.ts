/**
 * Types pour les tâches (todo list)
 */

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "completed";
export type RecurrenceType = "weekly" | "monthly";
/**
 * Extensible metadata for task categorization
 */
export interface TaskMetadata {
  type?: string;
  inventoryType?: string;
  inventoryEntryId?: string;
  productId?: string;
  [key: string]: unknown;
}

/**
 * Task instance
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdBy: string;
  completedBy?: string;
  completedAt?: string;
  recurringTaskId?: string;
  metadata?: TaskMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
}

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
 * Recurring task template
 */
export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
  active: boolean;
  metadata?: TaskMetadata;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTaskCreateData {
  title: string;
  description?: string;
  priority: TaskPriority;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
  metadata?: TaskMetadata;
}

export interface RecurringTaskUpdateData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  recurrenceType?: RecurrenceType;
  recurrenceDays?: number[];
  active?: boolean;
}

/**
 * UI constants
 */
export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "border-red-500",
  medium: "border-orange-500",
  low: "border-green-500",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Urgent",
  medium: "Normal",
  low: "Faible",
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Dim",
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
  6: "Sam",
};
