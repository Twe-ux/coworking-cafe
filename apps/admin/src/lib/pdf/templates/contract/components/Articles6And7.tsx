import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
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

      {/* Article 11 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>
          Article 11 - Caisse de retraite et prévoyance
        </Text>
        <Text style={styles.text}>
          Le Salarié bénéficiera du régime de retraite et de prévoyance du
          groupe AG2R auxquels la société a souscrit.
        </Text>
      </View>

      {/* Article 12 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 12 - Garanties</Text>
        <Text style={styles.text}>
          Le Salarié bénéficie de tous les droits et avantages reconnus aux
          Salariés à temps plein travaillant dans la Société, résultant du code
          du travail, de la convention collective ou des usages, dans les
          conditions définies par la convention collective.
        </Text>
        <Text style={styles.text}>
          Il lui est garanti un traitement équivalent aux autres Salariés de
          même qualification professionnelle et de même ancienneté, en ce qui
          concerne les possibilités de promotion, de déroulement de carrière,
          d'accès à la formation professionnelle.
        </Text>
      </View>
    </Page>
  );
}
