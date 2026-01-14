"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { ReactElement } from "react";

// Types pour le système de PDF générique
export interface PDFSection {
  id: string;
  title?: string;
  type: "header" | "table" | "summary" | "text" | "image" | "custom";
  data?: any;
  style?: any;
  component?: () => ReactElement;
}

export interface PDFTableColumn {
  id: string;
  label: string;
  accessor: string | ((row: any) => any);
  width?: string | number;
  align?: "left" | "center" | "right";
  format?: (value: any) => string;
  style?: any;
}

export interface PDFTableConfig {
  columns: PDFTableColumn[];
  data: any[];
  showHeader?: boolean;
  showFooter?: boolean;
  footerCalculations?: {
    [columnId: string]: "sum" | "average" | "count" | ((data: any[]) => any);
  };
  alternateRowColors?: boolean;
  borderStyle?: "none" | "light" | "medium" | "heavy";
}

export interface PDFConfig {
  title: string;
  subtitle?: string;
  date?: string;
  logo?: string;
  sections: PDFSection[];
  pageSize?: "A4" | "A3" | "LETTER";
  orientation?: "portrait" | "landscape";
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  footer?: {
    text?: string;
    showPageNumbers?: boolean;
  };
  styles?: any;
}

// Styles par défaut
const defaultStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1px solid #e5e5e5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666666",
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    textAlign: "right",
    color: "#888888",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 15,
  },
  table: {
    marginBottom: 15,
    border: "1px solid #e5e5e5",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    borderBottom: "1px solid #e5e5e5",
    padding: 5,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    padding: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e5e5",
    padding: 5,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#f9f9f9",
    padding: 5,
  },
  tableCell: {
    fontSize: 9,
    padding: 3,
    textAlign: "left",
  },
  tableCellCenter: {
    fontSize: 9,
    padding: 3,
    textAlign: "center",
  },
  tableCellRight: {
    fontSize: 9,
    padding: 3,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#888888",
    borderTop: "1px solid #e5e5e5",
    paddingTop: 5,
  },
  summary: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #0ea5e9",
    padding: 10,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0369a1",
  },
  summaryText: {
    fontSize: 10,
    color: "#0c4a6e",
  },
});

