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

export interface InventoryPDFOptions {
  title: string
  date: string
  items: InventoryItem[]
  valorization?: ValorizationData
}

/**
 * Génère et télécharge un PDF d'inventaire
 * Utilise @react-pdf/renderer
 */
export async function generateInventoryPDF(options: InventoryPDFOptions): Promise<void> {
  try {
    // Import dynamique pour optimiser le bundle
    const { pdf } = await import('@react-pdf/renderer')
    const { InventoryPDF } = await import('@/components/pdf/InventoryPDF')

    // Créer le document PDF React
    const pdfElement = InventoryPDF(options)

    // Générer le blob
    const blob = await pdf(pdfElement).toBlob()

    // Télécharger le fichier
    const formattedDate = new Date(options.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-')
    const filename = `Inventaire_${formattedDate}.pdf`

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw error
  }
}
