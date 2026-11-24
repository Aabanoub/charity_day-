'use client';

import React, { useState } from 'react';
import { Section, SectionStatus } from '@/lib/types';
import { Lock, Check, X, Sparkles } from 'lucide-react';

interface CategoryDashboardProps {
  sections: Section[];
  isLoading?: boolean;
  onSelectSection: (section: Section) => void;
}

export default function CategoryDashboard({
  sections,
  isLoading = false,
  onSelectSection,
}: CategoryDashboardProps) {
  const [modalMessage, setModalMessage] = useState<{
    type: 'closed' | 'completed';
    text: string;
  } | null>(null);

  const handleCardClick = (section: Section) => {
    if (section.status === 'OPEN') {
      onSelectSection(section);
    } else if (section.status === 'CLOSED') {
      setModalMessage({
        type: 'closed',
        text: 'Thank you! This section is currently closed.',
      });
    } else if (section.status === 'COMPLETED') {
      setModalMessage({
        type: 'completed',
        text: 'Thank you! This section is completed. We appreciate your contribution ❤️',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className={`relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[20px] overflow-hidden bg-[#071526] border border-[#123A66]/30 animate-pulse ${
              idx === 4 ? 'col-span-2 sm:col-span-1 sm:col-start-auto' : ''
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#123A66]/20 to-[#071526]/80" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* 5-Category Image-Only Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 w-full">
        {sections.map((section, idx) => {
          const isFifth = idx === 4;
          const isClosed = section.status === 'CLOSED';
          const isCompleted = section.status === 'COMPLETED';

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleCardClick(section)}
              aria-label={`Category ${idx + 1}`}
              className={`group relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[20px] overflow-hidden bg-[#071526] border border-[#123A66]/40 shadow-[0_8px_24px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-[#A9C8EE]/60 transition-transform duration-300 tap-active hover:shadow-[0_12px_32px_rgba(18,58,102,0.35)] ${
                isFifth ? 'col-span-2 sm:col-span-1 sm:col-start-auto' : ''
              }`}
            >
              {/* Photograph Only - object-fit: cover, smooth hover zoom */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.imageUrl}
                alt=""
                loading={idx < 2 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none"
              />

              {/* CLOSED State Overlay & Lock Indicator */}
              {isClosed && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[1.5px] flex items-center justify-center transition-opacity duration-200">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/80 border border-white/25 flex items-center justify-center shadow-2xl text-white/90">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              )}

              {/* COMPLETED State Overlay & Checkmark Indicator */}
              {isCompleted && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center shadow-2xl text-white">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Premium Status Feedback Modal */}
      {modalMessage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setModalMessage(null)}
        >
          <div
            className="relative w-full max-w-sm bg-[#0b1d33] border border-[#123A66] rounded-[20px] p-6 shadow-2xl text-white text-center space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center shadow-lg bg-[#123A66]/40 border border-[#123A66]">
              {modalMessage.type === 'completed' ? (
                <Check className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
              ) : (
                <Lock className="w-6 h-6 text-[#A9C8EE]" />
              )}
            </div>

            <p className="text-sm font-medium text-gray-100 leading-relaxed px-2">
              {modalMessage.text}
            </p>

            <button
              type="button"
              onClick={() => setModalMessage(null)}
              className="w-full py-2.5 px-4 bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium rounded-[12px] shadow-md transition-colors duration-200 tap-active"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
