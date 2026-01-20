/**
 * Contract articles 1-3
 * Engagement, functions, and workplace
 */

import type { Employee } from '../types'
import { TABLE_STYLES } from '../constants'
import { ArticleSection } from './ArticleSection'

interface ArticleEmployeeProps {
  employee: Employee
}

interface Article1Props extends ArticleEmployeeProps {
  contractTypeLabel: string
}

// Article 1 - Engagement et periode d'essai
export function Article1({ employee, contractTypeLabel }: Article1Props) {
  const dpaeDate = employee.onboardingStatus?.dpaeCompletedAt
    ? new Date(employee.onboardingStatus.dpaeCompletedAt).toLocaleDateString('fr-FR')
    : '[DATE DPAE]'
  const hireDate = new Date(employee.hireDate).toLocaleDateString('fr-FR')

  return (
    <ArticleSection title="Article 1 - Engagement et periode d'essai">
      <p style={{ marginBottom: '12px' }}>
        La declaration prealable a l&apos;embauche a ete adressee a l&apos;URSSAF d&apos;Alsace (427), le{' '}
        <strong>{dpaeDate}</strong>
        <br />
        Le Salarie est engage pour une duree indeterminee et a temps {contractTypeLabel} :
      </p>

      <table style={{ ...TABLE_STYLES.table, width: '60%', marginBottom: '15px' }}>
        <tbody>
          <tr>
            <td style={{ ...TABLE_STYLES.cell, width: '50%', textAlign: 'left' }}>En qualite de</td>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Equipier polyvalent</td>
          </tr>
          <tr>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Niveau</td>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>{employee.level ?? ''}</td>
          </tr>
          <tr>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Echelon</td>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>{employee.step ?? ''}</td>
          </tr>
          <tr>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Date d&apos;entree</td>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>{hireDate}</td>
          </tr>
          <tr>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>Heure</td>
            <td style={{ ...TABLE_STYLES.cell, textAlign: 'left' }}>{employee.hireTime ?? '9H30'}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginBottom: '10px' }}>
        Il ne deviendra definitif qu&apos;a l&apos;expiration d&apos;une periode d&apos;essai de <strong>deux mois</strong>.
      </p>
      <p style={{ marginBottom: '10px' }}>
        La periode d&apos;essai pourra etre renouvelee d&apos;une periode au maximum egale a <strong>deux mois</strong>.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Le renouvellement de la periode d&apos;essai devra etre formalise par un accord ecrit, signe des deux parties,
        au moins trois jours ouvrables avant la fin de la periode d&apos;essai initiale.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Pendant la periode d&apos;essai, les parties pourront resilier le contrat de travail en respectant les delais
        de prevenance minimaux prevus par les dispositions legales et conventionnelles.
      </p>
      <p style={{ marginBottom: '10px' }}>
        Toute suspension qui se produirait pendant la periode d&apos;essai (maladie, conges...) prolongerait d&apos;autant
        la duree de cette periode qui doit correspondre a un travail effectif.
      </p>
      <p>
        Le Salarie declare n&apos;etre lie a aucune autre entreprise et avoir quitte son precedent employeur libre de
        tout engagement. Dans le cas contraire, les dispositions prevues a l&apos;article 8 s&apos;appliquent.
      </p>
    </ArticleSection>
  )
}

// Article 2 - Fonctions
export function Article2() {
  return (
    <ArticleSection title="Article 2 - Fonctions">
      <p style={{ marginBottom: '10px' }}>
        Le Salarie exercera les fonctions d&apos;employe polyvalent et sera a ce titre, notamment en charge des
        taches suivantes :
      </p>
      <ul style={{ marginLeft: '30px', marginBottom: '10px', lineHeight: '1.6' }}>
        <li>Accueillir, servir et etre a l&apos;ecoute des clients ;</li>
        <li>Promouvoir la Societe aupres des clients en expliquant le concept du Coworking Cafe ;</li>
        <li>
          Preparer et servir les boissons et la nourriture proposes dans l&apos;etablissement, dans le respect des
          regles d&apos;hygiene ;
        </li>
        <li>Veiller a la proprete et au parfait etat des locaux et du mobilier s&apos;y trouvant ;</li>
        <li>
          Proceder a l&apos;encaissement des clients et assurer la securite de la caisse dans le respect des
          consignes specifiques relatifs aux flux financiers ;
        </li>
        <li>
          D&apos;une maniere generale, faire son mieux pour assurer un haut niveau de qualite de service aupres des
          clients et assurer le bon fonctionnement de l&apos;etablissement.
        </li>
      </ul>
      <p>
        Les attributions du Salarie sont evolutives et pourront faire l&apos;objet de modifications, de precisions ou
        de complements, temporaires ou definitifs, sans que cela puisse etre considere comme une modification du
        contrat de travail.
      </p>
      <p style={{ marginTop: '12px' }}>
        Afin de permettre au Salarie d&apos;apprehender au mieux le contenu de ses futures fonctions et les
        specificites liees a la nature de notre activite, le Salarie beneficiera d&apos;une formation continue.
      </p>
    </ArticleSection>
  )
}

// Article 3 - Lieu de travail
export function Article3() {
  return (
    <ArticleSection title="Article 3 - Lieu de travail">
      <p>
        Le Salarie exercera ses fonctions au sein de l&apos;etablissement situe{' '}
        <strong>1 rue de la Division Leclerc 67000 Strasbourg</strong>. Toutefois, il pourra etre affecte de
        maniere temporaire a un autre etablissement de la meme enseigne.
      </p>
    </ArticleSection>
  )
}
