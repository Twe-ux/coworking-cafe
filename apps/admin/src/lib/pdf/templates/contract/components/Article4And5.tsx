import { Page, Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";
import { AvailabilityTable } from "./AvailabilityTable";
import { DistributionTable } from "./DistributionTable";

interface Article4And5Props {
  employee: Employee;
  monthlyHours: string;
}

export function Article4And5({ employee, monthlyHours }: Article4And5Props) {
  return (
    <>
      {/* Page 4 - Article 4 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.articleTitle}>
            Article 4 - Durée mensuelle du travail
          </Text>

          <Text style={styles.text}>
            Le présent contrat de travail est conclu pour une durée mensuelle du
            travail de <Text style={styles.textBold}>{monthlyHours} heures</Text>.
          </Text>

          <Text style={styles.text}>
            Conformément aux dispositions conventionnelles applicables, il est
            expressément convenu que la durée du travail du Salarié, notifiée
            dans les conditions énoncées a l'article 5 du présent contrat, sera
            programmée dans les plages de planification possible définies
            ci-après :
          </Text>

          <Text style={[styles.text, { marginBottom: 20 }]}>
            La durée mensuelle de travail a été divisée par 4,33 semaines en
            moyenne par mois pour obtenir la référence horaire hebdomadaire
            servant à définir le volant des plages de planification possible.
          </Text>

          {/* Availability Table */}
          <AvailabilityTable availability={employee.availability} />
        </View>
      </Page>

      {/* Page 5 - Article 5 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.articleTitle}>
            Article 5 - Répartition de la durée du travail
          </Text>

          <Text style={[styles.text, { marginBottom: 20 }]}>
            La répartition des heures sur les semaines du mois est indiquée
            ci-après. Cette répartition est effectuée dans le respect des plages
            de planification possible visées a l'article 4.
          </Text>

          {/* Distribution Table */}
          <DistributionTable
            distributionData={employee.workSchedule?.weeklyDistributionData}
          />

          <Text style={styles.text}>
            En ce qui concerne les jours de repos hebdomadaires, il a été convenu
            en accord avec le Salarie et conformément aux dispositions
            conventionnelles que les 2 jours de repos hebdomadaires sont fixés
            contractuellement dans le tableau de répartition ci-dessus.
          </Text>
        </View>
      </Page>
    </>
  );
}
