"use client";

import React, { useState, useEffect, useRef } from "react";
import { MousePointer2, Hand, StickyNote, Type, Square, MessageSquare, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";

import { useWebSocket } from "@/hooks/useWebSocket";
import { addProjectToCookieAction } from "../../../actions/project.actions";

interface CanvasWorkspaceProps {
  projectId: string;
}

interface MockItem {
  id: string;
  type: "note" | "text" | "shape";
  content: string;
  x: number;
  y: number;
  color?: string;
  width?: number;
  height?: number;
}

export const CanvasWorkspace = ({ projectId }: CanvasWorkspaceProps) => {
  const { isConnected, lastMessage, sendMessage } = useWebSocket(projectId);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [zoom, setZoom] = useState<number>(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const registerProject = async () => {
      await addProjectToCookieAction(projectId);
    };
    registerProject();
  }, [projectId]);

  useEffect(() => {
    if (isConnected) {
      sendMessage("presence", { status: "online" });
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (lastMessage) {
      console.log("WebSocket event from backend:", lastMessage);
    }
  }, [lastMessage]);
  
  // Interactive mock items
  const [items, setItems] = useState<MockItem[]>([
    {
      id: "i1",
      type: "note",
      content: "Brainstorm onboarding flows & copy writeups",
      x: 120,
      y: 180,
      color: "#fdfdf0", // yellow
    },
    {
      id: "i2",
      type: "note",
      content: "Ensure all buttons have Apple hover spring physics",
      x: 480,
      y: 140,
      color: "#f6fbf7", // green
    },
    {
      id: "i3",
      type: "text",
      content: "Core Platform Architecture V1",
      x: 310,
      y: 80,
    },
    {
      id: "i4",
      type: "shape",
      content: "Database Server",
      x: 320,
      y: 340,
      width: 140,
      height: 70,
    },
  ]);

  // Drag state for canvas items
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleItemMouseDown = (e: React.MouseEvent, item: MockItem) => {
    if (activeTool !== "select") return;
    e.stopPropagation();
    setDraggingId(item.id);
    
    // Calculate relative offset of mouse pointer inside the item
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    
    // Get mouse coordinates relative to the canvas container
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    setItems((prev) =>
      prev.map((item) => (item.id === draggingId ? { ...item, x: Math.max(0, x), y: Math.max(0, y) } : item))
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingId(null);
  };

  // Add a new sticky note relative to center
  const handleAddStickyNote = (e: React.MouseEvent) => {
    if (activeTool !== "note") return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Get position relative to canvas container
    const x = e.clientX - canvasRect.left - 75;
    const y = e.clientY - canvasRect.top - 75;

    const colors = ["#fdfdf0", "#f6fbf7", "#f5fbfd"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newItem: MockItem = {
      id: `item-${Date.now()}`,
      type: "note",
      content: "Double click to edit note",
      x: Math.max(20, x),
      y: Math.max(20, y),
      color: randomColor,
    };

    setItems((prev) => [...prev, newItem]);
    setActiveTool("select"); // switch back
    toast.success("Sticky note added! Drag it anywhere.");
  };

  // Double click to edit content
  const handleItemDoubleClick = (id: string) => {
    const newContent = prompt("Edit content:");
    if (newContent !== null) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, content: newContent || "Empty Content" } : item))
      );
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const tools = [
    { id: "select", icon: <MousePointer2 size={16} />, label: "Select (V)" },
    { id: "hand", icon: <Hand size={16} />, label: "Pan (H)" },
    { id: "note", icon: <StickyNote size={16} />, label: "Sticky Note (N)" },
    { id: "shape", icon: <Square size={16} />, label: "Shape (S)" },
    { id: "text", icon: <Type size={16} />, label: "Text (T)" },
  ];

  return (
    <div className="flex-1 w-full relative overflow-hidden flex flex-col select-none">
      {/* Workspace Canvas Area */}
      <div
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleAddStickyNote}
        className={`flex-grow h-full relative overflow-hidden select-none bg-white ${
          activeTool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        }`}
        style={{
          backgroundImage: "radial-gradient(#e5e5e7 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "center center",
          transition: draggingId ? "none" : "transform 0.1s ease-out",
        }}
      >
        {/* Helper Instructions Badge */}
        <div className="absolute top-4 left-4 pointer-events-none z-10 px-3.5 py-1.5 text-[10px] font-semibold text-[#737373] tracking-widest uppercase bg-white border border-[#e5e5e7] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {activeTool === "note" ? "Click canvas to place Sticky Note" : "Selection Tool Active"}
        </div>

        {/* Canvas Connections (Background decorative paths) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path
            d="M 220 250 Q 300 280 390 340"
            fill="none"
            stroke="#e5e5e7"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        </svg>

        {/* Render Items */}
        {items.map((item) => (
          <div
            key={item.id}
            onMouseDown={(e) => handleItemMouseDown(e, item)}
            onDoubleClick={() => handleItemDoubleClick(item.id)}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            className={`absolute z-10 select-none group touch-none ${
              activeTool === "select" ? "cursor-move" : "pointer-events-none"
            } ${draggingId === item.id ? "scale-[1.02] shadow-lg" : ""}`}
          >
            {item.type === "note" && (
              <div
                style={{ backgroundColor: item.color }}
                className="w-[150px] h-[150px] border border-[#e5e5e7] p-4 flex flex-col justify-between shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-200 select-none rounded-lg"
              >
                <p className="text-xs text-black/85 leading-relaxed font-sans overflow-hidden">
                  {item.content}
                </p>
                <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-[#737373] select-none">
                  <span>STICKY</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">DBL-CLK TO EDIT</span>
                </div>
              </div>
            )}

            {item.type === "text" && (
              <div className="px-3 py-1.5 bg-transparent border-0 select-none">
                <span className="text-sm font-bold tracking-tight text-black font-sans leading-none uppercase">
                  {item.content}
                </span>
              </div>
            )}

            {item.type === "shape" && (
              <div
                style={{ width: item.width || 120, height: item.height || 60 }}
                className="bg-white border-2 border-black/80 rounded-xl flex items-center justify-center p-3 shadow-sm select-none hover:shadow-md transition-shadow"
              >
                <span className="text-xs font-semibold text-black tracking-tight text-center">
                  {item.content}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Mock collaborator pointer simulation inside the canvas */}
        <div className="absolute top-[220px] left-[680px] pointer-events-none z-20">
          <MousePointer2 size={16} fill="#f43f5e" className="text-[#f43f5e] drop-shadow-sm rotate-[-85deg]" />
          <div className="absolute top-4 left-3 bg-[#f43f5e] text-white font-medium text-[9px] py-0.5 px-2 rounded-md whitespace-nowrap">
            Sarah Chen is editing
          </div>
        </div>
      </div>

      {/* Center Floating Whiteboard Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-[#e5e5e7] px-3.5 py-2 rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] z-40 flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              if (tool.id === "note") {
                toast.info("Click anywhere on the board to drop a sticky note.");
              }
            }}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTool === tool.id
                ? "bg-black text-white"
                : "text-[#737373] hover:text-black hover:bg-[#f5f5f7]"
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Bottom Left Controls (Zoom) */}
      <div className="absolute bottom-6 left-6 bg-white border border-[#e5e5e7] p-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.04)] z-40 flex items-center gap-1.5 text-xs select-none">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg text-[#737373] hover:text-black hover:bg-[#f5f5f7] cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <span className="font-semibold text-black tracking-wider w-10 text-center select-none">
          {zoom}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg text-[#737373] hover:text-black hover:bg-[#f5f5f7] cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      {/* Bottom Right Workspace Help badge */}
      <div className="absolute bottom-6 right-6 hidden md:block z-40 select-none">
        <div className="bg-white border border-[#e5e5e7] px-3 py-2 rounded-xl text-[10px] text-[#737373] font-medium tracking-wide uppercase shadow-sm">
          UI Shell Only • Drawing Disabled
        </div>
      </div>
    </div>
  );
};
export default CanvasWorkspace;
