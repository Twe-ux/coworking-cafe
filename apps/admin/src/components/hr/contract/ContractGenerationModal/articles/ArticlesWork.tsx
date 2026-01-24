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

// Article 4 - Durée mensuelle du travail
export function Article4({ employee, monthlyHours }: Article4Props) {
  return (
    <ArticleSection title="Article 4 - Durée mensuelle du travail">
      <p style={{ marginBottom: '12px' }}>
        Le présent contrat de travail est conclu pour une durée mensuelle du travail de{' '}
        <strong>{monthlyHours} heures</strong>.
      </p>
      <p style={{ marginBottom: '12px' }}>
        Conformément aux dispositions conventionnelles applicables, il est expressement convenu que la durée du
        travail du Salarie, notifiée dans les conditions énoncées a l&apos;article 5 du present contrat, sera
        programmée dans les plages de planification possible définies ci-après :
      </p>
      <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>
        La durée mensuelle de travail a ete divisée par 4,33 semaines en moyenne par mois pour obtenir la
        référence horaire hebdomadaire servant a définir le volant des plages de planification possible.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <AvailabilityTable employee={employee} />
      </div>
    </ArticleSection>
  )
}

// Article 5 - Répartition de la durée du travail
export function Article5({ employee }: ArticleEmployeeProps) {
  return (
    <ArticleSection title="Article 5 - Répartition de la durée du travail">
      <p style={{ marginBottom: '12px' }}>
        La répartition des heures sur les semaines du mois est indiquee ci-après. Cette répartition est effectuée
        dans le respect des plages de planification possible visées a l&apos;article 4.
      </p>
      <div style={{ marginBottom: '10px' }}>
        <DistributionTable employee={employee} />
      </div>
      <p style={{ marginBottom: '10px' }}>
        En ce qui concerne les jours de repos hebdomadaires, il a ete convenu en accord avec le Salarie et
        conformement aux dispositions conventionnelles que les 2 jours de repos hebdomadaires sont fixés
        contractuellement dans le tableau de répartition ci-dessus.
      </p>
    </ArticleSection>
  )
}

// Article 6 - Heures complémentaires
export function Article6() {
  return (
    <ArticleSection title="Article 6 - Heures complémentaires">
      <p style={{ marginBottom: '10px' }}>
        Il est convenu qu&apos;en fonction des besoins de l&apos;entreprise, le Salarie pourra etre amené a
        effectuer des heures complémentaires, dans la limite du tiers de la durée initiale du contrat par semaine.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Les heures complémentaires effectuées en-deca du 1/10 de la durée initialement fixee au contrat seront
        majorees a <strong>10%</strong>.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Les heures complémentaires effectuées au-dela du 1/10 de la durée initialement fixee au contrat seront
        majorees a <strong>25%</strong>.
      </p>
    </ArticleSection>
  )
}

// Article 7 - Rémunération
export function Article7({ employee, monthlySalary, monthlyHours }: Article7Props) {
  const hourlyRate = employee.hourlyRate || 0;
  const calculatedSalary = hourlyRate > 0 && monthlySalary !== '0.00'
    ? monthlySalary
    : (hourlyRate * parseFloat(monthlyHours)).toFixed(2);

  return (
    <ArticleSection title="Article 7 - Rémunération">
      <p style={{ marginBottom: '12px' }}>
        Le Salarié percevra une rémunération mensualisée brute de <strong>{calculatedSalary} EUR</strong>
        <br />
        correspondant à sa durée de travail mensuelle de <strong>{monthlyHours} heures</strong>
        <br />
        sur la base d&apos;un taux horaire brut de <strong>{hourlyRate.toFixed(2)} EUR</strong>
      </p>
      <p>
        Sur cette rémunération seront prélevées les cotisations sociales et notamment celles afférentes au régime
        de protection sociale en vigueur dans la société à la date de versement.
      </p>
    </ArticleSection>
  )
}
