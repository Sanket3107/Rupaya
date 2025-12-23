"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Plus, ChevronRight, UserPlus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Assuming cn utility is available here

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

import { api } from "@/lib/api";

interface Group {
    id: string;
    name: string;
    type: string;
    owner_id: string;
}

const groupTypes = ["Home", "Trip", "Social", "Sports", "Other"];

export default function GroupsPage() {
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newGroupName, setNewGroupName] = React.useState("");
    const [selectedType, setSelectedType] = React.useState("Home");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const data = await api.get<Group[]>("/groups/");
            setGroups(data);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post("/groups/", {
                name: newGroupName,
                type: selectedType
            });
            setIsModalOpen(false);
            setNewGroupName("");
            fetchGroups();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to create group");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your shared expenses with friends and family.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl shadow-lg shadow-primary/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Group
                </Button>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    // Loading skeletons
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-card/50 border border-border animate-pulse rounded-2xl" />
                    ))
                ) : groups.length > 0 ? (
                    groups.map((group, i) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight">{group.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="px-2 py-0.5 bg-secondary rounded-md text-[10px] uppercase font-bold tracking-wider">
                                        {group.type}
                                    </span>
                                    <span>•</span>
                                    <span>New Group</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Balance</p>
                                    <p className="text-lg font-bold text-muted-foreground italic text-sm">₹0.00</p>
                                </div>
                                <Link href={`/groups/${group.id}`}>
                                    <Button size="sm" variant="secondary" className="rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                        View <ChevronRight className="ml-1 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    /* Empty State */
                    <motion.div
                        onClick={() => setIsModalOpen(true)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                            <UserPlus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">No groups found</h4>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Create your first group to start splitting expenses with friends.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl">Create Group</Button>
                    </motion.div>
                )}

                {!isLoading && groups.length > 0 && (
                    <motion.div
                        onClick={() => setIsModalOpen(true)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groups.length * 0.1 }}
                        className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[220px]"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h4 className="font-bold">New Group</h4>
                            <p className="text-sm text-muted-foreground">Add a new group</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Create Group Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Group"
                description="Start a new group to manage shared expenses with specific friends."
            >
                <form onSubmit={handleCreateGroup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Group Name</label>
                        <Input
                            placeholder="e.g. Goa Trip, Flatmates"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {groupTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-semibold transition-all border",
                                        selectedType === type
                                            ? "bg-primary border-primary text-white"
                                            : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/40"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting || !newGroupName}
                        >
                            {isSubmitting ? "Creating..." : "Create Group"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
