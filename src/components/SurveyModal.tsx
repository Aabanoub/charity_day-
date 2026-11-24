'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { validatePhoneNumber, generateId } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { User, Phone, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

interface SurveyModalProps {
  onComplete: (user: UserProfile) => void;
  initialProfile?: UserProfile | null;
  isOpen: boolean;
}

export default function SurveyModal({ onComplete, initialProfile, isOpen }: SurveyModalProps) {
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phoneNumber || '');
  const [className, setClassName] = useState(initialProfile?.className || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    if (phoneError) {
      const res = validatePhoneNumber(val);
      if (res.isValid) {
        setPhoneError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Validate Name
    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameError('Please enter your full name (minimum 2 characters)');
      hasError = true;
    } else {
      setNameError(null);
    }

    // Validate Phone
    const phoneRes = validatePhoneNumber(phoneNumber);
    if (!phoneRes.isValid) {
      setPhoneError(phoneRes.error || 'Please enter a valid phone number');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    // Validate Class
    if (!className.trim()) {
      setClassError('Please enter your class');
      hasError = true;
    } else {
      setClassError(null);
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      // Generate or reuse device user ID
      const userId = initialProfile?.id || generateId();
      const userProfile: UserProfile = {
        id: userId,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        className,
        createdAt: initialProfile?.createdAt || new Date().toISOString(),
      };

      // 1. Save once per device in localStorage
      localStorage.setItem('mtd_user_profile', JSON.stringify(userProfile));

      // 2. Persist to API
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      }).catch((err) => {
        console.warn('Network sync for user profile deferred:', err);
      });

      // 3. Complete survey and unlock page
      onComplete(userProfile);
    } catch (err) {
      console.error('Error saving survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-brand-black border border-[#123A66] rounded-[16px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(169,200,238,0.2)] text-white my-auto">
        {/* Subtle Brand Accent Ring */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#B22026]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Logo at the top of Survey Pop-up */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" showText={false} variant="badge" />
          <h1 className="text-2xl font-medium tracking-tight text-white mt-4 flex items-center gap-2">
            Make Their <span className="text-[#B22026]">Day</span>
          </h1>
          <p className="text-sm text-[#A9C8EE] mt-1 font-normal opacity-90 max-w-xs leading-relaxed">
            Welcome to Charity Day! Please introduce yourself to start collecting prices and bringing joy.
          </p>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-medium text-gray-200 mb-1.5">
              Full Name <span className="text-[#B22026]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A9C8EE]/70">
                <User className="w-4 h-4" />
              </div>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full pl-10 pr-4 py-3 bg-[#123A66]/30 border ${
                  nameError ? 'border-[#B22026]' : 'border-[#123A66] focus:border-[#A9C8EE]'
                } rounded-[12px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200`}
              />
            </div>
            {nameError && (
              <p className="flex items-center gap-1 text-[#B22026] text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {nameError}
              </p>
            )}
          </div>

          {/* Phone Number with validation */}
          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-200 mb-1.5">
              Phone Number <span className="text-[#B22026]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A9C8EE]/70">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="e.g. +1 555-0192 or 0712345678"
                className={`w-full pl-10 pr-4 py-3 bg-[#123A66]/30 border ${
                  phoneError ? 'border-[#B22026]' : 'border-[#123A66] focus:border-[#A9C8EE]'
                } rounded-[12px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200`}
              />
            </div>
            {phoneError ? (
              <p className="flex items-center gap-1 text-[#B22026] text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {phoneError}
              </p>
            ) : (
              <p className="text-[11px] text-[#A9C8EE]/70 mt-1">
                Required for the organizer to contact price winners.
              </p>
            )}
          </div>

          {/* Class Text Input */}
          <div>
            <label htmlFor="className" className="block text-xs font-medium text-gray-200 mb-1.5">
              Class <span className="text-[#B22026]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A9C8EE]/70">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                id="className"
                type="text"
                required
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  if (classError) setClassError(null);
                }}
                placeholder="e.g. 10A, Year 11, or Room 4"
                className={`w-full pl-10 pr-4 py-3 bg-[#123A66]/30 border ${
                  classError ? 'border-[#B22026]' : 'border-[#123A66] focus:border-[#A9C8EE]'
                } rounded-[12px] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#A9C8EE] transition-all duration-200`}
              />
            </div>
            {classError && (
              <p className="flex items-center gap-1 text-[#B22026] text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {classError}
              </p>
            )}
          </div>

          {/* Main Action Button - Brand Red */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 px-6 bg-[#B22026] hover:bg-[#c9252c] active:bg-[#991a1f] disabled:opacity-50 text-white font-medium text-base rounded-[12px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(178,32,38,0.35)] transition-all duration-200 tap-active"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <span>Start Making Their Day</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
