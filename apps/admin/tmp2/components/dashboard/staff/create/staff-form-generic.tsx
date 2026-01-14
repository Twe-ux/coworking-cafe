"use client";

import { AdvancedForm } from "@/components/ui/advanced-form";
import { AdvancedFormConfig } from "@/hooks/use-advanced-form";

// Types métier pour le personnel
export interface StaffFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberSecu: string;

  // Adresse
  adresse: string;
  zipcode: string;
  city: string;

  // Informations professionnelles
  framework: string;
  times: string;

  // Contrat
  hourlyRate: string;
  startDate: string;
  endDate: string;
  mdp: string;
  isActif: boolean;
}

// Props du composant
interface StaffFormGenericProps {
  onSubmit: (data: StaffFormData) => void | Promise<void>;
  initialData?: Partial<StaffFormData>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

// Configuration du formulaire générique pour le personnel
function createStaffFormConfig(
  onSubmit: (data: StaffFormData) => void | Promise<void>,
  initialData?: Partial<StaffFormData>,
  mode: "create" | "edit" = "create",
): AdvancedFormConfig<StaffFormData> {
  const defaultData: StaffFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    numberSecu: "",
    adresse: "",
    zipcode: "",
    city: "",
    framework: "",
    times: "",
    hourlyRate: "",
    startDate: "",
    endDate: "",
    mdp: "",
    isActif: true,
    ...initialData,
  };

  // Options pour les sélecteurs
  const CONTRACT_TYPES = [
    { value: "CDI", label: "CDI" },
    { value: "CDD", label: "CDD" },
    { value: "Stage", label: "Stage" },
    { value: "Freelance", label: "Freelance" },
    { value: "Interim", label: "Intérim" },
  ];

  const CONTRACT_TIMES = [
    { value: "Temps plein", label: "Temps plein" },
    { value: "Temps partiel", label: "Temps partiel" },
    { value: "35h", label: "35 heures" },
    { value: "39h", label: "39 heures" },
  ];

  return {
    initialValues: defaultData,
    onSubmit,
    submitLabel: mode === "create" ? "Créer le membre" : "Mettre à jour",
    validateOnChange: true,
    wizardMode: false, // Peut être activé pour un formulaire multi-étapes
    sections: [
      // Section 1: Informations personnelles
      {
        title: "Informations personnelles",
        description:
          "Renseignez les informations de base du membre du personnel",
        layout: "grid",
        columns: 2,
        fields: [
          {
            id: "firstName",
            type: "text",
            label: "Prénom",
            placeholder: "Entrez le prénom",
            required: true,
            className: "col-span-1",
          },
          {
            id: "lastName",
            type: "text",
            label: "Nom",
            placeholder: "Entrez le nom",
            required: true,
            className: "col-span-1",
          },
          {
            id: "email",
            type: "email",
            label: "Email",
            placeholder: "exemple@email.com",
            required: true,
            className: "col-span-1",
          },
          {
            id: "phone",
            type: "text",
            label: "Téléphone",
            placeholder: "06 12 34 56 78",
            required: true,
            className: "col-span-1",
          },
          {
            id: "numberSecu",
            type: "text",
            label: "Numéro de sécurité sociale",
            placeholder: "1 23 45 67 890 123 45",
            required: true,
            className: "col-span-2",
            helper: "Format : 1 23 45 67 890 123 45",
          },
        ],
      },

      // Section 2: Adresse
      {
        title: "Adresse",
        description: "Informations de résidence",
        layout: "grid",
        columns: 2,
        fields: [
          {
            id: "adresse",
            type: "text",
            label: "Adresse",
            placeholder: "123 rue de la Paix",
            required: true,
            className: "col-span-2",
          },
          {
            id: "zipcode",
            type: "text",
            label: "Code postal",
            placeholder: "75001",
            required: true,
            className: "col-span-1",
          },
          {
            id: "city",
            type: "text",
            label: "Ville",
            placeholder: "Paris",
            required: true,
            className: "col-span-1",
          },
        ],
      },

      // Section 3: Informations professionnelles
      {
        title: "Informations professionnelles",
        description: "Détails du poste et du contrat",
        layout: "grid",
        columns: 2,
        fields: [
          {
            id: "framework",
            type: "select",
            label: "Type de contrat",
            placeholder: "Sélectionnez un type de contrat",
            options: CONTRACT_TYPES,
            required: true,
            className: "col-span-1",
          },
          {
            id: "times",
            type: "select",
            label: "Temps de travail",
            placeholder: "Sélectionnez le temps de travail",
            options: CONTRACT_TIMES,
            required: true,
            className: "col-span-1",
          },
        ],
      },

      // Section 4: Conditions d'emploi
      {
        title: "Conditions d'emploi",
        description: "Rémunération et dates de contrat",
        layout: "grid",
        columns: 2,
        fields: [
          {
            id: "hourlyRate",
            type: "number",
            label: "Taux horaire (€)",
            placeholder: "15.00",
            min: 0,
            step: 0.01,
            required: true,
            className: "col-span-1",
            helper: "Rémunération brute par heure",
          },
          {
            id: "startDate",
            type: "text", // Sera rendu comme date
            label: "Date de début",
            required: true,
            className: "col-span-1",
          },
          {
            id: "endDate",
            type: "text", // Sera rendu comme date
            label: "Date de fin",
            className: "col-span-1",
            conditional: {
              field: "framework",
              value: "CDI",
              operator: "not-equals",
            },
            helper: "Laissez vide pour un CDI",
          },
          {
            id: "mdp",
            type: "password",
            label: "Mot de passe temporaire",
            placeholder: "Généré automatiquement si vide",
            className: "col-span-1",
            helper: "Le membre pourra le changer à sa première connexion",
          },
          {
            id: "isActif",
            type: "switch",
            label: "Compte actif",
            className: "col-span-2",
            helper: "Le membre peut-il se connecter au système ?",
          },
        ],
      },
    ],
  };
}

