import { EmployeeAvailability } from "../types";

interface DistributionTableProps {
  availability: EmployeeAvailability;
  weeklyDistributionData: { [key: string]: { [week: string]: string } };
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

export default function DistributionTable({ availability, weeklyDistributionData }: DistributionTableProps) {
  const calculateWeekTotal = (week: string) => {
    return days.reduce((total, day) => {
      const hours = parseFloat(weeklyDistributionData[day]?.[week] || '0');
      return total + hours;
    }, 0);
  };

  return (
    <table className="contract-template__table contract-template__table--small contract-template__table--distribution">
      <thead>
        <tr>
          <th>Jour</th>
          <th className="center">Semaine 1</th>
          <th className="center">Semaine 2</th>
          <th className="center">Semaine 3</th>
          <th className="center">Semaine 4</th>
        </tr>
      </thead>
      <tbody>
        {days.map(day => {
          const schedule = availability[day as keyof typeof availability];

          return (
            <tr key={day}>
              <td className="bold small-padding">{dayNames[day]}</td>
              {['week1', 'week2', 'week3', 'week4'].map(week => (
                <td key={week} className="center small-padding">
                  {schedule?.available ? (weeklyDistributionData[day]?.[week] || '0') + 'h' : 'Repos'}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td className="small-padding">Total</td>
          {['week1', 'week2', 'week3', 'week4'].map(week => {
            const total = calculateWeekTotal(week);
            return (
              <td key={week} className="center small-padding">
                {total.toFixed(1)}h
              </td>
            );
          })}
        </tr>
      </tfoot>
    </table>
  );
}
