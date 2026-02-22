import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

interface Articles11To13Props {
  employee: Employee;
}

export function Articles11To13({
  employee,
}: Articles11To13Props) {
  return (
    <Page size="A4" style={styles.page}>
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
        <Text style={styles.text}>
          Le Salarié pourra être reçu par un membre de la Direction afin
          d'examiner les problèmes qui pourraient se poser dans l'application de
          cette égalité de traitement.
        </Text>
        <Text style={styles.text}>
          Conformément aux dispositions de la convention collective applicable,
          le Salarié bénéficie d'une priorité d'affectation aux emplois à temps
          complet ressortissant de sa qualification professionnelle ou d’un
          emploi équivalent qui serait créé ou qui deviendrait vacant. Cette
          priorité est attribuée compte tenu des aptitudes de l’intéressé. La
          liste de ces emplois sera portée à la connaissance du Salarié dès lors
          qu’il aura manifesté l’intention d’occuper un emploi à temps complet.
        </Text>
        <Text style={styles.text}>
          Au cas où le Salarié ferait acte de candidature à un emploi à temps
          complet, sa demande serait examinée et une réponse motivée lui serait
          faite dans un délai maximum de huit jours. Si une suite favorable
          était accordée à cette demande, le présent contrat ferait l’objet d’un
          avenant.
        </Text>
      </View>

      {/* Article 13 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>
          Article 13 - Déclarations diverses
        </Text>
        <Text style={styles.text}>
          Le Salarié déclare être informé du fait que CoworKing Café dispose de
          caméras de surveillance et qu’il sera ainsi filmé durant ses horaires
          de travail.
        </Text>
        <Text style={styles.text}>
          Le Salarié déclare formellement que toutes les informations fournies
          sur sa formation et son expérience professionnelle sont parfaitement
          exactes.
        </Text>
        <Text style={styles.text}>
          Le Salarié s’engage à faire connaître, sans délai, tout changement qui
          interviendrait dans les situations qu’il a signalées lors de son
          embauche (adresse, situation de famille, statut, …).
        </Text>
        <Text style={styles.text}>
          Pour les dispositions non prévues au présent contrat, les Parties se
          référeront aux dispositions légales et conventionnelles en vigueur
          applicables à la Société avec application notamment, et à titre
          d’information, de la Convention Collective Nationale des Hôtels,
          Cafés, Restaurants.
        </Text>
        <Text style={styles.text}>
          La déclaration préalable à l’embauche du Salarié a été effectuée
          auprès de l’URSSAF à laquelle l’employeur est affilié.
        </Text>
        <Text style={styles.text}>
          Le Salarié pourra exercer auprès de cet organisme son droit d’accès et
          de rectification que la loi du 6 janvier 1978 lui confère.
        </Text>
      </View>
    </Page>
  );
}
