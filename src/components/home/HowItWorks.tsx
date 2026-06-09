import React from "react";

interface StepProps {
  number: string;
  title: string;
  description: string;
}

const Step = ({ number, title, description }: StepProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start py-8 border-t border-[#e5e5e7] w-full last:border-b last:border-[#e5e5e7]">
      <span className="text-3xl sm:text-4xl font-light text-[#c7c7cc] tracking-tight font-display w-16 select-none">
        {number}
      </span>
      <div className="flex-1">
        <h3 className="text-lg font-medium text-black tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#737373] font-light leading-relaxed max-w-xl">
          {description}
        </p>
      </div>
    </div>
  );
};

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create a Space",
      description: "Initialize a new project from your dashboard in one click. Give it a title and open up the canvas immediately. No initial setup, configuration, or templates required.",
    },
    {
      number: "02",
      title: "Share the Canvas Link",
      description: "Invite your teammates, designers, or external clients. Drop in email addresses from the top share panel to grant immediate viewing or editing rights.",
    },
    {
      number: "03",
      title: "Ideate, Iterate, and Refine",
      description: "Work in real-time on sticky notes, wireframes, architectures, and mood boards. See collaborator mouse inputs instantly, avoiding design misunderstandings.",
    },
  ];

  return (
    <section className="w-full bg-[#f5f5f7] py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        <div className="lg:w-1/3 lg:sticky lg:top-24 flex flex-col items-start">
          <div className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#737373] uppercase bg-white border border-black/5 rounded-full mb-6 select-none">
            Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-black tracking-tight mb-4 text-left leading-tight">
            How it works. <br />
            <span className="font-semibold">Simple and fast.</span>
          </h2>
          <p className="text-sm text-[#737373] font-light leading-relaxed text-left max-w-sm">
            We designed Collab to be completely frictionless. You are never more than three seconds away from working with your team.
          </p>
        </div>

        <div className="flex-1 w-full flex flex-col">
          {steps.map((s, idx) => (
            <Step
              key={idx}
              number={s.number}
              title={s.title}
              description={s.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
