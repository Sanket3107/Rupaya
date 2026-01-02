import { api } from "../http";

export interface SummaryData {
  total_owed: number;
  total_owe: number;
  group_count: number;
  recent_activity: {
    id: string;
    description: string;
    amount: number;
    date: string;
    payer_name: string;
    group_name: string;
    type: "lent" | "borrowed";
  }[];
  friends: {
    id: string;
    name: string;
    email: string;
  }[];
}

export const SummaryAPI = {
  dashboard() {
    return api.get<SummaryData>("/summary/");
  },
};
