'use client'

import { Page, Text, View } from '@react-pdf/renderer'
import { RowTabTurnover } from '../RowTabTurnover'
import { pdfStyles } from './styles'
import { PDFHeader } from './PDFHeader'
import { PDFFooter } from './PDFFooter'
import { formatDateDDMMYY, formatCurrencyOrSpace } from './utils'
import type { TurnoverData } from './types'

interface PaymentMethodsPageProps {
  data: TurnoverData[]
  selectedMonth: number | null
  selectedYear: number | null
}

/**
 * Page 5: Daily payment methods breakdown
 */
export function PaymentMethodsPage({
  data,
  selectedMonth,
  selectedYear,
}: PaymentMethodsPageProps) {
  return (
    <Page style={pdfStyles.page} size="A4">
      <PDFHeader
        title="Recapitulatif journalier - Modes de paiement"
        month={selectedMonth}
        year={selectedYear}
        height={100}
      />

      <View style={pdfStyles.body} wrap={false}>
        <View>
          <View style={pdfStyles.bodyView}>
            {/* Table Header */}
            <View
              style={{
                ...pdfStyles.detailBodyHeader,
                ...pdfStyles.tableHeaderStyle,
                height: 60,
              }}
            >
              <RowTabTurnover
                firstCell="Date"
                secCell="CB Classique"
                thirdCell="CB Sans contact"
                fourthCell="Virement"
                fifthCell="Especes"
              />
            </View>

            {/* Table Content */}
            <View style={pdfStyles.tableContentWithLineHeight}>
              {data.length > 0 ? (
                data.map((row, idx) => (
                  <View style={pdfStyles.detailBodyHeader} key={idx}>
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
                <Text>Aucune donnee disponible</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <PDFFooter pageNumber={5} totalPages={5} />
    </Page>
  )
}
