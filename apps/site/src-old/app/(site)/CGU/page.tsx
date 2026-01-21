"use client";

import ProtectedEmail from "../../../components/common/ProtectedEmail";
import { useEffect, useState } from "react";

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  tiers: CancellationTier[];
  spaceType: string;
}

export default function CGUPage() {
  const lastUpdate = "1 décembre 2025";
  const [openSpacePolicy, setOpenSpacePolicy] =
    useState<CancellationPolicy | null>(null);
  const [meetingRoomPolicy, setMeetingRoomPolicy] =
    useState<CancellationPolicy | null>(null);

  useEffect(() => {
    // Fetch open-space policy
    const fetchOpenSpacePolicy = async () => {
      try {
        const response = await fetch(
          "/api/cancellation-policy?spaceType=open-space",
        );
        if (response.ok) {
          const data = await response.json();
          setOpenSpacePolicy(data.data.cancellationPolicy);
        }
      } catch (error) {}
    };

    // Fetch meeting room policy
    const fetchMeetingRoomPolicy = async () => {
      try {
        const response = await fetch(
          "/api/cancellation-policy?spaceType=salle-verriere",
        );
        if (response.ok) {
          const data = await response.json();
          setMeetingRoomPolicy(data.data.cancellationPolicy);
        }
      } catch (error) {}
    };

    fetchOpenSpacePolicy();
    fetchMeetingRoomPolicy();
  }, []);

  // Helper function to format cancellation policy tiers correctly
  const formatPolicyTiers = (tiers: CancellationTier[]) => {
    // Sort tiers by daysBeforeBooking descending
    const sortedTiers = [...tiers].sort(
      (a, b) => b.daysBeforeBooking - a.daysBeforeBooking,
    );

    return sortedTiers.map((tier, index) => {
      const nextTier = sortedTiers[index + 1];

      if (index === sortedTiers.length - 1) {
        // Last tier (0 days)
        if (sortedTiers.length > 1) {
          const previousTier = sortedTiers[index - 1];
          return {
            label: `Entre 0 et ${previousTier.daysBeforeBooking} jours avant`,
            percentage: tier.chargePercentage,
          };
        }
        return {
          label: `Moins de ${tier.daysBeforeBooking} jour avant`,
          percentage: tier.chargePercentage,
        };
      } else if (index === 0) {
        // First tier (highest days)
        return {
          label: `Plus de ${tier.daysBeforeBooking} jours avant`,
          percentage: tier.chargePercentage,
        };
      } else {
        // Middle tiers
        const previousTier = sortedTiers[index - 1];
        return {
          label: `Entre ${tier.daysBeforeBooking} et ${previousTier.daysBeforeBooking} jours avant`,
          percentage: tier.chargePercentage,
        };
      }
    });
  };

  return (
    <main className="bg-white pb__180">
      {/* Hero Section */}
      <section
        className="pt-5 pb-4 px-3 px-md-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(65, 121, 114, 0.05) 0%, rgba(242, 211, 129, 0.05) 100%)",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <h1 className="display-4 fw-bold text-dark mb-4">
                Conditions Générales d&apos;{" "}
                <span
                  style={{
                    background: "linear-gradient(to right, #f2d381, #417972)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Utilisation
                </span>
              </h1>
              <p
                className="lead text-muted mb-3 mx-auto"
                style={{ maxWidth: "600px" }}
              >
                Règles d&apos;utilisation de notre espace de CoworKing Café by
                Anticafé
              </p>
              <p className="text-muted small">
                Dernière mise à jour : {lastUpdate}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          {/* Sommaire */}
          <div className="col-lg-3">
            <div
              className="position-sticky rounded-3 p-4"
              style={{
                top: "150px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <h2 className="h5 fw-bold text-dark mb-4">Sommaire</h2>
              <nav className="d-flex flex-column gap-2">
                <a
                  href="#article1"
                  className="text-decoration-none text-muted small hover-link"
                >
                  1. Définitions
                </a>
                <a
                  href="#article2"
                  className="text-decoration-none text-muted small hover-link"
                >
                  2. Objet
                </a>
                <a
                  href="#article3"
                  className="text-decoration-none text-muted small hover-link"
                >
                  3. Acceptation des CGU
                </a>
                <a
                  href="#article4"
                  className="text-decoration-none text-muted small hover-link"
                >
                  4. Accès aux services
                </a>
                <a
                  href="#article5"
                  className="text-decoration-none text-muted small hover-link"
                >
                  5. Réservations
                </a>
                <a
                  href="#article6"
                  className="text-decoration-none text-muted small hover-link"
                >
                  6. Annulations et remboursements
                </a>
                <a
                  href="#article7"
                  className="text-decoration-none text-muted small hover-link"
                >
                  7. Règles d&apos;utilisation
                </a>
                {/* <a
                  href="#article8"
                  className="text-decoration-none text-muted small hover-link"
                >
                  8. Obligations du client
                </a> */}
                <a
                  href="#article8"
                  className="text-decoration-none text-muted small hover-link"
                >
                  8. Protection des données
                </a>
                <a
                  href="#article9"
                  className="text-decoration-none text-muted small hover-link"
                >
                  9. Responsabilité
                </a>
                <a
                  href="#article10"
                  className="text-decoration-none text-muted small hover-link"
                >
                  10. Propriété intellectuelle
                </a>
                <a
                  href="#article11"
                  className="text-decoration-none text-muted small hover-link"
                >
                  11. Modification des CGU
                </a>
                <a
                  href="#article12"
                  className="text-decoration-none text-muted small hover-link"
                >
                  12. Droit applicable et litiges
                </a>
                <a
                  href="#contact"
                  className="text-decoration-none text-muted small hover-link"
                >
                  Contact
                </a>
              </nav>
            </div>
          </div>

          {/* Contenu */}
          <div className="col-lg-9">
            <div className="legal-content">
              {/* Article 1 */}
              <section
                id="article1"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">1. Définitions</h2>
                <div className="bg-light rounded-3 p-4">
                  <p className="mb-3">
                    <strong>&quot;CoworKing Café by Anticafé&quot;</strong> :
                    désigne l&apos;espace de café coworking situé au 1 rue de la
                    Division Leclerc, 67000 Strasbourg, exploité par ILY SARL.
                  </p>
                  <p className="mb-3">
                    <strong>
                      &quot;Client&quot; ou &quot;Utilisateur&quot;
                    </strong>{" "}
                    : désigne toute personne physique ou morale utilisant les
                    services de l&apos;espace de coworking.
                  </p>
                  <p className="mb-3">
                    <strong>&quot;Services&quot;</strong> : désigne
                    l&apos;ensemble des prestations proposées par CoworKing Café
                    by Anticafé Café, incluant l&apos;accès aux espaces de
                    travail, salles de réunion, services de restauration et
                    équipements mis à disposition.
                  </p>
                  <p className="mb-0">
                    <strong>&quot;Plateforme&quot;</strong> : désigne le site
                    internet et l&apos;application mobile permettant la
                    réservation des services.
                  </p>
                </div>
              </section>

              {/* Article 2 */}
              <section
                id="article2"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">2. Objet</h2>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Les présentes Conditions Générales d&apos;Utilisation (CGU)
                  définissent les termes et conditions d&apos;utilisation des
                  services proposés par CoworKing Café by Anticafé, espace de
                  CoworKing Café by Anticafé situé à Strasbourg.
                </p>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Elles s&apos;appliquent à toute utilisation de nos services,
                  que ce soit sur place, via notre plateforme de réservation en
                  ligne, ou par tout autre moyen de communication.
                </p>
              </section>

              {/* Article 3 */}
              <section
                id="article3"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  3. Acceptation des CGU
                </h2>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  L&apos;utilisation des services de CoworKing Café by Anticafé
                  implique l&apos;acceptation pleine et entière des présentes
                  CGU.
                </p>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  En cas de non-acceptation des CGU, l&apos;utilisateur doit
                  renoncer à l&apos;utilisation des services.
                </p>
                <div
                  className="border rounded-3 p-3"
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderColor: "#90caf9 !important",
                  }}
                >
                  <p className="mb-0 small" style={{ color: "#1565c0" }}>
                    <strong>Important :</strong> Nous vous recommandons de
                    conserver une copie des présentes CGU et de consulter
                    régulièrement leur version mise à jour.
                  </p>
                </div>
              </section>

              {/* Article 4 */}
              <section
                id="article4"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  4. Accès aux services
                </h2>
                <h3 className="h5 fw-semibold text-dark mb-3">
                  4.1 Horaires d&apos;ouverture
                </h3>
                <ul className="text-dark mb-4">
                  <li className="mb-2">Lundi à Vendredi : 9h00 - 20h00</li>
                  <li className="mb-2">Samedi - Dimanche : 10h00 - 20h00</li>
                  <li className="mb-2">Jours fériés : 10h00 - 20h00</li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  4.2 Conditions d&apos;accès
                </h3>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  L&apos;accès aux services est ouvert à toute personne majeure
                  ou mineure accompagnée d&apos;un tuteur légal.
                </p>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Un système de contrôle d&apos;accès peut être mis en place
                  pour garantir la sécurité des utilisateurs et du matériel.
                </p>
              </section>

              {/* Article 5 */}
              <section
                id="article5"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">5. Réservations</h2>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  5.1 Modalités de réservation
                </h3>
                <p
                  className="text-dark mb-3"
                  style={{ lineHeight: "1.8", fontWeight: "600" }}
                >
                  Les réservations peuvent être effectuées :
                </p>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    En ligne via la plateforme de réservation,
                  </li>
                  <li className="mb-2">
                    Par téléphone au 09 87 33 45 19 (uniquement pour le jour
                    même),
                  </li>
                  <li className="mb-2">
                    Par email à l’adresse suivante :{" "}
                    <ProtectedEmail
                      user="strasbourg"
                      domain="coworkingcafe.fr"
                      className="ml-email"
                    />
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  5.2 Confirmation de réservation
                </h3>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Toute réservation est confirmée par l&apos;envoi d&apos;un
                  email de confirmation comprenant :
                </p>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    La date, l&apos;heure et l&apos;espace réservé,
                  </li>
                  <li className="mb-2">Une estimation du montant à régler,</li>
                  <li className="mb-2">
                    Les conditions d&apos;annulation applicables.
                  </li>
                </ul>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Dans le cas des espaces de coworking et de travail partagé, le
                  <strong>
                    montant facturé est ajusté sur place en fonction du temps
                    réellement passé
                  </strong>{" "}
                  et des prestations effectivement consommées.
                </p>

                <h3 className="h5 fw-semibold text-dark mb-3">5.3 Paiement</h3>
                <p
                  className="text-dark"
                  style={{ lineHeight: "1.8", marginBottom: "1rem" }}
                >
                  Sauf disposition contraire convenue par écrit (notamment dans
                  le cadre d&apos;un devis ou d&apos;une privatisation), le
                  <strong>
                    règlement s&apos;effectue directement sur place le jour de
                    la venue.
                  </strong>
                </p>
                <p
                  className="text-dark"
                  style={{ lineHeight: "1.8", marginBottom: "1rem" }}
                >
                  Pour les réservations effectuées via la plateforme en ligne,
                  <strong>une empreinte bancaire</strong>est demandée afin de
                  garantir la réservation. <br /> Cette empreinte{" "}
                  <strong> n&apos;est pas débitée </strong> et est{" "}
                  <strong>
                    automatiquement levée lors de la présence du client le jour
                    de la réservation
                  </strong>
                  .
                </p>
                <p
                  className="text-dark"
                  style={{ lineHeight: "1.8", marginBottom: "1rem" }}
                >
                  En cas de non-présentation ou d&apos;annulation tardive,
                  l&apos;empreinte bancaire pourra être utilisée conformément
                  aux conditions d&apos;annulation définies ci-après.
                </p>
              </section>

              {/* Article 6 */}
              <section
                id="article6"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  6. Annulations et remboursements
                </h2>

                <div
                  className="border rounded-3 p-4 mb-4"
                  style={{
                    backgroundColor: "#fff3e0",
                    borderColor: "#ffb74d !important",
                  }}
                >
                  <h3
                    className="h5 fw-semibold mb-3"
                    style={{ color: "#e65100" }}
                  >
                    Politique d&apos;annulation
                  </h3>

                  <p
                    className="text-dark"
                    style={{ lineHeight: "1.8", marginBottom: "1rem" }}
                  >
                    Les délais d&apos;annulation sont exprimés en{" "}
                    <strong>jours calendaires</strong> (tous les jours du
                    calendrier, y compris les week-ends et jours fériés), et
                    sont calculés à compter de la date de réception écrite de
                    l&apos;annulation. (tous les jours du calendrier, y compris
                    les week-ends et jours fériés), et sont calculés à compter
                    de la date de réception écrite de l&apos;annulation.
                  </p>

                  <h4
                    className="h6 fw-semibold mb-2"
                    style={{ color: "#e65100" }}
                  >
                    Espaces de travail partagés (Open-space) :
                  </h4>
                  {openSpacePolicy && openSpacePolicy.tiers ? (
                    <ul className="mb-3 text-dark">
                      {formatPolicyTiers(openSpacePolicy.tiers).map(
                        (tier, index) => (
                          <li key={index} className="mb-1">
                            <strong>{tier.label} :</strong>{" "}
                            {tier.percentage === 0
                              ? "Aucun frais"
                              : `${tier.percentage}% de frais`}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="mb-3" style={{ color: "#f57c00" }}>
                      Chargement des conditions...
                    </p>
                  )}

                  <h4
                    className="h6 fw-semibold mb-2"
                    style={{ color: "#e65100" }}
                  >
                    Salles de réunion et espaces privatifs :
                  </h4>
                  {meetingRoomPolicy && meetingRoomPolicy.tiers ? (
                    <ul className="mb-0 text-dark">
                      {formatPolicyTiers(meetingRoomPolicy.tiers).map(
                        (tier, index) => (
                          <li key={index} className="mb-1">
                            <strong>{tier.label} :</strong>{" "}
                            {tier.percentage === 0
                              ? "Aucun frais"
                              : `${tier.percentage}% de frais`}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="mb-0" style={{ color: "#f57c00" }}>
                      Chargement des conditions...
                    </p>
                  )}
                  <p
                    className="text-dark"
                    style={{ lineHeight: "1.8", marginTop: "1rem" }}
                  >
                    Ces frais correspondent à une{" "}
                    <strong>indemnité d&apos;annulation</strong>, tenant compte
                    de l&apos;immobilisation des espaces, de la perte de chiffre
                    d&apos;affaires et des frais engagés.
                  </p>
                </div>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  6.1 Procédure d&apos;annulation
                </h3>
                <p className="text-dark mb-2" style={{ lineHeight: "1.8" }}>
                  Toute demande d&apos;annulation doit être notifiée :
                </p>
                <ul className="text-dark mb-3">
                  <li className="mb-2">
                    soit par email à{" "}
                    <ProtectedEmail
                      user="strasbourg"
                      domain="coworkingcafe.fr"
                      className="ml-email"
                    />
                  </li>
                  <li className="mb-2">
                    soit via l&apos;espace client de la plateforme de
                    réservation.
                  </li>
                </ul>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Seule la date de réception de la demande écrite fait foi pour
                  le calcul des délais d’annulation.
                </p>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  6.2 Cas de force majeure
                </h3>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  En cas de force majeure dûment justifiée (maladie avec
                  certificat médical, grève des transports, événements
                  exceptionnels, etc.),
                  <strong> un report ou un remboursement</strong> pourra être
                  accordé,
                  <strong> à la discrétion de la direction</strong>.
                </p>
              </section>

              {/* Article 7 */}
              <section
                id="article7"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  7. Règles d&apos;utilisation
                </h2>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  7.1 Respect de l&apos;environnement de travail
                </h3>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    Maintenir un niveau sonore approprié (téléphone en mode
                    silencieux)
                  </li>
                  <li className="mb-2">
                    Nettoyer son espace de travail après utilisation
                  </li>
                  <li className="mb-2">
                    Respecter les autres utilisateurs et le personnel
                  </li>
                  <li className="mb-2">
                    Ne pas déplacer le mobilier sans autorisation
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  7.2 Utilisation des équipements
                </h3>
                <ul className="text-dark mb-4">
                  <li className="mb-2">WiFi gratuit et illimité fourni</li>
                  <li className="mb-2">
                    Prises électriques disponibles à chaque poste
                  </li>
                  <li className="mb-2">
                    Imprimante/scanner accessible moyennant participation
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  7.3 Interdictions
                </h3>
                <div
                  className="border rounded-3 p-3"
                  style={{
                    backgroundColor: "#ffebee",
                    borderColor: "#ef5350 !important",
                  }}
                >
                  <ul className="mb-0" style={{ color: "#c62828" }}>
                    <li className="mb-2">
                      Fumer dans l&apos;enceinte de l&apos;établissement
                    </li>
                    <li className="mb-2">
                      Consommer de l&apos;alcool sauf autorisation expresse
                    </li>
                    <li className="mb-2">
                      Utiliser les espaces à des fins illégales
                    </li>
                    <li className="mb-2">
                      Tenir des activités commerciales non autorisées
                    </li>
                  </ul>
                </div>
              </section>

              {/* Article 8 */}
              {/* <section
                id="article8"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  8. Obligations du client
                </h2>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  8.1 Obligations générales
                </h3>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Le client s&apos;engage à :
                </p>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    Respecter les présentes CGU et le règlement intérieur
                  </li>
                  <li className="mb-2">
                    Effectuer toutes les formalités administratives, fiscales et
                    sociales qui lui incombent
                  </li>
                  <li className="mb-2">
                    Souscrire une assurance responsabilité civile
                    professionnelle
                  </li>
                  <li className="mb-2">
                    Signaler immédiatement tout dommage ou dysfonctionnement
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  8.2 Protection des données et confidentialité
                </h3>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Le client s&apos;engage à respecter la confidentialité des
                  informations auxquelles il pourrait avoir accès concernant les
                  autres utilisateurs ou l&apos;établissement.
                </p>
              </section> */}

              {/* Article 8 */}
              <section
                id="article8"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  8. Protection des données personnelles
                </h2>

                <div
                  className="border rounded-3 p-4 mb-4"
                  style={{
                    backgroundColor: "#e3f2fd",
                    borderColor: "#64b5f6 !important",
                  }}
                >
                  <h3
                    className="h5 fw-semibold mb-3"
                    style={{ color: "#0d47a1" }}
                  >
                    Conformité RGPD
                  </h3>

                  <h4
                    className="h6 fw-semibold mb-2"
                    style={{ color: "#1565c0" }}
                  >
                    Données collectées :
                  </h4>
                  <ul className="mb-3" style={{ color: "#1565c0" }}>
                    <li className="mb-1">
                      Informations d&apos;identification (nom, prénom, email,
                      téléphone)
                    </li>
                    <li className="mb-1">Données de facturation</li>
                    <li className="mb-1">
                      Données de connexion et d&apos;utilisation des services
                    </li>
                  </ul>

                  <h4
                    className="h6 fw-semibold mb-2"
                    style={{ color: "#1565c0" }}
                  >
                    Finalités du traitement :
                  </h4>
                  <ul className="mb-0" style={{ color: "#1565c0" }}>
                    <li className="mb-1">
                      Gestion des réservations et de la facturation
                    </li>
                    <li className="mb-1">
                      Communication commerciale (avec consentement)
                    </li>
                    <li className="mb-1">Amélioration de nos services</li>
                    <li className="mb-1">
                      Respect des obligations légales et comptables
                    </li>
                  </ul>
                </div>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  8.1 Droits des utilisateurs
                </h3>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    Droit d&apos;accès à vos données personnelles
                  </li>
                  <li className="mb-2">
                    Droit de rectification et de mise à jour
                  </li>
                  <li className="mb-2">
                    Droit à l&apos;effacement (&quot;droit à l&apos;oubli&quot;)
                  </li>
                  <li className="mb-2">Droit à la limitation du traitement</li>
                  <li className="mb-2">Droit à la portabilité des données</li>
                  <li className="mb-2">
                    Droit d&apos;opposition au traitement
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  8.2 Conservation des données
                </h3>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Les données sont conservées pendant la durée de la relation
                  contractuelle et peuvent être conservées pendant 10 ans après
                  la fin de la relation pour respecter les obligations
                  comptables et fiscales.
                </p>
              </section>

              {/* Article 10 */}
              <section
                id="article9"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">9. Responsabilité</h2>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  9.1 Responsabilité de CoworKing Café by Anticafé
                </h3>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  CoworKing Café by Anticafé s&apos;engage à fournir ses
                  services avec diligence et professionnalisme. Toutefois, sa
                  responsabilité est limitée aux dommages directs prouvés.
                </p>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  CoworKing Café by Anticafé ne peut être tenu responsable :
                </p>
                <ul className="text-dark mb-4">
                  <li className="mb-2">
                    Des vols ou dégradations d&apos;effets personnels
                  </li>
                  <li className="mb-2">
                    Des interruptions de service dues à des cas de force majeure
                  </li>
                  <li className="mb-2">
                    Des dysfonctionnements temporaires d&apos;internet ou
                    d&apos;équipements
                  </li>
                </ul>

                <h3 className="h5 fw-semibold text-dark mb-3">
                  9.2 Responsabilité du client
                </h3>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Le client est responsable de tous dommages causés aux biens,
                  aux personnes ou à l&apos;image de l&apos;établissement du
                  fait de son utilisation des services.
                </p>
              </section>

              {/* Article 11 */}
              <section
                id="article10"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  10. Propriété intellectuelle
                </h2>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Tous les éléments du site internet et de la marque &quot;Cow
                  or King Café&quot; (textes, images, vidéos, logos, etc.) sont
                  protégés par les droits de propriété intellectuelle.
                </p>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Toute reproduction, représentation, modification ou adaptation
                  sans autorisation expresse est interdite et constitue une
                  contrefaçon sanctionnée par le Code de la propriété
                  intellectuelle.
                </p>
              </section>

              {/* Article 11 */}
              <section
                id="article11"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  11. Modification des CGU
                </h2>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  CoworKing Café by Anticafé se réserve le droit de modifier les
                  présentes CGU à tout moment. Les modifications entrent en
                  vigueur dès leur publication sur le site internet.
                </p>
                <p className="text-dark" style={{ lineHeight: "1.8" }}>
                  Les utilisateurs sont invités à consulter régulièrement les
                  CGU. L&apos;utilisation continue des services après
                  modification vaut acceptation des nouvelles conditions.
                </p>
              </section>

              {/* Article 12 */}
              <section
                id="article12"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">
                  12. Droit applicable et litiges
                </h2>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  Les présentes CGU sont soumises au droit français. En cas de
                  litige, les parties s&apos;efforceront de trouver une solution
                  amiable.
                </p>
                <p className="text-dark mb-3" style={{ lineHeight: "1.8" }}>
                  À défaut d&apos;accord amiable dans un délai de 30 jours, le
                  litige sera porté devant les tribunaux compétents de
                  Strasbourg.
                </p>
                <div
                  className="border rounded-3 p-3"
                  style={{
                    backgroundColor: "#e8f5e9",
                    borderColor: "#81c784 !important",
                  }}
                >
                  <p className="mb-0 small" style={{ color: "#2e7d32" }}>
                    <strong>Médiation :</strong> Conformément à la loi, nous
                    adhérons à un service de médiation de la consommation. En
                    cas de litige, vous pouvez saisir gratuitement le médiateur
                    via{" "}
                    <a
                      href="https://www.economie.gouv.fr/mediation-conso"
                      className="text-decoration-underline"
                      style={{ color: "#2e7d32" }}
                    >
                      economie.gouv.fr/mediation-conso
                    </a>
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section
                id="contact"
                className="mb-5"
                style={{ scrollMarginTop: 150 }}
              >
                <h2 className="h3 fw-bold text-dark mb-4">Contact</h2>
                <div className="rounded-3 p-4 bg-light">
                  <h3
                    className="h5 fw-semibold mb-3"
                    style={{ color: "#417972" }}
                  >
                    CoworKing Café by Anticafé
                  </h3>
                  <div className="text-dark">
                    <p className="mb-2">
                      <strong>Adresse :</strong> 1 rue de la Division Leclerc,
                      67000 Strasbourg
                    </p>
                    <p className="mb-2">
                      <strong>Téléphone :</strong> 09 87 33 45 19
                    </p>
                    <p className="mb-2">
                      <strong>Email :</strong>{" "}
                      <ProtectedEmail
                        user="contact"
                        domain="coworkingcafe.fr"
                        className="ml-email"
                      />
                    </p>
                    <p className="mb-0">
                      <strong>Horaires d&apos;accueil :</strong> Lundi au
                      Vendredi, 9h00 - 18h00
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer du document */}
              <div className="border-top pt-4 text-center small ">
                <p className="mb-2 text-muted">
                  Document mis à jour le {lastUpdate}
                </p>
                <p className="mb-0 text-muted">
                  Version 1.0 - Conditions Générales d&apos;Utilisation Cow or
                  King Café
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-link:hover {
          color: #417972 !important;
          transition: color 0.2s ease;
        }
      `}</style>
    </main>
  );
}
