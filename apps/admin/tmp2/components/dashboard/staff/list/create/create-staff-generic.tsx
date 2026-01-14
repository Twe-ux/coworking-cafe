"use client";

import { GenericForm } from "@/components/ui/generic-form";
import { FormConfig } from "@/hooks/use-generic-form";
import { CONTRACT_TIMES, CONTRACT_TYPES } from "@/hooks/use-staff-form";
import type { AppDispatch } from "@/store";
import { createStaff } from "@/store/staff/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

// Type pour les données du staff (réutilisation)
interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberSecu: string;
  adresse: string;
  zipcode: string;
  city: string;
  framework: string;
  times: string;
  hourlyRate: number;
  startDate: string;
  endDate: string;
  isActif: boolean;
  mdp: number;
}

export default function CreateStaffGeneric() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: any) => state.staff);

  // Configuration du formulaire générique
  const formConfig: FormConfig<StaffFormData> = {
    sections: [
      // Section informations personnelles
      {
        id: "personal-info",
        title: "Informations personnelles",
        description:
          "Renseignez les informations de base du membre du personnel",
        columns: 2,
        fields: [
          {
            id: "firstName",
            label: "Prénom",
            type: "text",
            required: true,
            placeholder: "Entrez le prénom",
          },
          {
            id: "lastName",
            label: "Nom",
            type: "text",
            required: true,
            placeholder: "Entrez le nom",
          },
          {
            id: "email",
            label: "Email",
            type: "email",
            required: true,
            placeholder: "exemple@email.com",
          },
          {
            id: "phone",
            label: "Téléphone",
            type: "tel",
            required: true,
            placeholder: "06 12 34 56 78",
          },
          {
            id: "numberSecu",
            label: "Numéro de sécurité sociale",
            type: "text",
            placeholder: "1 23 45 67 890 123 45",
          },
        ],
      },

      // Section adresse
      {
        id: "address",
        title: "Adresse",
        description: "Informations de domicile du membre du personnel",
        fields: [
          {
            id: "adresse",
            label: "Adresse",
            type: "text",
            placeholder: "12 rue de la Paix",
          },
          {
            id: "zipcode",
            label: "Code postal",
            type: "text",
            placeholder: "75001",
            className: "md:col-span-1",
          },
          {
            id: "city",
            label: "Ville",
            type: "text",
            placeholder: "Paris",
            className: "md:col-span-2",
          },
        ],
        columns: 3,
      },

      // Section contrat
      {
        id: "contract",
        title: "Informations contractuelles",
        description: "Détails du contrat de travail",
        columns: 2,
        fields: [
          {
            id: "framework",
            label: "Type de contrat",
            type: "select",
            required: true,
            options: [...CONTRACT_TYPES],
          },
          {
            id: "times",
            label: "Temps de travail",
            type: "select",
            required: true,
            options: [...CONTRACT_TIMES],
          },
        ],
      },

      // Section rémunération
      {
        id: "compensation",
        title: "Rémunération et période",
        description: "Détails de rémunération et dates du contrat",
        columns: 3,
        fields: [
          {
            id: "hourlyRate",
            label: "Taux horaire (€)",
            type: "number",
            required: true,
            placeholder: "15.50",
          },
          {
            id: "startDate",
            label: "Date de début",
            type: "date",
          },
          {
            id: "endDate",
            label: "Date de fin",
            type: "date",
          },
          {
            id: "mdp",
            label: "Mot de passe (numérique)",
            type: "number",
            placeholder: "1234",
            className: "md:col-span-2",
          },
          {
            id: "isActif",
            label: "Membre actif",
            type: "switch",
            description:
              "Détermine si le membre du personnel est actuellement actif",
            className: "md:col-span-1",
          },
        ],
      },
    ],

    initialValues: {
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
      hourlyRate: 0,
      startDate: "",
      endDate: "",
      isActif: true,
      mdp: 0,
    },

    onSubmit: async (data: StaffFormData) => {
      // Transformation des données pour l'API
      const staffData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        contract: data.framework, // Mappage du champ framework vers contract
        isActive: data.isActif, // Mappage de isActif vers isActive
      };

      dispatch(createStaff(staffData));
    },

    submitLabel: "Créer le personnel",
    resetLabel: "Réinitialiser",
    cancelLabel: "Retour à la liste",
  };

  // Gestion des effets de bord
  useEffect(() => {
    if (success) {
      toast.success("Personnel créé avec succès !");
      router.push("/admin/staff/list");
    }
  }, [success, router]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Une erreur est survenue lors de la création");
    }
  }, [error]);

  const handleCancel = () => {
    router.push("/admin/staff/list");
  };

  return (
    <GenericForm
      config={formConfig}
      title="Nouveau membre du personnel (Version Générique)"
      description="Formulaire généré automatiquement avec validation et gestion d'état intégrées"
      onCancel={handleCancel}
      showResetButton={true}
    />
  );
}
