import { createTypedAsyncThunk } from "../../types";
import { CashEntry } from "../state";

export const createCashEntry = createTypedAsyncThunk(
  "cashentry/create",
  async (entry: CashEntry) => {
    const res = await fetch("/api/cash-entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Erreur lors de la création");
    const data = await res.json();
    return data.data as CashEntry;
  },
);

export const fetchCashEntries = createTypedAsyncThunk(
  "cashentry/fetchAll",
  async () => {
    const res = await fetch("/api/cash-entry");
    if (!res.ok) throw new Error("Erreur lors du chargement");
    const data = await res.json();
    return data.data as CashEntry[];
  },
);

export const updateCashEntry = createTypedAsyncThunk(
  "cashentry/update",
  async (entry: CashEntry) => {
    const res = await fetch("/api/cash-entry/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour");
    const data = await res.json();
    return data.data as CashEntry;
  },
);

export const deleteCashEntry = createTypedAsyncThunk(
  "cashentry/delete",
  async (id: string) => {
    const res = await fetch(`/api/cash-entry/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    const data = await res.json();
    return data.data as CashEntry;
  },
);
