import { StyleSheet } from "@react-pdf/renderer";

// Styles génériques pour les PDFs
export const pdfStyles = StyleSheet.create({
  // Layout principal
  page: {
    border: "1px solid rgba(0, 0, 0, 0.3)",
  },

  header: {
    justifyContent: "center",
    alignItems: "center",
  },

  body: {
    margin: "auto",
    padding: 20,
    minWidth: 600,
    maxWidth: 600,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    gap: 30,
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },

  // Conteneurs de sections
  bodyView: {
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderColor: "rgba(1, 1, 1, 1)",
  },

  bodyHeader: {
    height: 30,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Styles de tableau
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },

  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },

  tableHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontWeight: "bold",
  },

  tableCell: {
    padding: 8,
    fontSize: 10,
    textAlign: "left",
    flex: 1,
  },

  tableCellCenter: {
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    flex: 1,
  },

  tableCellRight: {
    padding: 8,
    fontSize: 10,
    textAlign: "right",
    flex: 1,
  },

  // Styles de texte
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },

  text: {
    fontSize: 10,
    marginBottom: 5,
  },

  textBold: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },

  // Styles spécialisés
  lastRow: {
    backgroundColor: "rgba(1, 1, 1, 0.05)",
  },

  totalRow: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    fontWeight: "bold",
  },

  highlight: {
    backgroundColor: "rgba(255, 255, 0, 0.2)",
  },

  // Layout flex
  flexRow: {
    display: "flex",
    flexDirection: "row",
  },

  flexColumn: {
    display: "flex",
    flexDirection: "column",
  },

  flexBetween: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Espacement
  marginSmall: {
    margin: 5,
  },

  marginMedium: {
    margin: 10,
  },

  marginLarge: {
    margin: 20,
  },

  paddingSmall: {
    padding: 5,
  },

  paddingMedium: {
    padding: 10,
  },

  paddingLarge: {
    padding: 20,
  },
});

// Types pour les styles
export type PDFStyleKey = keyof typeof pdfStyles;
