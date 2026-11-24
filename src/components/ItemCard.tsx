'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Item, PriceSubmission } from '@/lib/types';
import { Check, Send, Edit2, MessageSquare, AlertCircle } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  userSubmission?: PriceSubmission | null;
  onSavePrice: (itemId: string, price: number, comment?: string) => Promise<boolean>;
  index: number;
}

export default function ItemCard({
  item,
  userSubmission,
  onSavePrice,
  index,
}: ItemCardProps) {
  const [priceInput, setPriceInput] = useState<string>(
    userSubmission ? String(userSubmission.price) : ''
  );
  const [commentInput, setCommentInput] = useState<string>(
    userSubmission?.comment || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Sync when submission loads or changes
  useEffect(() => {
    if (userSubmission) {
      setPriceInput(String(userSubmission.price));
      if (userSubmission.comment) {
        setCommentInput(userSubmission.comment);
      }
    }
  }, [userSubmission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPrice = priceInput.trim();
    if (!cleanPrice) {
      setErrorMessage('Please enter a price');
      return;
    }

    const numericPrice = parseFloat(cleanPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setErrorMessage('Please enter a valid price (e.g. 15.00)');
      return;
    }

    setIsSubmitting(true);
    const success = await onSavePrice(item.id, numericPrice, commentInput.trim());
    setIsSubmitting(false);

    if (success) {
      setJustSaved(true);
      setTimeout(() => {
        setJustSaved(false);
      }, 2500);
    } else {
      setErrorMessage('Failed to save price. Please retry.');
    }
  };

  const isAlreadySubmitted = Boolean(userSubmission);

  return (
    <div className="group relative bg-[#0b1d33]/90 hover:bg-[#0e2440] border border-[#123A66] hover:border-[#A9C8EE]/30 rounded-[16px] overflow-hidden transition-all duration-200">
      {/* Top Photo Section */}
      <div className="relative w-full h-52 sm:h-60 bg-[#061220] overflow-hidden">
        {/* Skeleton while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-shimmer bg-[#123A66]/30 flex items-center justify-center text-[#A9C8EE]/40 text-xs">
            Loading photo...
          </div>
        )}
        
        <img
          src={item.photoUrl}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback placeholder on image load failure
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=600&auto=format&fit=crop&q=80';
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Item Index Pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#123A66] text-[11px] font-medium text-[#A9C8EE]">
          Item #{index + 1}
        </div>

        {/* Saved indicator badge on image */}
        {isAlreadySubmitted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-green-500/40 text-xs text-green-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Priced: ${Number(userSubmission?.price).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-medium text-white tracking-tight leading-snug">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs text-[#A9C8EE]/80 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price Submission Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Price Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor={`price-${item.id}`} className="font-medium text-gray-200">
                Price Found ($) <span className="text-[#B22026]">*</span>
              </label>
              <span className="text-[11px] text-[#A9C8EE]/80">Lowest market price</span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white font-medium text-base">
                $
              </span>
              <input
                id={`price-${item.id}`}
                type="number"
                step="0.01"
                min="0"
                required
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 min-h-[48px] bg-[#123A66]/30 border border-[#123A66] focus:border-[#A9C8EE] rounded-[12px] text-white font-medium text-lg placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200"
              />
            </div>

            {errorMessage && (
              <p className="flex items-center gap-1 text-[#B22026] text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Store Info / Notes Input (Encourage users to write info) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor={`comment-${item.id}`} className="text-[#A9C8EE] text-[11px] font-medium flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#A9C8EE]" />
                <span>Store Info & Notes (Optional)</span>
              </label>
            </div>
            <input
              id={`comment-${item.id}`}
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="e.g. Store name, branch, address, or product link..."
              maxLength={150}
              className="w-full px-3.5 py-2.5 bg-[#123A66]/20 border border-[#123A66]/70 focus:border-[#A9C8EE] rounded-[10px] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full min-h-[46px] py-2.5 px-4 rounded-[12px] font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 tap-active shadow-md ${
                justSaved
                  ? 'bg-green-600 text-white'
                  : isAlreadySubmitted
                  ? 'bg-[#123A66] hover:bg-[#18497d] text-white border border-[#A9C8EE]/40'
                  : 'bg-[#B22026] hover:bg-[#c9252c] text-white shadow-[0_4px_14px_rgba(178,32,38,0.3)]'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : justSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved ✓</span>
                </>
              ) : isAlreadySubmitted ? (
                <>
                  <Edit2 className="w-3.5 h-3.5 text-[#A9C8EE]" />
                  <span>Update Price</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Price</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
