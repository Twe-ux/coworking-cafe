/**
 * PDF Styles for Contract Document - VERSION MODERNE
 * Using @react-pdf/renderer StyleSheet
 *
 * Palette de couleurs :
 * - Primary: #1e40af (Bleu professionnel)
 * - Secondary: #64748b (Gris ardoise)
 * - Accent: #3b82f6 (Bleu clair)
 * - Background: #f8fafc (Gris très clair)
 * - Border: #e2e8f0 (Gris bordure)
 */

import { StyleSheet, Font } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  // ============================================
  // PAGE & LAYOUT
  // ============================================
  page: {
    paddingTop: 35,
    paddingBottom: 35,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================

  // Titre principal
  title: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1e40af',
    letterSpacing: 0.5,
  },

  // Sous-titre
  subtitle: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 25,
    color: '#64748b',
  },

  // Titre de section (ex: "Entre les soussignés")
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    marginTop: 5,
    color: '#1e293b',
  },

  // Titre d'article (ex: "Article 1 - Engagement")
  articleTitle: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    marginTop: 15,
    paddingBottom: 6,
    borderBottom: '1.5pt solid #e2e8f0',
    color: '#1e40af',
  },

  // ============================================
  // TEXT STYLES
  // ============================================

  // Texte normal
  text: {
    fontSize: 10.5,
    lineHeight: 1.6,
    marginBottom: 9,
    color: '#1e293b',
    textAlign: 'justify',
  },

  // Texte en gras
  textBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // Texte italique
  textItalic: {
    fontStyle: 'italic',
    color: '#475569',
  },

  // Texte "Ci-après..."
  labelText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 15,
    color: '#64748b',
  },

  // ============================================
  // SECTIONS & SPACING
  // ============================================

  section: {
    marginBottom: 22,
  },

  spacer: {
    height: 15,
  },

  // ============================================
  // TABLEAUX MODERNES
  // ============================================

  table: {
    width: '100%',
    marginBottom: 15,
    marginTop: 10,
    borderRadius: 4,
  },

  // Ligne de tableau
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #e2e8f0',
  },

  // Dernière ligne
  tableRowLast: {
    flexDirection: 'row',
    borderBottom: '1pt solid #cbd5e1',
  },

  // En-tête de tableau (fond bleu clair)
  tableHeader: {
    backgroundColor: '#f1f5f9',
    borderBottom: '1.5pt solid #cbd5e1',
  },

  // Cellule normale
  tableCell: {
    padding: 10,
    fontSize: 10,
    borderRight: '0.5pt solid #e2e8f0',
    textAlign: 'center',
    color: '#334155',
  },

  // Dernière cellule (pas de bordure droite)
  tableCellLast: {
    padding: 10,
    fontSize: 10,
    textAlign: 'center',
    color: '#334155',
  },

  // Cellule alignée à gauche
  tableCellLeft: {
    padding: 10,
    fontSize: 10,
    borderRight: '0.5pt solid #e2e8f0',
    textAlign: 'left',
    color: '#334155',
  },

  // Cellule d'en-tête
  tableCellHeader: {
    padding: 9,
    fontSize: 10,
    borderRight: '0.5pt solid #cbd5e1',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1e40af',
  },

  // Cellule en gras
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // ============================================
  // LISTES À PUCES
  // ============================================

  list: {
    marginLeft: 25,
    marginBottom: 10,
    marginTop: 8,
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 7,
  },

  bullet: {
    width: 18,
    fontSize: 11,
    color: '#3b82f6',
  },

  listText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.6,
    color: '#334155',
  },

  // ============================================
  // SIGNATURES
  // ============================================

  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 20,
  },

  signatureBlock: {
    width: '45%',
    textAlign: 'center',
  },

  signatureLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 25,
    color: '#1e40af',
  },

  signatureName: {
    fontSize: 11,
    marginBottom: 50,
    color: '#1e293b',
  },

  signatureLine: {
    borderBottom: '1pt solid #cbd5e1',
    marginBottom: 12,
    height: 60,
  },

  signatureText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: '#64748b',
  },

  // ============================================
  // FOOTER & MISC
  // ============================================

  footer: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 30,
    color: '#94a3b8',
  },

  // Numéro de page (optionnel)
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 20,
    right: 40,
    color: '#94a3b8',
  },

  // Box avec fond (pour info importante)
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    marginVertical: 10,
    borderLeft: '3pt solid #3b82f6',
    borderRadius: 4,
  },

  infoBoxText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
})