// Composant Table générique pour PDF
function PDFGenericTable({ config }: { config: PDFTableConfig }) {
  const {
    columns,
    data,
    showHeader = true,
    footerCalculations,
    alternateRowColors = true,
  } = config;

  // Calculs pour le footer
  const footerData: Record<string, any> = footerCalculations ? {} : {};
  if (footerCalculations) {
    Object.entries(footerCalculations).forEach(([columnId, calculation]) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column) return;

      if (typeof calculation === "function") {
        footerData[columnId] = calculation(data);
      } else {
        const values = data.map((row) => {
          const value =
            typeof column.accessor === "function"
              ? column.accessor(row)
              : row[column.accessor];
          return parseFloat(value) || 0;
        });

        switch (calculation) {
          case "sum":
            footerData[columnId] = values.reduce((sum, val) => sum + val, 0);
            break;
          case "average":
            footerData[columnId] =
              values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case "count":
            footerData[columnId] = data.length;
            break;
        }
      }
    });
  }

  return (
    <View style={defaultStyles.table}>
      {/* Header */}
      {showHeader && (
        <View style={defaultStyles.tableHeader}>
          {columns.map((column) => (
            <Text
              key={column.id}
              style={[
                defaultStyles.tableHeaderCell,
                { width: column.width || `${100 / columns.length}%` },
                column.style?.header,
              ]}
            >
              {column.label}
            </Text>
          ))}
        </View>
      )}

      {/* Data Rows */}
      {data.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={
            alternateRowColors && rowIndex % 2 === 1
              ? defaultStyles.tableRowAlt
              : defaultStyles.tableRow
          }
        >
          {columns.map((column) => {
            const value =
              typeof column.accessor === "function"
                ? column.accessor(row)
                : row[column.accessor];

            const formattedValue = column.format
              ? column.format(value)
              : String(value || "");

            const cellStyle = [
              column.align === "center"
                ? defaultStyles.tableCellCenter
                : column.align === "right"
                  ? defaultStyles.tableCellRight
                  : defaultStyles.tableCell,
              { width: column.width || `${100 / columns.length}%` },
              column.style?.cell,
            ];

            return (
              <Text key={column.id} style={cellStyle}>
                {formattedValue}
              </Text>
            );
          })}
        </View>
      ))}

      {/* Footer with calculations */}
      {footerCalculations && Object.keys(footerData).length > 0 && (
        <View
          style={[
            defaultStyles.tableRow,
            { backgroundColor: "#e5e5e5", fontWeight: "bold" },
          ]}
        >
          {columns.map((column) => (
            <Text
              key={column.id}
              style={[
                column.align === "center"
                  ? defaultStyles.tableCellCenter
                  : column.align === "right"
                    ? defaultStyles.tableCellRight
                    : defaultStyles.tableCell,
                {
                  width: column.width || `${100 / columns.length}%`,
                  fontWeight: "bold",
                },
              ]}
            >
              {footerData[column.id] !== undefined
                ? column.format
                  ? column.format(footerData[column.id])
                  : String(footerData[column.id])
                : column.id === columns[0].id
                  ? "TOTAL"
                  : ""}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// Composant Section générique
function PDFGenericSection({ section }: { section: PDFSection }) {
  switch (section.type) {
    case "header":
      return (
        <View style={defaultStyles.header}>
          {section.data?.logo && (
            <Image
              src={section.data.logo}
              style={{ width: 60, height: 60, marginBottom: 10 }}
            />
          )}
          <Text style={defaultStyles.title}>{section.data?.title}</Text>
          {section.data?.subtitle && (
            <Text style={defaultStyles.subtitle}>{section.data.subtitle}</Text>
          )}
          {section.data?.date && (
            <Text style={defaultStyles.date}>{section.data.date}</Text>
          )}
        </View>
      );

    case "table":
      return (
        <View>
          {section.title && (
            <Text style={defaultStyles.sectionTitle}>{section.title}</Text>
          )}
          <PDFGenericTable config={section.data} />
        </View>
      );

    case "summary":
      return (
        <View style={defaultStyles.summary}>
          {section.title && (
            <Text style={defaultStyles.summaryTitle}>{section.title}</Text>
          )}
          <Text style={defaultStyles.summaryText}>{section.data?.text}</Text>
        </View>
      );

    case "text":
      return (
        <View>
          {section.title && (
            <Text style={defaultStyles.sectionTitle}>{section.title}</Text>
          )}
          <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
            {section.data?.text}
          </Text>
        </View>
      );

    case "custom":
      return section.component ? section.component() : null;

    default:
      return null;
  }
}

// Composant PDF générique principal
export function GenericPDF({ config }: { config: PDFConfig }) {
  const pageStyles = StyleSheet.create({
    page: {
      ...defaultStyles.page,
      ...config.styles?.page,
      ...(config.margins && {
        paddingTop: config.margins.top,
        paddingBottom: config.margins.bottom,
        paddingLeft: config.margins.left,
        paddingRight: config.margins.right,
      }),
    },
  });

  return (
    <Document>
      <Page
        size={config.pageSize || "A4"}
        orientation={config.orientation || "portrait"}
        style={pageStyles.page}
      >
        {/* Sections */}
        {config.sections.map((section, index) => (
          <PDFGenericSection key={section.id || index} section={section} />
        ))}

        {/* Footer */}
        {config.footer && (
          <Text style={defaultStyles.footer}>
            {config.footer.text}
            {config.footer.showPageNumbers && " - Page "}
          </Text>
        )}
      </Page>
    </Document>
  );
}

// Générateur de configuration pour Cash Control PDF
export function createCashControlPDFConfig(cashData: any[]): PDFConfig {
  return {
    title: "Contrôle de Caisse",
    subtitle: "Rapport quotidien des entrées et sorties",
    date: new Date().toLocaleDateString("fr-FR"),
    sections: [
      {
        id: "header",
        type: "header",
        data: {
          title: "Contrôle de Caisse",
          subtitle: "Rapport quotidien des entrées et sorties",
          date: new Date().toLocaleDateString("fr-FR"),
        },
      },
      {
        id: "summary",
        type: "summary",
        title: "Résumé",
        data: {
          text: `${cashData.length} entrées de caisse analysées. Total des encaissements: ${cashData
            .reduce((sum, entry) => {
              const total =
                (parseFloat(entry.virement) || 0) +
                (parseFloat(entry.especes) || 0) +
                (parseFloat(entry.cbClassique) || 0) +
                (parseFloat(entry.cbSansContact) || 0);
              return sum + total;
            }, 0)
            .toFixed(2)} €`,
        },
      },
      {
        id: "cash-table",
        type: "table",
        title: "Détail des Entrées",
        data: {
          columns: [
            {
              id: "date",
              label: "Date",
              accessor: "date",
              width: "15%",
              align: "center" as const,
            },
            {
              id: "prestations",
              label: "Prestations",
              accessor: (row: any) =>
                row.prestaB2B?.length
                  ? `${row.prestaB2B.length} prestation(s)`
                  : "-",
              width: "20%",
            },
            {
              id: "depenses",
              label: "Dépenses",
              accessor: (row: any) =>
                row.depenses?.length
                  ? `${row.depenses.length} dépense(s)`
                  : "-",
              width: "20%",
            },
            {
              id: "virement",
              label: "Virement",
              accessor: "virement",
              width: "11%",
              align: "right" as const,
              format: (val: any) => `${parseFloat(val || 0).toFixed(2)} €`,
            },
            {
              id: "especes",
              label: "Espèces",
              accessor: "especes",
              width: "11%",
              align: "right" as const,
              format: (val: any) => `${parseFloat(val || 0).toFixed(2)} €`,
            },
            {
              id: "cb",
              label: "CB Total",
              accessor: (row: any) =>
                parseFloat(row.cbClassique || 0) +
                parseFloat(row.cbSansContact || 0),
              width: "11%",
              align: "right" as const,
              format: (val: any) => `${val.toFixed(2)} €`,
            },
            {
              id: "total",
              label: "Total",
              accessor: (row: any) =>
                parseFloat(row.virement || 0) +
                parseFloat(row.especes || 0) +
                parseFloat(row.cbClassique || 0) +
                parseFloat(row.cbSansContact || 0),
              width: "12%",
              align: "right" as const,
              format: (val: any) => `${val.toFixed(2)} €`,
            },
          ],
          data: cashData,
          showHeader: true,
          alternateRowColors: true,
          footerCalculations: {
            virement: "sum",
            especes: "sum",
            cb: "sum",
            total: "sum",
          },
        } as PDFTableConfig,
      },
    ],
    footer: {
      text: "Rapport généré automatiquement",
      showPageNumbers: true,
    },
  };
}

// Générateur de configuration pour Staff PDF
export function createStaffPDFConfig(staffData: any[]): PDFConfig {
  return {
    title: "Liste du Personnel",
    subtitle: "Répertoire des employés",
    date: new Date().toLocaleDateString("fr-FR"),
    sections: [
      {
        id: "header",
        type: "header",
        data: {
          title: "Liste du Personnel",
          subtitle: "Répertoire des employés",
          date: new Date().toLocaleDateString("fr-FR"),
        },
      },
      {
        id: "staff-table",
        type: "table",
        title: "Personnel Actif",
        data: {
          columns: [
            {
              id: "name",
              label: "Nom Complet",
              accessor: (row: any) => `${row.firstName} ${row.lastName}`,
              width: "25%",
            },
            { id: "email", label: "Email", accessor: "email", width: "25%" },
            {
              id: "phone",
              label: "Téléphone",
              accessor: "phone",
              width: "15%",
            },
            {
              id: "framework",
              label: "Contrat",
              accessor: "framework",
              width: "15%",
            },
            {
              id: "hourlyRate",
              label: "Taux/h",
              accessor: "hourlyRate",
              width: "10%",
              align: "right" as const,
              format: (val: any) => `${val} €`,
            },
            {
              id: "status",
              label: "Statut",
              accessor: (row: any) => (row.isActif ? "Actif" : "Inactif"),
              width: "10%",
              align: "center" as const,
            },
          ],
          data: staffData,
          showHeader: true,
          alternateRowColors: true,
        } as PDFTableConfig,
      },
    ],
    footer: {
      text: "Document confidentiel - Usage interne uniquement",
      showPageNumbers: true,
    },
  };
}

// Hook pour générer et télécharger un PDF
export function useGenericPDF() {
  const generatePDF = async (
    config: PDFConfig,
    filename: string = "document.pdf",
  ) => {
    try {
      // Ici vous utiliseriez react-pdf pour générer le PDF
      console.log("Génération PDF avec configuration:", config);
      console.log("Nom de fichier:", filename);

      // Simulation de la génération
      return {
        success: true,
        url: "#", // URL du PDF généré
        filename,
      };
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  };

  return { generatePDF };
}

// Export des utilitaires
export { defaultStyles };
export default GenericPDF;
