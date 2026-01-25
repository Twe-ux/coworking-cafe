/**
 * PDF Styles for Contract Document
 * Using @react-pdf/renderer StyleSheet
 */

import { StyleSheet } from "@react-pdf/renderer";

// Register fonts (optional - uses Helvetica by default)
// Font.register({
//   family: 'Arial',
//   src: '/fonts/Arial.ttf',
// })

export const styles = StyleSheet.create({
  // Page
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 65, // Increased for better side margins
    paddingRight: 65,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5, // Reduced from 1.6 for more compact text
  },

  // Title
  title: {
    color: "#1e40af",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  subtitle: {
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12, // Reduced from 20 to minimize white space
  },

  // Section
  section: {
    marginBottom: 15, // Reduced from 30 to minimize white space
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10, // Reduced from 15 for tighter spacing
  },

  // Article
  articleTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10, // Reduced from 12 for tighter spacing
    marginBottom: 10, // Reduced from 12 for tighter spacing
    textDecoration: "underline",
  },

  // Text
  text: {
    fontSize: 11,
    lineHeight: 1.5, // Reduced from 1.6 for more compact text
    marginBottom: 6, // Reduced from 10 to minimize white space
  },

  textBold: {
    fontWeight: "bold",
  },

  textItalic: {
    fontStyle: "italic",
  },

  // Label text (Ci-après l'Employeur/le Salarié)
  labelText: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#64748b", // Gris ardoise
    marginBottom: 8,
  },

  // Table - Style moderne
  table: {
    width: "100%",
    marginBottom: 10,
  },

  tableRow: {
    flexDirection: "row",
    borderTop: "0.75pt solid #e2e8f0", // Bordure grise subtile
    borderLeft: "0.75pt solid #e2e8f0",
    borderRight: "0.75pt solid #e2e8f0",
  },

  tableRowLast: {
    flexDirection: "row",
    borderTop: "0.75pt solid #e2e8f0",
    borderLeft: "0.75pt solid #e2e8f0",
    borderRight: "0.75pt solid #e2e8f0",
    borderBottom: "0.75pt solid #e2e8f0",
  },

  tableHeader: {
    backgroundColor: "#f1f5f9", // Fond bleu très clair
    borderBottom: "1.5pt solid #cbd5e1", // Bordure plus marquée pour l'en-tête
  },

  tableCell: {
    padding: 5, // Augmenté pour plus d'espace
    fontSize: 10, // Augmenté pour meilleure lisibilité
    borderRight: "0.75pt solid #e2e8f0",
    textAlign: "center",
  },

  tableCellLast: {
    padding: 5,
    fontSize: 10,
    textAlign: "center",
  },

  tableCellLeft: {
    padding: 5,
    fontSize: 10,
    borderRight: "0.75pt solid #e2e8f0",
    textAlign: "center",
  },

  tableCellHeader: {
    padding: 5,
    fontSize: 10,
    borderRight: "0.75pt solid #e2e8f0",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1e40af", // Bleu pour les en-têtes
    textAlign: "center",
  },

  tableCellBold: {
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  // List
  list: {
    marginLeft: 30,
    marginBottom: 8, // Reduced from 10
  },

  listItem: {
    flexDirection: "row",
    marginBottom: 4, // Reduced from 6 for tighter spacing
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100, // Reduced from 40
    marginBottom: 20,
  },

  signatureBlock: {
    width: "45%",
    textAlign: "center",
  },

  signatureLine: {
    borderBottom: "1px solid #000",
    marginBottom: 10,
    height: 40,
  },

  signatureLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 20,
  },

  signatureName: {
    fontSize: 11,
    marginBottom: 5,
  },

  signatureText: {
    fontSize: 10,
    fontStyle: "italic",
  },

  // Spacer
  spacer: {
    height: 12, // Reduced from 20 for tighter spacing
  },

  // Footer text
  footer: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 30,
  },
});
