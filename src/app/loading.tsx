"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-black bg-white animate-loader-white" />
        <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black border border-black animate-loader-black" />
      </div>
      <div className="mt-5 text-xs text-[#737373] font-medium tracking-widest capitalize animate-pulse">
        Loading...
      </div>
    </div>
  );
}
