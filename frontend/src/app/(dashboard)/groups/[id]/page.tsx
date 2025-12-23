"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Receipt,
    UserPlus,
    Settings,
    Trash2,
    Shield,
    Search,
    ArrowLeft,
    MoreHorizontal,
    X,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { api } from "@/lib/api";

interface Member {
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
}

interface Bill {
    id: string;
    title: string;
    amount: number;
    payer_name: string;
    created_at: string;
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

const categories = ["Food", "Travel", "Home", "Social", "Other"];

export default function GroupDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [group, setGroup] = useState<GroupDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    const [billTitle, setBillTitle] = useState("");
    const [billAmount, setBillAmount] = useState("");
    const [billCategory, setBillCategory] = useState("Home");
    const [isSubmittingBill, setIsSubmittingBill] = useState(false);

    const [newMemberEmail, setNewMemberEmail] = useState("");

    React.useEffect(() => {
        if (id) fetchGroupDetail();
    }, [id]);

    const fetchGroupDetail = async () => {
        try {
            const data = await api.get<GroupDetail>(`/groups/${id}`);
            setGroup(data);
        } catch (error) {
            console.error("Failed to fetch group details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingBill(true);
        try {
            await api.post("/bills/", {
                group_id: id,
                title: billTitle,
                amount: parseFloat(billAmount),
                category: billCategory,
                splitting_method: "equal"
            });
            setIsAddExpenseOpen(false);
            setBillTitle("");
            setBillAmount("");
            fetchGroupDetail();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to add expense");
        } finally {
            setIsSubmittingBill(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${id}/members`, {
                email: newMemberEmail
            });
            setIsAddMemberOpen(false);
            setNewMemberEmail("");
            fetchGroupDetail();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to add member");
        }
    };

    const removeMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await api.delete(`/groups/${id}/members/${memberId}`);
            fetchGroupDetail();
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

    if (!group) return <div className="p-8">Group not found</div>;

    const members = group.members;
    const bills = group.bills;

    return (
        <div className="space-y-8">
            {/* Breadcrumbs / Back */}
            <Link href="/groups" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Groups
            </Link>

            {/* Group Header Card */}
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Users className="w-32 h-32" />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight italic uppercase">{group.name}</h1>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">{group.type}</span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> {members.length} members
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            className="rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => setIsAddExpenseOpen(true)}
                        >
                            <Receipt className="w-4 h-4 mr-2" />
                            Add Expense
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => setIsAddMemberOpen(true)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl bg-secondary">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border flex gap-12">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Group Spending</p>
                        <p className="text-2xl font-black">₹{group.total_spent?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Your Balance</p>
                        <p className={cn(
                            "text-2xl font-black",
                            group.user_balance >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {group.user_balance >= 0 ? '+' : '-'}₹{Math.abs(group.user_balance || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Unified View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Members & Management */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Group Members</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-secondary/50 text-primary"
                                onClick={() => setIsAddMemberOpen(true)}
                            >
                                <UserPlus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                                            {member.name ? member.name.substring(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold leading-none">{member.name || 'Invited User'}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{member.email}</p>
                                        </div>
                                    </div>
                                    {member.is_admin ? (
                                        <Shield className="w-3 h-3 text-primary" />
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full mt-6 rounded-xl text-xs h-9 bg-primary/5 text-primary hover:bg-primary/10 border-none"
                            onClick={() => setIsAddMemberOpen(true)}
                        >
                            Add New Member
                        </Button>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Group Settings</h2>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-sm h-10 rounded-xl">
                                <Settings className="w-4 h-4 mr-3" /> Group Settings
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm h-10 rounded-xl text-rose-500 hover:bg-rose-500/5 hover:text-rose-600">
                                <Trash2 className="w-4 h-4 mr-3" /> Leave Group
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bills/Expenses */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Expenses</h2>
                        {/* Removed search input as per instruction */}
                    </div>

                    <div className="space-y-3">
                        {bills.length > 0 ? (
                            bills.map((bill) => (
                                <div key={bill.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all hover:bg-primary/[0.01]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center">
                                            <Receipt className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm tracking-tight">{bill.title}</h4>
                                            <p className="text-[10px] text-muted-foreground">Paid by <span className="font-semibold text-foreground/80">{bill.payer_name}</span> • {new Date(bill.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-black">₹{bill.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">
                                            Share: ₹{(bill.amount / members.length).toFixed(0)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/5">
                                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">No expenses yet.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 rounded-xl"
                                    onClick={() => setIsAddExpenseOpen(true)}
                                >
                                    Add First Expense
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <Modal
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                title="Add Expense"
                description="Fill in the details to split a new bill with the group."
            >
                <form onSubmit={handleAddBill} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">What was this for?</label>
                            <Input
                                placeholder="e.g. Dinner, Rent, Movie"
                                value={billTitle}
                                onChange={(e) => setBillTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-8"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setBillCategory(cat)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                            billCategory === cat
                                                ? "bg-primary border-primary text-white"
                                                : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/40"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
                        <Button className="flex-1 rounded-xl shadow-lg shadow-primary/20" disabled={isSubmittingBill}>
                            {isSubmittingBill ? "Saving..." : "Split Expense"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                title="Invite Member"
                description="Share the group and split expenses with someone new."
            >
                <form onSubmit={handleAddMember} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                            <Input
                                placeholder="friend@example.com"
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                className="pr-12"
                                autoFocus
                            />
                            <Button
                                size="sm"
                                className="absolute right-1 top-1 h-8 rounded-lg"
                                disabled={!newMemberEmail}
                                type="submit"
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-3 tracking-widest">Suggestions</p>
                        <div className="space-y-2">
                            {["Akash Gupta", "Priya Sharma"].map((name) => (
                                <div key={name} className="flex items-center justify-between p-2 hover:bg-secondary rounded-xl cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-xs font-semibold">{name}</span>
                                    </div>
                                    <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
