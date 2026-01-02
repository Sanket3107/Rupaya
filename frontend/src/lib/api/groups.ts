import { api } from "../http";

export interface Group {
  id: string;
  name: string;
}

export interface GroupDetail extends Group {
  members: {
    id: string;
    name: string;
    email: string;
  }[];
}

export const GroupsAPI = {
  list() {
    return api.get<Group[]>("/groups/");
  },

  detail(id: string) {
    return api.get<GroupDetail>(`/groups/${id}`);
  },
};
