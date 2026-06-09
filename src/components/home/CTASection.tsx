import Link from "next/link";
import { Button } from "@/components/common/Button";

export const CTASection = () => {
  return (
    <section className="w-full bg-white py-28 px-6 text-center border-t border-[#e5e5e7] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#f5f5f7_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-60 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl font-light text-black tracking-tight mb-6 max-w-xl leading-tight">
          Bring your team’s thoughts <span className="font-semibold">to life.</span>
        </h2>
        
        <p className="text-sm sm:text-base text-[#737373] font-light leading-relaxed mb-10 max-w-md">
          Start collaborating visually in real-time. Create infinite boards, invite guests, and brainstorm without limitations.
        </p>

        <Link href="/signup" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto px-10">
            Start Collaborating
          </Button>
        </Link>
      </div>
    </section>
  );
};
export default CTASection;
