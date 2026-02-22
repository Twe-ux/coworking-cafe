import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

interface Articles6To10Props {
  employee: Employee;
  monthlySalary: string;
  monthlyHours: string;
}

export function Articles6To10({
  employee,
  monthlySalary,
  monthlyHours,
}: Articles6To10Props) {
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

        <Text style={styles.text}>
          En contrepartie, le Salarié a droit à une période minimale de travail
          continue de 2 heures par jour.
        </Text>
        <Text style={styles.text}>
          En tout état de cause, les heures complémentaires ne pourront avoir
          pour effet de porter la durée du contrat au niveau de la durée légale
          ou conventionnelle de travail.
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
      {/* Article 8 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 8 - Cumul d'emplois</Text>

        <Text style={styles.text}>
          Le Salarié s’engage à porter à la connaissance de l’Employeur tout
          autre emploi à temps partiel qu’il pourrait occuper. Le Salarié
          communiquera notamment le nombre d’heures effectuées chez cet autre
          employeur qui en aucun cas ne pourra le conduire à effectuer un temps
          de travail effectif, tous emplois confondus, qui excède les limites
          fixées par la loi (10h par jour, 48 h par semaine, 44 h en moyenne sur
          12 semaines).
        </Text>
      </View>

      {/* Article 9 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 9 - Congés payés</Text>

        <Text style={styles.text}>
          Le Salarié bénéficiera des congés payés conformément aux dispositions
          légales et conventionnelles en vigueur dont l’époque sera déterminée
          par accord des parties ou, à défaut, en fonction des nécessités du
          service.
        </Text>
      </View>
      {/* Article 10 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 10 - Absence et maladie</Text>

        <Text style={styles.text}>
          Toute absence doit être portée à la connaissance de la Direction par
          tous moyens et dans les plus brefs délais. Les absences pour maladie
          ou accident devront être confirmées par l’envoi, dans les 48 heures à
          compter du premier jour d’indisponibilité, d’un arrêt de travail. En
          cas de prolongation d’arrêt de travail, Le Salarié devra transmettre
          dans les mêmes délais le certificat médical justifiant cette
          prolongation.
        </Text>
      </View>
    </Page>
  );
}
