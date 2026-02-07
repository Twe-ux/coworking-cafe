import { Page, Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";

interface FinalArticlesAndSignaturesProps {
  employee: Employee;
}

export function FinalArticlesAndSignatures({
  employee,
}: FinalArticlesAndSignaturesProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Article 8 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 8 - Cumul d'emplois</Text>

        <Text style={styles.text}>
          Le Salarie s'engage a porter à la connaissance de l'Employeur tout
          autre emploi a temps partiel qu'il pourrait occuper.
        </Text>
      </View>

      {/* Article 9 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 9 - Congés payés</Text>

        <Text style={styles.text}>
          Le Salarie bénéficiera des congés payés conformément aux dispositions
          légales et conventionnelles en vigueur.
        </Text>
      </View>

      {/* Article 10 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>
          Article 10 - Absence et maladie
        </Text>

        <Text style={styles.text}>
          Toute absence doit être portée à la connaissance de la Direction par
          tous moyens et dans les plus brefs délais.
        </Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Pour l'Employeur</Text>
          <Text style={styles.signatureName}>MILONE Thierry</Text>
          <Text style={styles.signatureText}>Gérant</Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Pour le Salarié</Text>
          <Text style={styles.signatureName}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.signatureText}>
            Signature précédée de la mention{"\n"}
            {<Text style={styles.textBold}>« Lu et approuvé »</Text>}
          </Text>
        </View>
      </View>
    </Page>
  );
}
