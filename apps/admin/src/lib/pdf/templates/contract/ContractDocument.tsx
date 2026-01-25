"use client";

/**
 * Contract PDF Document Template
 * Uses @react-pdf/renderer for PDF generation
 *
 * Structure: 6 pages
 * - Page 1: Header + Company/Employee info
 * - Page 2: Article 1 (Trial period)
 * - Page 3: Articles 2-3 (Functions + Location)
 * - Page 4: Articles 4-5 (Hours + Schedule tables)
 * - Page 5: Articles 6-7 (Overtime + Salary)
 * - Page 6: Articles 8-10 + Signatures
 */

import type { Employee } from "@/types/hr";
import { Document as PDFDocument, Page, Text, View } from "@react-pdf/renderer";
import { PDFTable } from "./components/PDFTable";
import { styles } from "./styles";

interface ContractDocumentProps {
  employee: Employee;
  monthlySalary: string;
  monthlyHours: string;
}

export default function ContractDocument({
  employee,
  monthlySalary,
  monthlyHours,
}: ContractDocumentProps) {
  // Helper: Check if full-time
  const isFullTime = employee.contractualHours >= 35;

  // Helper: Format date
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Employee data
  const birthDate = formatDate(employee.dateOfBirth);
  const hireDate = formatDate(employee.hireDate);
  const dpaeDate = formatDate(employee.onboardingStatus?.dpaeCompletedAt);

  // Place of birth formatting
  const placeOfBirth = employee.placeOfBirth
    ? typeof employee.placeOfBirth === "string"
      ? employee.placeOfBirth
      : `${employee.placeOfBirth.city || ""}${
          employee.placeOfBirth.department
            ? ` (${employee.placeOfBirth.department})`
            : ""
        }${employee.placeOfBirth.country ? ` ${employee.placeOfBirth.country}` : ""}`
    : "";

  // Helper: Render availability table
  function renderAvailabilityTable() {
    if (!employee.availability) return null;

    const availability = employee.availability;
    const days = [
      { key: "monday", label: "Lundi" },
      { key: "tuesday", label: "Mardi" },
      { key: "wednesday", label: "Mercredi" },
      { key: "thursday", label: "Jeudi" },
      { key: "friday", label: "Vendredi" },
      { key: "saturday", label: "Samedi" },
      { key: "sunday", label: "Dimanche" },
    ];

    return (
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>Jour</Text>
          <Text style={[styles.tableCellHeader, { width: "30%" }]}></Text>
          <Text style={[styles.tableCellHeader, { width: "30%" }]}></Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>Total</Text>
        </View>

        {/* Days */}
        {days.map((day, index) => {
          const schedule = availability[day.key as keyof typeof availability];
          const isAvailable = schedule?.available ?? false;
          const isLast = index === days.length - 1;

          // Calculate total hours
          let totalHours = "";
          if (isAvailable && schedule?.slots) {
            const slot1 = schedule.slots[0];
            const slot2 = schedule.slots[1];

            const calc = (start: string, end: string) => {
              const [sh, sm] = start.split(":").map(Number);
              const [eh, em] = end.split(":").map(Number);
              return (eh * 60 + em - (sh * 60 + sm)) / 60;
            };

            let hours = 0;
            if (slot1?.start && slot1?.end)
              hours += calc(slot1.start, slot1.end);
            if (slot2?.start && slot2?.end)
              hours += calc(slot2.start, slot2.end);

            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            totalHours =
              m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
          }

          return (
            <View
              key={day.key}
              style={isLast ? styles.tableRowLast : styles.tableRow}
            >
              <View
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "20%" },
                ]}
              >
                <Text>{day.label}</Text>
              </View>
              <View style={[styles.tableCell, { width: "30%" }]}>
                <Text>
                  {isAvailable && schedule?.slots?.[0]
                    ? `${schedule.slots[0].start} - ${schedule.slots[0].end}`
                    : ""}
                </Text>
              </View>
              <View style={[styles.tableCell, { width: "30%" }]}>
                <Text>
                  {isAvailable && schedule?.slots?.[1]
                    ? `${schedule.slots[1].start} - ${schedule.slots[1].end}`
                    : ""}
                </Text>
              </View>
              <View style={[styles.tableCellLast, { width: "20%" }]}>
                <Text>{totalHours}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Helper: Render distribution table
  function renderDistributionTable() {
    if (!employee.workSchedule?.weeklyDistributionData) return null;

    const distribution = employee.workSchedule.weeklyDistributionData;
    const days = [
      { key: "monday", label: "Lundi" },
      { key: "tuesday", label: "Mardi" },
      { key: "wednesday", label: "Mercredi" },
      { key: "thursday", label: "Jeudi" },
      { key: "friday", label: "Vendredi" },
      { key: "saturday", label: "Samedi" },
      { key: "sunday", label: "Dimanche" },
    ];

    const weeks = ["week1", "week2", "week3", "week4"] as const;

    return (
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>Jour</Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>
            Semaine 1
          </Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>
            Semaine 2
          </Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>
            Semaine 3
          </Text>
          <Text style={[styles.tableCellHeader, { width: "20%" }]}>
            Semaine 4
          </Text>
        </View>

        {/* Days */}
        {days.map((day, dayIndex) => {
          const isLast = dayIndex === days.length - 1;
          return (
            <View
              key={day.key}
              style={isLast ? styles.tableRowLast : styles.tableRow}
            >
              <View
                style={[
                  styles.tableCellLeft,
                  styles.tableCellBold,
                  { width: "20%" },
                ]}
              >
                <Text>{day.label}</Text>
              </View>
              {weeks.map((week) => {
                const hours =
                  distribution[week]?.[
                    day.key as keyof typeof distribution.week1
                  ];
                const displayValue =
                  hours === "0" || hours === "0h" || !hours ? "Repos" : hours;
                return (
                  <View
                    key={week}
                    style={[styles.tableCellLast, { width: "20%" }]}
                  >
                    <Text>{displayValue}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Total row */}
        <View style={[styles.tableRowLast, styles.tableHeader]}>
          <View
            style={[
              styles.tableCellLeft,
              styles.tableCellBold,
              { width: "20%" },
            ]}
          >
            <Text>Total</Text>
          </View>
          {weeks.map((week) => {
            const weekData = distribution[week];
            let total = 0;
            if (weekData) {
              Object.values(weekData).forEach((val) => {
                if (typeof val === "number") total += val;
                else if (typeof val === "string") {
                  const match = val.match(/(\d+)h?(\d*)/);
                  if (match) {
                    total +=
                      parseInt(match[1]) +
                      (match[2] ? parseInt(match[2]) / 60 : 0);
                  }
                }
              });
            }
            const h = Math.floor(total);
            const m = Math.round((total - h) * 60);
            const displayTotal =
              m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;

            return (
              <View key={week} style={[styles.tableCellLast, { width: "20%" }]}>
                <Text style={styles.textBold}>{displayTotal}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <PDFDocument>
      {/* ==================== PAGE 1 : EN-TÊTE + IDENTIFICATION ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.title}>
          CONTRAT DE TRAVAIL MENSUEL A TEMPS{" "}
          {isFullTime ? "COMPLET" : "PARTIEL"}
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
                    <Text>Immatriculée a l'URSSAF de</Text>
                    <Text>Numéro d'immatriculation</Text>
                  </>
                ),
                value: (
                  <>
                    <Text>D'ALSACE (427)</Text>
                    <Text>n 829 552 264 000 22</Text>
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
                value: employee.socialSecurityNumber || "",
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

      {/* ==================== PAGE 2 ================================= */}
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

          {/* Small Table */}
          <View style={[styles.table, { width: "60%" }]}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellLeft, { width: "50%" }]}>
                En qualité de
              </Text>
              <Text
                style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}
              >
                Equipier polyvalent
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellLeft, { width: "50%" }]}>
                Niveau
              </Text>
              <Text
                style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}
              >
                {employee.level ?? ""}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellLeft, { width: "50%" }]}>
                Echelon
              </Text>
              <Text
                style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}
              >
                {employee.step ?? ""}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellLeft, { width: "50%" }]}>
                Date d'entree
              </Text>
              <Text
                style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}
              >
                {hireDate}
              </Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={[styles.tableCellLeft, { width: "50%" }]}>
                Heure
              </Text>
              <Text
                style={[styles.tableCellLast, { textAlign: "left", flex: 1 }]}
              >
                {employee.hireTime ?? "9H30"}
              </Text>
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
            de travail en respectant les délais de prévenance minimaux prévus
            par les dispositions légales et conventionnelles.
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

      {/* ==================== PAGE 3 ================================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.text}>
            Les attributions du Salarié sont évolutives et pourront faire
            l'objet de modifications, de précisions ou de compléments,
            temporaires ou définitifs, sans que cela puisse être considéré comme
            une modification du contrat de travail.
          </Text>

          <Text style={styles.text}>
            Afin de permettre au Salarié d'appréhender au mieux le contenu de
            ses futures fonctions et les spécificités liées à la nature de notre
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

        {/* Article 4 */}
        <View style={styles.section}>
          <Text style={styles.articleTitle}>
            Article 4 - Durée mensuelle du travail
          </Text>

          <Text style={styles.text}>
            Le présent contrat de travail est conclu pour une durée mensuelle du
            travail de{" "}
            <Text style={styles.textBold}>{monthlyHours} heures</Text>.
          </Text>

          <Text style={styles.text}>
            Conformément aux dispositions conventionnelles applicables, il est
            expressément convenu que la durée du travail du Salarié, notifiée
            dans les conditions énoncées a l'article 5 du présent contrat, sera
            programmée dans les plages de planification possible définies
            ci-après :
          </Text>

          <Text style={[styles.text, { marginBottom: 30 }]}>
            La durée mensuelle de travail a été divisée par 4,33 semaines en
            moyenne par mois pour obtenir la référence horaire hebdomadaire
            servant à définir le volant des plages de planification possible.
          </Text>

          {/* Availability Table */}
          {renderAvailabilityTable()}
        </View>
      </Page>

      {/* ==================== PAGE 4 ================================= */}
      <Page size="A4" style={styles.page}>
        {/* Article 5 */}
        <View style={styles.section}>
          <Text style={styles.articleTitle}>
            Article 5 - Répartition de la durée du travail
          </Text>

          <Text style={[styles.text, { marginBottom: 30 }]}>
            La répartition des heures sur les semaines du mois est indiquée
            ci-après. Cette répartition est effectuée dans le respect des plages
            de planification possible visées a l'article 4.
          </Text>

          {/* Distribution Table */}
          {renderDistributionTable()}

          <Text style={styles.text}>
            En ce qui concerne les jours de repos hebdomadaires, il a été
            convenu en accord avec le Salarie et conformément aux dispositions
            conventionnelles que les 2 jours de repos hebdomadaires sont fixés
            contractuellement dans le tableau de répartition ci-dessus.
          </Text>
        </View>

        {/* Article 6 */}
        <View style={styles.section}>
          <Text style={styles.articleTitle}>
            Article 6 - Heures complémentaires
          </Text>

          <Text style={styles.text}>
            Il est convenu qu'en fonction des besoins de l'entreprise, le
            Salarié pourra être amené à effectuer des heures complémentaires,
            dans la limite du tiers de la durée initiale du contrat par semaine.
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
        </View>

        {/* Article 7 */}
        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 7 - Rémunération</Text>

          <Text style={styles.text}>
            Le Salarié percevra une rémunération mensualisée brute de{" "}
            <Text style={styles.textBold}>{monthlySalary} EUR</Text>{" "}
            correspondant à sa durée de travail mensuelle de{" "}
            <Text style={styles.textBold}>{monthlyHours} heures</Text> sur la
            base d'un taux horaire brut de{" "}
            <Text style={styles.textBold}>
              {(employee.hourlyRate || 0).toFixed(2)} EUR
            </Text>
          </Text>

          <Text style={styles.text}>
            Sur cette rémunération seront prélevées les cotisations sociales et
            notamment celles afférentes au régime de protection sociale en
            vigueur dans la société à la date de versement.
          </Text>
        </View>
      </Page>

      {/* ==================== PAGE 5 ================================= */}
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
            Le Salarie bénéficiera des congés payés conformément aux
            dispositions légales et conventionnelles en vigueur.
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
            {/* <View style={styles.signatureLine} /> */}
            {/* <Text style={styles.signatureText}>
              Signature précédée de la mention « Lu et approuvé »
            </Text> */}
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Pour le Salarié</Text>
            <Text style={styles.signatureName}>
              {employee.firstName} {employee.lastName}
            </Text>
            {/* <View style={styles.signatureLine} /> */}
            <Text style={styles.signatureText}>
              Signature précédée de la mention{"\n"}
              {<Text style={styles.textBold}>« Lu et approuvé »</Text>}
            </Text>
          </View>
        </View>
      </Page>
    </PDFDocument>
  );
}
