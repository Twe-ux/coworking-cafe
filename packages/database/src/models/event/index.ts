import { Model, model, models } from "mongoose";
import { EventDocument, EventSchema } from "./document";
import { attachHooks } from "./hooks";
import { EventMethods } from "./methods";
import { VirtualEvent } from "./virtuals";

export type Event = VirtualEvent & EventMethods;

let EventModel: Model<EventDocument>;

if (models.Event) {
  EventModel = models.Event as Model<EventDocument>;
} else {
  attachHooks();
  EventModel = model<EventDocument>("Event", EventSchema);
}

if (!EventModel) {
  throw new Error("Event model not initialized");
}

export { EventModel as Event };
export * from "./document";
export * from "./constants";
