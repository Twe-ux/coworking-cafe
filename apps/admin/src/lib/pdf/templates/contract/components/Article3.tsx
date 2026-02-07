import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

export function Article3() {
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

        {/* Article 3 */}
        <Text style={styles.articleTitle}>Article 3 - Lieu de travail</Text>

        <Text style={styles.text}>
          Le Salarié exercera ses fonctions au sein de l'établissement situe{" "}
          <Text style={styles.textBold}>
            1 rue de la Division Leclerc 67000 Strasbourg
          </Text>
          . Toutefois, il pourra être affecté de manière temporaire à un autre
          établissement de la même enseigne.
        </Text>
      </View>
    </Page>
  );
}
