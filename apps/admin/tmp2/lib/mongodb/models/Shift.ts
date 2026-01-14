import mongoose, { Document, Schema } from "mongoose";

export interface IShift extends Document {
  staffId: mongoose.Types.ObjectId; // Référence à l'identifiant du staff
  firstName: string; // Prénom du Staff
  lastName: string; // Nom du Staff
  date: string; // Date du pointage
  firstShift: {
    start: string; // Heure de début du premier shift
    end: string; // Heure de fin du premier shift
  };
  secondShift: {
    start: string; // Heure de début du deuxième shift
    end: string; // Heure de fin du deuxième shift
  };
}

const ShiftSchema: Schema = new Schema({
  staffId: {
    type: mongoose.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  firstShift: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  secondShift: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
});

export default mongoose.models.Shift ||
  mongoose.model<IShift>("Shift", ShiftSchema);
