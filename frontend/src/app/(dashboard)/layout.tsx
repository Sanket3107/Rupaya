"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { api } from "@/lib/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await api.get<{ id: string }>("/users/me");
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <Sidebar onAddExpense={() => setIsAddExpenseOpen(true)} />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                currentUser={currentUser}
                onSuccess={() => {
                    setIsAddExpenseOpen(false);
                    // We might want a way to refresh the current page's data
                    window.location.reload(); // Simple way for now, or use context/event bus
                }}
            />
        </div>
    );
}
