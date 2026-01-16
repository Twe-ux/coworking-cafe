import { Model, model, models } from 'mongoose'
import { AvailabilityDocument, AvailabilitySchema } from './document'
import { attachHooks } from './hooks'
import { AvailabilityMethods } from './methods'
import { VirtualAvailability } from './virtuals'

export type Availability = VirtualAvailability & AvailabilityMethods

let AvailabilityModel: Model<AvailabilityDocument>

if (models.Availability) {
  AvailabilityModel = models.Availability as Model<AvailabilityDocument>
} else {
  attachHooks()
  AvailabilityModel = model<AvailabilityDocument>('Availability', AvailabilitySchema)
}

if (!AvailabilityModel) {
  throw new Error('Availability model not initialized')
}

export { AvailabilityModel as Availability }
export type { AvailabilityDocument } from './document'
