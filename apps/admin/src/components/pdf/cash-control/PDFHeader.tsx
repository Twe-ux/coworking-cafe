'use client'

import { Text, View } from '@react-pdf/renderer'
import { pdfStyles } from './styles'
import { getMonthName } from './utils'
import type { PageHeaderProps } from './types'

interface PDFHeaderProps extends PageHeaderProps {
  subtitle?: string
  height?: number
}

/**
 * Reusable PDF page header component
 */
export function PDFHeader({ title, subtitle, month, year, height = 80 }: PDFHeaderProps) {
  return (
    <View style={{ ...pdfStyles.header, height }} fixed>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, marginBottom: 5 }}>
          {subtitle}
        </Text>
      )}
      <Text style={{ fontSize: 15 }}>
        {getMonthName(month)} {year}
      </Text>
    </View>
  )
}
