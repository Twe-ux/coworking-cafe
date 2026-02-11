import { Schema, Document, Types } from 'mongoose';

/**
 * Interface Task Document
 * Tâche à faire pour l'équipe
 */
export interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;                           // Titre court (max 100 chars)
  description?: string;                    // Description détaillée (optionnel)
  priority: 'high' | 'medium' | 'low';    // 3 niveaux de priorité
  status: 'pending' | 'completed';        // Statut de la tâche
  dueDate?: string;                        // Date limite YYYY-MM-DD (optionnel)
  createdBy: Types.ObjectId;               // Référence User (qui a créé)
  completedBy?: Types.ObjectId;            // Référence User (qui a complété)
  completedAt?: Date;                      // Date/heure de complétion
  recurringTaskId?: Types.ObjectId;        // Ref RecurringTask template (if generated)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema Mongoose pour Task
 */
export const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      required: true,
      default: 'pending',
    },
    dueDate: {
      type: String, // Format YYYY-MM-DD
      validate: {
        validator: function (v: string) {
          // Valider format YYYY-MM-DD
          return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'dueDate must be in YYYY-MM-DD format',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
    recurringTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'RecurringTask',
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// Index pour performances
TaskSchema.index({ status: 1, priority: -1, dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ completedBy: 1 });
TaskSchema.index({ recurringTaskId: 1, status: 1 });
