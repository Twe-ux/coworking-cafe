export interface RangeData {
  TTC: number;
  HT: number;
}

export interface DailyComparisonItem {
  date: string;
  displayDate: string;
  thisYear: {
    TTC: number;
    HT: number;
  };
  lastYear: {
    TTC: number;
    HT: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: Record<string, RangeData> | DailyComparisonItem[];
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
