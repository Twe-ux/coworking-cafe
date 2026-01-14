import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InitialReportingState } from "./state";

export const ReportingStore = createSlice({
  name: "reporting",
  reducerPath: "reporting",
  initialState: InitialReportingState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDateRange(state, action: PayloadAction<string>) {
      state.selectedRange = action.payload;
    },
    setShowHT(state, action: PayloadAction<boolean>) {
      if (state.preferences) {
        state.preferences.showHT = action.payload;
      }
    },
    setAutoRefresh(state, action: PayloadAction<boolean>) {
      if (state.preferences) {
        state.preferences.autoRefresh = action.payload;
      }
    },
  },
  // RTK Query gère maintenant tout l'état de fetch automatiquement
});

export const { setLoading, setDateRange, setShowHT, setAutoRefresh } =
  ReportingStore.actions;
