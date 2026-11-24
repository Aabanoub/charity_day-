'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { UserProfile } from '@/lib/types';
import { Shield, UserCheck, Edit3 } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  onEditProfile?: () => void;
  completedCount?: number;
  totalCount?: number;
}

export default function Header({
  user,
  onEditProfile,
  completedCount = 0,
  totalCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-black/90 backdrop-blur-md border-b border-[#123A66]/60 transition-all duration-200">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightBlue rounded-lg">
          <Logo size="md" />
        </Link>

        {/* User Status Badge / Admin Link */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEditProfile}
                title="Edit device profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#123A66]/50 hover:bg-[#123A66] border border-[#A9C8EE]/30 text-xs text-white transition-all duration-200 tap-active"
              >
                <span className="w-2 h-2 rounded-full bg-[#A9C8EE] animate-pulse" />
                <span className="font-medium max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                <span className="text-[#A9C8EE] font-normal opacity-80 hidden sm:inline">({user.className})</span>
                <Edit3 className="w-3 h-3 text-[#A9C8EE] opacity-70 ml-0.5" />
              </button>

              {totalCount > 0 && (
                <div className="px-2.5 py-1 rounded-full bg-[#B22026]/20 border border-[#B22026]/40 text-xs font-medium text-white">
                  {completedCount}/{totalCount}
                </div>
              )}
            </div>
          ) : null}

          {/* Admin link */}
          <Link
            href="/admin"
            title="Admin Portal"
            className="p-2 rounded-full text-[#A9C8EE] hover:text-white hover:bg-[#123A66]/50 transition-colors duration-200"
            aria-label="Admin Portal"
          >
            <Shield className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
