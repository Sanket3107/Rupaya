import { api } from "../http";
import type { PaginatedResponse } from "./types";

export interface BillShare {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  paid: boolean;
}

export interface Bill {
  id: string;
  description: string;
  total_amount: number;
  payer_id: string;
  payer?: {
    id: string;
    name: string;
    email: string;
  };
  group_id: string;
  created_at: string;
  shares: BillShare[];
}

export interface BillCreate {
  description: string;
  total_amount: number;
  paid_by: string;
  group_id: string;
  split_type?: "EQUAL" | "EXACT" | "PERCENTAGE";
  shares: { user_id: string; amount?: number }[];
}

export const BillsAPI = {
  create(data: BillCreate) {
    return api.post<Bill>("/bills/", data);
  },

  getGroupBills(groupId: string, skip = 0, limit = 20) {
    return api.get<PaginatedResponse<Bill>>(
      `/bills/group/${groupId}?skip=${skip}&limit=${limit}`
    );
  },

  getDetail(billId: string) {
    return api.get<Bill>(`/bills/${billId}`);
  },

  markShareAsPaid(shareId: string) {
    return api.patch<BillShare>(`/bills/shares/${shareId}/mark-paid`);
  },

  markShareAsUnpaid(shareId: string) {
    return api.patch<BillShare>(`/bills/shares/${shareId}/mark-unpaid`);
  },
};
