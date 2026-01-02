import { api } from "../http";

export interface RecentActivity {
  id: string;
  description: string;
  amount: number;
  date: string;
  payer_name: string;
  group_name: string;
  type: "lent" | "borrowed";
}

export interface Friend {
  id: string;
  name: string;
  email: string;
}

export interface SummaryData {
  total_owed: number;
  total_owe: number;
  group_count: number;
  recent_activity: RecentActivity[];
  friends: Friend[];
}

export const SummaryAPI = {
  getDashboard() {
    return api.get<SummaryData>("/summary/");
  },
};
