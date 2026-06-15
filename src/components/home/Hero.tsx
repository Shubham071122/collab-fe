"use client";

import Link from "next/link";
import { Button } from "@/components/common/Button";
import { CollaborationPreview } from "./CollaborationPreview";

export const Hero = () => {
  return (
    <section className="relative w-full bg-white pt-24 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
      <div 
        className="absolute inset-0 bg-[radial-gradient(#e5e5e7_1px,transparent_1px)] [background-size:24px_24px] opacity-55 pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)"
        }}
      />

      <h1 className="animate-fade-up relative z-10 max-w-4xl text-5xl sm:text-7xl font-light text-black tracking-tight leading-[1.08] mb-8 font-sans">
        Collaborate visually. <br />
        <span className="font-semibold">Create together.</span> <br />
        Work in real time.
      </h1>

      <p className="animate-fade-up delay-100 relative z-10 max-w-xl text-base sm:text-lg text-[#737373] font-light leading-relaxed mb-10">
        Collab is a canvas without limits. Share ideas, map architectures, and iterate as a team in real-time, on a platform designed to let creativity flow.
      </p>

      <div className="animate-fade-up delay-200 relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Link href="/signup">
          <Button variant="primary" size="lg" className="w-full sm:w-auto font-medium">
            Start Collaborating
          </Button>
        </Link>
        <Link href="/about">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Learn More
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-5xl mt-16 relative z-10 animate-fade-up delay-300">
        <CollaborationPreview />
      </div>
    </section>
  );
};
export default Hero;
