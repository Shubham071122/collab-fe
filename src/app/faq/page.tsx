"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown } from "lucide-react";

interface FAQItem {
	question: string;
	answer: string;
	category: string;
}

const FAQS: FAQItem[] = [
	{
		category: "General",
		question: "What is Collab?",
		answer: "Collab is a real-time collaborative workspace and infinite whiteboard. It allows designers, developers, and product teams to sketch system designs, plan project sprints, and organize brainstorm layouts synchronously with sub-millisecond updates.",
	},
	{
		category: "Billing",
		question: "How do the limits work on the Free Plan?",
		answer: "Under the Free Plan, you can own up to 2 active projects. You can also invite up to 2 unique collaborators per project. If you need to create more projects or share with larger teams, you can upgrade to Silver (up to 5 projects/collaborators) or Gold (unlimited projects/collaborators).",
	},
	{
		category: "Billing",
		question: "What happens if my subscription expires or is canceled?",
		answer: "If your subscription expires (e.g., payment failure) or you cancel, your account is downgraded back to the Free plan. We never delete your data. However, if you have more than 2 projects, all of your projects will be placed in a secure 'Read-only' mode. You can view all of your work, but you cannot edit existing projects or create new ones until you upgrade or delete excess projects to get back under the limit.",
	},
	{
		category: "Billing",
		question: "Can my collaborators edit my projects if my plan expires?",
		answer: "No. Project limits and locks are always tied to the owner of the project. If the owner's subscription expires, the project is locked to 'Read-only' for everyone—including collaborators. This guarantees fair usage and consistent data integrity.",
	},
	{
		category: "General",
		question: "Is there a limit on how many shapes or pages I can create?",
		answer: "No. Our whiteboards are completely infinite and performance-optimized. You can create as many nodes, shapes, drawings, and notes as you need without hitting any scale limitations. However, each project is capped at 1 whiteboard page to preserve board structure.",
	},
	{
		category: "Billing",
		question: "What payment options are supported?",
		answer: "Collab supports secure recurring subscriptions and manual card payments through Stripe and Razorpay integrations. You can switch or cancel plans at any time directly from your Billing settings.",
	},
];

export default function FAQPage() {
	const [activeIdx, setActiveIdx] = useState<number | null>(null);

	const toggleFAQ = (idx: number) => {
		setActiveIdx(activeIdx === idx ? null : idx);
	};

	return (
		<div className="flex flex-col min-h-screen bg-white text-black font-sans">
			<Header />
			<main className="flex-grow flex flex-col items-center w-full pb-24">
				{/* Hero Section */}
				<section className="w-full bg-[#f5f5f7] pt-24 pb-20 px-6 text-center border-b border-[#e5e5e7]">
					<div className="max-w-3xl mx-auto flex flex-col items-center">
						<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6 font-sans">
							Frequently Asked Questions
						</h1>
						<p className="text-sm text-[#86868b] font-light leading-relaxed max-w-lg">
							Everything you need to know about Collab plans, project limits, collaboration features, and subscription states.
						</p>
					</div>
				</section>

				{/* FAQ Accordion Section */}
				<section className="w-full max-w-3xl mx-auto mt-20 px-6">
					<div className="flex flex-col gap-4">
						{FAQS.map((faq, idx) => {
							const isOpen = activeIdx === idx;
							return (
								<div
									key={idx}
									className="border border-[#e5e5e7] rounded-2xl overflow-hidden transition-all duration-300 hover:border-neutral-300 bg-white"
								>
									<button
										onClick={() => toggleFAQ(idx)}
										className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
									>
										<div className="flex items-center min-w-0">
											<span className="text-sm font-medium text-black truncate pr-4">
												{faq.question}
											</span>
										</div>
										<ChevronDown
											size={16}
											className={`text-[#86868b] transition-transform duration-300 ${
												isOpen ? "transform rotate-180" : ""
											}`}
										/>
									</button>

									<div
										className={`transition-all duration-300 ease-in-out ${
											isOpen ? "max-h-[300px] border-t border-[#f5f5f7]" : "max-h-0"
										} overflow-hidden`}
									>
										<div className="p-6 text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed bg-[#fafafa]">
											{faq.answer}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
