import { Schema } from 'mongoose';
import { AdditionalServiceDocument } from './document';

export function addMethods(schema: Schema<AdditionalServiceDocument>) {
  // Activer le service
  schema.methods.activate = function (this: AdditionalServiceDocument) {
    this.isActive = true;
    return this.save();
  };

  // Désactiver le service
  schema.methods.deactivate = function (this: AdditionalServiceDocument) {
    this.isActive = false;
    return this.save();
  };

  // Soft delete
  schema.methods.softDelete = function (this: AdditionalServiceDocument) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.isActive = false;
    return this.save();
  };

  // Calculer le prix pour un nombre de personnes
  schema.methods.calculatePrice = function (
    this: AdditionalServiceDocument,
    numberOfPeople: number = 1
  ): number {
    if (this.priceUnit === 'per-person') {
      return this.price * numberOfPeople;
    }
    return this.price;
  };

  // Vérifier si le service est disponible pour un type d'espace
  schema.methods.isAvailableForSpaceType = function (
    this: AdditionalServiceDocument,
    spaceType: string
  ): boolean {
    if (!this.availableForSpaceTypes || this.availableForSpaceTypes.length === 0) {
      return true; // Disponible pour tous les types si non spécifié
    }
    return this.availableForSpaceTypes.includes(spaceType);
  };
}

// Extend the document interface with methods
declare module './document' {
  interface AdditionalServiceDocument {
    activate(): Promise<AdditionalServiceDocument>;
    deactivate(): Promise<AdditionalServiceDocument>;
    softDelete(): Promise<AdditionalServiceDocument>;
    calculatePrice(numberOfPeople?: number): number;
    isAvailableForSpaceType(spaceType: string): boolean;
  }
}
