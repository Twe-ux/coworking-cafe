import { EmployeeAvailability } from "../types";

interface AvailabilityTableProps {
  availability: EmployeeAvailability;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames: { [key: string]: string } = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export default function AvailabilityTable({ availability }: AvailabilityTableProps) {
  const calculateDayHours = (day: string) => {
    const schedule = availability[day as keyof typeof availability];
    if (!schedule?.available || !schedule.slots) return 0;

    return schedule.slots.reduce((total, slot) => {
      const start = new Date(`2000-01-01T${slot.start}`);
      const end = new Date(`2000-01-01T${slot.end}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + (diff > 0 ? diff : 0);
    }, 0);
  };

  return (
    <table className="contract-template__table contract-template__table--small contract-template__table--availability">
      <thead>
        <tr>
          <th className="center">Jour</th>
          <th className="center">Disponibilité</th>
          <th className="center">Créneaux</th>
          <th className="center">Total</th>
        </tr>
      </thead>
      <tbody>
        {days.map(day => {
          const schedule = availability[day as keyof typeof availability];
          const availableHours = calculateDayHours(day);

          return (
            <tr key={day}>
              <td className="center bold">{dayNames[day]}</td>
              <td className="center">
                {schedule?.available ? 'Disponible' : 'Repos'}
              </td>
              <td className="center">
                {schedule?.available && schedule.slots && schedule.slots.length > 0
                  ? schedule.slots.map((slot, idx) => `${slot.start}-${slot.end}`).join(', ')
                  : '-'}
              </td>
              <td className="center bold">
                {schedule?.available && schedule.slots && schedule.slots.length > 0
                  ? `${availableHours.toFixed(1)}h`
                  : '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
