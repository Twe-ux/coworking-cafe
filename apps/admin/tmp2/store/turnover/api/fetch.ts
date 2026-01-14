import { createTypedAsyncThunk } from "../../types";

export const fetchData = createTypedAsyncThunk(
  "turnover/fetchData",
  async function () {
    // If already loaded, do nothing.

    const res = await fetch("/api/turnover");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await res.json();
    return data.data;
  },
);
