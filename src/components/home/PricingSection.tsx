"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/common/Button";

export const PricingSection = () => {
  const { user, subscription } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTier = mounted && subscription?.tier ? subscription.tier : "free";
  const isLoggedIn = mounted && !!user;

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      description: "Get started with up to 2 projects and share with 2 collaborators.",
      features: [
        "Up to 2 projects",
        "Up to 2 collaborators per project",
        "Infinite collaborative canvas",
        "Real-time socket sync",
      ],
    },
    {
      id: "silver",
      name: "Silver",
      price: "5",
      description: "Scale up with up to 5 projects and share with 5 collaborators.",
      features: [
        "Up to 5 projects",
        "Up to 5 collaborators per project",
        "Infinite collaborative canvas",
        "Real-time socket sync",
        "Priority project access",
      ],
    },
    {
      id: "gold",
      name: "Gold",
      price: "10",
      description: "Unlock full capability with unlimited projects and collaborators.",
      features: [
        "Unlimited projects",
        "Unlimited collaborators",
        "Infinite collaborative canvas",
        "Real-time socket sync",
        "Priority premium support",
      ],
    },
  ];

  return (
    <section className="w-full bg-white py-24 px-6 max-w-7xl mx-auto flex flex-col items-center border-t border-[#e5e5e7]">
      {/* Title */}
      <div className="max-w-2xl text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-light text-black tracking-tight mb-4">
          Simple pricing. <span className="font-semibold">Built for teams.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#737373] font-light leading-relaxed">
          Choose a plan that fits your collaboration scale. Switch or cancel any time right from your dashboard settings.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
        {plans.map((plan) => {
          const isActive = isLoggedIn && plan.id === activeTier;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border hover-apple ${
                isActive
                  ? "border-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                  : "border-[#e5e5e7] hover:border-neutral-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-lg text-black">{plan.name}</span>
                  {isActive && (
                    <span className="text-[10px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-black/5 select-none">
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="mb-4 flex items-baseline gap-0.5">
                  <span className="text-3xl font-semibold text-black tracking-tight font-sans">
                    ₹{plan.price}
                  </span>
                  <span className="text-xs text-[#86868b]">/month</span>
                </div>

                <p className="text-xs text-[#86868b] font-light leading-relaxed mb-6 border-b border-[#f5f5f7] pb-4 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Checklist */}
                <div className="flex flex-col gap-3.5 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-left">
                      <Check size={14} className="text-neutral-800 shrink-0 stroke-[2.5]" />
                      <span className="text-xs text-neutral-800 font-sans font-light">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant={isActive ? "outline" : "primary"}
                    className={`w-full flex items-center justify-center gap-2 h-10 py-0 text-xs font-semibold rounded-full transition-all ${
                      isActive
                        ? "bg-transparent border-[#e5e5e7] text-neutral-400 cursor-default"
                        : "bg-neutral-900 hover:bg-neutral-800 text-white border-transparent"
                    }`}
                  >
                    {isActive ? "Active" : "Go to Dashboard"}
                  </Button>
                </Link>
              ) : (
                <Link href="/signup" className="w-full">
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 h-10 py-0 text-xs font-semibold rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border-transparent"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
