/**
 * Contract articles 4-7
 * Work hours, distribution, extra hours, and salary
 */

import type { Employee } from '../types'
import { AvailabilityTable } from '../AvailabilityTable'
import { DistributionTable } from '../DistributionTable'
import { ArticleSection } from './ArticleSection'

interface ArticleEmployeeProps {
  employee: Employee
}

interface Article4Props extends ArticleEmployeeProps {
  monthlyHours: string
}

interface Article7Props extends ArticleEmployeeProps {
  monthlySalary: string
  monthlyHours: string
}

// Article 4 - Duree mensuelle du travail
export function Article4({ employee, monthlyHours }: Article4Props) {
  return (
    <ArticleSection title="Article 4 - Duree mensuelle du travail">
      <p style={{ marginBottom: '12px' }}>
        Le present contrat de travail est conclu pour une duree mensuelle du travail de{' '}
        <strong>{monthlyHours} heures</strong>.
      </p>
      <p style={{ marginBottom: '12px' }}>
        Conformement aux dispositions conventionnelles applicables, il est expressement convenu que la duree du
        travail du Salarie, notifiee dans les conditions enoncees a l&apos;article 5 du present contrat, sera
        programmee dans les plages de planification possible definies ci-apres :
      </p>
      <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>
        La duree mensuelle de travail a ete divisee par 4,33 semaines en moyenne par mois pour obtenir la
        reference horaire hebdomadaire servant a definir le volant des plages de planification possible.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <AvailabilityTable employee={employee} />
      </div>
    </ArticleSection>
  )
}

// Article 5 - Repartition de la duree du travail
export function Article5({ employee }: ArticleEmployeeProps) {
  return (
    <ArticleSection title="Article 5 - Repartition de la duree du travail">
      <p style={{ marginBottom: '12px' }}>
        La repartition des heures sur les semaines du mois est indiquee ci-apres. Cette repartition est effectuee
        dans le respect des plages de planification possible visees a l&apos;article 4.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <DistributionTable employee={employee} />
      </div>
      <p style={{ marginBottom: '10px' }}>
        En ce qui concerne les jours de repos hebdomadaires, il a ete convenu en accord avec le Salarie et
        conformement aux dispositions conventionnelles que les 2 jours de repos hebdomadaires sont fixes
        contractuellement dans le tableau de repartition ci-dessus.
      </p>
    </ArticleSection>
  )
}

// Article 6 - Heures complementaires
export function Article6() {
  return (
    <ArticleSection title="Article 6 - Heures complementaires">
      <p style={{ marginBottom: '10px' }}>
        Il est convenu qu&apos;en fonction des besoins de l&apos;entreprise, le Salarie pourra etre amene a
        effectuer des heures complementaires, dans la limite du tiers de la duree initiale du contrat par semaine.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Les heures complementaires effectuees en-deca du 1/10 de la duree initialement fixee au contrat seront
        majorees a <strong>10%</strong>.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Les heures complementaires effectuees au-dela du 1/10 de la duree initialement fixee au contrat seront
        majorees a <strong>25%</strong>.
      </p>
    </ArticleSection>
  )
}

// Article 7 - Remuneration
export function Article7({ employee, monthlySalary, monthlyHours }: Article7Props) {
  return (
    <ArticleSection title="Article 7 - Remuneration">
      <p style={{ marginBottom: '12px' }}>
        Le Salarie percevra une remuneration mensualisee brute de <strong>{monthlySalary} EUR</strong>
        <br />
        correspondant a sa duree de travail mensuelle de <strong>{monthlyHours}</strong> heures
        <br />
        sur la base d&apos;un taux horaire de <strong>{employee.hourlyRate?.toFixed(2) ?? ''} EUR</strong>
      </p>
      <p>
        Sur cette remuneration seront prelevees les cotisations sociales et notamment celles afferentes au regime
        de protection sociale en vigueur dans la societe a la date de versement.
      </p>
    </ArticleSection>
  )
}
