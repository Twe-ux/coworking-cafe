'use client'

import { Page, Text, View } from '@react-pdf/renderer'
import { RowTabTurnover } from '../RowTabTurnover'
import { pdfStyles } from './styles'
import { PDFHeader } from './PDFHeader'
import { PDFFooter } from './PDFFooter'
import { formatDateDDMMYY, formatTVADetails } from './utils'
import type { TurnoverData } from './types'

interface DailyTurnoverPageProps {
  data: TurnoverData[]
  selectedMonth: number | null
  selectedYear: number | null
  pageNumber: number
  isFirstHalf: boolean
}

const ROWS_PER_PAGE = 15

/**
 * Pages 2-3: Daily turnover with VAT details
 */
export function DailyTurnoverPage({
  data,
  selectedMonth,
  selectedYear,
  pageNumber,
  isFirstHalf,
}: DailyTurnoverPageProps) {
  const displayData = isFirstHalf
    ? data.slice(0, ROWS_PER_PAGE)
    : data.slice(ROWS_PER_PAGE)

  const hasData = isFirstHalf ? data.length > 0 : data.length > ROWS_PER_PAGE

  return (
    <Page style={pdfStyles.page} size="A4">
      <PDFHeader
        title={`Recapitulatif journalier - Chiffre d'affaires et TVA (${isFirstHalf ? '1/2' : '2/2'})`}
        month={selectedMonth}
        year={selectedYear}
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
                thirdCell="Total HT"
                fourthCell="Detail HT par taux"
                fifthCell="Detail TVA par taux"
              />
            </View>

            {/* Table Content */}
            <View style={pdfStyles.tableContentWithLineHeight}>
              {hasData ? (
                displayData.map((row, idx) => (
                  <View style={pdfStyles.tvaBodyHeader} key={idx}>
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
                <Text>
                  {isFirstHalf
                    ? 'Aucune donnee disponible'
                    : 'Aucune donnee supplementaire disponible'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <PDFFooter pageNumber={pageNumber} totalPages={5} />
    </Page>
  )
}
