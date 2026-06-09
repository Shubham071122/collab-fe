import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sparkles, Compass, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-grow flex flex-col items-center w-full">
        <section className="w-full bg-[#f5f5f7] pt-24 pb-20 px-6 text-center border-b border-[#e5e5e7]">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="px-3.5 py-1 text-[10px] font-semibold tracking-widest text-[#737373] uppercase bg-white border border-black/5 rounded-full mb-6 select-none">
              Our Philosophy
            </span>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-black mb-8 leading-tight">
              Designing space for <br />
              <span className="font-semibold">shared imagination.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#737373] font-light leading-relaxed max-w-xl">
              Collab was born from a simple observation: the tools teams use to brainstorm together have become bloated, sluggish, and overly complex. We built a canvas that puts ideas first.
            </p>
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light text-black tracking-tight mb-6 leading-snug">
              What is <span className="font-semibold">Collab?</span>
            </h2>
            <p className="text-sm text-[#737373] font-light leading-relaxed mb-6">
              Collab is a real-time, visual workspace designed to streamline collaboration. It operates as an infinite whiteboard where designers, engineers, product managers, and clients can gather to organize notes, draw system boundaries, plan sprints, or layout boards.
            </p>
            <p className="text-sm text-[#737373] font-light leading-relaxed">
              By merging sub-millisecond real-time sync with an incredibly clean, clutter-free interface, Collab lets teams visualize complex architectures and workflows together as if they were standing at the same physical board.
            </p>
          </div>

          <div className="bg-[#f5f5f7] border border-[#e5e5e7] p-8 rounded-3xl flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              Core Tenets
            </h3>
            <ul className="flex flex-col gap-4 text-xs text-[#737373] tracking-wide">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                <span><strong className="font-semibold text-black">Zero Friction</strong>: No loading screens, no heavy tools. Instant startup.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                <span><strong className="font-semibold text-black">Light Mode Design</strong>: Clean white surfaces and dark details create an workspace that mirrors physical sketching paper.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                <span><strong className="font-semibold text-black">Unbounded Power</strong>: Infinite scale allows board assets to grow infinitely without browser slowdown.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="w-full bg-[#f5f5f7] py-24 px-6 border-t border-b border-[#e5e5e7]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div>
              <div className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e7] flex items-center justify-center text-black mb-6">
                <Compass size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-black tracking-tight mb-3">
                Why it exists
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] font-light leading-relaxed">
                Most whiteboard products feel like spreadsheets or bloated visual editors. We wanted to build a canvas that mimics physical design rooms—clean, spacious, encouraging visual experimentation without tool overload.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e7] flex items-center justify-center text-black mb-6">
                <Lightbulb size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-black tracking-tight mb-3">
                Focus on Ideas
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] font-light leading-relaxed">
                By maintaining a pure grayscale design system, we ensure the colors you add to the board—like sticky note categorizations or markup strokes—actually pop and carry meaning rather than getting lost in UI clutter.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 rounded-lg bg-white border border-[#e5e5e7] flex items-center justify-center text-black mb-6">
                <Sparkles size={15} className="stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-black tracking-tight mb-3">
                Realtime Synchronicity
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] font-light leading-relaxed">
                Shared mouse coordinates, layout sync, and chat presence create a sense of true companionship. Remote teams align in real-time, eliminating redundant review cycles.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto py-24 px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-black tracking-tight mb-12">
            The power of <span className="font-semibold">visual collaboration.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            <div className="p-6 border border-[#e5e5e7] rounded-2xl bg-white hover-apple">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-2">Benefit 01</span>
              <h3 className="text-base font-semibold text-black mb-2.5">Align Remote Teams</h3>
              <p className="text-xs text-[#737373] font-light leading-relaxed">
                Bridge the timezone gap. Sketch layouts, architectures, and customer flows on a board that updates instantly.
              </p>
            </div>
            <div className="p-6 border border-[#e5e5e7] rounded-2xl bg-white hover-apple">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-2">Benefit 02</span>
              <h3 className="text-base font-semibold text-black mb-2.5">Faster Design Handoffs</h3>
              <p className="text-xs text-[#737373] font-light leading-relaxed">
                Explain wireframe hierarchies visually. Embed notes, draw logical flow connectors, and receive comments directly.
              </p>
            </div>
            <div className="p-6 border border-[#e5e5e7] rounded-2xl bg-white hover-apple">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-2">Benefit 03</span>
              <h3 className="text-base font-semibold text-black mb-2.5">Clearer Strategic Mapping</h3>
              <p className="text-xs text-[#737373] font-light leading-relaxed">
                Connect the dots of your Q3 projects. Organically expand ideas from a simple concept node to detailed specifications.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
