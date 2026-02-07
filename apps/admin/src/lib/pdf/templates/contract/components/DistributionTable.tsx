import { Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";

interface DistributionTableProps {
  distributionData: NonNullable<Employee["workSchedule"]>["weeklyDistributionData"];
}

export function DistributionTable({ distributionData }: DistributionTableProps) {
  if (!distributionData) return null;

  const days = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  const weeks = ["week1", "week2", "week3", "week4"] as const;

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
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>
          Semaine 1
        </Text>
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>
          Semaine 2
        </Text>
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>
          Semaine 3
        </Text>
        <Text style={[styles.tableCellHeader, { width: "20%" }]}>
          Semaine 4
        </Text>
      </View>

      {/* Days */}
      {days.map((day, dayIndex) => {
        const isLast = dayIndex === days.length - 1;
        const dayData = distributionData[day.key];

        // Vérifier si c'est un jour de repos (aucune heure sur les 4 semaines)
        const isRepos =
          !dayData ||
          weeks.every((week) => {
            const hours = dayData[week];
            return !hours || hours === "0" || hours === "0h";
          });

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
                {weeks.map((week) => {
                  const hours = dayData?.[week];
                  const displayValue =
                    hours === "0" || hours === "0h" || !hours ? "0" : hours;
                  return (
                    <View key={week} style={[styles.tableCellLast, { width: "20%" }]}>
                      <Text>{displayValue}</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        );
      })}

      {/* Total row */}
      <View style={[styles.tableRowLast, styles.tableHeader]}>
        <View
          style={[
            styles.tableCellLeft,
            styles.tableCellBold,
            { width: "20%" },
          ]}
        >
          <Text>Total</Text>
        </View>
        {weeks.map((week) => {
          let total = 0;
          days.forEach((day) => {
            const dayData = distributionData[day.key];
            const val = dayData?.[week];
            if (typeof val === "number") {
              total += val;
            } else if (typeof val === "string") {
              const match = val.match(/(\d+)h?(\d*)/);
              if (match) {
                total +=
                  parseInt(match[1]) +
                  (match[2] ? parseInt(match[2]) / 60 : 0);
              }
            }
          });

          const h = Math.floor(total);
          const m = Math.round((total - h) * 60);
          const displayTotal =
            total > 0
              ? m > 0
                ? `${h}h${m.toString().padStart(2, "0")}`
                : `${h}h`
              : "0h";

          return (
            <View key={week} style={[styles.tableCellLast, { width: "20%" }]}>
              <Text style={styles.textBold}>{displayTotal}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
