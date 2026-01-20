/**
 * Article section wrapper component
 * Reusable wrapper for contract articles
 */

import { CONTRACT_STYLES } from '../constants'

export interface ArticleSectionProps {
  title: string
  children: React.ReactNode
}

export function ArticleSection({ title, children }: ArticleSectionProps) {
  return (
    <div style={CONTRACT_STYLES.section}>
      <h4 style={CONTRACT_STYLES.articleTitle}>{title}</h4>
      {children}
    </div>
  )
}
