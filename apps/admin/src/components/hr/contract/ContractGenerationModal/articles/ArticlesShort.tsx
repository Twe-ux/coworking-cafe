/**
 * Contract articles 8-10
 * Short articles: employment accumulation, leave, and absence
 */

import { ArticleSection } from './ArticleSection'

// Articles 8-10 (simplified/short)
export function ArticlesShort() {
  return (
    <>
      <ArticleSection title="Article 8 - Cumul d'emplois">
        <p>
          Le Salarie s&apos;engage a porter à la connaissance de l&apos;Employeur tout autre emploi a temps partiel
          qu&apos;il pourrait occuper.
        </p>
      </ArticleSection>

      <ArticleSection title="Article 9 - Congés payés">
        <p>
          Le Salarie bénéficiera des congés payés conformement aux dispositions legales et conventionnelles en
          vigueur.
        </p>
      </ArticleSection>

      <ArticleSection title="Article 10 - Absence et maladie">
        <p>
          Toute absence doit etre portee à la connaissance de la Direction par tous moyens et dans les plus brefs
          delais.
        </p>
      </ArticleSection>
    </>
  )
}
