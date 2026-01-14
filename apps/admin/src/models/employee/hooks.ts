import { EmployeeSchema } from "./document";

export function attachHooks() {
  // Pre-save hook pour valider les dates
  EmployeeSchema.pre("save", function (next) {
    // Si CDD ou Stage, vérifier qu'une date de fin est fournie
    if ((this.contractType === 'CDD' || this.contractType === 'Stage') && !this.endDate) {
      return next(new Error(`Une date de fin est requise pour un contrat de type ${this.contractType}`));
    }

    // Vérifier que la date de fin est après la date d'embauche
    if (this.endDate && this.endDate <= this.hireDate) {
      return next(new Error("La date de fin doit être postérieure à la date d'embauche"));
    }

    next();
  });
}
