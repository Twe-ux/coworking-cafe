/**
 * Reusable PDF Table component - VERSION MODERNE
 * Tableau avec bordures complètes et style moderne
 */

import { View, Text } from '@react-pdf/renderer'
import { styles } from '../styles'

export interface PDFTableRow {
  label: string | React.ReactNode
  value: string | React.ReactNode
}

interface PDFTableProps {
  rows: PDFTableRow[]
  labelWidth?: string
}

export function PDFTable({ rows, labelWidth = '40%' }: PDFTableProps) {
  return (
    <View
      style={[
        styles.table,
        {
          border: '1pt solid #cbd5e1',
          borderRadius: 4,
        },
      ]}
    >
      {rows.map((row, index) => {
        const isFirst = index === 0
        const isLast = index === rows.length - 1
        return (
          <View
            key={index}
            style={[
              isLast ? styles.tableRowLast : styles.tableRow,
              isFirst && { borderTop: 'none' },
            ]}
          >
            <View style={[styles.tableCellLeft, styles.tableCellBold, { width: labelWidth }]}>
              {typeof row.label === 'string' ? <Text>{row.label}</Text> : row.label}
            </View>
            <View style={[styles.tableCellLast, { textAlign: 'left', flex: 1 }]}>
              {typeof row.value === 'string' ? <Text>{row.value}</Text> : row.value}
            </View>
          </View>
        )
      })}
    </View>
  )
}
