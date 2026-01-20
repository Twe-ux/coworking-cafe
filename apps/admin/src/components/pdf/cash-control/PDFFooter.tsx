'use client'

import { Text, View } from '@react-pdf/renderer'
import { pdfStyles } from './styles'
import type { PageFooterProps } from './types'

const TOTAL_PAGES = 5

/**
 * Reusable PDF page footer component
 */
export function PDFFooter({ pageNumber, totalPages = TOTAL_PAGES }: PageFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={{ fontSize: 10 }}>
        Page {pageNumber}/{totalPages} - Genere le: {new Date().toLocaleDateString()} a{' '}
        {new Date().toLocaleTimeString()} par Coworking Platform
      </Text>
    </View>
  )
}
