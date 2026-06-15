"use client";

import React, { useState, useEffect } from "react";
import { MousePointer2, Hand, Square, Circle, Type, StickyNote } from "lucide-react";

interface MockCursor {
  name: string;
  color: string;
  x: number;
  y: number;
}

export const CollaborationPreview = () => {
  // Setup coordinates for 3 mock users orbiting their selected elements
  const [cursors, setCursors] = useState<MockCursor[]>([
    { name: "Sarah Chen", color: "#3b82f6", x: 180, y: 150 },
    { name: "Marcus", color: "#10b981", x: 440, y: 200 },
    { name: "Julia R.", color: "#8b5cf6", x: 740, y: 240 },
  ]);

  // Animate mock cursors in smooth circles or patterns around their items
  useEffect(() => {
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.025;
      setCursors((prev) => [
        {
          ...prev[0],
          x: 180 + Math.cos(angle) * 55,
          y: 150 + Math.sin(angle * 1.3) * 40,
        },
        {
          ...prev[1],
          x: 440 + Math.sin(angle * 0.9) * 50,
          y: 200 + Math.cos(angle * 1.1) * 40,
        },
        {
          ...prev[2],
          x: 740 + Math.cos(angle * 1.2) * 55,
          y: 240 + Math.sin(angle * 0.8) * 40,
        },
      ]);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes preview-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-preview-dash {
          animation: preview-dash 2s linear infinite;
        }
      `}</style>

      {/* Simulated Board Frame */}
      <div className="w-full max-w-5xl h-[420px] bg-[#fafafa] border border-[#e5e5e7] rounded-3xl relative overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.03)] group select-none">
        {/* Whiteboard grid dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e7_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-75" />

        {/* Connections (SVG animated dashed line) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="260"
            y1="150"
            x2="380"
            y2="200"
            stroke="#c7c7cc"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-preview-dash"
          />
          <line
            x1="500"
            y1="200"
            x2="660"
            y2="240"
            stroke="#c7c7cc"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-preview-dash"
          />
        </svg>

        {/* Board Items */}
        {/* Sticky Note 1 (Sarah Chen's selection) */}
        <div className="absolute top-[70px] left-[100px] w-[160px] h-[160px] bg-[#fef9c3] border border-[#fef08a] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl rotate-[-2deg] transition-all duration-300 hover:rotate-0 hover:shadow-lg select-none">
          <p className="text-xs font-normal text-yellow-950 leading-relaxed font-sans">
            Finalize onboarding screens & user flow
          </p>
          <span className="text-[9px] font-bold text-yellow-700 tracking-wider uppercase">
            In Progress
          </span>
        </div>

        {/* Selection Box: Sarah Chen */}
        <div className="absolute top-[66px] left-[96px] w-[168px] h-[168px] border border-[#3b82f6] rounded-[18px] pointer-events-none z-10 select-none">
          <span className="absolute -top-4.5 left-0 bg-[#3b82f6] text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md shadow-sm select-none tracking-wide">
            Sarah Chen
          </span>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#3b82f6]" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#3b82f6]" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#3b82f6]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#3b82f6]" />
        </div>

        {/* Center Circle: V1 Launch (Marcus's selection) */}
        <div className="absolute top-[140px] left-[380px] w-[120px] h-[120px] rounded-full border border-neutral-200 flex items-center justify-center bg-white shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-transform duration-500 hover:scale-105 select-none z-10">
          <div className="text-center">
            <span className="text-xs font-semibold text-black font-sans tracking-tight">V1 Launch</span>
            <span className="block text-[8px] text-[#86868b] mt-1 font-light font-sans">July 2026</span>
          </div>
        </div>

        {/* Selection Box: Marcus */}
        <div className="absolute top-[136px] left-[376px] w-[128px] h-[128px] border border-[#10b981] rounded-full pointer-events-none z-10 select-none">
          <span className="absolute -top-4.5 left-2 bg-[#10b981] text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md shadow-sm select-none tracking-wide">
            Marcus
          </span>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#10b981]" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#10b981]" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#10b981]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#10b981]" />
        </div>

        {/* Sticky Note 2 (Julia R.'s selection) */}
        <div className="absolute top-[160px] left-[660px] w-[160px] h-[160px] bg-[#dcfce7] border border-[#bbf7d0] p-5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl rotate-[3deg] transition-all duration-300 hover:rotate-0 hover:shadow-lg select-none">
          <p className="text-xs font-normal text-green-950 leading-relaxed font-sans">
            Review design tokens with frontend engineers
          </p>
          <span className="text-[9px] font-bold text-green-700 tracking-wider uppercase">
            Up Next
          </span>
        </div>

        {/* Selection Box: Julia R. */}
        <div className="absolute top-[156px] left-[656px] w-[168px] h-[168px] border border-[#8b5cf6] rounded-[18px] pointer-events-none z-10 select-none">
          <span className="absolute -top-4.5 left-0 bg-[#8b5cf6] text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md shadow-sm select-none tracking-wide">
            Julia R.
          </span>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#8b5cf6]" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#8b5cf6]" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#8b5cf6]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#8b5cf6]" />
        </div>

        {/* Live Indicator Badges */}
        <div className="absolute top-4 left-4 flex gap-1.5 items-center bg-white border border-[#e5e5e7] px-3.5 py-1.5 rounded-full shadow-sm text-[10px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-neutral-700 font-sans">3 active collaborators</span>
        </div>

        {/* Floating Tool Bar (Miro / Excalidraw Style) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 border border-[#e5e5e7] px-3.5 py-1.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex items-center gap-3 z-40 text-neutral-800 backdrop-blur-md select-none animate-fade-in shrink-0">
          <div className="p-1 hover:bg-[#f5f5f7] rounded-lg cursor-pointer text-black transition-colors" title="Select"><MousePointer2 size={13} className="stroke-[2]" /></div>
          <div className="p-1 hover:bg-[#f5f5f7] rounded-lg cursor-pointer text-neutral-400 transition-colors" title="Hand"><Hand size={13} className="stroke-[1.5]" /></div>
          <div className="p-1 hover:bg-[#f5f5f7] rounded-lg cursor-pointer text-neutral-400 transition-colors" title="Rectangle"><Square size={13} className="stroke-[1.5]" /></div>
          <div className="p-1 hover:bg-[#f5f5f7] rounded-lg cursor-pointer text-neutral-400 transition-colors" title="Circle"><Circle size={13} className="stroke-[1.5]" /></div>
          <div className="p-1 hover:bg-[#f5f5f7] rounded-lg cursor-pointer text-neutral-400 transition-colors" title="Text"><Type size={13} className="stroke-[1.5]" /></div>
          <div className="p-1 bg-amber-50 text-amber-600 rounded-lg cursor-pointer transition-colors" title="Sticky Note"><StickyNote size={13} className="stroke-[2]" /></div>
          <div className="w-[1px] h-4 bg-[#e5e5e7]" />
          <span className="text-[10px] text-[#737373] font-medium tracking-wide">96%</span>
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
              className="drop-shadow-sm"
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
    </>
  );
};

export default CollaborationPreview;
