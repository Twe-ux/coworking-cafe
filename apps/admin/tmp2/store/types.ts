import { createAsyncThunk, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '.';

export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector = useSelector.withTypes<RootState>();
export const useTypedDispatch =
  useDispatch.withTypes<ThunkDispatch<RootState, unknown, UnknownAction>>();

export const createTypedAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: ThunkDispatch<RootState, unknown, UnknownAction>;
}>();
