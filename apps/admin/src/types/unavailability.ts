import { Document, Types } from 'mongoose';

export type UnavailabilityType = 'vacation' | 'sick' | 'personal' | 'other';
export type UnavailabilityStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type UnavailabilityRequestedBy = 'admin' | 'employee';

export interface IUnavailability {
  employeeId: Types.ObjectId;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  type: UnavailabilityType;
  status: UnavailabilityStatus;
  requestedBy: UnavailabilityRequestedBy;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnavailabilityDocument extends IUnavailability, Document {}

export interface IUnavailabilityWithEmployee extends Omit<IUnavailability, 'employeeId' | 'approvedBy'> {
  _id: string;
  employeeId: string; // Converted from ObjectId
  approvedBy?: string; // Converted from ObjectId
  employee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
