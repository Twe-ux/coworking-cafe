import { Model, model, models } from 'mongoose';
import { TaskDocument, TaskSchema } from './document';
import { attachHooks } from './hooks';

export type { TaskDocument };

let TaskModel: Model<TaskDocument>;

if (models.Task) {
  TaskModel = models.Task as Model<TaskDocument>;
} else {
  attachHooks();
  TaskModel = model<TaskDocument>('Task', TaskSchema);
}

if (!TaskModel) {
  throw new Error('Task model not initialized');
}

export { TaskModel as Task };
