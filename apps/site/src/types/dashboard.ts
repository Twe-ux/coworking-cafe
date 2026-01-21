/**
 * Dashboard Types
 * Types pour le dashboard client
 */

export interface BookingData {
  _id: string;
  spaceId: {
    _id: string;
    name: string;
    type: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalBookings: number;
  thisMonthBookings: number;
  totalSpent: number;
  nextBooking: BookingData | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
}

export interface DashboardNavItem {
  href: string;
  icon: string;
  label: string;
}

export interface StatsCardVariant {
  variant: 'primary' | 'success' | 'warning' | 'info';
}