// Composant principal utilisant le système générique
export function StaffFormGeneric({
  onSubmit,
  initialData,
  isLoading = false,
  mode = "create",
}: StaffFormGenericProps) {
  // Configuration du formulaire
  const formConfig = createStaffFormConfig(onSubmit, initialData, mode);

  return (
    <div className="mx-auto max-w-4xl">
      <AdvancedForm config={formConfig} className="bg-background" />
    </div>
  );
}

// Version avec validation métier avancée
export function StaffFormWithValidation({
  onSubmit,
  initialData,
  isLoading = false,
  mode = "create",
}: StaffFormGenericProps) {
  // Validation métier personnalisée
  const handleSubmitWithValidation = async (data: StaffFormData) => {
    // Validations métier spécifiques
    const errors: string[] = [];

    // Validation email unique (en mode création)
    if (mode === "create") {
      // Simulation d'une vérification d'unicité
      const existingEmails = ["admin@test.com", "user@test.com"];
      if (existingEmails.includes(data.email.toLowerCase())) {
        errors.push("Cet email est déjà utilisé");
      }
    }

    // Validation numéro de sécurité sociale
    const ssnPattern = /^\d\s\d{2}\s\d{2}\s\d{2}\s\d{3}\s\d{3}\s\d{2}$/;
    if (data.numberSecu && !ssnPattern.test(data.numberSecu)) {
      errors.push("Format du numéro de sécurité sociale invalide");
    }

    // Validation dates
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate <= startDate) {
        errors.push("La date de fin doit être postérieure à la date de début");
      }
    }

    // Validation taux horaire minimum
    const hourlyRate = parseFloat(data.hourlyRate);
    const SMIC_HOURLY = 11.27; // SMIC 2024
    if (hourlyRate < SMIC_HOURLY) {
      errors.push(
        `Le taux horaire ne peut pas être inférieur au SMIC (${SMIC_HOURLY}€)`,
      );
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    // Enrichissement des données
    const enrichedData = {
      ...data,
      // Génération automatique du mot de passe si vide
      mdp: data.mdp || generateSecurePassword(),
      // Normalisation de l'email
      email: data.email.toLowerCase().trim(),
      // Métadonnées
      metadata: {
        createdBy: "system", // À remplacer par l'utilisateur connecté
        createdAt: new Date().toISOString(),
        version: "1.0",
      },
    };

    console.log("Données enrichies du personnel:", enrichedData);
    await onSubmit(data);
  };

  const enhancedConfig = createStaffFormConfig(
    handleSubmitWithValidation,
    initialData,
    mode,
  );

  // Ajout d'une section de prévisualisation
  enhancedConfig.sections.push({
    title: "Récapitulatif",
    description: "Vérifiez les informations avant validation",
    fields: [
      {
        id: "summary",
        type: "object",
        label: "Résumé",
        fields: [
          {
            id: "info",
            type: "text",
            label: "Information",
            disabled: true,
            placeholder:
              "Les données seront vérifiées automatiquement lors de la sauvegarde",
            helper: "Email unique, SMIC respecté, dates cohérentes",
          },
        ],
      },
    ],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <AdvancedForm config={enhancedConfig} className="bg-background" />
    </div>
  );
}

// Utilitaire pour générer un mot de passe sécurisé
function generateSecurePassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Export par défaut
export default StaffFormGeneric;
