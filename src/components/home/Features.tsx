import React from "react";
import { Maximize2, Zap, Layout, Users } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white border border-[#e5e5e7] p-8 rounded-2xl flex flex-col items-start text-left hover-apple">
      <div className="w-10 h-10 rounded-lg bg-[#f5f5f7] flex items-center justify-center text-black mb-6 border border-black/5">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-black tracking-tight mb-2.5">
        {title}
      </h3>
      <p className="text-sm text-[#737373] font-light leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const Features = () => {
  const features = [
    {
      icon: <Maximize2 size={18} className="stroke-[1.5]" />,
      title: "Infinite Canvas",
      description: "An infinite digital workspace that expands with your thoughts. Structure mind maps, wireframes, and mood boards without borders.",
    },
    {
      icon: <Zap size={18} className="stroke-[1.5]" />,
      title: "Instant Sync",
      description: "Collaborate in real-time with latency-free synchronizations. Watch edits, selections, and drawings appear instantly.",
    },
    {
      icon: <Layout size={18} className="stroke-[1.5]" />,
      title: "Clean UI Controls",
      description: "Focused tools designed for speed. Minimalistic interface keeps the workspace clean so you can concentrate on creation.",
    },
    {
      icon: <Users size={18} className="stroke-[1.5]" />,
      title: "Team Presence",
      description: "See exactly where your team is looking and editing. Active cursor positioning and user avatars build shared context.",
    },
  ];

  return (
    <section className="w-full bg-white py-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="max-w-2xl text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-light text-black tracking-tight mb-4">
          Everything you need. <span className="font-semibold">Nothing you don't.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#737373] font-light leading-relaxed">
          We stripped away the noise and complex toolbars to focus entirely on visual communication. Clean, efficient, and direct.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {features.map((f, idx) => (
          <FeatureCard
            key={idx}
            icon={f.icon}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </section>
  );
};
export default Features;
