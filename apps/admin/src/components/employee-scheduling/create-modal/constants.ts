export const EMPLOYEE_ROLES = [
  {
    value: 'Manager',
    label: 'Manager',
    description: "Responsable d'équipe",
  },
  {
    value: 'Assistant manager',
    label: 'Assistant manager',
    description: 'Responsable adjoint',
  },
  {
    value: 'Employé polyvalent',
    label: 'Employé polyvalent',
    description: 'Employé standard',
  },
] as const

export const EMPLOYEE_COLORS = [
  { value: 'bg-blue-500', label: 'Bleu', color: '#3B82F6' },
  { value: 'bg-green-500', label: 'Vert', color: '#10B981' },
  { value: 'bg-purple-500', label: 'Violet', color: '#8B5CF6' },
  { value: 'bg-orange-500', label: 'Orange', color: '#F97316' },
  { value: 'bg-pink-500', label: 'Rose', color: '#EC4899' },
  { value: 'bg-yellow-500', label: 'Jaune', color: '#EAB308' },
  { value: 'bg-cyan-500', label: 'Cyan', color: '#06B6D4' },
  { value: 'bg-lime-500', label: 'Lime', color: '#84CC16' },
] as const
