import type { CashEntryRow } from "@/types/accounting";

interface TurnoverData {
  date: string;
  HT: number;
  TTC: number;
  TVA?: number;
  'ca-ht'?: { [key: string]: number };
  'ca-ttc'?: { [key: string]: number };
  'ca-tva'?: { [key: string]: number };
}

export interface CashControlPDFOptions {
  turnoverData: TurnoverData[];
  month: number;
  year: number;
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Génère un PDF structuré du contrôle de caisse
 * Utilise @react-pdf/renderer pour créer un document professionnel
 */
export async function generateCashControlPDF({
  turnoverData,
  month,
  year,
}: CashControlPDFOptions): Promise<void> {
  try {
    // Import dynamique pour optimiser le bundle
    const { pdf } = await import("@react-pdf/renderer");
    const { CashControlPDF } = await import("@/components/pdf/CashControlPDF");

    // Créer le document PDF React
    const pdfElement = CashControlPDF({
      data: turnoverData,
      selectedMonth: month,
      selectedYear: year,
    });

    // Générer le blob
    const blob = await pdf(pdfElement).toBlob();

    // Télécharger le fichier
    const monthName = monthNames[month];
    const filename = `Controle_Caisse_${monthName}_${year}.pdf`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
}
