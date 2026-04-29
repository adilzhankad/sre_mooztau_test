export interface AnalyticsListRow {
  label: string;
  value: number;
  sub: string;
}

export interface AnalyticsMetricCard {
  label: string;
  value: string;
  note: string;
  color: string;
}

export interface AnalyticsNamedValue {
  name: string;
  value: number;
  note: string;
}

export interface AnalyticsProductRow {
  name: string;
  quantity: number;
  value: number;
}
