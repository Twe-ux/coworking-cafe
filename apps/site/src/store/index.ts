import { configureStore } from '@reduxjs/toolkit';
import { blogApi } from './api/blogApi';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [blogApi.reducerPath]: blogApi.reducer,

    // Regular slices
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(blogApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
