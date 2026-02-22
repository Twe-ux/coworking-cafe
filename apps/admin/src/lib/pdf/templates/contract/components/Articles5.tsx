import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import { DistributionTable } from "./DistributionTable";

interface Articles5Props {
  employee: Employee;
  monthlyHours: string;
}

export function Articles5And6({ employee, monthlyHours }: Articles5Props) {
  return (
    <>
      {/* Page 4 - */}
      <Page size="A4" style={styles.page}>
        {/* Article 5  */}
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
            En ce qui concerne les jours de repos hebdomadaires, il a été
            convenu en accord avec le Salarié et conformément aux dispositions
            conventionnelles que :
          </Text>
          <Text style={styles.text}>
            les 2 jours de repos hebdomadaires sont fixés contractuellement dans
            le tableau de répartition ci-dessus et qu’ils peuvent faire l’objet
            d’un commun accord d’une modification éventuelle ultérieure
            conformément aux règles de planification en vigueur.
          </Text>
          <Text style={styles.text}>
            Par ailleurs, concernant cette répartition de la durée du travail,
            il est rappelé tout particulièrement et conformément aux
            dispositions conventionnelles en vigueur à la date du présent
            contrat de travail que :
          </Text>
          <Text style={styles.text}>
            - Les horaires sont notifiés au Salarié par affichage du programme
            de travail dans le respect des règles et délais de planification
            prévus conventionnellement à savoir 10 jours calendaires avant le
            début de la semaine concernée, modifiables au plus tard 3 jours
            avant avec l’accord du Salarié.
          </Text>
          <Text style={styles.text}>
            - La modification de la répartition de la durée du travail, sur les
            semaines du mois ou sur les jours des dites semaines, est notifiée
            au Salarié dans les mêmes formes et délais.
          </Text>
          <Text style={styles.text}>
            - Cette modification de la répartition de la durée du travail et des
            horaires de travail est possible sous réserve :
          </Text>
          <Text style={styles.text}>
            - Qu’elle intervienne dans le cadre des plages de planification
            possible précisées à l’article 4 du contrat et qui en déterminent
            ainsi la variation possible
          </Text>
          <Text style={styles.text}>
            - Qu’elle intervienne notamment dans les cas suivants : variation
            d’activité, changement d’affectation d’équipe en fonction des
            compétences requises par l’entreprise, remplacement pour départ,
            absence ou maladie d’un Salarié, accident du travail ou congés
          </Text>
          <Text style={styles.text}>
            - Chaque journée de travail ne pourra comporter qu’une seule coupure
            dont la durée ne peut excéder 5 heures. Dans ce cas, et en
            contrepartie de toute coupure journalière supérieure à 2 heures dans
            la limite de 5 heures, les deux séquences de travail réalisées par
            le Salarié à temps partiel au cours de cette journée seront chacune
            d’une durée minimale de 3 heures consécutives
          </Text>
        </View>
      </Page>
    </>
  );
}
