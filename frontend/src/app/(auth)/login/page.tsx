"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const searchParams = new URLSearchParams();
            searchParams.append("username", formData.username);
            searchParams.append("password", formData.password);

            const data = await api.login(searchParams);
            localStorage.setItem("token", data.access_token);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border p-8 rounded-2xl shadow-xl auth-card-shadow"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <Wallet className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Enter your credentials to access your account
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                        Email or Username
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="text"
                            className="pl-10"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none" htmlFor="password">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            className="pl-10"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full group"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <span className="flex items-center">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/register" className="text-primary hover:underline font-semibold">
                    Sign up
                </Link>
            </div>
        </motion.div>
    );
}
