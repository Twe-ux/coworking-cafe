"use client";

import { Icon } from "@iconify/react";
import { Alert } from "react-bootstrap";

export default function Step4Contract() {
  return (
    <div>
      <h5 className="mb-4">
        <Icon icon="ri:file-text-line" className="me-2" />
        Génération du Contrat
      </h5>

      <Alert variant="success">
        <Icon icon="ri:checkbox-circle-line" className="me-2" />
        Toutes les étapes précédentes sont complétées !
      </Alert>

      <p>Vous pouvez maintenant générer le contrat de travail avec toutes les informations collectées.</p>

      <ul className="mb-4">
        <li>Informations personnelles complètes</li>
        <li>Documents administratifs validés</li>
        <li>Planning de travail défini</li>
      </ul>
    </div>
  );
}
