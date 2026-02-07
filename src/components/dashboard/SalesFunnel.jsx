"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Default funnel data as fallback
const defaultFunnelData = [
  { label: "Leads", value: "0", percent: "100%", x: "0%" },
  { label: "Contacted", value: "0", percent: "0%", x: "20%" },
  { label: "Qualified", value: "0", percent: "0%", x: "40%" },
  { label: "Proposal", value: "0", percent: "0%", x: "60%" },
  { label: "Converted", value: "0", percent: "0%", x: "80%" },
];

export function SalesFunnel({ className, funnelData }) {
  const data = funnelData && funnelData.length > 0 ? funnelData : defaultFunnelData;
  
  const width = 1000;
  const funnelWidth = 850;
  const height = 250; 
  // Adjusted geometry for subtler slope
  const leftTopY = 40;
  const leftBottomY = 210;
  const rightTopY = 90;
  const rightBottomY = 160;

  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center font-sans select-none", className)}>
      <div className="relative w-full aspect-[3.5/1] max-h-[300px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full drop-shadow-md"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mainGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />    {/* Blue */}
              <stop offset="30%" stopColor="#6366F1" />   {/* Indigo */}
              <stop offset="60%" stopColor="#A855F7" />   {/* Purple */}
              <stop offset="85%" stopColor="#F59E0B" />   {/* Orange/Yellow */}
              <stop offset="100%" stopColor="#FBBF24" />  {/* Lighter Yellow */}
            </linearGradient>
            
            {/* Glossy overlay gradient */}
            <linearGradient id="glossCheck" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="white" stopOpacity="0.1" />
               <stop offset="50%" stopColor="white" stopOpacity="0" />
               <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Main Shape */}
          <path 
            d={`M0,${leftTopY} L${funnelWidth},${rightTopY} L${funnelWidth},${rightBottomY} L0,${leftBottomY} Z`} 
            fill="url(#mainGradient)" 
          />
          
          {/* Subtle Gloss Overlay */}
           <path 
            d={`M0,${leftTopY} L${funnelWidth},${rightTopY} L${funnelWidth},${rightBottomY} L0,${leftBottomY} Z`} 
            fill="url(#glossCheck)" 
            className="opacity-50"
          />

          {/* Vertical Separators */}
          {[1, 2, 3, 4].map((i) => {
             const x = (funnelWidth / 5) * i;
             // Calculate local top/bottom Y
             const progress = i / 5;
             const yTop = leftTopY + (rightTopY - leftTopY) * progress;
             const yBottom = leftBottomY + (rightBottomY - leftBottomY) * progress;
             return (
               <line 
                 key={i} 
                 x1={x} y1={yTop} 
                 x2={x} y2={yBottom} 
                 stroke="white" 
                 strokeWidth="2" 
                 strokeOpacity="0.5"
               />
             );
          })}
        </svg>

        {/* Labels Overlay */}
        <div className="absolute inset-y-0 left-0 flex" style={{ width: '85%' }}>
          {data.map((item, index) => (
            <div key={index} className="flex-1 relative flex flex-col justify-between py-1 group cursor-pointer border-r border-slate-200/50 last:border-0">
              {/* Top Label */}
              <div 
                className="absolute top-0 w-full text-center transition-transform hover:-translate-y-1 duration-200"
                style={{ top: '-15%' }}
              >
                <div className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight">{item.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{item.label}</div>
              </div>

               {/* Hover Highlight (Invisible normally) */}
               <div className="absolute inset-x-0 h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Bottom Label (Percentage) */}
              <div 
                className="absolute bottom-0 w-full text-center group-hover:scale-110 transition-transform duration-200"
                style={{ bottom: '2%' }}
              >
                <span className="text-lg xl:text-xl font-bold text-slate-700/80 drop-shadow-sm">{item.percent}</span>
              </div>
            </div>
          ))}
        </div>
          
        {/* Right side Percentage Indicators */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-4 flex flex-col gap-6 w-[15%]">
           <div className="flex items-center gap-1 justify-start pl-2">
              <div className="text-[#A3B8CC] text-[10px]">◀</div>
              <span className="text-[#94A3B8] font-bold text-xs">
                {data.length > 1 ? data[1].percent : '0%'}
              </span>
           </div>
           <div className="flex items-center gap-1 justify-start pl-2">
              <div className="text-[#A3B8CC] text-[10px]">◀</div>
              <span className="text-[#94A3B8] font-bold text-xs">
                {data.length > 4 ? data[4].percent : '0%'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
