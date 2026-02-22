import type { Employee } from "@/types/hr";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

interface Article14AndSignaturesProps {
  employee: Employee;
}

export function Article14AndSignatures({
  employee,
}: Article14AndSignaturesProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Article 14 */}
      <View style={styles.section}>
        <Text style={styles.articleTitle}>Article 14 - Résiliation</Text>
        <Text style={styles.text}>
          A l'issue de la période d'essai, chacune des parties pourra rompre le
          présent contrat sous réserve de respecter le préavis prévu par les
          dispositions légales et conventionnelles en vigueur, hormis hypothèse
          de licenciement pour faute grave, lourde ou événement de force
          majeure.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Fait en deux exemplaires originaux dont chaque partie reconnaît avoir
          reçu le sien.
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
            {<Text style={styles.textBold}>« Lu et approuvé »</Text>}
          </Text>
        </View>
      </View>
    </Page>
  );
}
