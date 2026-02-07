import { Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";

interface AvailabilityTableProps {
  availability: Employee["availability"];
}

export function AvailabilityTable({ availability }: AvailabilityTableProps) {
  if (!availability) return null;

  const days = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  return (
    <View
      style={[
        styles.table,
        {
          border: "1pt solid #cbd5e1",
          borderRadius: 4,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.tableRow, styles.tableHeader, { borderTop: "none" }]}>
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>Jour</Text>
        <Text style={[styles.tableCellHeader, { width: "60%" }]}>
          Plage de disponibilité
        </Text>
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>Total</Text>
      </View>

      {/* Days */}
      {days.map((day, index) => {
        const schedule = availability[day.key as keyof typeof availability];
        const isAvailable = schedule?.available ?? false;
        const isLast = index === days.length - 1;

        let slot1Text = "";
        let slot2Text = "";
        let totalHours = "";
        let isRepos = true;

        if (isAvailable && schedule?.slots && schedule.slots.length > 0) {
          const allSlots = schedule.slots.filter((s) => s.start && s.end);

          if (allSlots.length > 0) {
            isRepos = false;

            // Fonction pour parser l'heure en minutes
            const timeToMinutes = (time: string) => {
              const [h, m] = time.split(":").map(Number);
              return h * 60 + m;
            };

            // Seuil 14H30 = 870 minutes
            const afternoonThreshold = 14 * 60 + 30;

            // Séparer les créneaux matin/après-midi
            const morningSlots = allSlots.filter(
              (s) => timeToMinutes(s.start) < afternoonThreshold
            );
            const afternoonSlots = allSlots.filter(
              (s) => timeToMinutes(s.start) >= afternoonThreshold
            );

            // Créneau 1 (matin)
            if (morningSlots.length > 0) {
              slot1Text = morningSlots
                .map((s) => `${s.start} - ${s.end}`)
                .join(", ");
            }

            // Créneau 2 (après-midi)
            if (afternoonSlots.length > 0) {
              slot2Text = afternoonSlots
                .map((s) => `${s.start} - ${s.end}`)
                .join(", ");
            }

            // Calculer le total
            const calc = (start: string, end: string) => {
              const [sh, sm] = start.split(":").map(Number);
              const [eh, em] = end.split(":").map(Number);
              return (eh * 60 + em - (sh * 60 + sm)) / 60;
            };

            let hours = 0;
            allSlots.forEach((slot) => {
              hours += calc(slot.start, slot.end);
            });

            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            totalHours = m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
          }
        }

        return (
          <View key={day.key} style={isLast ? styles.tableRowLast : styles.tableRow}>
            <View
              style={[
                styles.tableCellLeft,
                styles.tableCellBold,
                { width: "20%" },
              ]}
            >
              <Text>{day.label}</Text>
            </View>
            {isRepos ? (
              <>
                <View
                  style={[
                    styles.tableCell,
                    { width: "80%", backgroundColor: "#f8fafc" },
                  ]}
                >
                  <Text
                    style={[
                      styles.textBold,
                      { color: "#64748b", fontSize: 12 },
                    ]}
                  >
                    REPOS
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.tableCell, { width: "30%" }]}>
                  <Text>{slot1Text}</Text>
                </View>
                <View style={[styles.tableCell, { width: "30%" }]}>
                  <Text>{slot2Text}</Text>
                </View>
                <View style={[styles.tableCellLast, { width: "20%" }]}>
                  <Text>{totalHours}</Text>
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
