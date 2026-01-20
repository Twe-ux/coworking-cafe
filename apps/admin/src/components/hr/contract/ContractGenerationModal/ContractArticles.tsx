/**
 * Contract articles component
 * Assembles all legal articles of the employment contract
 */

import type { ContractArticlesProps } from './types'
import {
  Article1,
  Article2,
  Article3,
  Article4,
  Article5,
  Article6,
  Article7,
  ArticlesShort,
} from './articles'

export function ContractArticles({ employee, monthlySalary, monthlyHours }: ContractArticlesProps) {
  const contractTypeLabel = employee.contractualHours >= 35 ? 'complet' : 'partiel'

  return (
    <>
      <Article1 employee={employee} contractTypeLabel={contractTypeLabel} />
      <Article2 />
      <Article3 />
      <Article4 employee={employee} monthlyHours={monthlyHours} />
      <Article5 employee={employee} />
      <Article6 />
      <Article7 employee={employee} monthlySalary={monthlySalary} monthlyHours={monthlyHours} />
      <ArticlesShort />
    </>
  )
}
