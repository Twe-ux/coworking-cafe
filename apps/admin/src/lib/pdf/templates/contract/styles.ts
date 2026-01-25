/**
 * PDF Styles for Contract Document
 * Using @react-pdf/renderer StyleSheet
 */

import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts (optional - uses Helvetica by default)
// Font.register({
//   family: 'Arial',
//   src: '/fonts/Arial.ttf',
// })

export const styles = StyleSheet.create({
  // Page
  page: {
    paddingTop: 20, // 20mm ≈ 57pt
    paddingBottom: 20,
    paddingLeft: 25, // 25mm ≈ 71pt
    paddingRight: 25,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
  },

  // Title
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  subtitle: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Section
  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  // Article
  articleTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 12,
    textDecoration: 'underline',
  },

  // Text
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },

  textBold: {
    fontWeight: 'bold',
  },

  textItalic: {
    fontStyle: 'italic',
  },

  // Table
  table: {
    width: '100%',
    marginBottom: 15,
  },

  tableRow: {
    flexDirection: 'row',
    borderTop: '1px solid #000',
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
  },

  tableRowLast: {
    flexDirection: 'row',
    borderTop: '1px solid #000',
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000',
    borderBottom: '1px solid #000',
  },

  tableHeader: {
    backgroundColor: '#e9ecef',
  },

  tableCell: {
    padding: 8,
    fontSize: 9,
    borderRight: '1px solid #000',
    textAlign: 'center',
  },

  tableCellLast: {
    padding: 8,
    fontSize: 9,
    textAlign: 'center',
  },

  tableCellLeft: {
    padding: 8,
    fontSize: 9,
    borderRight: '1px solid #000',
    textAlign: 'left',
  },

  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    borderRight: '1px solid #000',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tableCellBold: {
    fontWeight: 'bold',
  },

  // List
  list: {
    marginLeft: 30,
    marginBottom: 10,
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  bullet: {
    width: 15,
  },

  listText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.6,
  },

  // Signature
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },

  signatureBlock: {
    width: '45%',
    textAlign: 'center',
  },

  signatureLine: {
    borderBottom: '1px solid #000',
    marginBottom: 10,
    height: 40,
  },

  signatureLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  signatureName: {
    fontSize: 11,
    marginBottom: 40,
  },

  signatureText: {
    fontSize: 10,
    fontStyle: 'italic',
  },

  // Spacer
  spacer: {
    height: 20,
  },

  // Footer text
  footer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 30,
  },
})
