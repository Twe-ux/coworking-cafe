"use client";

/**
 * Payroll PDF Document Template
 * Monthly payroll report for accounting/HR
 *
 * Structure: 1 page with table
 * Columns:
 * - Nom, Prénom
 * - Adresse
 * - N° Sécu
 * - Date début
 * - Date fin
 * - Taux horaire
 * - Heures contrat
 * - Heures réalisées
 * - Heures sup
 * - Mutuelle
 */

import { Document as PDFDocument, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "../contract/styles";
import type { EmployeePayrollData } from "@/lib/payroll/calculateMonthlyPayroll";

interface PayrollDocumentProps {
  payrollData: EmployeePayrollData[];
  month: number;
  year: number;
}

export function PayrollDocument({
  payrollData,
  month,
  year,
}: PayrollDocumentProps) {
  // Format month name
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const monthName = monthNames[month - 1];

  // Format date display
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <PDFDocument>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>
            Récapitulatif Paie - {monthName} {year}
          </Text>
          <Text style={styles.subtitle}>
            Document confidentiel à usage interne
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View
              style={[
                styles.tableCellHeader,
                { width: "11%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Nom, Prénom</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "13%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Adresse</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "11%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>N° Sécu</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "8%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Date début</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "8%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Date fin</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "8%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Taux h.</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "9%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>H. contrat</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "9%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>H. réalisées</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "9%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>H. sup</Text>
            </View>
            <View
              style={[
                styles.tableCellHeader,
                { width: "7%", fontSize: 9, padding: "8 2 2 2" },
              ]}
            >
              <Text>Mutuelle</Text>
            </View>
          </View>

          {/* Table Rows */}
          {payrollData.map((employee, index) => {
            const isLast = index === payrollData.length - 1;
            return (
              <View
                key={employee.employeeId}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                {/* Nom, Prénom */}
                <View
                  style={[
                    styles.tableCellLeft,
                    {
                      width: "11%",
                      fontSize: 8,
                      padding: "5 2 2 2",
                      alignItems: "flex-start",
                    },
                  ]}
                >
                  <Text>{employee.fullName}</Text>
                </View>

                {/* Adresse */}
                <View
                  style={[
                    styles.tableCellLeft,
                    {
                      width: "13%",
                      fontSize: 7,
                      padding: "5 2 2 2",
                      alignItems: "flex-start",
                      flexDirection: "column",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text>{employee.addressLine1}</Text>
                  {employee.addressLine2 && (
                    <Text style={{ marginTop: 2 }}>{employee.addressLine2}</Text>
                  )}
                </View>

                {/* N° Sécu */}
                <View
                  style={[
                    styles.tableCell,
                    {
                      width: "11%",
                      fontSize: 7,
                      padding: "5 2 2 2",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text>{employee.socialSecurityNumber}</Text>
                </View>

                {/* Date début */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "8%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{formatDate(employee.hireDate)}</Text>
                </View>

                {/* Date fin */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "8%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{formatDate(employee.endDate)}</Text>
                </View>

                {/* Taux horaire */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "8%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{employee.hourlyRate.toFixed(2)}€</Text>
                </View>

                {/* H. contrat */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "9%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{employee.monthlyContractualHours.toFixed(2)}h</Text>
                </View>

                {/* H. réalisées */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "9%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{employee.hoursWorked.toFixed(2)}h</Text>
                </View>

                {/* H. sup */}
                <View
                  style={[
                    styles.tableCell,
                    {
                      width: "9%",
                      fontSize: 8,
                      padding: "5 2 2 2",
                      color:
                        employee.overtimeHours > 0 ? "#dc2626" : "#000000",
                      fontFamily:
                        employee.overtimeHours > 0
                          ? "Helvetica-Bold"
                          : "Helvetica",
                    },
                  ]}
                >
                  <Text>
                    {employee.overtimeHours > 0
                      ? `${employee.overtimeHours.toFixed(2)}h`
                      : "-"}
                  </Text>
                </View>

                {/* Mutuelle */}
                <View
                  style={[
                    styles.tableCell,
                    { width: "7%", fontSize: 8, padding: "5 2 2 2" },
                  ]}
                >
                  <Text>{employee.hasMutuelle ? "Oui" : "Non"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.text, { fontSize: 9, fontStyle: "italic" }]}>
            Note : Les heures supplémentaires sont calculées selon la formule :
            Heures sup = MAX(0, Heures réalisées - (Heures hebdo contractuelles
            × 4.33))
          </Text>
          <Text
            style={[
              styles.text,
              { fontSize: 9, fontStyle: "italic", marginTop: 5 },
            ]}
          >
            Ce document est généré automatiquement par le système de gestion RH.
          </Text>
        </View>
      </Page>
    </PDFDocument>
  );
}
