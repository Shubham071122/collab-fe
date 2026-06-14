import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Compass } from "lucide-react";

export default function TermsPage() {
	return (
		<div className="flex flex-col min-h-screen bg-white text-black font-sans">
			<Header />
			<main className="flex-grow flex flex-col items-center w-full pb-24">
				{/* Hero Section */}
				<section className="w-full bg-[#f5f5f7] pt-24 pb-20 px-6 text-center border-b border-[#e5e5e7]">
					<div className="max-w-3xl mx-auto flex flex-col items-center">
						<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6">
							Terms of Service
						</h1>
						<p className="text-sm text-[#86868b] font-light mt-1.5">
							Last Updated: June 14, 2026. Review our terms of use and project subscription agreements.
						</p>
					</div>
				</section>

				{/* Terms of Service Content */}
				<section className="w-full max-w-3xl mx-auto mt-16 px-6 text-sm sm:text-base text-neutral-800 leading-relaxed font-sans">
					<div className="flex flex-col gap-10">
						<div>
							<h2 className="text-lg font-semibold text-black mb-3">1. Agreement to Terms</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								By registering an account and using Collab's whiteboards, collaborative sockets, and document features, you agree to be bound by these terms. If you do not agree to these terms, you are not authorized to use the platform.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">2. Account Registration & Safety</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								To access our whiteboard tools, you must register a verified email. You are responsible for safeguarding your login password. Collab will not be held responsible for unauthorized project edits resulting from shared passwords.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">3. Subscription Tiers & Billing Limits</h2>
							<p className="text-neutral-700 text-xs sm:text-sm mb-3">
								Collab provides varying limits based on your active billing tier (Free, Silver, Gold).
							</p>
							<ul className="list-disc list-inside text-neutral-700 text-xs sm:text-sm flex flex-col gap-2 pl-2">
								<li>Free tier provides up to 2 owned projects and 2 collaborators per project.</li>
								<li>Silver tier (Rs 100/mo) provides up to 5 owned projects and 5 collaborators.</li>
								<li>Gold tier (Rs 200/mo) provides unlimited projects and collaborators.</li>
								<li>If your plan expires or downgrades, all excess projects are locked into <strong>Read-Only Mode</strong> until the limit is resolved. We do not delete your projects automatically on downgrade.</li>
							</ul>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">4. Intellectual Property</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								You retain complete ownership and intellectual property rights over all drawings, wireframes, flowcharts, and text documents you save to Collab. We do not claim any ownership over your workspace files.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">5. Disclaimer of Warranties</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								Collab is provided on an 'as-is' and 'as-available' basis. While we strive to maintain 99.9% socket connection uptime, we make no guarantees of uninterrupted service, data permanence, or sub-millisecond drawing synchronization under all networking circumstances.
							</p>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
