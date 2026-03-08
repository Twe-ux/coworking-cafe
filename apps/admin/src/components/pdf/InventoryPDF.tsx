'use client'

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

interface InventoryItem {
  productName: string
  category: string
  theoreticalQty: number
  actualQty: number
  variance: number
  unitPriceHT: number
  varianceValue: number
}

interface ValorizationData {
  stockFinalValue: number
  consumptionValue: number
  totalValue: number
}

interface InventoryPDFProps {
  title: string
  date: string
  items: InventoryItem[]
  valorization?: ValorizationData
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '30%' },
  col2: { width: '10%' },
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '15%' },
  col7: { width: '15%' },
  valorization: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  valorizationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  valorizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
})

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Alimentaire',
  cleaning: 'Entretien',
  emballage: 'Emballage',
  papeterie: 'Papeterie',
  divers: 'Divers',
}

export function InventoryPDF({ title, date, items, valorization }: InventoryPDFProps) {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{formattedDate}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Produit</Text>
            <Text style={styles.col2}>Catégorie</Text>
            <Text style={styles.col3}>Stock théo.</Text>
            <Text style={styles.col4}>Stock réel</Text>
            <Text style={styles.col5}>Écart</Text>
            <Text style={styles.col6}>Prix Unit. HT</Text>
            <Text style={styles.col7}>Valeur écart</Text>
          </View>

          {/* Data Rows */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.productName}</Text>
              <Text style={styles.col2}>{CATEGORY_LABELS[item.category] || item.category}</Text>
              <Text style={styles.col3}>{item.theoreticalQty}</Text>
              <Text style={styles.col4}>{item.actualQty}</Text>
              <Text style={styles.col5}>{item.variance}</Text>
              <Text style={styles.col6}>{item.unitPriceHT.toFixed(2)} €</Text>
              <Text style={styles.col7}>{item.varianceValue.toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        {/* Valorization */}
        {valorization && (
          <View style={styles.valorization}>
            <Text style={styles.valorizationTitle}>Valorisation CUMP</Text>
            <View style={styles.valorizationRow}>
              <Text>Stock final valorisé (dernier prix)</Text>
              <Text>{valorization.stockFinalValue.toFixed(2)} €</Text>
            </View>
            <View style={styles.valorizationRow}>
              <Text>Consommation valorisée (CUMP)</Text>
              <Text>{valorization.consumptionValue.toFixed(2)} €</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>VALORISATION TOTALE</Text>
              <Text>{valorization.totalValue.toFixed(2)} €</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Généré le {new Date().toLocaleString('fr-FR')} - CoworkingCafé
        </Text>
      </Page>
    </Document>
  )
}
