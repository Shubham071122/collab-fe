"use client";

import React, { useState, useEffect } from "react";
import { MousePointer2, Sparkles } from "lucide-react";

interface MockCursor {
  name: string;
  color: string;
  x: number;
  y: number;
}

export const CollaborationPreview = () => {
  // Setup coordinates for 3 mock users
  const [cursors, setCursors] = useState<MockCursor[]>([
    { name: "Sarah Chen", color: "#3b82f6", x: 200, y: 150 },
    { name: "Marcus", color: "#10b981", x: 450, y: 250 },
    { name: "Julia R.", color: "#8b5cf6", x: 600, y: 120 },
  ]);

  // Animate mock cursors in smooth circles or patterns
  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.03;
      setCursors((prev) => [
        {
          ...prev[0],
          x: 220 + Math.cos(angle) * 70,
          y: 160 + Math.sin(angle * 1.5) * 40,
        },
        {
          ...prev[1],
          x: 460 + Math.sin(angle * 0.8) * 80,
          y: 280 + Math.cos(angle * 1.2) * 50,
        },
        {
          ...prev[2],
          x: 650 + Math.cos(angle * 1.1) * 90,
          y: 140 + Math.sin(angle * 0.7) * 45,
        },
      ]);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-white py-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="max-w-2xl text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-light text-black tracking-tight mb-4">
          Experience <span className="font-semibold">visual fluidity.</span>
        </h2>
        <p className="text-sm text-[#737373] font-light leading-relaxed">
          Watch your workspace come to life. Teams from Apple, Stripe, and Airbnb align ideas inside real-time interactive canvases.
        </p>
      </div>

      {/* Simulated Board Frame */}
      <div className="w-full max-w-5xl h-[420px] bg-white border border-[#e5e5e7] rounded-3xl relative overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.03)] group select-none">
        {/* Whiteboard grid dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e7_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-75" />

        {/* Board Items */}
        {/* Sticky Note 1 */}
        <div className="absolute top-[80px] left-[60px] sm:left-[100px] w-[140px] h-[140px] bg-[#fdfdf0] border border-[#f5ecb8] p-4 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] rotate-[-2deg] transition-all duration-300 hover:rotate-0 hover:shadow-md">
          <p className="text-xs text-black/80 font-normal leading-relaxed font-sans">
            Finalize onboarding screens & user flow
          </p>
          <span className="text-[9px] font-bold text-[#c2b04c] tracking-wider uppercase">
            In Progress
          </span>
        </div>

        {/* Sticky Note 2 */}
        <div className="absolute bottom-[60px] right-[80px] sm:right-[150px] w-[140px] h-[140px] bg-[#f6fbf7] border border-[#d2edd7] p-4 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.03)] rotate-[3deg] transition-all duration-300 hover:rotate-0 hover:shadow-md">
          <p className="text-xs text-black/80 font-normal leading-relaxed">
            Review design tokens with frontend engineers
          </p>
          <span className="text-[9px] font-bold text-[#459e59] tracking-wider uppercase">
            Up Next
          </span>
        </div>

        {/* Minimal Circle / Shapes */}
        <div className="absolute top-[160px] left-[320px] sm:left-[380px] w-[110px] h-[110px] rounded-full border border-black/10 flex items-center justify-center bg-white shadow-sm transition-transform duration-500 hover:scale-105">
          <div className="text-center">
            <span className="text-xs font-semibold text-black">V1 Launch</span>
            <span className="block text-[8px] text-[#737373] mt-0.5 font-light">July 2026</span>
          </div>
        </div>

        {/* Connections (SVG dashed line) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="220"
            y1="150"
            x2="380"
            y2="215"
            stroke="#c7c7cc"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="490"
            y1="215"
            x2="600"
            y2="280"
            stroke="#c7c7cc"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Simulated Active Selection Box */}
        <div className="absolute top-[154px] left-[314px] sm:left-[374px] w-[122px] h-[122px] border border-blue-500 rounded-full pointer-events-none opacity-40">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500" />
        </div>

        {/* Live Indicator Badges */}
        <div className="absolute top-4 left-4 flex gap-1.5 items-center bg-white/95 border border-[#e5e5e7] px-3 py-1.5 rounded-full shadow-sm text-[10px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>3 USERS ACTIVE</span>
        </div>

        {/* Mock Cursors */}
        {cursors.map((cursor, idx) => (
          <div
            key={idx}
            className="absolute transition-transform duration-75 pointer-events-none z-30"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
            }}
          >
            <MousePointer2
              size={18}
              fill={cursor.color}
              stroke="white"
              strokeWidth={1.5}
              className="drop-shadow-sm rotate-[-85deg]"
              style={{ color: cursor.color }}
            />
            <div
              className="absolute top-4 left-3 px-2 py-0.5 text-[9px] font-medium text-white tracking-wider rounded-md rounded-tl-none shadow-sm whitespace-nowrap animate-cursor-pulse"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default CollaborationPreview;
