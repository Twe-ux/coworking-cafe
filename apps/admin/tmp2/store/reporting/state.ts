export interface ChartDataItem {
  date: string;
  TTC: number;
  HT: number;
}

export interface ChartData {
  yesterday: ChartDataItem | undefined;
  week: ChartDataItem | undefined;
  month: ChartDataItem | undefined;
  year: ChartDataItem | undefined;
}

export interface ReportingState {
  loading: boolean;
  data: ChartData;
  selectedRange?: string;
  preferences?: {
    showHT: boolean;
    autoRefresh: boolean;
  };
}

export const InitialReportingState: ReportingState = {
  loading: false, // RTK Query gère le loading
  selectedRange: "yesterday",
  preferences: {
    showHT: false,
    autoRefresh: true,
  },
  data: {
    yesterday: undefined,
    week: undefined,
    month: undefined,
    year: undefined,
  },
};
