import { Model, model, models, HydratedDocument } from 'mongoose'
import { ITimeEntry, ITimeEntryMethods, TimeEntrySchema } from './document'
import { attachHooks } from './hooks'
import './methods'
import { VirtualTimeEntry } from './virtuals'

export type TimeEntry = VirtualTimeEntry & ITimeEntryMethods

// Type complet avec méthodes
export type TimeEntryWithMethods = HydratedDocument<ITimeEntry> & ITimeEntryMethods

// Type Model avec méthodes
export type TimeEntryModelType = Model<ITimeEntry, {}, ITimeEntryMethods>

let TimeEntryModel: TimeEntryModelType

// IMPORTANT: Toujours supprimer le modèle en cache pour forcer l'utilisation du schéma à jour
// Cela résout le problème où un modèle avec un ancien schéma (avant ajout des champs
// justificationNote/justificationRead) peut rester en cache et ignorer les nouveaux champs
if (models.TimeEntry) {
  delete models.TimeEntry
}

// Toujours créer un nouveau modèle avec le schéma actuel
attachHooks()
TimeEntryModel = model<ITimeEntry, TimeEntryModelType>('TimeEntry', TimeEntrySchema)

if (!TimeEntryModel) {
  throw new Error('TimeEntry model not initialized')
}

export default TimeEntryModel
export type { ITimeEntry }
