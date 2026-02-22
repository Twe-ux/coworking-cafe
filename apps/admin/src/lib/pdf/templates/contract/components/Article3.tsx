import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import { AvailabilityTable } from "./AvailabilityTable";

interface Article4And5Props {
  employee: Employee;
  monthlyHours: string;
}

export function Article3({ employee, monthlyHours }: Article4And5Props) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>
          Les attributions du Salarié sont évolutives et pourront faire l'objet
          de modifications, de précisions ou de compléments, temporaires ou
          définitifs, sans que cela puisse être considéré comme une modification
          du contrat de travail.
        </Text>

        <Text style={styles.text}>
          Afin de permettre au Salarié d'appréhender au mieux le contenu de ses
          futures fonctions et les spécificités liées à la nature de notre
          activité, le Salarié bénéficiera d'une formation continue.
        </Text>

        <Text style={styles.text}>
          La participation du Salarié à cette formation est obligatoire et
          pourra s’exercer dans une société tierce auprès de laquelle il pourra
          à cet effet être détaché pour la durée de la formation, ce que le
          Salarié accepte expressément par avance.
        </Text>

        <Text style={styles.text}>
          De telles périodes ou formations pourront se renouveler en cours de
          contrat.
        </Text>
      </View>
      <View style={styles.section}>
        {/* Article 3 */}
        <Text style={styles.articleTitle}>Article 3 - Lieu de travail</Text>

        <Text style={styles.text}>
          Le Salarié exercera ses fonctions au sein de l'établissement situe{" "}
          <Text style={styles.textBold}>
            1 rue de la Division Leclerc 67000 Strasbourg
          </Text>
          . Toutefois, il pourra être affecté de manière temporaire à un autre
          établissement de la même enseigne. A cet effet, si la conclusion du
          présent contrat s’effectue dans le cadre de l’ouverture d’un nouveau
          restaurant, le Salarié se verra proposer un avenant de détachement lié
          à la réalisation de sa formation.
        </Text>

        <Text style={styles.articleTitle}>
          Article 4 - Durée mensuelle du travail
        </Text>

        <Text style={styles.text}>
          Le présent contrat de travail est conclu pour une durée mensuelle du
          travail de <Text style={styles.textBold}>{monthlyHours} heures</Text>.
        </Text>

        <Text style={styles.text}>
          Conformément aux dispositions conventionnelles applicables, il est
          expressément convenu que la durée du travail du Salarié, notifiée dans
          les conditions énoncées a l'article 5 du présent contrat, sera
          programmée dans les plages de planification possible définies ci-après
          :
        </Text>

        <Text style={[styles.text, { marginBottom: 20 }]}>
          La durée mensuelle de travail a été divisée par 4,33 semaines en
          moyenne par mois pour obtenir la référence horaire hebdomadaire
          servant à définir le volant des plages de planification possible.
        </Text>

        {/* Availability Table */}
        <AvailabilityTable availability={employee.availability} />

        <Text style={styles.text}>
          Toutefois, pendant une période de trois mois suivant la conclusion du
          présent contrat et avec l'accord du Salarié, celui-ci pourra voir ses
          horaires programmés en dehors de ses plages de planification dans la
          perspective notamment d'assurer sa formation aux diverses tâches
          requises au sein de l'établissement.
        </Text>
      </View>
    </Page>
  );
}
