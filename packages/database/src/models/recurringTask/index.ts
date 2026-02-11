import { Model, model, models } from 'mongoose';
import { RecurringTaskDocument, RecurringTaskSchema } from './document';
import { attachHooks } from './hooks';

export type { RecurringTaskDocument };

let RecurringTaskModel: Model<RecurringTaskDocument>;

if (models.RecurringTask) {
  RecurringTaskModel = models.RecurringTask as Model<RecurringTaskDocument>;
} else {
  attachHooks();
  RecurringTaskModel = model<RecurringTaskDocument>('RecurringTask', RecurringTaskSchema);
}

if (!RecurringTaskModel) {
  throw new Error('RecurringTask model not initialized');
}

export { RecurringTaskModel as RecurringTask };
