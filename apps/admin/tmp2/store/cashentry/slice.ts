import { createSlice } from "@reduxjs/toolkit";
import { fetchCashEntries } from "./api/fetch";
import { InitialCashEntryState } from "./state";

export const CashEntryStore = createSlice({
  name: "cashentry",
  initialState: InitialCashEntryState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashEntries.pending, (state) => {
        state.reloading = true;
        state.error = null;
      })
      .addCase(fetchCashEntries.fulfilled, (state, action) => {
        state.reloading = false;
        state.dataCash = action.payload;
      })
      .addCase(fetchCashEntries.rejected, (state, action) => {
        state.reloading = false;
        state.error = action.error.message || "Erreur";
      });
  },
});
