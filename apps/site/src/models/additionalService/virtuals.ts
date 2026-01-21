import { Schema } from 'mongoose';
import { AdditionalServiceDocument } from './document';

export function addVirtuals(schema: Schema<AdditionalServiceDocument>) {
  // Label de la catégorie en français
  schema.virtual('categoryLabel').get(function (this: AdditionalServiceDocument) {
    const labels: Record<string, string> = {
      food: 'Nourriture',
      beverage: 'Boissons',
      equipment: 'Équipement',
      other: 'Autre',
    };
    return labels[this.category] || this.category;
  });

  // Label de l'unité de prix en français
  schema.virtual('priceUnitLabel').get(function (this: AdditionalServiceDocument) {
    return this.priceUnit === 'per-person' ? 'par personne' : 'forfait';
  });

  // Prix formaté
  schema.virtual('formattedPrice').get(function (this: AdditionalServiceDocument) {
    return `${this.price.toFixed(2)}€`;
  });

  // Prix avec unité
  schema.virtual('priceWithUnit').get(function (this: AdditionalServiceDocument) {
    const unit = this.priceUnit === 'per-person' ? '/pers' : '';
    return `${this.price.toFixed(2)}€${unit}`;
  });

  // Est disponible
  schema.virtual('isAvailable').get(function (this: AdditionalServiceDocument) {
    return this.isActive && !this.isDeleted;
  });
}

// Extend the document interface with virtuals
declare module './document' {
  interface AdditionalServiceDocument {
    categoryLabel: string;
    priceUnitLabel: string;
    formattedPrice: string;
    priceWithUnit: string;
    isAvailable: boolean;
  }
}
