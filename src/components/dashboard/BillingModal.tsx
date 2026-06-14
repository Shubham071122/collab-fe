"use client";

import React, { useEffect, useState, useTransition } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getPlansAction, getSubscriptionAction, updateSubscriptionAction } from "../../../actions/subscription.actions";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import { PlanConfig } from "@/types";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingModal = ({ isOpen, onClose }: BillingModalProps) => {
  const { subscription, setSubscription, plans, setPlans } = useAppStore();
  const [localPlans, setLocalPlans] = useState<PlanConfig[]>(plans);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(plans.length === 0);
      try {
        const plansRes = await getPlansAction();
        if (plansRes.success && plansRes.data) {
          setPlans(plansRes.data);
          setLocalPlans(plansRes.data);
        }

        const subRes = await getSubscriptionAction();
        if (subRes.success && subRes.data) {
          setSubscription(subRes.data);
        }
      } catch (err) {
        console.error("Failed to load subscription data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, plans.length, setPlans, setSubscription]);

  if (!isOpen) return null;

  const activeTier = subscription?.tier || "free";

  const handleSubscribe = (tier: string) => {
    if (tier === activeTier) {
      toast.info(`You are already on the ${tier} plan.`);
      return;
    }

    setCheckoutTier(tier);

    startTransition(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const res = await updateSubscriptionAction(tier);
        if (res.success && res.data) {
          setSubscription(res.data);
          toast.success(`Plan updated to ${tier} successfully!`);
          setCheckoutTier(null);
          setTimeout(() => {
            onClose();
          }, 400);
        } else {
          toast.error(res.message || "Failed to update plan.");
          setCheckoutTier(null);
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
        setCheckoutTier(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/15 backdrop-blur-[4px] animate-fade-in">
      <div className="w-full max-w-4xl bg-white border border-[#e5e5e7] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-start justify-between bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-semibold text-black tracking-tight font-sans">
              Choose your plan
            </h2>
            <p className="text-xs text-[#86868b] mt-1.5 font-sans">
              Switch or cancel plans at any time. Limits are managed automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-[#86868b] hover:text-black p-2 hover:bg-[#f5f5f7] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-8 pb-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 text-black animate-spin" />
              <span className="text-xs text-[#86868b] font-medium tracking-wide">
                Loading plans...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
              {localPlans.map((plan) => {
                const isActive = plan.id === activeTier;
                const isCheckingOutThis = checkoutTier === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                      isActive 
                        ? "border-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.04)]" 
                        : "border-[#e5e5e7] hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      {/* Plan Title & Current Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-lg text-black font-sans">{plan.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2 py-0.5 rounded-full border border-black/5">
                            Current plan
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-4 flex items-baseline gap-0.5">
                        <span className="text-3xl font-semibold text-black tracking-tight font-sans">
                          ₹{plan.price_in_rs}
                        </span>
                        <span className="text-xs text-[#86868b] font-sans">/month</span>
                      </div>

                      <p className="text-xs text-[#86868b] font-light leading-relaxed mb-6 border-b border-[#f5f5f7] pb-4 font-sans">
                        {plan.description}
                      </p>

                      {/* Limits / Features */}
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
                          <Check size={14} className="text-[#86868b] shrink-0" />
                          <span className="text-xs text-[#86868b] font-sans">
                            Real-time socket sync
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
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
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Choose {plan.name}</span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#e5e5e7] bg-white flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-[#86868b] tracking-wide shrink-0">
          <span className="font-sans">Secure payment processing simulated</span>
          <span className="font-sans">Prices in Indian Rupees (INR)</span>
        </div>

      </div>
    </div>
  );
};
export default BillingModal;

