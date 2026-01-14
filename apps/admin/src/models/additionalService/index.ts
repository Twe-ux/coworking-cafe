import mongoose from 'mongoose';
import AdditionalServiceSchema, { AdditionalServiceDocument } from './document';
import { addMethods } from './methods';
import { addHooks } from './hooks';
import { addVirtuals } from './virtuals';

// Ajouter les méthodes, hooks et virtuals
addMethods(AdditionalServiceSchema);
addHooks(AdditionalServiceSchema);
addVirtuals(AdditionalServiceSchema);

// Set toJSON options to include virtuals
AdditionalServiceSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    const { __v, ...rest } = ret;
    return rest;
  },
});

// Créer et exporter le modèle
const AdditionalService =
  mongoose.models.AdditionalService ||
  mongoose.model<AdditionalServiceDocument>('AdditionalService', AdditionalServiceSchema);

export default AdditionalService;
export type { AdditionalServiceDocument };
