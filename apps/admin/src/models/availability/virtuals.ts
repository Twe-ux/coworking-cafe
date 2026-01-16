import { AvailabilityDocument } from './document'

export type VirtualAvailability = AvailabilityDocument

// Example of virtual properties:
// AvailabilitySchema.virtual('virtualPropertyName').get(function(this: AvailabilityDocument) {
//   return // computed value
// })
