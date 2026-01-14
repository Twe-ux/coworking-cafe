/**
 * Utilitaires partagés pour la gestion des shifts/pointages
 */

// Types
export type ShiftData = {
  _id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  date: string;
  firstShift: {
    start: string;
    end: string;
  };
  secondShift: {
    start: string;
    end: string;
  };
};

export type UpdateShiftProps = {
  shiftId: string;
  field: string;
  value: string;
};

export type DisplayShifts = {
  firstShiftStart: string;
  firstShiftEnd: string;
  secondShiftStart: string;
  secondShiftEnd: string;
};

// Fonction pour vérifier si une valeur de shift est vide
export const isEmptyShiftValue = (value: string): boolean => {
  return !value || value === "00:00" || value === "0000-01-01T00:00:00.000Z";
};

// Fonction pour vérifier si un shift entier est vide
export const isEmptyShift = (shift: {
  start: string;
  end: string;
}): boolean => {
  return isEmptyShiftValue(shift.start) && isEmptyShiftValue(shift.end);
};

// Fonction pour vérifier si un shift est incomplet (début sans fin)
export const isIncompleteShift = (start: string, end: string): boolean => {
  const hasStart = !isEmptyShiftValue(start);
  const hasEnd = !isEmptyShiftValue(end);
  return hasStart && !hasEnd;
};

// Fonction pour formater l'heure ISO en format HH:MM
export const formatTime = (isoString: string): string => {
  if (!isoString || isoString === "00:00" || isNaN(Date.parse(isoString)))
    return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Fonction pour calculer la durée en minutes entre deux heures
export const calculateDurationInMinutes = (
  startTime: string,
  endTime: string,
): number => {
  if (isEmptyShiftValue(startTime) || isEmptyShiftValue(endTime)) {
    return 0;
  }

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
  } catch {
    return 0;
  }
};

// Fonction pour formater la durée en heures et minutes
export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return "--:--";

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

// Fonction pour vérifier si une heure est après 14h30
export const isAfternoonShift = (timeString: string): boolean => {
  if (!timeString || timeString === "00:00") return false;
  try {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Après 14h30 = 14:30 et plus
    return hours > 14 || (hours === 14 && minutes >= 30);
  } catch {
    return false;
  }
};

// Fonction pour réorganiser les shifts selon la logique métier (règle 14h30)
export const getDisplayShifts = (data: ShiftData): DisplayShifts => {
  const { firstShift, secondShift } = data;

  // Initialiser les valeurs d'affichage
  let displayFirstStart = "--:--";
  let displayFirstEnd = "--:--";
  let displaySecondStart = "--:--";
  let displaySecondEnd = "--:--";

  // Vérifier si les shifts ont des starts valides
  const hasFirstShift = !isEmptyShiftValue(firstShift.start);
  const hasSecondShift = !isEmptyShiftValue(secondShift.start);

  // Cas spécial : Si les deux shifts sont après 14h30, les afficher dans chaque colonne
  if (hasFirstShift && hasSecondShift) {
    const firstIsAfternoon = isAfternoonShift(firstShift.start);
    const secondIsAfternoon = isAfternoonShift(secondShift.start);

    if (firstIsAfternoon && secondIsAfternoon) {
      // Les deux sont après 14h30 → afficher chacun dans sa colonne
      displayFirstStart = formatTime(firstShift.start);
      displayFirstEnd = formatTime(firstShift.end);
      displaySecondStart = formatTime(secondShift.start);
      displaySecondEnd = formatTime(secondShift.end);

      return {
        firstShiftStart: displayFirstStart,
        firstShiftEnd: displayFirstEnd,
        secondShiftStart: displaySecondStart,
        secondShiftEnd: displaySecondEnd,
      };
    }
  }

  // Logique normale : traiter chaque shift selon sa propre heure
  if (hasFirstShift) {
    if (isAfternoonShift(firstShift.start)) {
      // Après 14h30 → va en Shift 2
      displaySecondStart = formatTime(firstShift.start);
      displaySecondEnd = formatTime(firstShift.end);
    } else {
      // Avant 14h30 → va en Shift 1
      displayFirstStart = formatTime(firstShift.start);
      displayFirstEnd = formatTime(firstShift.end);
    }
  }

  if (hasSecondShift) {
    if (isAfternoonShift(secondShift.start)) {
      // Après 14h30 → va en Shift 2
      displaySecondStart = formatTime(secondShift.start);
      displaySecondEnd = formatTime(secondShift.end);
    } else {
      // Avant 14h30 → va en Shift 1
      displayFirstStart = formatTime(secondShift.start);
      displayFirstEnd = formatTime(secondShift.end);
    }
  }

  return {
    firstShiftStart: displayFirstStart,
    firstShiftEnd: displayFirstEnd,
    secondShiftStart: displaySecondStart,
    secondShiftEnd: displaySecondEnd,
  };
};

// Fonction pour calculer le temps total travaillé
export const calculateTotalWorkTime = (data: ShiftData): string => {
  const shifts = getDisplayShifts(data);
  let totalMinutes = 0;

  // Calculer la durée du premier shift affiché
  if (shifts.firstShiftStart !== "--:--" && shifts.firstShiftEnd !== "--:--") {
    const isFromSecondShift =
      shifts.firstShiftStart === formatTime(data.secondShift.start);
    const startTime = isFromSecondShift
      ? data.secondShift.start
      : data.firstShift.start;
    const endTime = isFromSecondShift
      ? data.secondShift.end
      : data.firstShift.end;
    totalMinutes += calculateDurationInMinutes(startTime, endTime);
  }

  // Calculer la durée du deuxième shift affiché
  if (
    shifts.secondShiftStart !== "--:--" &&
    shifts.secondShiftEnd !== "--:--"
  ) {
    const isFromFirstShift =
      shifts.secondShiftStart === formatTime(data.firstShift.start);
    const startTime = isFromFirstShift
      ? data.firstShift.start
      : data.secondShift.start;
    const endTime = isFromFirstShift
      ? data.firstShift.end
      : data.secondShift.end;
    totalMinutes += calculateDurationInMinutes(startTime, endTime);
  }

  return formatDuration(totalMinutes);
};

// Fonction pour détecter si une ligne a un shift incomplet selon la logique d'affichage
export const hasIncompleteShift = (rowData: ShiftData): boolean => {
  const shifts = getDisplayShifts(rowData);

  // Vérifier si un shift affiché a un début mais pas de fin
  const firstShiftIncomplete =
    shifts.firstShiftStart !== "--:--" && shifts.firstShiftEnd === "--:--";
  const secondShiftIncomplete =
    shifts.secondShiftStart !== "--:--" && shifts.secondShiftEnd === "--:--";

  return firstShiftIncomplete || secondShiftIncomplete;
};

// Fonction pour convertir une heure HH:MM en ISO string
export const convertTimeToISO = (timeString: string): string => {
  if (!timeString) return "00:00";
  const [hours, minutes] = timeString.split(":");
  const today = new Date();
  today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return today.toISOString();
};
