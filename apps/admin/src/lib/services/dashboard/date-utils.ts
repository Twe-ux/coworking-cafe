/**
 * Formate une date en string YYYY/MM/DD pour MongoDB
 */
export function formatDateForMongoDB(date: Date): string {
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
}

/**
 * Calcule les dates de début et fin selon le type de range
 */
export function calculateDates(rangeType: string) {
  const today = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (rangeType) {
    case "yesterday":
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      break;
    case "week":
      if (startDate.getDay() === 0) {
        startDate.setDate(startDate.getDate() - 6);
      } else {
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
      }
      break;
    case "month":
      startDate.setDate(1);
      break;
    case "year":
      startDate.setMonth(0, 1);
      break;
    case "customPreviousDay":
      startDate.setDate(startDate.getDate() - 8);
      endDate.setDate(endDate.getDate() - 8);
      break;
    case "customPreviousWeek":
      const currentDayOfWeek = startDate.getDay();
      if (currentDayOfWeek === 1) {
        startDate.setFullYear(1970, 0, 1);
        endDate.setFullYear(1970, 0, 1);
      } else {
        const daysToMondayLastWeek =
          currentDayOfWeek === 0 ? 7 : currentDayOfWeek - 1 + 7;
        startDate.setDate(startDate.getDate() - daysToMondayLastWeek);
        endDate.setDate(endDate.getDate() - 7);
      }
      break;
    case "customPreviousMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() - 1);
      endDate.setDate(
        Math.min(
          today.getDate() - 1,
          new Date(
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            0
          ).getDate()
        )
      );
      break;
    case "customPreviousYear":
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setMonth(0, 1);
      endDate.setFullYear(endDate.getFullYear() - 1);
      endDate.setMonth(today.getMonth(), today.getDate() - 1);
      break;
    case "previousDay":
      startDate.setDate(startDate.getDate() - 8);
      endDate.setDate(endDate.getDate() - 8);
      break;
    case "previousWeek":
      if (startDate.getDay() === 0) {
        startDate.setDate(startDate.getDate() - 13);
        endDate.setDate(endDate.getDate() - endDate.getDay() - 6);
      } else {
        startDate.setDate(startDate.getDate() - startDate.getDay() - 6);
        endDate.setDate(endDate.getDate() - endDate.getDay() + 1);
      }
      break;
    case "previousMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      endDate.setMonth(endDate.getMonth() - 1);
      startDate.setDate(1);
      endDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      break;
    case "previousYear":
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate.setFullYear(endDate.getFullYear() - 1);
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDateString: formatDateForMongoDB(startDate),
    endDateString: formatDateForMongoDB(endDate),
  };
}
