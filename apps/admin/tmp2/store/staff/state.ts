export interface StaffState {
  loading: boolean;
  data: Staff[] | undefined;
  error: string | null;
  success: boolean;
}

export const InitialStaffState: StaffState = {
  loading: false,
  data: undefined,
  success: false,
  error: null as string | null,
};

export interface Staff {
  date: string | number | Date;
  mdp: number;
  _id: string;
  id: string;
  isActive: boolean; // Mis à jour vers le format moderne
  firstName: string;
  lastName: string;
  email: string;
  startTime: string;
  endTime: string;
  phone?: string; // Mis à jour vers le format moderne
}
