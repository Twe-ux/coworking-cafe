import { Page, Text, View } from "@react-pdf/renderer";
import type { Employee } from "@/types/hr";
import { styles } from "../styles";

interface Article1Props {
  employee: Employee;
  isFullTime: boolean;
  dpaeDate: string;
  hireDate: string;
}

export function Article1({ employee, isFullTime, dpaeDate, hireDate }: Article1Props) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        {/* Article 1 */}
        <Text style={styles.articleTitle}>
          Article 1 - Engagement et période d'essai
        </Text>

        <Text style={styles.text}>
          La déclaration préalable à l'embauche a été adressée à l'URSSAF
          d'Alsace (427), le{" "}
          <Text style={styles.textBold}>{dpaeDate || "[DATE DPAE]"}</Text>
        </Text>

        <Text style={styles.text}>
          Le Salarié est engagé pour une durée indéterminée et a temps{" "}
          {isFullTime ? "complet" : "partiel"} :
        </Text>

        {/* Table Article 1 - Style moderne et centré */}
        <View style={{ alignItems: "center", marginTop: 15, marginBottom: 15 }}>
          <View
            style={[
              styles.table,
              {
                width: "60%",
                border: "1pt solid #cbd5e1",
                borderRadius: 4,
              },
            ]}
          >
            <View style={[styles.tableRow, { borderTop: "none" }]}>
              <Text
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "50%" },
                ]}
              >
                En qualité de
              </Text>
              <Text style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}>
                Equipier polyvalent
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "50%" },
                ]}
              >
                Niveau
              </Text>
              <Text style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}>
                {employee.level ?? ""}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "50%" },
                ]}
              >
                Echelon
              </Text>
              <Text style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}>
                {employee.step ?? ""}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "50%" },
                ]}
              >
                Date d'entree
              </Text>
              <Text style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}>
                {hireDate}
              </Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "50%" },
                ]}
              >
                Heure
              </Text>
              <Text style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}>
                {employee.hireTime ?? "9H30"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.text}>
          Il ne deviendra définitif qu'à l'expiration d'une période d'essai de{" "}
          <Text style={styles.textBold}>deux mois</Text>.
        </Text>

        <Text style={styles.text}>
          La période d'essai pourra être renouvelée d'une période au maximum
          égale a <Text style={styles.textBold}>deux mois</Text>.
        </Text>

        <Text style={styles.text}>
          Le renouvellement de la période d'essai devra être formalisé par un
          accord écrit, signé des deux parties, au moins trois jours ouvrables
          avant la fin de la période d'essai initiale.
        </Text>

        <Text style={styles.text}>
          Pendant la période d'essai, les parties pourront résilier le contrat
          de travail en respectant les délais de prévenance minimaux prévus par
          les dispositions légales et conventionnelles.
        </Text>

        <Text style={styles.text}>
          Toute suspension qui se produirait pendant la période d'essai
          (maladie, congés...) prolongerait d'autant la durée de cette période
          qui doit correspondre a un travail effectif.
        </Text>

        <Text style={styles.text}>
          Le Salarié déclare n'être lié a aucune autre entreprise et avoir
          quitté son précédent employeur libre de tout engagement. Dans le cas
          contraire, les dispositions prévues à l'article 8 s'appliquent.
        </Text>
      </View>

      <View style={styles.section}>
        {/* Article 2 */}
        <Text style={styles.articleTitle}>Article 2 - Fonctions</Text>

        <Text style={styles.text}>
          Le Salarié exercera les fonctions d'employé polyvalent et sera a ce
          titre, notamment en charge des taches suivantes :
        </Text>

        <View style={styles.list}>
          {[
            "Accueillir, servir et être à l'écoute des clients ;",
            "Promouvoir la Société auprès des clients en expliquant le concept du Coworking Cafe ;",
            "Preparer et servir les boissons et la nourriture proposes dans l'établissement, dans le respect des règles d'hygiene ;",
            "Veiller à la propreté et au parfait état des locaux et du mobilier s'y trouvant ;",
            "Procéder à l'encaissement des clients et assurer la sécurité de la caisse dans le respect des consignés spécifiques relatifs aux flux financiers ;",
            "D'une manière generale, faire son mieux pour assurer un haut niveau de qualité de service auprès des clients et assurer le bon fonctionnement de l'établissement.",
          ].map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}
