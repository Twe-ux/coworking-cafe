import { StyleSheet } from '@react-pdf/renderer'

export const pdfStyles = StyleSheet.create({
  page: {
    border: '1px solid rgba(0, 0, 0, 0.3)',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    margin: 'auto',
    padding: 20,
    minWidth: 600,
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: 30,
  },
  bodyView: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(1, 1, 1, 1)',
  },
  bodyHeader: {
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  tvaBodyHeader: {
    height: 120,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  detailBodyHeader: {
    height: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
  },
  lastRow: {
    backgroundColor: 'rgba(1, 1, 1, 0.05)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderTop: '1px solid #000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tableHeaderStyle: {
    borderBottom: '0.5px solid rgba(0, 0, 0, 0.3)',
    backgroundColor: 'rgba(1, 1, 1, 0.05)',
  },
  tableContentStyle: {
    flexDirection: 'column',
    fontSize: 10,
  },
  tableContentWithLineHeight: {
    flexDirection: 'column',
    fontSize: 10,
    lineHeight: 1.4,
  },
})
