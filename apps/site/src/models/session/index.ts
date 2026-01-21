import { Model, model, models } from "mongoose";
import { SessionDocument, SessionSchema } from "./document";
import { attachHooks } from "./hooks";
import { SessionMethods } from "./methods";
import { VirtualSession } from "./virtuals";

export type Session = VirtualSession & SessionMethods;

let SessionModel: Model<SessionDocument>;

if (models.Session) {
  SessionModel = models.Session as Model<SessionDocument>;
} else {
  attachHooks();
  SessionModel = model<SessionDocument>("Session", SessionSchema);
}

if (!SessionModel) {
  throw new Error("Session model not initialized");
}

export { SessionModel as Session };
