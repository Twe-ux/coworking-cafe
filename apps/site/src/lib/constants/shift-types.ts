// Types de shifts prédéfinis
export interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export const DEFAULT_SHIFT_TYPES: ShiftType[] = [
  {
    id: 'morning',
    name: 'Morning',
    startTime: '09:30',
    endTime: '14:30',
  },
  {
    id: 'afternoon',
    name: 'Afternoon',
    startTime: '12:00',
    endTime: '18:00',
  },
  {
    id: 'evening',
    name: 'Evening',
    startTime: '18:00',
    endTime: '22:00',
  },
  {
    id: 'night',
    name: 'Night',
    startTime: '22:00',
    endTime: '06:00',
  },
];

// Fonction pour charger les shift types depuis le localStorage
export const getShiftTypes = (): ShiftType[] => {
  if (typeof window === 'undefined') return DEFAULT_SHIFT_TYPES;

  const stored = localStorage.getItem('__SHIFT_TYPES__');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SHIFT_TYPES;
    }
  }
  return DEFAULT_SHIFT_TYPES;
};

// Fonction pour sauvegarder les shift types dans le localStorage
export const saveShiftTypes = (shiftTypes: ShiftType[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('__SHIFT_TYPES__', JSON.stringify(shiftTypes));
};
