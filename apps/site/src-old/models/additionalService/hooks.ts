import { Schema } from 'mongoose';
import { AdditionalServiceDocument } from './document';
import slugify from 'slugify';

export function addHooks(schema: Schema<AdditionalServiceDocument>) {
  // Pre-save hook pour générer le slug automatiquement
  schema.pre('save', async function (this: AdditionalServiceDocument, next) {
    // Générer le slug à partir du nom si non fourni ou vide
    if ((this.isModified('name') || this.isNew) && (!this.slug || this.slug === '')) {
      this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        trim: true,
      });

      // Vérifier l'unicité du slug
      const mongoose = await import('mongoose');
      const existingService = await mongoose.default.models.AdditionalService?.findOne({
        slug: this.slug,
        _id: { $ne: this._id },
      });

      if (existingService) {
        this.slug = `${this.slug}-${Date.now()}`;
      }
    }

    next();
  });

  // Pre-save hook pour définir deletedAt lors d'un soft delete
  schema.pre('save', function (next) {
    if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
      this.deletedAt = new Date();
    }
    next();
  });
}
