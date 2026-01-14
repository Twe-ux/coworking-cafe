import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TurnoverApi } from '.';
import { InitialTurnoverState } from './state';

export const TurnoverStore = createSlice({
  name: 'turnover',
  reducerPath: 'turnover',
  initialState: InitialTurnoverState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(TurnoverApi.fetchData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(TurnoverApi.fetchData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
  },
});
