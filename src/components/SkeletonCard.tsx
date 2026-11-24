'use client';

import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-[#0b1d33]/60 border border-[#123A66]/50 rounded-[16px] overflow-hidden">
      {/* Top photo skeleton */}
      <div className="w-full h-52 sm:h-60 animate-shimmer" />

      {/* Body skeleton */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded-md animate-shimmer" />
          <div className="w-1/2 h-3.5 rounded-md animate-shimmer" />
        </div>

        {/* Price field skeleton */}
        <div className="space-y-2 pt-2">
          <div className="w-1/4 h-3 rounded-md animate-shimmer" />
          <div className="w-full h-12 rounded-[12px] animate-shimmer" />
        </div>

        {/* Button skeleton */}
        <div className="w-full h-11 rounded-[12px] animate-shimmer" />
      </div>
    </div>
  );
}
