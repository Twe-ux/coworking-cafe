import { createSlice } from "@reduxjs/toolkit";
import { StaffApi } from ".";
import { createStaff } from "./api";
import { InitialStaffState } from "./state";

// Slice Redux pour staff
const staffSlice = createSlice({
  name: "staff",
  initialState: InitialStaffState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(StaffApi.fetchData.pending, (state) => {
        state.loading = true;
      })
      .addCase(StaffApi.fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(createStaff.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export default staffSlice.reducer;
