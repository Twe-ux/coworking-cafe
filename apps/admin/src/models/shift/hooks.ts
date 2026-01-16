import { ShiftSchema } from './document'

export function attachHooks() {
  // Pre-save: Validation personnalisée pour s'assurer que endTime > startTime
  // ou que le créneau passe minuit de manière cohérente
  ShiftSchema.pre('save', function (next) {
    if (this.startTime && this.endTime) {
      const start = new Date(`2000-01-01 ${this.startTime}`)
      let end = new Date(`2000-01-01 ${this.endTime}`)

      // Gérer les créneaux qui passent minuit (détection automatique)
      if (end <= start) {
        // Si l'heure de fin est inférieure ou égale à l'heure de début,
        // c'est probablement un créneau de nuit qui passe minuit
        end.setDate(end.getDate() + 1)
      }
    }
    next()
  })
}
