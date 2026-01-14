import { Document } from "mongoose";

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface ExceptionalClosure {
  date: Date;
  reason?: string;
  startTime?: string;
  endTime?: string;
  isFullDay: boolean;
}

export interface GlobalHoursConfigurationDocument extends Document {
  defaultHours: WeeklyHours;
  exceptionalClosures: ExceptionalClosure[];
  createdAt: Date;
  updatedAt: Date;
}
