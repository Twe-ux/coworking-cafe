import { Model, model, models } from "mongoose";
import { EventRegistrationDocument, EventRegistrationSchema } from "./document";
import { attachHooks } from "./hooks";

let EventRegistrationModel: Model<EventRegistrationDocument>;

if (models.EventRegistration) {
  EventRegistrationModel = models.EventRegistration as Model<EventRegistrationDocument>;
} else {
  attachHooks();
  EventRegistrationModel = model<EventRegistrationDocument>(
    "EventRegistration",
    EventRegistrationSchema
  );
}

if (!EventRegistrationModel) {
  throw new Error("EventRegistration model not initialized");
}

export { EventRegistrationModel as EventRegistration };
export * from "./document";
