"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Receipt, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BillsAPI, type Bill } from "@/lib/api";

interface ExpenseListProps {
  groupId: string;
  currentUserId: string | undefined;
  onAddExpense: () => void;
  // We can use this to trigger a refresh from the parent
  refreshTrigger?: number;
}

const ITEMS_PER_PAGE = 10;

export function ExpenseList({
  groupId,
  currentUserId,
  onAddExpense,
  refreshTrigger = 0,
}: ExpenseListProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const fetchInitialBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await BillsAPI.getGroupBills(groupId, 0, ITEMS_PER_PAGE);
      setBills(response.items);
      setSkip(response.items.length);
      setHasMore(response.items.length >= ITEMS_PER_PAGE); // Simple check, or response.total > ... if available
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchMoreBills = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await BillsAPI.getGroupBills(groupId, skip, ITEMS_PER_PAGE);
      if (response.items.length > 0) {
        setBills((prev) => [...prev, ...response.items]);
        setSkip((prev) => prev + response.items.length);
        setHasMore(response.items.length >= ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more bills:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [groupId, hasMore, loadingMore, skip]);

  // Intersection Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreBills();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchMoreBills],
  );

  // Initial load and manual refresh
  useEffect(() => {
    fetchInitialBills();
  }, [fetchInitialBills, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Expenses</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-secondary/20 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Expenses</h2>
      </div>

      <div className="space-y-3">
        {bills.length > 0 ? (
          <>
            {bills.map((bill, index) => {
              const myShare = bill.shares.find(
                (s) => s.user_id === currentUserId
              );
              const isPayer = bill.payer_id === currentUserId;
              const isLastItem = index === bills.length - 1;

              return (
                <div
                  key={bill.id}
                  ref={isLastItem ? lastElementRef : null}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all hover:bg-primary/[0.01]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/80 rounded-xl flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">
                        {bill.description}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        Paid by{" "}
                        <span className="font-semibold text-foreground/80">
                          {isPayer ? "You" : bill.payer_name || "Unknown"}
                        </span>{" "}
                        • {new Date(bill.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {myShare && (
                      <div className="text-right hidden sm:block">
                        <p
                          className={cn(
                            "text-xs font-bold",
                            isPayer ? "text-emerald-500" : "text-rose-500"
                          )}
                        >
                          {isPayer ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              Owed ₹
                              {(
                                bill.total_amount - myShare.amount
                              ).toLocaleString()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDownLeft className="w-3 h-3" />
                              You owe ₹{myShare.amount.toLocaleString()}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">
                          {myShare.is_paid ? "Settled" : "Pending"}
                        </p>
                      </div>
                    )}
                    <div className="text-right min-w-[80px]">
                      <p className="text-base font-black">
                        ₹{bill.total_amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">
                        Total
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!hasMore && bills.length > 0 && (
              <p className="text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest py-8 opacity-40">
                You&apos;ve reached the end
              </p>
            )}
          </>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/5">
            <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              No expenses yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={onAddExpense}
            >
              Add First Expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
