'use client';

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { RowTabTurnover } from './RowTabTurnover';
import type { CashEntryRow } from '@/types/accounting';

const styles = StyleSheet.create({
  page: {
    border: '1px solid rgba(0, 0, 0, 0.3)',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    margin: 'auto',
    padding: 20,
    minWidth: 600,
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: 30,
  },
  bodyView: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(1, 1, 1, 1)',
  },
  bodyHeader: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  tvaBodyHeader: {
    height: 120,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  detailBodyHeader: {
    height: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  lastRow: {
    backgroundColor: 'rgba(1, 1, 1, 0.05)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderTop: '1px solid #000',
  },
});

function getMonthName(month: number | null): string {
  const months = [
    'JANVIER',
    'FÉVRIER',
    'MARS',
    'AVRIL',
    'MAI',
    'JUIN',
    'JUILLET',
    'AOÛT',
    'SEPTEMBRE',
    'OCTOBRE',
    'NOVEMBRE',
    'DÉCEMBRE',
  ];
  return month !== null && month >= 0 && month < 12 ? months[month] : '';
}

function formatDateDDMMYY(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

function formatCurrencyOrEmpty(value: number): string {
  if (!value || value === 0) return '';
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

function formatCurrencyOrSpace(value: number): string {
  if (!value || value === 0) return ' ';
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

function formatTVADetails(
  data: { [key: string]: number } | undefined,
  prefix: string
): string {
  if (!data) return ' ';
  const rates = ['5.5', '10', '20'];
  const rateLabels = ['5,5', '10', '20'];
  const lines = rates.map((rate, idx) => {
    const value = data?.[rate];
    if (!value || value === 0) return `${prefix} ${rateLabels[idx]}% : 0,00 €`;
    return `${prefix} ${rateLabels[idx]}% : ${formatCurrencyOrSpace(value)}`;
  });

  return lines.join('\n');
}

function formatB2BDetails(
  data: { label: string; value: number }[] | undefined
): string {
  if (!data || !Array.isArray(data) || data.length === 0) return ' ';

  const lines = data.map((item) => {
    if (!item.value || item.value === 0) return ' ';
    return `${item.label || 'Sans libellé'}: ${formatCurrencyOrEmpty(item.value)}`;
  });

  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  if (nonEmptyLines.length === 0) return ' ';

  while (nonEmptyLines.length < 3) {
    nonEmptyLines.push(' ');
  }

  return nonEmptyLines.join('\n');
}

function formatDepensesDetails(
  data: { label: string; value: number }[] | undefined
): string {
  if (!data || !Array.isArray(data) || data.length === 0) return ' ';

  const lines = data.map((item) => {
    if (!item.value || item.value === 0) return ' ';
    return `${item.label || 'Sans libellé'}: ${formatCurrencyOrEmpty(item.value)}`;
  });

  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  if (nonEmptyLines.length === 0) return ' ';

  while (nonEmptyLines.length < 3) {
    nonEmptyLines.push(' ');
  }

  return nonEmptyLines.join('\n');
}

interface TurnoverData {
  _id?: string;
  date: string;
  HT: number;
  TTC: number;
  TVA?: number;
  'ca-ht'?: { [key: string]: number };
  'ca-ttc'?: { [key: string]: number };
  'ca-tva'?: { [key: string]: number };
  prestaB2B?: { label: string; value: number }[];
  depenses?: { label: string; value: number }[];
  cbClassique?: number | string;
  cbSansContact?: number | string;
  virement?: number | string;
  especes?: number | string;
}

interface CashControlPDFProps {
  data: TurnoverData[];
  selectedMonth: number | null;
  selectedYear: number | null;
}

export function CashControlPDF({
  data,
  selectedMonth,
  selectedYear,
}: CashControlPDFProps) {
  return (
    <Document pageMode="fullScreen">
      {/* PAGE 1: Journal de bord - Récapitulatifs */}
      <Page style={styles.page} size="A4">
        <View style={styles.header} fixed>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
            {/* COWORKING PLATFORM */}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Journal de bord
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View style={styles.body} wrap={false}>
          {/* Récapitulatif du chiffre d'affaires */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
              Récapitulatif du chiffre d&apos;affaires
            </Text>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.bodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(1, 1, 1, 0.05)',
                }}
              >
                <RowTabTurnover
                  firstCell="Libellé"
                  secCell="Total HT"
                  thirdCell="Taxe"
                  fourthCell="Total TTC"
                />
              </View>
              <View style={{ flexDirection: 'column', fontSize: 10 }}>
                {/* Dont TVA 5,5% */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Dont TVA 5,5%"
                    secCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ht']?.['5.5'] || 0),
                      0
                    )}
                    thirdCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-tva']?.['5.5'] || 0),
                      0
                    )}
                    fourthCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ttc']?.['5.5'] || 0),
                      0
                    )}
                  />
                </View>
                {/* Dont TVA 10% */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Dont TVA 10%"
                    secCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ht']?.['10'] || 0),
                      0
                    )}
                    thirdCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-tva']?.['10'] || 0),
                      0
                    )}
                    fourthCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ttc']?.['10'] || 0),
                      0
                    )}
                  />
                </View>
                {/* Dont TVA 20% */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Dont TVA 20%"
                    secCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ht']?.['20'] || 0),
                      0
                    )}
                    thirdCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-tva']?.['20'] || 0),
                      0
                    )}
                    fourthCell={data.reduce(
                      (sum, row) => sum + Number(row['ca-ttc']?.['20'] || 0),
                      0
                    )}
                  />
                </View>
                {/* Total */}
                <View style={[styles.bodyHeader, styles.lastRow]}>
                  <RowTabTurnover
                    firstCell="Total"
                    secCell={data.reduce(
                      (sum, row) =>
                        sum +
                        Number(
                          (row['ca-ht']?.['5.5'] || 0) +
                            (row['ca-ht']?.['10'] || 0) +
                            (row['ca-ht']?.['20'] || 0)
                        ),
                      0
                    )}
                    thirdCell={data.reduce(
                      (sum, row) =>
                        sum +
                        Number(
                          (row['ca-tva']?.['5.5'] || 0) +
                            (row['ca-tva']?.['10'] || 0) +
                            (row['ca-tva']?.['20'] || 0)
                        ),
                      0
                    )}
                    fourthCell={data.reduce(
                      (sum, row) =>
                        sum +
                        Number(
                          (row['ca-ttc']?.['5.5'] || 0) +
                            (row['ca-ttc']?.['10'] || 0) +
                            (row['ca-ttc']?.['20'] || 0)
                        ),
                      0
                    )}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Récapitulatif des règlements factures B2B /dépenses caisses */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
              Récapitulatif des règlements factures B2B /dépenses caisses
            </Text>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.bodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(1, 1, 1, 0.05)',
                }}
              >
                <RowTabTurnover firstCell="Libellé" secCell="Montant" />
              </View>
              <View style={{ flexDirection: 'column', fontSize: 10 }}>
                {/* Factures B2B */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Factures B2B"
                    secCell={data.reduce((acc, row) => {
                      if (Array.isArray(row.prestaB2B)) {
                        return (
                          acc +
                          row.prestaB2B.reduce(
                            (s, p) => s + (Number(p.value) || 0),
                            0
                          )
                        );
                      }
                      return acc;
                    }, 0)}
                  />
                </View>
                {/* Dépenses caisse */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Dépenses caisse"
                    secCell={data.reduce((acc, row) => {
                      if (Array.isArray(row.depenses)) {
                        return (
                          acc +
                          row.depenses.reduce((s, p) => s + (Number(p.value) || 0), 0)
                        );
                      }
                      return acc;
                    }, 0)}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Récapitulatif des modes de paiement */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
              Récapitulatif des modes de paiement
            </Text>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.bodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(1, 1, 1, 0.05)',
                }}
              >
                <RowTabTurnover firstCell="Libellé" secCell="Montant" />
              </View>
              <View style={{ flexDirection: 'column', fontSize: 10 }}>
                {/* CB classique */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Cb classique"
                    secCell={data.reduce(
                      (acc, row) => acc + (Number(row.cbClassique) || 0),
                      0
                    )}
                  />
                </View>
                {/* CB sans contact */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Cb sans contact"
                    secCell={data.reduce(
                      (acc, row) => acc + (Number(row.cbSansContact) || 0),
                      0
                    )}
                  />
                </View>
                {/* Virement */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Virement"
                    secCell={data.reduce(
                      (acc, row) => acc + (Number(row.virement) || 0),
                      0
                    )}
                  />
                </View>
                {/* Espèces */}
                <View style={styles.bodyHeader}>
                  <RowTabTurnover
                    firstCell="Espèces"
                    secCell={data.reduce(
                      (acc, row) => acc + (Number(row.especes) || 0),
                      0
                    )}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10 }}>
            Page 1/5 - Généré le: {new Date().toLocaleDateString()} à{' '}
            {new Date().toLocaleTimeString()} par Coworking Platform
          </Text>
        </View>
      </Page>

      {/* PAGE 2: Récapitulatif journalier - CA et TVA (Partie 1 - 15 premières lignes) */}
      <Page style={styles.page} size="A4">
        <View style={{ ...styles.header, height: 80 }} fixed>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
            Récapitulatif journalier - Chiffre d&apos;affaires et TVA (1/2)
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View style={styles.body} wrap={false}>
          <View>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.detailBodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(3, 1, 1, 0.05)',
                  height: 60,
                }}
              >
                <RowTabTurnover
                  firstCell="Date"
                  secCell="Total TTC"
                  thirdCell="Total HT"
                  fourthCell="Détail HT par taux"
                  fifthCell="Détail TVA par taux"
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {data.length > 0 ? (
                  data.slice(0, 15).map((row, idx) => (
                    <View style={styles.tvaBodyHeader} key={idx}>
                      <RowTabTurnover
                        firstCell={formatDateDDMMYY(row.date) || 'N/A'}
                        secCell={row.TTC || ' '}
                        thirdCell={row.HT || ' '}
                        fourthCell={formatTVADetails(row['ca-ht'], 'HT')}
                        fifthCell={formatTVADetails(row['ca-tva'], 'TVA')}
                      />
                    </View>
                  ))
                ) : (
                  <Text>Aucune donnée disponible</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10 }}>
            Page 2/5 - Généré le: {new Date().toLocaleDateString()} à{' '}
            {new Date().toLocaleTimeString()} par Coworking Platform
          </Text>
        </View>
      </Page>

      {/* PAGE 3: Récapitulatif journalier - CA et TVA (Partie 2 - lignes 16+) */}
      <Page style={styles.page} size="A4">
        <View style={{ ...styles.header, height: 80 }} fixed>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
            Récapitulatif journalier - Chiffre d&apos;affaires et TVA (2/2)
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View style={styles.body} wrap={false}>
          <View>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.detailBodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(3, 1, 1, 0.05)',
                  height: 60,
                }}
              >
                <RowTabTurnover
                  firstCell="Date"
                  secCell="Total TTC"
                  thirdCell="Total HT"
                  fourthCell="Détail HT par taux"
                  fifthCell="Détail TVA par taux"
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {data.length > 15 ? (
                  data.slice(15).map((row, idx) => (
                    <View style={styles.tvaBodyHeader} key={idx}>
                      <RowTabTurnover
                        firstCell={formatDateDDMMYY(row.date) || 'N/A'}
                        secCell={row.TTC || ' '}
                        thirdCell={row.HT || ' '}
                        fourthCell={formatTVADetails(row['ca-ht'], 'HT')}
                        fifthCell={formatTVADetails(row['ca-tva'], 'TVA')}
                      />
                    </View>
                  ))
                ) : (
                  <Text>Aucune donnée supplémentaire disponible</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10 }}>
            Page 3/5 - Généré le: {new Date().toLocaleDateString()} à{' '}
            {new Date().toLocaleTimeString()} par Coworking Platform
          </Text>
        </View>
      </Page>

      {/* PAGE 4: Récapitulatif journalier - Factures B2B et Dépenses */}
      <Page style={styles.page} size="A4">
        <View style={{ ...styles.header, height: 100 }} fixed>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
            Récapitulatif journalier - Factures B2B et Dépenses
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View style={styles.body} wrap={false}>
          <View>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.detailBodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(3, 1, 1, 0.05)',
                  height: 60,
                }}
              >
                <RowTabTurnover
                  firstCell="Date"
                  secCell="Total TTC"
                  thirdCell="Détail B2B"
                  fourthCell="Détail Dépenses"
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <View style={styles.tvaBodyHeader} key={idx}>
                      <RowTabTurnover
                        firstCell={formatDateDDMMYY(row.date) || 'N/A'}
                        secCell={row.TTC || ' '}
                        thirdCell={formatB2BDetails(row.prestaB2B)}
                        fourthCell={formatDepensesDetails(row.depenses)}
                      />
                    </View>
                  ))
                ) : (
                  <Text>Aucune donnée disponible</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10 }}>
            Page 4/5 - Généré le: {new Date().toLocaleDateString()} à{' '}
            {new Date().toLocaleTimeString()} par Coworking Platform
          </Text>
        </View>
      </Page>

      {/* PAGE 5: Récapitulatif journalier - Modes de paiement */}
      <Page style={styles.page} size="A4">
        <View style={{ ...styles.header, height: 100 }} fixed>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
            Récapitulatif journalier - Modes de paiement
          </Text>
          <Text style={{ fontSize: 15, fontWeight: '' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>

        <View style={styles.body} wrap={false}>
          <View>
            <View style={styles.bodyView}>
              <View
                style={{
                  ...styles.detailBodyHeader,
                  borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(3, 1, 1, 0.05)',
                  height: 60,
                }}
              >
                <RowTabTurnover
                  firstCell="Date"
                  secCell="CB Classique"
                  thirdCell="CB Sans contact"
                  fourthCell="Virement"
                  fifthCell="Espèces"
                />
              </View>
              <View
                style={{
                  flexDirection: 'column',
                  fontSize: 10,
                  lineHeight: 1.4,
                }}
              >
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <View style={styles.detailBodyHeader} key={idx}>
                      <RowTabTurnover
                        firstCell={formatDateDDMMYY(row.date) || 'N/A'}
                        secCell={formatCurrencyOrSpace(Number(row.cbClassique))}
                        thirdCell={formatCurrencyOrSpace(Number(row.cbSansContact))}
                        fourthCell={formatCurrencyOrSpace(Number(row.virement))}
                        fifthCell={formatCurrencyOrSpace(Number(row.especes))}
                      />
                    </View>
                  ))
                ) : (
                  <Text>Aucune donnée disponible</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10 }}>
            Page 5/5 - Généré le: {new Date().toLocaleDateString()} à{' '}
            {new Date().toLocaleTimeString()} par Coworking Platform
          </Text>
        </View>
      </Page>
    </Document>
  );
}
