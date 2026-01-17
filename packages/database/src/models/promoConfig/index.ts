import { Model, model, models, HydratedDocument } from 'mongoose'
import { PromoConfigDocument, PromoConfigSchema } from './document'
import { attachHooks } from './hooks'
import { PromoConfigMethods } from './methods'
import { VirtualPromoConfig } from './virtuals'
import './methods' // Import methods to apply them
import './virtuals' // Import virtuals to apply them

// Type complet avec méthodes et virtuals
export type PromoConfigWithMethods = HydratedDocument<PromoConfigDocument> & PromoConfigMethods

// Type Model avec méthodes
export type PromoConfigModelType = Model<PromoConfigDocument, {}, PromoConfigMethods>

export type PromoConfig = VirtualPromoConfig & PromoConfigMethods

let PromoConfigModel: PromoConfigModelType

if (models.PromoConfig) {
  PromoConfigModel = models.PromoConfig as PromoConfigModelType
} else {
  attachHooks()
  PromoConfigModel = model<PromoConfigDocument, PromoConfigModelType>(
    'PromoConfig',
    PromoConfigSchema
  )
}

if (!PromoConfigModel) {
  throw new Error('PromoConfig model not initialized')
}

export { PromoConfigModel as PromoConfig }
export default PromoConfigModel
export type { PromoConfigDocument } from './document'
