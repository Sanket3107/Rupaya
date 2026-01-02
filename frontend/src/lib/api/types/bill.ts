// src/lib/api/types/bill.ts
export interface Bill {
    id: string;
    description: string;
    amount: number;
    created_at: string;
    payer_id?: string;
    payer_name?: string;
}

export interface PaginatedBillsResponse {
    items: Bill[];
    total: number;
}
```

Now let's create the `utils.ts` file: ```typescript
// src/lib/api/utils.ts
import { api } from "../http";
import { CurrentUser, SearchUser } from "./types/user";
import { SummaryData } from "./types/summary";
import { Group, GroupDetail } from "./types/group";

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

export const getBillsByGroup = async (groupId: string, skip = 0, limit = 10): Promise<{ items: Bill[], total: number }> => {
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
            })),
            total: response.total,
        };
    } catch (error) {
        console.error("Failed to fetch bills:", error);
        throw error;
    }
};
```

Now let's update the `users.ts` file: ```typescript
// src/lib/api/users.ts
import { getCurrentUser, searchUsers } from "../api/utils";

export { getCurrentUser, searchUsers };
```

Let's update the `auth.ts` file: ```typescript
// src/lib/api/auth.ts
import { login, logout } from "../api/utils";

export { login, logout };
```

Let's update the `groups.ts` file: ```typescript
// src/lib/api/groups.ts
import { getGroups, getGroupDetail } from "../api/utils";

export { getGroups, getGroupDetail };
```

Let's update the `bills.ts` file: ```typescript
// src/lib/api/bills.ts
import { getBillsByGroup } from "../api/utils";

export { getBillsByGroup };
```

Let's update the `summary.ts` file: ```typescript
// src/lib/api/summary.ts
import { getSummaryData } from "../api/utils";

export { getSummaryData };
