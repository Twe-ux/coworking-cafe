import type { ShiftData } from "@/lib/shift-utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type pour les props de mise à jour
export type UpdateShiftProps = {
  shiftId: string;
  field: string;
  value: string;
};

// Type pour la création d'un shift
export type CreateShiftProps = {
  staffId: string;
  firstName: string;
  lastName: string;
  date: string;
  firstShift: {
    start: string;
    end: string;
  };
  secondShift: {
    start: string;
    end: string;
  };
};

export const shiftApi = createApi({
  reducerPath: "shiftApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/shift",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Shift"],
  endpoints: (builder) => ({
    // Récupérer tous les shifts
    getShifts: builder.query<{ shifts: ShiftData[] }, void>({
      query: () => "/list",
      providesTags: ["Shift"],
    }),

    // Créer un nouveau shift
    createShift: builder.mutation<
      { success: boolean; shift: ShiftData },
      CreateShiftProps
    >({
      query: (shiftData) => ({
        url: "/",
        method: "POST",
        body: shiftData,
      }),
      invalidatesTags: ["Shift"],
    }),

    // Mettre à jour un shift
    updateShift: builder.mutation<
      { message: string; shift: ShiftData },
      UpdateShiftProps
    >({
      query: (update) => ({
        url: "/update",
        method: "PUT",
        body: update,
      }),
      invalidatesTags: ["Shift"],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
} = shiftApi;
