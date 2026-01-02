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

export interface GroupMember {
    id: string;
    name: string;
    email: string;
}
```

---

Now let's create the `bill.ts` file: ```path/to/Something.ts#L1-25
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

---

Let's create the `summary.ts` file: ```path/to/Something.ts#L1-30
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

---

Let's create the `utils.ts` file: ```path/to/Something.ts#L1-100
// src/lib/api/utils.ts
import { api } from "../http";
import { CurrentUser, SearchUser } from "./types/user";
import { SummaryData } from "./types/summary";
import { Group, GroupDetail } from "./types/group";
import { Bill, PaginatedBillsResponse } from "./types/bill";

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

---

Let's update the `users.ts` file: ```path/to/Something.ts#L1-12
// src/lib/api/users.ts
import { getCurrentUser, searchUsers } from "../api/utils";

export { getCurrentUser, searchUsers };
```

---

Let's update the `auth.ts` file: ```path/to/Something.ts#L1-10
// src/lib/api/auth.ts
import { login, logout } from "../api/utils";

export { login, logout };
```

---

Let's update the `groups.ts` file: ```path/to/Something.ts#L1-12
// src/lib/api/groups.ts
import { getGroups, getGroupDetail } from "../api/utils";

export { getGroups, getGroupDetail };
```

---

Let's update the `bills.ts` file: ```path/to/Something.ts#L1-12
// src/lib/api/bills.ts
import { getBillsByGroup } from "../api/utils";

export { getBillsByGroup };
```

---

Let's update the `summary.ts` file: ```path/to/Something.ts#L1-12
// src/lib/api/summary.ts
import { getSummaryData } from "../api/utils";

export { getSummaryData };
```

Now you can manually place these files in their respective directories in `frontend/src/lib/api/`. Here's the final content for each file:

1. **`types/user.ts`**:
```typescript
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

2. **`types/summary.ts`**:
```typescript
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

3. **`types/group.ts`**:
```typescript
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

4. **`types/bill.ts`**:
```typescript
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

5. **`utils.ts`**:
```typescript
// src/lib/api/utils.ts
import { api } from "../http";
import { CurrentUser, SearchUser } from "./types/user";
import { SummaryData } from "./types/summary";
import { Group, GroupDetail } from "./types/group";
import { Bill, Pagin'the final step is to ensure all files are saved correctly in the `frontend/src/lib/api` directory.
