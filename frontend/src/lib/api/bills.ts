import { api } from "../http";

export interface Bill {
  id: string;
  description: string;
  amount: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export const BillsAPI = {
  byGroup(groupId: string, skip = 0, limit = 10) {
    return api.get<PaginatedResponse<Bill>>(
      `/bills/group/${groupId}?skip=${skip}&limit=${limit}`,
    );
  },
};
