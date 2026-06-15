"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getPlansAction,
  getSubscriptionAction,
  createCheckoutAction,
  verifySubscriptionAction,
  cancelSubscriptionCheckoutAction,
  getTransactionsAction
} from "../../../../actions/subscription.actions";
import { getCurrentUserAction } from "../../../../actions/auth.actions";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import { PlanConfig, SubscriptionTransaction } from "@/types";
import {
  Check,
  Loader2,
  CreditCard,
  Calendar,
  Shield,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BillingPage() {
  const router = useRouter();
  const { user, setUser, subscription, setSubscription, plans, setPlans, clearSession } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);

    const syncSession = async () => {
      const activeUser = await getCurrentUserAction();
      if (!activeUser) {
        clearSession();
        router.push("/login");
        return;
      }
      setUser(activeUser);

      try {
        // Load plans
        const plansRes = await getPlansAction();
        if (plansRes.success && plansRes.data) {
          setPlans(plansRes.data);
        }

        // Load subscription
        const subRes = await getSubscriptionAction();
        if (subRes.success && subRes.data) {
          setSubscription(subRes.data);
        }

        // Load transactions
        const txRes = await getTransactionsAction();
        if (txRes.success && txRes.data) {
          setTransactions(txRes.data);
        }
      } catch (err) {
        console.error("Failed to load billing details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    syncSession();
  }, []);

  const activeTier = subscription?.tier || "free";
  const activeStatus = subscription?.status || "active";

  const handleSubscribe = (tier: string) => {
    if (tier === activeTier) {
      toast.info(`You are already on the ${tier} plan.`);
      return;
    }

    setCheckoutTier(tier);

    startTransition(async () => {
      try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          toast.error("Failed to load payment gateway. Please check your internet connection.");
          setCheckoutTier(null);
          return;
        }

        const res = await createCheckoutAction(tier);
        if (!res.success || !res.data) {
          toast.error(res.message || "Failed to initiate checkout.");
          setCheckoutTier(null);
          return;
        }

        const { subscription_id } = res.data;

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
        if (!keyId) {
          toast.error("Razorpay Key ID is not configured on the frontend.");
          setCheckoutTier(null);
          return;
        }

        const options = {
          key: keyId,
          subscription_id: subscription_id,
          name: "Collab Whiteboard",
          description: `Subscribe to ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
          image: typeof window !== "undefined" ? window.location.origin + "/apple-touch-icon.png" : "",
          handler: async function (response: any) {
            const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = response;
            
            toast.loading("Verifying payment...", { id: "verify-toast" });
            
            try {
              const verifyRes = await verifySubscriptionAction(
                razorpay_subscription_id,
                razorpay_payment_id,
                razorpay_signature
              );
              
              if (verifyRes.success) {
                toast.success(`Subscribed to ${tier} successfully!`, { id: "verify-toast" });
                
                // Refresh data
                const subRes = await getSubscriptionAction();
                if (subRes.success && subRes.data) {
                  setSubscription(subRes.data);
                }

                const txRes = await getTransactionsAction();
                if (txRes.success && txRes.data) {
                  setTransactions(txRes.data);
                }
                
                setCheckoutTier(null);
              } else {
                toast.error(verifyRes.message || "Payment verification failed.", { id: "verify-toast" });
                setCheckoutTier(null);
              }
            } catch (err) {
              toast.error("Verification failed due to a network error.", { id: "verify-toast" });
              setCheckoutTier(null);
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: function () {
              toast.info("Payment cancelled.");
              setCheckoutTier(null);
              cancelSubscriptionCheckoutAction(subscription_id);
              
              // Refresh transaction history to show failed attempt immediately
              getTransactionsAction().then(txRes => {
                if (txRes.success && txRes.data) setTransactions(txRes.data);
              });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (err) {
        toast.error("An unexpected error occurred during checkout initialization.");
        setCheckoutTier(null);
      }
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center min-h-[60vh] bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin h-6 w-6 text-black" />
            <span className="text-xs text-[#737373] tracking-wide capitalize font-medium">
              Loading Billing Dashboard...
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Header />
      
      <main className="flex-grow bg-[#f5f5f7] pb-24">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full animate-fade-in flex flex-col gap-10">
          
          {/* Back button & Title */}
          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold text-[#515154] hover:text-black transition-colors self-start cursor-pointer select-none"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
            <div className="flex flex-col gap-2 border-b border-[#e5e5e7] pb-6">
              <h1 className="text-3xl font-light text-black tracking-tight leading-none mb-1">
                Plans & <span className="font-semibold">Billing</span>
              </h1>
              <p className="text-xs text-[#515154] tracking-wide">
                Manage your subscription, review invoice cycles, and view your billing transaction history.
              </p>
            </div>
          </div>

          {/* Active Plan details overview card */}
          <section className="bg-white border border-[#e5e5e7] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shrink-0 shadow-sm">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-black tracking-tight font-sans capitalize">
                    {activeTier} Plan
                  </h2>
                  <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                    activeStatus === "active"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                      : "text-red-600 bg-red-50 border-red-200"
                  }`}>
                    {activeStatus}
                  </span>
                </div>
                <p className="text-xs text-[#515154] mt-1 font-light font-sans">
                  {activeTier === "free"
                    ? "Basic whiteboard features with standard project limits."
                    : activeTier === "silver"
                    ? "Up to 5 active whiteboard boards and team collaborators."
                    : "Unlimited Whiteboard projects and unlimited collaborators."}
                </p>
              </div>
            </div>

            <div className="flex gap-8 sm:gap-12 shrink-0 w-full md:w-auto border-t md:border-t-0 border-[#f5f5f7] pt-6 md:pt-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-medium font-sans">Price</span>
                <span className="text-base font-semibold text-black font-sans">
                  ₹{activeTier === "gold" ? 10 : activeTier === "silver" ? 5 : 0}
                  <span className="text-xs text-[#86868b] font-light">/mo</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-medium font-sans">
                  {activeTier === "free" ? "Created At" : "Next Billing"}
                </span>
                <span className="text-base font-semibold text-black font-sans flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#86868b]" />
                  {activeTier === "free"
                    ? formatDate(subscription?.created_at)
                    : formatDate(subscription?.current_period_end)}
                </span>
              </div>
            </div>
          </section>

          {/* Pricing cards selector */}
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-black font-sans">Available Plans</h2>
              <p className="text-xs text-[#515154] mt-1 font-sans">Select a plan tier below to modify your limits.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
              {plans.map((plan) => {
                const isActive = plan.id === activeTier;
                const isCheckingOutThis = checkoutTier === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                      isActive 
                        ? "border-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.04)]" 
                        : "border-[#e5e5e7] hover:border-neutral-300 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-base text-black font-sans">{plan.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2 py-0.5 rounded-full border border-black/5">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mb-4 flex items-baseline gap-0.5">
                        <span className="text-3xl font-semibold text-black tracking-tight font-sans">
                          ₹{plan.price_in_rs}
                        </span>
                        <span className="text-xs text-[#86868b] font-sans">/month</span>
                      </div>

                      <p className="text-xs text-[#515154] font-light leading-relaxed mb-6 border-b border-[#f5f5f7] pb-4 font-sans min-h-[48px]">
                        {plan.description}
                      </p>

                      <div className="flex flex-col gap-3.5 mb-8">
                        <div className="flex items-center gap-2.5">
                          <Check size={14} className="text-neutral-800 shrink-0" />
                          <span className="text-xs text-neutral-800 font-sans">
                            {plan.max_projects === -1 ? (
                              "Unlimited projects"
                            ) : (
                              <span>Up to <strong>{plan.max_projects}</strong> projects</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Check size={14} className="text-neutral-800 shrink-0" />
                          <span className="text-xs text-neutral-800 font-sans">
                            {plan.max_shares === -1 ? (
                              "Unlimited collaborators"
                            ) : (
                              <span>Up to <strong>{plan.max_shares}</strong> collaborators</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Check size={14} className="text-[#515154] shrink-0" />
                          <span className="text-xs text-[#515154] font-sans">
                            Real-time socket sync
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isActive ? "outline" : "primary"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isActive || isPending}
                      className={`w-full flex items-center justify-center gap-2 h-9 py-0 text-xs font-medium rounded-full transition-all ${
                        isActive 
                          ? "bg-transparent border-[#e5e5e7] text-neutral-400 cursor-default" 
                          : "bg-neutral-900 hover:bg-neutral-800 text-white border-transparent"
                      }`}
                    >
                      {isActive ? (
                        <span>Active</span>
                      ) : isCheckingOutThis ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Upgrade to {plan.name}</span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Billing Transactions history */}
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-black font-sans">Invoice Ledger</h2>
              <p className="text-xs text-[#515154] mt-1 font-sans">A historical log of your account payments and invoice receipts.</p>
            </div>

            <div className="bg-white border border-[#e5e5e7] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-10 h-10 bg-[#f5f5f7] border border-black/5 rounded-xl flex items-center justify-center text-[#86868b] mb-4">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-black mb-1">No transaction records</h3>
                  <p className="text-xs text-[#86868b] max-w-xs font-light leading-relaxed">
                    Once you subscribe or renew your plans, your monthly transaction receipts will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#f5f5f7] text-[10px] uppercase font-semibold text-[#515154] tracking-wider font-sans bg-[#fafafa]">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Payment ID / Transaction ID</th>
                        <th className="py-4 px-6">Description</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="text-xs text-neutral-800 font-sans hover:bg-[#fafafa]/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-black">
                            {formatDate(tx.created_at)}
                          </td>
                          <td className="py-4 px-6 font-mono text-[#86868b] text-[10px]">
                            {tx.payment_id || <span className="italic text-[#c81e1e]/60 font-sans">cancelled</span>}
                          </td>
                          <td className="py-4 px-6 text-neutral-500 font-light">
                            {tx.billing_reason === "subscription.charged" || tx.billing_reason === "subscription.created"
                              ? `Recurring Plan Charge`
                              : tx.billing_reason === "user_cancelled"
                              ? "Checkout Abandoned"
                              : tx.billing_reason === "silver"
                              ? "Silver Subscription Checkout"
                              : tx.billing_reason === "gold"
                              ? "Gold Subscription Checkout"
                              : tx.billing_reason}
                          </td>
                          <td className="py-4 px-6 font-semibold text-black">
                            ₹{(tx.amount / 100).toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              tx.status === "captured"
                                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                                : tx.status === "failed"
                                ? "text-red-600 bg-red-50 border-red-100"
                                : "text-amber-700 bg-amber-50 border-amber-100"
                            }`}>
                              {tx.status === "captured" ? (
                                <><CheckCircle2 size={10} className="stroke-[2.5]" /> Captured</>
                              ) : tx.status === "failed" ? (
                                <><XCircle size={10} className="stroke-[2.5]" /> Failed</>
                              ) : (
                                <><Clock size={10} className="stroke-[2.5]" /> Created</>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
