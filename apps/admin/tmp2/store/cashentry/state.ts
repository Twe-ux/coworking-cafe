export interface CashEntry {
  _id: string;
  date: string;
  depenses: { label: string; value: number }[];
  virement: number;
  especes: number;
  cbClassique: number;
  cbSansContact: number;
}

export interface CashEntryState {
  reloading: boolean;
  dataCash: CashEntry[];
  error: string | null;
}

export const InitialCashEntryState: CashEntryState = {
  reloading: false,
  dataCash: [],
  error: null,
};
export interface CashEntryForm {
  _id: string;
  date: string;
  depenses: { label: string; value: number }[];
  virement: number;
  especes: number;
  cbClassique: number;
  cbSansContact: number;
}
export const InitialCashEntryForm: CashEntryForm = {
  _id: "",
  date: "",
  depenses: [{ label: "", value: 0 }],
  virement: 0,
  especes: 0,
  cbClassique: 0,
  cbSansContact: 0,
};
