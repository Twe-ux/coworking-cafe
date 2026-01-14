import { CardFooter } from "@/components/ui/card";

interface ShiftInfo {
  start: string;
  end: string;
  elapsed: string;
}

interface StaffCardFooterProps {
  firstShift: ShiftInfo;
  secondShift: ShiftInfo;
}

export default function StaffCardFooter({
  firstShift,
  secondShift,
}: StaffCardFooterProps) {
  // Déterminer si le deuxième shift doit être affiché
  const shouldShowSecondShift =
    secondShift.start &&
    secondShift.start !== "--:--" &&
    secondShift.start !== "";

  // Fonction pour calculer la durée d'un shift
  const calculateShiftDuration = (
    start: string,
    end: string,
    elapsed: string,
  ) => {
    // Si on a déjà la durée en temps réel, l'utiliser
    if (elapsed) return elapsed;

    // Sinon, calculer la durée si les deux temps sont disponibles
    if (start && start !== "--:--" && end && end !== "--:--") {
      try {
        // Créer des dates aujourd'hui avec les heures
        const today = new Date().toDateString();
        const startTime = new Date(`${today} ${start}`);
        const endTime = new Date(`${today} ${end}`);

        const diff = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      } catch {
        return "";
      }
    }

    return "";
  };

  const firstShiftDuration = calculateShiftDuration(
    firstShift.start,
    firstShift.end,
    firstShift.elapsed,
  );
  const secondShiftDuration = calculateShiftDuration(
    secondShift.start,
    secondShift.end,
    secondShift.elapsed,
  );

  return (
    <CardFooter className="flex-row items-start gap-5 text-sm">
      {/* Premier Shift */}
      <div className="w-full">
        <div className="mb-1 font-semibold text-blue-600">Premier Shift</div>
        <div className="flex w-full justify-between">
          <div className="line-clamp-1 flex gap-2 font-medium">Début</div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            {firstShift.start || "--:--"}
          </div>
        </div>
        <div className="flex w-full justify-between">
          <div className="line-clamp-1 flex gap-2 font-medium">Fin</div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            {firstShift.end || "--:--"}
          </div>
        </div>
        {/* Afficher la durée si le shift a commencé */}
        {firstShift.start && firstShift.start !== "--:--" && (
          <div className="flex w-full justify-between">
            <div className="line-clamp-1 flex gap-2 font-medium">Durée</div>
            <div className="line-clamp-1 flex gap-2 font-bold text-blue-600">
              {firstShiftDuration || "En cours..."}
            </div>
          </div>
        )}
      </div>

      {/* Deuxième Shift - Affiché seulement s'il a été activé */}
      {shouldShowSecondShift && (
        <div className="w-full">
          <div className="mb-1 font-semibold text-green-600">
            Deuxième Shift
          </div>
          <div className="flex w-full justify-between">
            <div className="line-clamp-1 flex gap-2 font-medium">Début</div>
            <div className="line-clamp-1 flex gap-2 font-medium">
              {secondShift.start}
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="line-clamp-1 flex gap-2 font-medium">Fin</div>
            <div className="line-clamp-1 flex gap-2 font-medium">
              {secondShift.end || "--:--"}
            </div>
          </div>
          {/* Afficher la durée si le shift a commencé */}
          <div className="flex w-full justify-between">
            <div className="line-clamp-1 flex gap-2 font-medium">Durée</div>
            <div className="line-clamp-1 flex gap-2 font-bold text-green-600">
              {secondShiftDuration || "En cours..."}
            </div>
          </div>
        </div>
      )}
    </CardFooter>
  );
}
