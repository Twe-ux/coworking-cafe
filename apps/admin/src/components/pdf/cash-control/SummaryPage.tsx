'use client'

import { Page, Text, View } from '@react-pdf/renderer'
import { RowTabTurnover } from '../RowTabTurnover'
import { pdfStyles } from './styles'
import { getMonthName } from './utils'
import { PDFFooter } from './PDFFooter'
import {
  sumByVatRate,
  sumAllVatRates,
  sumB2BInvoices,
  sumExpenses,
  sumPaymentMethod,
} from './calculations'
import type { TurnoverData } from './types'

interface SummaryPageProps {
  data: TurnoverData[]
  selectedMonth: number | null
  selectedYear: number | null
}

/**
 * Page 1: Summary page with all recaps
 */
export function SummaryPage({ data, selectedMonth, selectedYear }: SummaryPageProps) {
  return (
    <Page style={pdfStyles.page} size="A4">
      {/* Header */}
      <View style={pdfStyles.header} fixed>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Journal de bord
        </Text>
        <Text style={{ fontSize: 15 }}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
      </View>

      <View style={pdfStyles.body} wrap={false}>
        {/* Turnover Summary */}
        <TurnoverSummarySection data={data} />

        {/* B2B & Expenses Summary */}
        <B2BExpensesSummarySection data={data} />

        {/* Payment Methods Summary */}
        <PaymentMethodsSummarySection data={data} />
      </View>

      <PDFFooter pageNumber={1} totalPages={5} />
    </Page>
  )
}

function TurnoverSummarySection({ data }: { data: TurnoverData[] }) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Recapitulatif du chiffre d&apos;affaires
      </Text>
      <View style={pdfStyles.bodyView}>
        {/* Header */}
        <View style={{ ...pdfStyles.bodyHeader, ...pdfStyles.tableHeaderStyle }}>
          <RowTabTurnover
            firstCell="Libelle"
            secCell="Total HT"
            thirdCell="Taxe"
            fourthCell="Total TTC"
          />
        </View>

        <View style={pdfStyles.tableContentStyle}>
          {/* TVA 5.5% */}
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Dont TVA 5,5%"
              secCell={sumByVatRate(data, 'ca-ht', '5.5')}
              thirdCell={sumByVatRate(data, 'ca-tva', '5.5')}
              fourthCell={sumByVatRate(data, 'ca-ttc', '5.5')}
            />
          </View>

          {/* TVA 10% */}
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Dont TVA 10%"
              secCell={sumByVatRate(data, 'ca-ht', '10')}
              thirdCell={sumByVatRate(data, 'ca-tva', '10')}
              fourthCell={sumByVatRate(data, 'ca-ttc', '10')}
            />
          </View>

          {/* TVA 20% */}
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Dont TVA 20%"
              secCell={sumByVatRate(data, 'ca-ht', '20')}
              thirdCell={sumByVatRate(data, 'ca-tva', '20')}
              fourthCell={sumByVatRate(data, 'ca-ttc', '20')}
            />
          </View>

          {/* Total */}
          <View style={[pdfStyles.bodyHeader, pdfStyles.lastRow]}>
            <RowTabTurnover
              firstCell="Total"
              secCell={sumAllVatRates(data, 'ca-ht')}
              thirdCell={sumAllVatRates(data, 'ca-tva')}
              fourthCell={sumAllVatRates(data, 'ca-ttc')}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

function B2BExpensesSummarySection({ data }: { data: TurnoverData[] }) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Recapitulatif des reglements factures B2B /depenses caisses
      </Text>
      <View style={pdfStyles.bodyView}>
        <View style={{ ...pdfStyles.bodyHeader, ...pdfStyles.tableHeaderStyle }}>
          <RowTabTurnover firstCell="Libelle" secCell="Montant" />
        </View>

        <View style={pdfStyles.tableContentStyle}>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Factures B2B"
              secCell={sumB2BInvoices(data)}
            />
          </View>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Depenses caisse"
              secCell={sumExpenses(data)}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

function PaymentMethodsSummarySection({ data }: { data: TurnoverData[] }) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Recapitulatif des modes de paiement
      </Text>
      <View style={pdfStyles.bodyView}>
        <View style={{ ...pdfStyles.bodyHeader, ...pdfStyles.tableHeaderStyle }}>
          <RowTabTurnover firstCell="Libelle" secCell="Montant" />
        </View>

        <View style={pdfStyles.tableContentStyle}>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Cb classique"
              secCell={sumPaymentMethod(data, 'cbClassique')}
            />
          </View>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Cb sans contact"
              secCell={sumPaymentMethod(data, 'cbSansContact')}
            />
          </View>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Virement"
              secCell={sumPaymentMethod(data, 'virement')}
            />
          </View>
          <View style={pdfStyles.bodyHeader}>
            <RowTabTurnover
              firstCell="Especes"
              secCell={sumPaymentMethod(data, 'especes')}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
