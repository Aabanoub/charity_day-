'use client';

import React from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isAllDone = total > 0 && completed >= total;

  return (
    <div className="w-full bg-[#000000] border-b border-[#123A66]/40 pb-4 pt-2">
      <div className="max-w-xl mx-auto px-4">
        {/* Progress label & stats */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-white">
            <Heart className={`w-3.5 h-3.5 ${isAllDone ? 'text-green-400 fill-current' : 'text-[#B22026] fill-current animate-pulse'}`} />
            <span>
              <strong className="text-white font-medium">{completed}</strong> of <strong className="text-white font-medium">{total}</strong> done
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAllDone ? (
              <span className="flex items-center gap-1 text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Completed!
              </span>
            ) : (
              <span className="text-[#A9C8EE] font-medium bg-[#123A66]/40 px-2 py-0.5 rounded-full border border-[#123A66]">
                {percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-2.5 bg-[#123A66]/50 rounded-full overflow-hidden border border-[#123A66]/80">
          <div
            className="h-full bg-[#B22026] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(178,32,38,0.7)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
