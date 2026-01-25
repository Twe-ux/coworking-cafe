/**
 * Contract articles 1-3
 * Engagement, functions, and workplace
 */

import type { Employee } from "../types";
import { TABLE_STYLES } from "../constants";
import { ArticleSection } from "./ArticleSection";

interface ArticleEmployeeProps {
  employee: Employee;
}

interface Article1Props extends ArticleEmployeeProps {
  contractTypeLabel: string;
}

// Article 1 - Engagement et période d'essai
export function Article1({ employee, contractTypeLabel }: Article1Props) {
  // Format DPAE date with error handling
  let dpaeDate = "[DATE DPAE]";
  try {
    if (employee.onboardingStatus?.dpaeCompletedAt) {
      const date =
        typeof employee.onboardingStatus.dpaeCompletedAt === "string"
          ? new Date(employee.onboardingStatus.dpaeCompletedAt)
          : employee.onboardingStatus.dpaeCompletedAt;
      dpaeDate = date.toLocaleDateString("fr-FR");
    }
  } catch (error) {
    console.error("Error formatting DPAE date:", error);
  }

  // Format hire date with error handling
  let hireDate = "";
  try {
    if (employee.hireDate) {
      const date =
        typeof employee.hireDate === "string"
          ? new Date(employee.hireDate)
          : employee.hireDate;
      hireDate = date.toLocaleDateString("fr-FR");
    }
  } catch (error) {
    console.error("Error formatting hire date:", error);
  }

  return (
    <div style={{ pageBreakBefore: "always" }}>
      <ArticleSection title="Article 1 - Engagement et période d'essai">
        <p style={{ marginBottom: "12px" }}>
          La déclaration préalable à l&apos;embauche a été adressée à
          l&apos;URSSAF d&apos;Alsace (427), le <strong>{dpaeDate}</strong>
          <br />
          Le Salarié est engagé pour une durée indéterminée et a temps{" "}
          {contractTypeLabel} :
        </p>

        <table
          style={{ ...TABLE_STYLES.table, width: "60%", marginBottom: "15px" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  ...TABLE_STYLES.cell,
                  width: "50%",
                  textAlign: "left",
                }}
              >
                En qualité de
              </td>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                Equipier polyvalent
              </td>
            </tr>
            <tr>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                Niveau
              </td>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                {employee.level ?? ""}
              </td>
            </tr>
            <tr>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                Echelon
              </td>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                {employee.step ?? ""}
              </td>
            </tr>
            <tr>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                Date d&apos;entree
              </td>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                {hireDate}
              </td>
            </tr>
            <tr>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>Heure</td>
              <td style={{ ...TABLE_STYLES.cell, textAlign: "left" }}>
                {employee.hireTime ?? "9H30"}
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginBottom: "10px" }}>
          Il ne deviendra définitif qu&apos;à l&apos;expiration d&apos;une
          période d&apos;essai de <strong>deux mois</strong>.
        </p>
        <p style={{ marginBottom: "10px" }}>
          La période d&apos;essai pourra être renouvelée d&apos;une période au
          maximum égale a <strong>deux mois</strong>.
        </p>
        <p style={{ marginBottom: "10px" }}>
          Le renouvellement de la période d&apos;essai devra être formalisé par
          un accord écrit, signé des deux parties, au moins trois jours
          ouvrables avant la fin de la période d&apos;essai initiale.
        </p>
        <p style={{ marginBottom: "10px" }}>
          Pendant la période d&apos;essai, les parties pourront résilier le
          contrat de travail en respectant les délais de prévenance minimaux
          prévus par les dispositions légales et conventionnelles.
        </p>
        <p style={{ marginBottom: "10px" }}>
          Toute suspension qui se produirait pendant la période d&apos;essai
          (maladie, congés...) prolongerait d&apos;autant la durée de cette
          période qui doit correspondre a un travail effectif.
        </p>
        <p>
          Le Salarié déclare n&apos;être lié a aucune autre entreprise et avoir
          quitté son précédent employeur libre de tout engagement. Dans le cas
          contraire, les dispositions prévues à l&apos;article 8
          s&apos;appliquent.
        </p>
      </ArticleSection>
    </div>
  );
}

// Article 2 - Fonctions
export function Article2() {
  return (
    <ArticleSection title="Article 2 - Fonctions">
      <p style={{ marginBottom: "10px" }}>
        Le Salarié exercera les fonctions d&apos;employé polyvalent et sera a ce
        titre, notamment en charge des taches suivantes :
      </p>
      <ul
        style={{ marginLeft: "30px", marginBottom: "10px", lineHeight: "1.6" }}
      >
        <li>Accueillir, servir et être à l&apos;écoute des clients ;</li>
        <li>
          Promouvoir la Société auprès des clients en expliquant le concept du
          Coworking Cafe ;
        </li>
        <li>
          Preparer et servir les boissons et la nourriture proposes dans
          l&apos;établissement, dans le respect des règles d&apos;hygiene ;
        </li>
        <li>
          Veiller à la propreté et au parfait état des locaux et du mobilier
          s&apos;y trouvant ;
        </li>
        <li>
          Procéder à l&apos;encaissement des clients et assurer la sécurité de
          la caisse dans le respect des consignés spécifiques relatifs aux flux
          financiers ;
        </li>
        <li>
          D&apos;une manière generale, faire son mieux pour assurer un haut
          niveau de qualité de service auprès des clients et assurer le bon
          fonctionnement de l&apos;établissement.
        </li>
      </ul>
      <p>
        Les attributions du Salarié sont évolutives et pourront faire
        l&apos;objet de modifications, de précisions ou de compléments,
        temporaires ou définitifs, sans que cela puisse être considéré comme une
        modification du contrat de travail.
      </p>
      <p style={{ marginTop: "12px" }}>
        Afin de permettre au Salarié d&apos;appréhender au mieux le contenu de
        ses futures fonctions et les spécificités liées à la nature de notre
        activité, le Salarié bénéficiera d&apos;une formation continue.
      </p>
    </ArticleSection>
  );
}

// Article 3 - Lieu de travail
export function Article3() {
  return (
    <div style={{ pageBreakBefore: "always" }}>
      <ArticleSection title="Article 3 - Lieu de travail">
      <p>
        Le Salarié exercera ses fonctions au sein de l&apos;établissement situe{" "}
        <strong>1 rue de la Division Leclerc 67000 Strasbourg</strong>.
        Toutefois, il pourra être affecté de manière temporaire à un autre
        établissement de la même enseigne.
      </p>
    </ArticleSection>
    </div>
  );
}
