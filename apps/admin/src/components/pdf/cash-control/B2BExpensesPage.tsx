'use client'

import { Page, Text, View } from '@react-pdf/renderer'
import { RowTabTurnover } from '../RowTabTurnover'
import { pdfStyles } from './styles'
import { PDFHeader } from './PDFHeader'
import { PDFFooter } from './PDFFooter'
import { formatDateDDMMYY, formatB2BDetails, formatDepensesDetails } from './utils'
import type { TurnoverData } from './types'

interface B2BExpensesPageProps {
  data: TurnoverData[]
  selectedMonth: number | null
  selectedYear: number | null
}

/**
 * Page 4: Daily B2B invoices and expenses details
 */
export function B2BExpensesPage({
  data,
  selectedMonth,
  selectedYear,
}: B2BExpensesPageProps) {
  return (
    <Page style={pdfStyles.page} size="A4">
      <PDFHeader
        title="Recapitulatif journalier - Factures B2B et Depenses"
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
                secCell="Total TTC"
                thirdCell="Detail B2B"
                fourthCell="Detail Depenses"
              />
            </View>

            {/* Table Content */}
            <View style={pdfStyles.tableContentWithLineHeight}>
              {data.length > 0 ? (
                data.map((row, idx) => (
                  <View style={pdfStyles.tvaBodyHeader} key={idx}>
                    <RowTabTurnover
                      firstCell={formatDateDDMMYY(row.date) || 'N/A'}
                      secCell={row.TTC || ' '}
                      thirdCell={formatB2BDetails(row.prestaB2B)}
                      fourthCell={formatDepensesDetails(row.depenses)}
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

      <PDFFooter pageNumber={4} totalPages={5} />
    </Page>
  )
}
