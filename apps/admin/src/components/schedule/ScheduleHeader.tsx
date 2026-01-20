/**
 * Schedule page header component
 * Displays title and description for the schedule page
 */

interface ScheduleHeaderProps {
  title?: string;
  description?: string;
}

export function ScheduleHeader({
  title = "Planning",
  description = "Gestion des créneaux de travail",
}: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
