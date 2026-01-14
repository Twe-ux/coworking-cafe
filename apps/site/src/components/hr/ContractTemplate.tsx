"use client";

import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface Employee {
  _id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;
  contractType: string;
  contractualHours: number;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  endContractReason?: string;
  level?: string;
  step?: number;
  hourlyRate?: number;
  monthlySalary?: number;
  clockingCode: string;
  employeeRole: string;
  isActive: boolean;
  onboardingStatus?: {
    contractGenerated: boolean;
    contractGeneratedAt?: Date;
    dpaeCompleted: boolean;
    dpaeCompletedAt?: Date;
    bankDetailsProvided: boolean;
    bankDetailsProvidedAt?: Date;
    contractSent: boolean;
    contractSentAt?: Date;
  };
}

interface ContractTemplateProps {
  show: boolean;
  onHide: () => void;
  employee: Employee;
  onValidate: () => void;
}

export default function ContractTemplate({
  show,
  onHide,
  employee,
  onValidate,
}: ContractTemplateProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  // Calcul du salaire mensuel brut
  const monthlySalary = employee.hourlyRate
    ? (employee.hourlyRate * employee.contractualHours * 4.33).toFixed(2)
    : "0.00";

  const handleGeneratePDF = async () => {
    if (!contractRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Contrat_CDI_${employee.lastName}_${employee.firstName}.pdf`);

      // Marquer le contrat comme généré
      onValidate();
      onHide();
    } catch (error) {
      alert("Erreur lors de la génération du PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen>
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon icon="ri:file-text-line" className="me-2" />
          Contrat de Travail - {employee.firstName} {employee.lastName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
      >
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Form.Check
            type="switch"
            id="edit-mode"
            label={isEditing ? "Mode édition activé" : "Mode lecture seule"}
            checked={isEditing}
            onChange={(e) => setIsEditing(e.target.checked)}
          />
          <small className="text-muted">
            {isEditing
              ? "Vous pouvez modifier le contrat avant de le générer"
              : "Prévisualisation finale"}
          </small>
        </div>

        <div
          ref={contractRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          style={{
            padding: "60px 250px",
            backgroundColor: "white",
            border: "1px solid #ddd",
            minHeight: "800px",
            fontFamily: "Arial, sans-serif",
            fontSize: "11pt",
            lineHeight: "1.5",
          }}
        >
          {/* Titre */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "13pt",
                fontWeight: "bold",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              CONTRAT DE TRAVAIL MENSUEL À TEMPS{" "}
              {employee.contractualHours >= 35 ? "COMPLET" : "PARTIEL"} À DURÉE
              INDÉTERMINÉE
            </h1>
            <p style={{ fontSize: "10pt", fontStyle: "italic", margin: 0 }}>
              Durée du travail répartie sur les semaines du mois
            </p>
          </div>

          {/* Entre les soussignés */}
          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              Entre les soussignés
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "15px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      width: "40%",
                      fontWeight: "bold",
                    }}
                  >
                    Société (raison sociale)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    CoworKing Café by Anticafé
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Adresse
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    1 RUE DE LA DIVISION LECLERC
                    <br />
                    67000 STRASBOURG
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Représentée par
                    <br />
                    Agissant en qualité de
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    MILONE Thierry
                    <br />
                    Gérant
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Code NAF
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    5630 Z
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Immatriculée à l'URSSAF de
                    <br />
                    Numéro d'immatriculation
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    D'ALSACE (427)
                    <br />
                    n° 829 552 264 000 22
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontStyle: "italic", marginBottom: "20px" }}>
              Ci-après l'Employeur
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "15px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      width: "40%",
                      fontWeight: "bold",
                    }}
                  >
                    Nom
                    <br />
                    Prénom(s)
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {employee.lastName}
                    <br />
                    {employee.firstName}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Date et lieu de naissance
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {new Date(employee.dateOfBirth).toLocaleDateString("fr-FR")}
                    <br />
                    {employee.placeOfBirth ?? ""}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Numéro de sécurité sociale
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {employee.socialSecurityNumber}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Adresse du domicile
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {employee.address?.street ?? ""}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Code postal
                    <br />
                    Ville
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {employee.address?.postalCode ?? ""}
                    <br />
                    {employee.address?.city ?? ""}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Nationalité
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    FRANÇAISE
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    N° Titre de séjour - travail
                    <br />
                    Date d'expiration
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}></td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontStyle: "italic", marginBottom: "20px" }}>
              Ci-après le Salarié
            </p>

            <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
              Le présent contrat est conclu à durée indéterminée à temps{" "}
              {employee.contractualHours >= 35 ? "complet" : "partiel"}. Il est
              régi par les dispositions générales de la{" "}
              <strong>
                Convention Collective Nationale des Hôtels, Cafés, Restaurants
              </strong>{" "}
              du 30 avril 1997, dont le Salarié reconnaît avoir pris
              connaissance et les conditions particulières ci-après :
            </p>
          </div>

          {/* Article 1 - Engagement et période d'essai */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 1 - Engagement et période d'essai
            </h4>
            <p style={{ marginBottom: "12px" }}>
              La déclaration préalable à l'embauche a été adressée à l'URSSAF
              d'Alsace (427), le <strong>[DATE DPAE]</strong>
              <br />
              Le Salarié est engagé pour une durée indéterminée et à temps{" "}
              {employee.contractualHours >= 35 ? "complet" : "partiel"} :
            </p>

            <table
              style={{
                width: "60%",
                borderCollapse: "collapse",
                marginBottom: "15px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      width: "50%",
                    }}
                  >
                    En qualité de
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    Équipier polyvalent
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    Niveau
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    {employee.level ?? ""}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    Echelon
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    {employee.step ?? ""}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    Date d'entrée
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    {new Date(employee.hireDate).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    Heure
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>
                    9H30
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginBottom: "10px" }}>
              Il ne deviendra définitif qu'à l'expiration d'une période d'essai
              de <strong>deux mois</strong>.
            </p>
            <p style={{ marginBottom: "10px" }}>
              La période d'essai pourra être renouvelée d'une période au maximum
              égale à <strong>deux mois</strong>.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Le renouvellement de la période d'essai devra être formalisé par
              un accord écrit, signé des deux parties, au moins trois jours
              ouvrables avant la fin de la période d'essai initiale.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Pendant la période d'essai, les parties pourront résilier le
              contrat de travail en respectant les délais de prévenance minimaux
              prévus par les dispositions légales et conventionnelles.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Toute suspension qui se produirait pendant la période d'essai
              (maladie, congés…) prolongerait d'autant la durée de cette période
              qui doit correspondre à un travail effectif.
            </p>
            <p>
              Le Salarié déclare n'être lié à aucune autre entreprise et avoir
              quitté son précédent employeur libre de tout engagement. Dans le
              cas contraire, les dispositions prévues à l'article 8
              s'appliquent.
            </p>
          </div>

          {/* Article 2 - Fonctions */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 2 - Fonctions
            </h4>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié exercera les fonctions d'employé polyvalent et sera à
              ce titre, notamment en charge des tâches suivantes :
            </p>
            <ul
              style={{
                marginLeft: "30px",
                marginBottom: "10px",
                lineHeight: "1.6",
              }}
            >
              <li>Accueillir, servir et être à l'écoute des clients ;</li>
              <li>
                Promouvoir la Société auprès des clients en expliquant le
                concept du CoworKing Café by Anticafé ;
              </li>
              <li>
                Préparer et servir les boissons et la nourriture proposés dans
                l'établissement, dans le respect des règles d'hygiène ;
              </li>
              <li>
                Veiller à la propreté et au parfait état des locaux et du
                mobilier s'y trouvant ;
              </li>
              <li>
                Procéder à l'encaissement des clients et assurer la sécurité de
                la caisse dans le respect des consignes spécifiques relatifs aux
                flux financiers ;
              </li>
              <li>
                D'une manière générale, faire son mieux pour assurer un haut
                niveau de qualité de service auprès des clients et assurer le
                bon fonctionnement de l'établissement.
              </li>
            </ul>
            <p>
              Les attributions du Salarié sont évolutives et pourront faire
              l'objet de modifications, de précisions ou de compléments,
              temporaires ou définitifs, sans que cela puisse être considéré
              comme une modification du contrat de travail.
            </p>
            <p style={{ marginTop: "12px" }}>
              Afin de permettre au Salarié d'appréhender au mieux le contenu de
              ses futures fonctions et les spécificités liées à la nature de
              notre activité, le Salarié bénéficiera d'une formation continue.
            </p>
            <p>
              La participation du Salarié à cette formation est obligatoire et
              pourra s'exercer dans une société tierce auprès de laquelle il
              pourra à cet effet être détaché pour la durée de la formation, ce
              que le Salarié accepte expressément par avance.
            </p>
            <p style={{ marginTop: "10px" }}>
              De telles périodes ou formations pourront se renouveler en cours
              de contrat.
            </p>
          </div>

          {/* Article 3 - Lieu de travail */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 3 - Lieu de travail
            </h4>
            <p>
              Le Salarié exercera ses fonctions au sein de l'établissement situé{" "}
              <strong>1 rue de la Division Leclerc 67000 Strasbourg</strong>.
              Toutefois, il pourra être affecté de manière temporaire à un autre
              établissement de la même enseigne. À cet effet, si la conclusion
              du présent contrat s'effectue dans le cadre de l'ouverture d'un
              nouveau restaurant, le Salarié se verra proposer un avenant de
              détachement lié à la réalisation de sa formation.
            </p>
          </div>

          {/* Article 4 - Durée mensuelle du travail */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 4 - Durée mensuelle du travail
            </h4>
            <p style={{ marginBottom: "12px" }}>
              Le présent contrat de travail est conclu pour une durée mensuelle
              du travail de{" "}
              <strong>
                {(employee.contractualHours * 4.33).toFixed(2)} heures
              </strong>
              .
            </p>
            <p style={{ marginBottom: "12px" }}>
              Conformément aux dispositions conventionnelles applicables, il est
              expressément convenu que la durée du travail du Salarié, notifiée
              dans les conditions énoncées à l'article 5 du présent contrat,
              sera programmée dans les plages de planification possible définies
              ci-après :
            </p>
            <p style={{ marginBottom: "10px", fontStyle: "italic" }}>
              La durée mensuelle de travail a été divisée par 4,33 semaines en
              moyenne par mois pour obtenir la référence horaire hebdomadaire
              servant à définir le volant des plages de planification possible.
            </p>
            <p style={{ marginBottom: "10px" }}>
              [Tableau des plages horaires à compléter selon les besoins]
            </p>
            <p>
              Toutefois, pendant une période de trois mois suivant la conclusion
              du présent contrat et avec l'accord du Salarié, celui-ci pourra
              voir ses horaires programmés en dehors de ses plages de
              planification dans la perspective notamment d'assurer sa formation
              aux diverses tâches requises au sein de l'établissement.
            </p>
          </div>

          {/* Article 5 - Répartition de la durée du travail */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 5 - Répartition de la durée du travail
            </h4>
            <p style={{ marginBottom: "12px" }}>
              La répartition des heures sur les semaines du mois est indiquée
              ci-après. Cette répartition est effectuée dans le respect des
              plages de planification possible visées à l'article 4.
            </p>
            <p style={{ marginBottom: "10px", fontStyle: "italic" }}>
              [Tableau de répartition hebdomadaire à compléter selon le
              planning]
            </p>
            <p style={{ marginBottom: "10px" }}>
              En ce qui concerne les jours de repos hebdomadaires, il a été
              convenu en accord avec le Salarié et conformément aux dispositions
              conventionnelles que :
            </p>
            <p style={{ marginBottom: "10px" }}>
              Les 2 jours de repos hebdomadaires sont fixés contractuellement
              dans le tableau de répartition ci-dessus et qu'ils peuvent faire
              l'objet d'un commun accord d'une modification éventuelle
              ultérieure conformément aux règles de planification en vigueur.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Par ailleurs, concernant cette répartition de la durée du travail,
              il est rappelé tout particulièrement et conformément aux
              dispositions conventionnelles en vigueur à la date du présent
              contrat de travail que :
            </p>
            <ul
              style={{
                marginLeft: "30px",
                marginBottom: "10px",
                lineHeight: "1.6",
              }}
            >
              <li>
                Les horaires sont notifiés au Salarié par affichage du programme
                de travail dans le respect des règles et délais de planification
                prévus conventionnellement à savoir 10 jours calendaires avant
                le début de la semaine concernée, modifiables au plus tard 3
                jours avant avec l'accord du Salarié.
              </li>
              <li>
                La modification de la répartition de la durée du travail, sur
                les semaines du mois ou sur les jours des dites semaines, est
                notifiée au Salarié dans les mêmes formes et délais.
              </li>
              <li>
                Cette modification de la répartition de la durée du travail et
                des horaires de travail est possible sous réserve :
                <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                  <li>
                    Qu'elle intervienne dans le cadre des plages de
                    planification possible précisées à l'article 4 du contrat et
                    qui en déterminent ainsi la variation possible
                  </li>
                  <li>
                    Qu'elle intervienne notamment dans les cas suivants :
                    variation d'activité, changement d'affectation d'équipe en
                    fonction des compétences requises par l'entreprise,
                    remplacement pour départ, absence ou maladie d'un Salarié,
                    accident du travail ou congés
                  </li>
                </ul>
              </li>
              <li>
                Chaque journée de travail ne pourra comporter qu'une seule
                coupure dont la durée ne peut excéder 5 heures.
              </li>
            </ul>
            <p>
              Dans ce cas, et en contrepartie de toute coupure journalière
              supérieure à 2 heures dans la limite de 5 heures, les deux
              séquences de travail réalisées par le Salarié à temps partiel au
              cours de cette journée seront chacune d'une durée minimale de 3
              heures consécutives.
            </p>
            <p style={{ marginTop: "10px" }}>
              En contrepartie, le Salarié a droit à une période minimale de
              travail continue de <strong>2 heures par jour</strong>.
            </p>
          </div>

          {/* Article 6 - Heures complémentaires */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 6 - Heures complémentaires
            </h4>
            <p style={{ marginBottom: "10px" }}>
              Il est convenu qu'en fonction des besoins de l'entreprise, le
              Salarié pourra être amené à effectuer des heures complémentaires,
              dans la limite du tiers de la durée initiale du contrat par
              semaine.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Les heures complémentaires effectuées en-deçà du 1/10 de la durée
              initialement fixée au contrat seront majorées à{" "}
              <strong>10%</strong>.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Les heures complémentaires effectuées au-delà du 1/10 de la durée
              initialement fixée au contrat seront majorées à{" "}
              <strong>25%</strong>.
            </p>
            <p>
              En tout état de cause, les heures complémentaires ne pourront
              avoir pour effet de porter la durée du contrat au niveau de la
              durée légale ou conventionnelle de travail.
            </p>
          </div>

          {/* Article 7 - Rémunération */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 7 - Rémunération
            </h4>
            <p style={{ marginBottom: "12px" }}>
              Le Salarié percevra une rémunération mensualisée brute de{" "}
              <strong>{monthlySalary} €</strong>
              <br />
              correspondant à sa durée de travail mensuelle de{" "}
              <strong>
                {(employee.contractualHours * 4.33).toFixed(2)}
              </strong>{" "}
              heures
              <br />
              sur la base d'un taux horaire de{" "}
              <strong>{employee.hourlyRate?.toFixed(2) ?? ""} €</strong>
            </p>
            <p>
              Sur cette rémunération seront prélevées les cotisations sociales
              et notamment celles afférentes au régime de protection sociale en
              vigueur dans la société à la date de versement.
            </p>
          </div>

          {/* Article 8 - Cumul d'emplois */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 8 - Cumul d'emplois
            </h4>
            <p>
              Le Salarié s'engage à porter à la connaissance de l'Employeur tout
              autre emploi à temps partiel qu'il pourrait occuper. Le Salarié
              communiquera notamment le nombre d'heures effectuées chez cet
              autre employeur qui en aucun cas ne pourra le conduire à effectuer
              un temps de travail effectif, tous emplois confondus, qui excède
              les limites fixées par la loi (10h par jour, 48h par semaine, 44h
              en moyenne sur 12 semaines).
            </p>
          </div>

          {/* Article 9 - Congés payés */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 9 - Congés payés
            </h4>
            <p>
              Le Salarié bénéficiera des congés payés conformément aux
              dispositions légales et conventionnelles en vigueur dont l'époque
              sera déterminée par accord des parties ou, à défaut, en fonction
              des nécessités du service.
            </p>
          </div>

          {/* Article 10 - Absence et maladie */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 10 - Absence et maladie
            </h4>
            <p style={{ marginBottom: "10px" }}>
              Toute absence doit être portée à la connaissance de la Direction
              par tous moyens et dans les plus brefs délais.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Les absences pour maladie ou accident devront être confirmées par
              l'envoi, dans les 48 heures à compter du premier jour
              d'indisponibilité, d'un arrêt de travail.
            </p>
            <p>
              En cas de prolongation d'arrêt de travail, le Salarié devra
              transmettre dans les mêmes délais le certificat médical justifiant
              cette prolongation.
            </p>
          </div>

          {/* Article 11 - Caisse de retraite et prévoyance */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 11 - Caisse de retraite et prévoyance
            </h4>
            <p>
              Le Salarié bénéficiera du régime de retraite et de prévoyance du
              groupe AG2R auxquels la société a souscrit.
            </p>
          </div>

          {/* Article 12 - Garanties */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 12 - Garanties
            </h4>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié bénéficie de tous les droits et avantages reconnus aux
              Salariés à temps plein travaillant dans la Société, résultant du
              code du travail, de la convention collective ou des usages, dans
              les conditions définies par la convention collective.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Il lui est garanti un traitement équivalent aux autres Salariés de
              même qualification professionnelle et de même ancienneté, en ce
              qui concerne les possibilités de promotion, de déroulement de
              carrière, d'accès à la formation professionnelle.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié pourra être reçu par un membre de la Direction afin
              d'examiner les problèmes qui pourraient se poser dans
              l'application de cette égalité de traitement.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Conformément aux dispositions de la convention collective
              applicable, le Salarié bénéficie d'une priorité d'affectation aux
              emplois à temps complet ressortissant de sa qualification
              professionnelle ou d'un emploi équivalent qui serait créé ou qui
              deviendrait vacant. Cette priorité est attribuée compte tenu des
              aptitudes de l'intéressé. La liste de ces emplois sera portée à la
              connaissance du Salarié dès lors qu'il aura manifesté l'intention
              d'occuper un emploi à temps complet.
            </p>
            <p>
              Au cas où le Salarié ferait acte de candidature à un emploi à
              temps complet, sa demande serait examinée et une réponse motivée
              lui serait faite dans un délai maximum de huit jours. Si une suite
              favorable était accordée à cette demande, le présent contrat
              ferait l'objet d'un avenant.
            </p>
          </div>

          {/* Article 13 - Résiliation */}
          <div style={{ marginBottom: "25px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 13 - Résiliation
            </h4>
            <p>
              À l'issue de la période d'essai, chacune des parties pourra rompre
              le présent contrat sous réserve de respecter le préavis prévu par
              les dispositions légales et conventionnelles en vigueur, hormis
              hypothèse de licenciement pour faute grave, lourde ou événement de
              force majeure.
            </p>
          </div>

          {/* Article 14 - Déclarations diverses */}
          <div style={{ marginBottom: "30px", pageBreakInside: "avoid" }}>
            <h4
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
              }}
            >
              Article 14 - Déclarations diverses
            </h4>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié déclare être informé du fait que le CoworKing Café by
              Anticafé dispose de caméras de surveillance et qu'il sera ainsi
              filmé durant ses horaires de travail.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié déclare formellement que toutes les informations
              fournies sur sa formation et son expérience professionnelle sont
              parfaitement exactes.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Le Salarié s'engage à faire connaître, sans délai, tout changement
              qui interviendrait dans les situations qu'il a signalées lors de
              son embauche (adresse, situation de famille, statut, …).
            </p>
            <p style={{ marginBottom: "10px" }}>
              Pour les dispositions non prévues au présent contrat, les Parties
              se référeront aux dispositions légales et conventionnelles en
              vigueur applicables à la Société avec application notamment, et à
              titre d'information, de la Convention Collective Nationale des
              Hôtels, Cafés, Restaurants.
            </p>
            <p style={{ marginBottom: "10px" }}>
              La déclaration préalable à l'embauche du Salarié a été effectuée
              auprès de l'URSSAF à laquelle l'employeur est affilié.
            </p>
            <p>
              Le Salarié pourra exercer auprès de cet organisme son droit
              d'accès et de rectification que la loi du 6 janvier 1978 lui
              confère.
            </p>
          </div>

          {/* Signature */}
          <div style={{ marginTop: "40px", pageBreakInside: "avoid" }}>
            <p style={{ marginBottom: "10px" }}>
              Fait en deux exemplaires originaux dont chaque partie reconnaît
              avoir reçu le sien.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
              }}
            >
              <div style={{ width: "45%" }}>
                <p>A</p>
                <p
                  style={{
                    fontWeight: "bold",
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    paddingBottom: "2px",
                    minWidth: "150px",
                  }}
                >
                  STRASBOURG
                </p>
              </div>
              <div style={{ width: "45%" }}>
                <p>Le</p>
                <p
                  style={{
                    fontWeight: "bold",
                    borderBottom: "1px solid #000",
                    display: "inline-block",
                    paddingBottom: "2px",
                    minWidth: "150px",
                  }}
                >
                  {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "60px",
              }}
            >
              <div style={{ width: "45%", textAlign: "center" }}>
                <p style={{ marginBottom: "5px" }}>Pour la Société</p>
                <p style={{ fontWeight: "bold", marginBottom: "60px" }}>
                  CoworKing Café by Anticafé
                </p>
                <p style={{ marginTop: "60px" }}>Signature</p>
              </div>
              <div style={{ width: "45%", textAlign: "center" }}>
                <p style={{ marginBottom: "5px" }}>Le Salarié</p>
                <p style={{ fontWeight: "bold", marginBottom: "60px" }}>
                  {employee.lastName} {employee.firstName}
                </p>
                <p style={{ marginTop: "60px" }}>
                  Signature
                  <br />
                  Lu et approuvé
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleGeneratePDF}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <Icon icon="ri:file-pdf-line" className="me-2" />
              Générer le PDF
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
