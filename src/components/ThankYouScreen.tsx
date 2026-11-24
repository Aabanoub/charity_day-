'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Logo from './Logo';
import { Heart, Sparkles, Edit3 } from 'lucide-react';

interface ThankYouScreenProps {
  completedCount: number;
  userName: string;
  onReviewPrices: () => void;
}

export default function ThankYouScreen({
  completedCount,
  userName,
  onReviewPrices,
}: ThankYouScreenProps) {
  useEffect(() => {
    // Fire celebratory confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#B22026', '#123A66', '#A9C8EE', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="w-full bg-[#000000] border-b border-[#123A66] py-10 px-4 text-center animate-fadeIn">
      <div className="max-w-md mx-auto bg-gradient-to-b from-[#123A66]/40 to-[#0b1d33]/80 border border-[#A9C8EE]/30 rounded-[16px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(178,32,38,0.2)]">
        {/* Heart handshake logo */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Logo size="xl" showText={false} />
            <div className="absolute -top-1 -right-1 p-1 bg-[#B22026] rounded-full text-white">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>

        {/* Celebration Title */}
        <h2 className="text-2xl font-medium tracking-tight text-white flex items-center justify-center gap-2">
          Thank you for making their day! <Heart className="w-6 h-6 text-[#B22026] fill-current" />
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-[#A9C8EE] mt-2 leading-relaxed">
          Amazing job, <strong className="text-white font-medium">{userName}</strong>! You have successfully submitted prices for all{' '}
          <strong className="text-white font-medium">{completedCount} charity items</strong>. Your generous contribution brings warmth and hope to our community.
        </p>

        {/* CTA to review or edit */}
        <div className="mt-6 pt-4 border-t border-[#123A66]/60">
          <button
            type="button"
            onClick={onReviewPrices}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#123A66] hover:bg-[#18497d] border border-[#A9C8EE]/40 text-xs font-medium text-white transition-all duration-200 tap-active"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#A9C8EE]" />
            <span>Review or Edit Your Prices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
