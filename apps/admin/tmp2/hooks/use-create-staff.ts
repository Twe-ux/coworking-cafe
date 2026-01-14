"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberSecu?: string;
  adresse?: string;
  zipcode?: string;
  city?: string;
  framework?: string;
  times?: string;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
  contract?: string;
  mdp: number;
  isActive?: boolean;
}

export function useCreateStaff() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStaff = async (staffData: CreateStaffData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      if (result.success) {
        toast.success(result.message || "Staff créé avec succès !");

        // Invalider le cache du staff pour forcer un rechargement
        if (typeof window !== "undefined") {
          // Déclencher un événement pour que les composants se rechargent
          console.log("🚀 DISPATCHING staff-created event");
          window.dispatchEvent(new CustomEvent("staff-created"));
          console.log("🚀 staff-created event dispatched successfully");
        }

        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStaff,
    isLoading,
    error,
  };
}
