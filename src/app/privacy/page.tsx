import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
	return (
		<div className="flex flex-col min-h-screen bg-white text-black font-sans">
			<Header />
			<main className="flex-grow flex flex-col items-center w-full pb-24">
				{/* Hero Section */}
				<section className="w-full bg-[#f5f5f7] pt-24 pb-20 px-6 text-center border-b border-[#e5e5e7]">
					<div className="max-w-3xl mx-auto flex flex-col items-center">
						<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6">
							Privacy Policy
						</h1>
						<p className="text-sm text-[#86868b] font-light mt-1.5">
							Last Updated: June 14, 2026. Review how Collab collects and secures your data.
						</p>
					</div>
				</section>

				{/* Privacy Policy Content */}
				<section className="w-full max-w-3xl mx-auto mt-16 px-6 text-sm sm:text-base text-neutral-800 leading-relaxed font-sans">
					<div className="flex flex-col gap-10">
						<div>
							<h2 className="text-lg font-semibold text-black mb-3">1. Information We Collect</h2>
							<p className="text-neutral-700 text-xs sm:text-sm mb-3">
								We only collect information necessary to deliver our real-time collaboration services:
							</p>
							<ul className="list-disc list-inside text-neutral-700 text-xs sm:text-sm flex flex-col gap-2 pl-2">
								<li><strong>Account Details:</strong> Your name, email address, and hashed password.</li>
								<li><strong>Project Content:</strong> The canvas coordinates, strokes, and shapes you save.</li>
								<li><strong>Payment Metadata:</strong> Transaction tokens from Stripe or Razorpay (we do not store your credit card details on our servers).</li>
							</ul>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">2. How We Use Your Data</h2>
							<p className="text-neutral-700 text-xs sm:text-sm mb-3">
								Your data is used solely to facilitate collaborative features:
							</p>
							<ul className="list-disc list-inside text-neutral-700 text-xs sm:text-sm flex flex-col gap-2 pl-2">
								<li>To synchronize canvas modifications with other project members in real-time.</li>
								<li>To verify project access permissions before establishing socket connections.</li>
								<li>To process billing tier changes and enforce maximum project counts.</li>
							</ul>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">3. Data Security & Encryption</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								All transmissions between your browser and our servers are encrypted using TLS (HTTPS/WSS). Project canvas snapshots are stored in PostgreSQL database environments with standard security protocols. Access to individual canvases is protected via cryptographic user validation checks at both HTTP and socket levels.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">4. Third-Party Integrations</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								We coordinate with payment processors (Stripe/Razorpay) to verify subscriptions. These providers handle your billing data according to their own strict industry-compliant security policies (PCI-DSS). We do not rent, sell, or distribute your email or workspace content to advertising vendors.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-black mb-3">5. Questions & Feedback</h2>
							<p className="text-neutral-700 text-xs sm:text-sm">
								If you have any questions or feedback regarding this Privacy Policy, please reach out to us via the in-app support portal in your dashboard, start a discussion in our community forum, or wave frantically in our general direction.
							</p>
						</div>


					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
