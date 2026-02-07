import { Page, Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { PDFTable } from "../components/PDFTable";
import { styles } from "../styles";

interface ContractHeaderProps {
  employee: Employee;
  isFullTime: boolean;
  birthDate: string;
  hireDate: string;
  dpaeDate: string;
  formattedSSN: string;
  placeOfBirth: string;
}

export function ContractHeader({
  employee,
  isFullTime,
  birthDate,
  hireDate,
  dpaeDate,
  formattedSSN,
  placeOfBirth,
}: ContractHeaderProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.title}>
        CONTRAT DE TRAVAIL MENSUEL A TEMPS {isFullTime ? "COMPLET" : "PARTIEL"}
        {"\n"}A DUREE INDETERMINEE
      </Text>
      <Text style={styles.subtitle}>
        Durée du travail répartie sur les semaines du mois
      </Text>

      {/* Parties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entre les soussignés</Text>

        {/* Employer Table */}
        <PDFTable
          rows={[
            { label: "Société (raison sociale)", value: "ILY SARL" },
            {
              label: "Adresse",
              value: (
                <>
                  <Text>1 RUE DE LA DIVISION LECLERC</Text>
                  <Text>67000 STRASBOURG</Text>
                </>
              ),
            },
            {
              label: (
                <>
                  <Text>Représentée par</Text>
                  <Text>Agissant en qualité de</Text>
                </>
              ),
              value: (
                <>
                  <Text>MILONE Thierry</Text>
                  <Text>Gérant</Text>
                </>
              ),
            },
            { label: "Code NAF", value: "5630 Z" },
            {
              label: (
                <>
                  <Text>Immatriculée a l'URSSAF</Text>
                  <Text>Numéro d'immatriculation</Text>
                </>
              ),
              value: (
                <>
                  <Text>D'ALSACE (427)</Text>
                  <Text>829 552 264 000 22</Text>
                </>
              ),
            },
          ]}
        />
        <Text style={styles.labelText}>Ci-après l'Employeur</Text>

        {/* Employee Table */}
        <PDFTable
          rows={[
            {
              label: (
                <>
                  <Text>Nom</Text>
                  <Text>Prénom(s)</Text>
                </>
              ),
              value: (
                <>
                  <Text>{employee.lastName || ""}</Text>
                  <Text>{employee.firstName || ""}</Text>
                </>
              ),
            },
            {
              label: (
                <>
                  <Text>Date de naissance</Text>
                  <Text>Lieu de naissance</Text>
                </>
              ),
              value: (
                <>
                  <Text>{birthDate}</Text>
                  <Text>{placeOfBirth}</Text>
                </>
              ),
            },
            {
              label: "Numéro de sécurité sociale",
              value: formattedSSN || "",
            },
            {
              label: "Adresse du domicile",
              value: employee.address?.street || "",
            },
            {
              label: (
                <>
                  <Text>Code postal</Text>
                  <Text>Ville</Text>
                </>
              ),
              value: (
                <>
                  <Text>{employee.address?.postalCode || ""}</Text>
                  <Text>{employee.address?.city || ""}</Text>
                </>
              ),
            },
            {
              label: "Nationalité",
              value: employee.nationality || "FRANÇAISE",
            },
            {
              label: (
                <>
                  <Text>N° Titre de séjour - travail</Text>
                  <Text>Date d'expiration</Text>
                </>
              ),
              value: "",
            },
          ]}
        />
        <Text style={styles.labelText}>Ci-après le Salarié</Text>

        {/* Introduction */}
        <Text style={styles.text}>
          Le présent contrat est conclu à durée indéterminée à temps{" "}
          {isFullTime ? "complet" : "partiel"}. Il est régi par les
          dispositions générales de la{" "}
          <Text style={styles.textBold}>
            Convention Collective Nationale des Hotels, Cafés, Restaurants
          </Text>{" "}
          du 30 avril 1997, dont le Salarie reconnaît avoir pris connaissance
          et les conditions particulières ci-après :
        </Text>
      </View>
    </Page>
  );
}
