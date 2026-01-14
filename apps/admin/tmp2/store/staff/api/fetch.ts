import { createTypedAsyncThunk } from "@/store/types";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (
    staffData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string; // Mis à jour vers le format moderne
      numberSecu: string;
      adresse: string;
      zipcode: string;
      city: string;
      framework: string;
      times: string;
      hourlyRate: number;
      startDate: Date;
      endDate?: Date;
      contract: string;
      mdp: number; // Champ pour le mot de passe ou l'identifiant
      isActive: boolean; // Mis à jour vers le format moderne
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch("/api/staff/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchData = createTypedAsyncThunk(
  "staff/fetchData",
  async function () {
    // If already loaded, do nothing.

    const res = await fetch("/api/staff");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();
    return data.data;
  },
);

export function useFetchDataQuery(): { users: any } {
  throw new Error("Function not implemented.");
}
