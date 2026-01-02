"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupsAPI, UsersAPI, type GroupMember } from "@/lib/api";

// Extracted Components
import { GroupHeader } from "@/components/groups/GroupHeader";
import { MemberList } from "@/components/groups/MemberList";
import { ExpenseList } from "@/components/groups/ExpenseList";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { InviteMemberModal } from "@/components/groups/InviteMemberModal";

interface Member {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: "ADMIN" | "MEMBER";
}

interface BillShare {
  id: string;
  user_id: string;
  amount: number;
  paid: boolean;
  user: {
    id: string;
    name: string;
  };
}

interface Bill {
  id: string;
  description: string;
  total_amount: number;
  split_type: "EQUAL" | "EXACT" | "PERCENTAGE";
  created_at: string;
  payer: {
    id: string;
    name: string;
  } | null;
  shares: BillShare[];
}

interface GroupDetail {
  id: string;
  name: string;
  type: string;
  members: Member[];
  bills: Bill[];
  total_spent: number;
  user_balance: number;
}

export default function GroupDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Moved fetch functions inside useEffect or wrapped in useCallback to satisfy linter
  const fetchGroupDetail = React.useCallback(async () => {
    try {
      const data = await GroupsAPI.getDetail(id);

      // Transform API data to match local interface expected by MemberList
      // Local Member expects { id, role, user: { id, name, email } }
      // API now returns nested members structure!
      const transformedMembers: Member[] = data.members.map((m: GroupMember) => ({
        id: m.id,
        role: (m.role as "ADMIN" | "MEMBER") || "MEMBER",
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email
        }
      }));

      // Construct the local GroupDetail object
      const fullGroup: GroupDetail = {
        id: data.id,
        name: data.name,
        type: "SHARED", // Default
        members: transformedMembers,
        bills: [], // API doesn't return bills in detail view apparently? Or we need separate call
        total_spent: 0,
        user_balance: 0
      };

      setGroup(fullGroup);
    } catch (error) {
      console.error("Failed to fetch group:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await UsersAPI.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    if (id) {
      fetchGroupDetail();
      fetchCurrentUser();
    }
  }, [id, fetchGroupDetail]);

  const handleExpenseAdded = () => {
    setIsAddExpenseOpen(false);
    setRefreshTrigger((prev) => prev + 1);
    fetchGroupDetail();
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await GroupsAPI.removeMember(id, memberId);
      fetchGroupDetail();
      window.dispatchEvent(new Event("refresh-summary"));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse p-8">
        <div className="h-48 bg-card rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-card rounded-2xl" />
          <div className="lg:col-span-2 h-96 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!group)
    return (
      <div className="p-8 text-center py-20 bg-card rounded-3xl border border-border">
        Group not found
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      <GroupHeader
        group={group}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onInviteMember={() => setIsAddMemberOpen(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Members & Management */}
        <div className="lg:col-span-1 space-y-6">
          <MemberList
            members={group.members}
            currentUserId={currentUser?.id}
            onInviteMember={() => setIsAddMemberOpen(true)}
            onRemoveMember={removeMember}
          />

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Group Settings
            </h2>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-10 rounded-xl"
              >
                <Settings className="w-4 h-4 mr-3" /> Group Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-10 rounded-xl text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4 mr-3" /> Leave Group
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Bills/Expenses */}
        <div className="lg:col-span-2">
          <ExpenseList
            groupId={id}
            currentUserId={currentUser?.id}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSuccess={handleExpenseAdded}
        currentUser={currentUser}
        initialGroupId={id}
        members={group.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          user_id: m.user.id,
          role: "MEMBER",
          user: m.user
        } as unknown as GroupMember))} // Temporary cast until we fully align AddExpenseModal types
      />

      <InviteMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={id}
        onSuccess={fetchGroupDetail}
      />
    </div>
  );
}
