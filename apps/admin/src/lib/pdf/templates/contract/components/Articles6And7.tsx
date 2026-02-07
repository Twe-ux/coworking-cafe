import { Page, Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";

interface Articles6And7Props {
  employee: Employee;
  monthlySalary: string;
  monthlyHours: string;
}

export function Articles6And7({
  employee,
  monthlySalary,
  monthlyHours,
}: Articles6And7Props) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Article 6 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>
          Article 6 - Heures complémentaires
        </Text>

        <Text style={styles.text}>
          Il est convenu qu'en fonction des besoins de l'entreprise, le Salarié
          pourra être amené à effectuer des heures complémentaires, dans la
          limite du tiers de la durée initiale du contrat par semaine.
        </Text>

        <Text style={styles.text}>
          Les heures complémentaires effectuées en-deca du 1/10 de la durée
          initialement fixée au contrat seront majorées a{" "}
          <Text style={styles.textBold}>10%</Text>.
        </Text>

        <Text style={styles.text}>
          Les heures complémentaires effectuées au-delà du 1/10 de la durée
          initialement fixée au contrat seront majorées a{" "}
          <Text style={styles.textBold}>25%</Text>.
        </Text>
      </View>

      {/* Article 7 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 7 - Rémunération</Text>

        <Text style={styles.text}>
          Le Salarié percevra une rémunération mensualisée brute de{" "}
          <Text style={styles.textBold}>{monthlySalary} EUR</Text>
          {"\n"}
          correspondant à sa durée de travail mensuelle de{" "}
          <Text style={styles.textBold}>{monthlyHours} heures</Text> {"\n"}
          sur la base d'un taux horaire brut de{" "}
          <Text style={styles.textBold}>
            {(employee.hourlyRate || 0).toFixed(2)} EUR
          </Text>
        </Text>

        <Text style={styles.text}>
          Sur cette rémunération seront prélevées les cotisations sociales et
          notamment celles afférentes au régime de protection sociale en vigueur
          dans la société à la date de versement.
        </Text>
      </View>
    </Page>
  );
}
