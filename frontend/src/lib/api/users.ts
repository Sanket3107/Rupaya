// src/lib/api/users.ts
import { getCurrentUser, searchUsers } from "../api/utils";

export { getCurrentUser, searchUsers };
```

Let's create the remaining files one by one:

---

```path/to/Something.ts#L1-15
// src/lib/api/types/user.ts
export interface CurrentUser {
    id: string;
    name: string;
    email?: string;
}

export interface SearchUser {
    id: string;
    name: string;
    email: string;
}
```

```path/to/Something.ts#L1-25
// src/lib/api/types/summary.ts
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
```

```path/to/Something.ts#L1-17
// src/lib/api/types/group.ts
export interface Group {
    id: string;
    name: string;
}

export interface GroupDetail {
    id: string;
    name: string;
    members: {
        id: string;
        name: string;
        email: string;
    }[];
}
```

```path/to/Something.ts#L1-25
// src/lib/api/types/bill.ts
export interface Bill {
    id: string;
    description: string;
    amount: number;
    created_at: string;
}

export interface PaginatedBillsResponse {
    items: Bill[];
    total: number;
}
```

```path/to/Something.ts#L1-100
// src/lib/api/utils.ts
import { api } from "../http";
import { CurrentUser, SearchUser } from "./types/user";
import { SummaryData } from "./types/summary";
import { Group, GroupDetail } from "./types/group";
import { Bill } from "./types/bill";

export const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    try {
        const response = await api.post("/auth/login", formData);
        return response;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.delete("/auth/logout");
        localStorage.removeItem("token");
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
    try {
        return await api.get<CurrentUser>("/users/me");
    } catch (error) {
        console.error("Failed to fetch current user:", error);
        throw error;
    }
};

export const searchUsers = async (query: string): Promise<SearchUser[]> => {
    try {
        return await api.get<SearchUser[]>(`/users/search?q=${query}`);
    } catch (error) {
        console.error("Failed to search users:", error);
        throw error;
    }
};

export const getSummaryData = async (): Promise<SummaryData> => {
    try {
        return await api.get<SummaryData>("/summary/dashboard");
    } catch (error) {
        console.error("Failed to fetch summary data:", error);
        throw error;
    }
};

export const getGroups = async (): Promise<Group[]> => {
    try {
        return await api.get<Group[]>("/groups");
    } catch (error) {
        console.error("Failed to fetch groups:", error);
        throw error;
    }
};

export const getGroupDetail = async (id: string): Promise<GroupDetail> => {
    try {
        return await api.get<GroupDetail>(`/groups/${id}`);
    } catch (error) {
        console.error(`Failed to fetch group ${id}:`, error);
        throw error;
    }
};

export const getBillsByGroup = async (groupId: string, skip = 0, limit = 10): Promise<PaginatedBillsResponse> => {
    try {
        const response = await api.get<{ items: any[], total: number }>(
            `/bills/group/${groupId}?skip=${skip}&limit=${limit}`
        );
        return {
            items: response.items.map((item: any) => ({
                id: item.id,
                description: item.description,
                amount: item.amount,
                created_at: item.created_at,
            })) as Bill[],
            total: response.total,
        };
    } catch (error) {
        console.error("Failed to fetch bills:", error);
        throw error;
    }
};
```

Now let's create the remaining files:

```path/to/Something.ts#L1-23
// src/lib/api/auth.ts
import { login, logout } from "../api/utils";

export { login, logout };
```

```path/to/Something.ts#L1-23
// src/lib/api/bills.ts
import { getBillsByGroup } from "../api/utils";

export { getBillsByGroup };
```

```path/to/Something.ts#L1-23
// src/lib/api/summary.ts
import { getSummaryData } from "../api/utils";

export { getSummaryData };
```

```path/to/Something.ts#L1-23
// src/lib/api/groups.ts
import { getGroups, getGroupDetail } from "../api/utils";

export { getGroups, getGroupDetail };
```

Please create these files in the correct directories manually in your editor:

1. `frontend/src/lib/api/users.ts`
2. `frontend/src/lib/api/types/user.ts`
3. `frontend/src/lib/api/types/summary.ts`
4. `frontend/src/lib/api/types/group.ts`
5. `frontend/src/lib/api/types/bill.ts`
6. `frontend/src/lib/api/utils.ts`
7. `frontend/src/lib/api/auth.ts`
8. `frontend/src/lib/api/bills.ts`
9. `frontend/src/lib/api/summary.ts`
10. `frontend/src/lib/api/groups.ts`
