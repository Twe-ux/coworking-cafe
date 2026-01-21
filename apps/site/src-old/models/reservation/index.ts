import { Model, model, models } from "mongoose";
import { ReservationDocument, ReservationSchema } from "./document";
import { attachHooks } from "./hooks";
import { ReservationMethods } from "./methods";
import { VirtualReservation } from "./virtuals";

export type Reservation = VirtualReservation & ReservationMethods;

let ReservationModel: Model<ReservationDocument>;

if (models.Reservation) {
  ReservationModel = models.Reservation as Model<ReservationDocument>;
} else {
  attachHooks();
  ReservationModel = model<ReservationDocument>("Reservation", ReservationSchema);
}

if (!ReservationModel) {
  throw new Error("Reservation model not initialized");
}

export { ReservationModel as Reservation };
