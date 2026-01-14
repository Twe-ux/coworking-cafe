"use client";

import { withStoreProvider } from "@/app/StoreProvider";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { PDFFooter, PDFHeader, PDFTable } from "./pdf-components";
import { pdfStyles, pdfUtils } from "./pdf-utils";

type RowData = {
  _id: string;
  id: number;
  date: string;
  TTC: number;
  [key: string]: any;
};

// Composant Section simplifié
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[pdfStyles.bodyView, { padding: 10 }]}>
      <Text style={pdfStyles.subtitle}>{title}</Text>
      {children}
    </View>
  );
}

// Composant AmountRow simplifié
function AmountRow({
  label,
  amount,
  highlight,
}: {
  label: string;
  amount: number;
  highlight?: boolean;
}) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        backgroundColor: highlight ? "rgba(255, 255, 0, 0.2)" : "transparent",
      }}
    >
      <Text style={pdfStyles.text}>{label}</Text>
      <Text style={[pdfStyles.text, { fontWeight: "bold" }]}>
        {pdfUtils.formatCurrency(amount)}
      </Text>
    </View>
  );
}

function PDFCashControlRefactored({
  data,
  from,
  to,
  totalVirement,
  totalCbClassique,
  totalCbSansContact,
  totalEspeces,
}: any) {
  // Validation des données
  const validationResult = pdfUtils.validatePDFData({ data, from, to });

  if (!validationResult.isValid) {
    console.error("Erreurs de validation PDF:", validationResult.errors);
  }

  // Configuration des colonnes simplifiée
  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: (info: any) => pdfUtils.formatDate.ddmmyyyy(info.getValue()),
      },
      {
        accessorKey: "TTC",
        header: "Montant TTC",
        cell: (info: any) => pdfUtils.formatCurrency(info.getValue()),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Calcul des totaux
  const totalTTC =
    data?.reduce((sum: number, row: RowData) => sum + (row.TTC || 0), 0) || 0;
  const totalPayments =
    (totalVirement || 0) +
    (totalCbClassique || 0) +
    (totalCbSansContact || 0) +
    (totalEspeces || 0);

  // Génération du titre du document
  const documentTitle = pdfUtils.generateDocumentTitle(
    "Contrôle de Caisse",
    from || new Date().toISOString(),
  );

  // Données du tableau principal
  const tableHeaders = ["Date", "Montant TTC"];
  const tableData =
    data?.map((row: RowData) => [
      pdfUtils.formatDate.ddmmyyyy(row.date),
      pdfUtils.formatCurrency(row.TTC),
    ]) || [];

  return (
    <Document>
      <Page style={pdfStyles.page}>
        <View style={pdfStyles.body}>
          {/* En-tête du document */}
          <PDFHeader
            title={documentTitle}
            subtitle={`Période: ${pdfUtils.formatDate.ddmmyyyy(from)} - ${pdfUtils.formatDate.ddmmyyyy(to)}`}
            date={new Date().toISOString()}
            logoUrl="/logo.svg"
          />

          {/* Résumé des totaux */}
          <Section title="Résumé financier">
            <AmountRow label="Total TTC" amount={totalTTC} highlight={true} />
            <AmountRow label="Total paiements" amount={totalPayments} />
            <AmountRow
              label="Différence"
              amount={totalTTC - totalPayments}
              highlight={Math.abs(totalTTC - totalPayments) > 0.01}
            />
          </Section>

          {/* Moyens de paiement */}
          <Section title="Moyens de paiement">
            {totalVirement > 0 && (
              <AmountRow label="Virement" amount={totalVirement} />
            )}
            {totalCbClassique > 0 && (
              <AmountRow label="CB Classique" amount={totalCbClassique} />
            )}
            {totalCbSansContact > 0 && (
              <AmountRow label="CB Sans Contact" amount={totalCbSansContact} />
            )}
            {totalEspeces > 0 && (
              <AmountRow label="Espèces" amount={totalEspeces} />
            )}
          </Section>

          {/* Tableau principal des données */}
          <Section title="Détail des transactions">
            <PDFTable
              headers={tableHeaders}
              data={tableData}
              totalsRow={["Total", pdfUtils.formatCurrency(totalTTC)]}
            />
          </Section>

          {/* Pied de page */}
          <PDFFooter text="Document généré automatiquement" showDate={true} />
        </View>
      </Page>
    </Document>
  );
}

export default withStoreProvider(PDFCashControlRefactored);
