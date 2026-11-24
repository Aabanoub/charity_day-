'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { getSupabase } from '@/lib/supabase';
import { SiteStatusSettings } from '@/lib/types';
import { Heart, Lock, Shield } from 'lucide-react';

interface SiteClosureOverlayProps {
  siteStatusProp?: SiteStatusSettings | null;
}

export default function SiteClosureOverlay({ siteStatusProp }: SiteClosureOverlayProps = {}) {
  const [siteStatus, setSiteStatus] = useState<SiteStatusSettings | null>(
    siteStatusProp || null
  );

  useEffect(() => {
    if (siteStatusProp) {
      setSiteStatus(siteStatusProp);
    }
  }, [siteStatusProp]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSiteStatus(data.settings);
        }
      }
    } catch (err) {
      console.warn('Could not fetch site status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Re-check whenever tab becomes visible or focused
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);

    // 1. Supabase Realtime subscription
    const supabase = getSupabase();
    let channel: any = null;

    if (supabase) {
      channel = supabase
        .channel('mtd_realtime_site_status')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mtd_settings' },
          (payload: any) => {
            if (payload.new && payload.new.key === 'site_status' && payload.new.value) {
              setSiteStatus(payload.new.value as SiteStatusSettings);
            } else {
              fetchStatus();
            }
          }
        )
        .subscribe();
    }

    // 2. Periodic polling every 3 seconds as fallback
    const interval = setInterval(fetchStatus, 3000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (!siteStatus || !siteStatus.isClosed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-brand-black border border-[#B22026]/70 rounded-[16px] p-6 sm:p-8 shadow-[0_0_50px_rgba(178,32,38,0.35),0_0_0_1px_rgba(169,200,238,0.2)] text-white text-center">
        {/* Soft Glowing Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#B22026]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Heart-Shaped Handshake Logo */}
        <div className="flex justify-center mb-5">
          <Logo size="xl" showText={false} />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B22026]/20 border border-[#B22026]/50 text-xs font-medium text-[#B22026] mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Submissions Closed</span>
        </div>

        {/* Customizable Title */}
        <h2 className="text-2xl font-medium tracking-tight text-white mb-3">
          {siteStatus.title || 'Charity Day Has Concluded'}
        </h2>

        {/* Customizable Message */}
        <p className="text-sm text-[#A9C8EE] leading-relaxed mb-6 whitespace-pre-wrap font-normal">
          {siteStatus.message ||
            'Thank you for your incredible support! Price submissions are currently closed while organizers review the results.'}
        </p>

        {/* Brand Sign-off */}
        <div className="pt-4 border-t border-[#123A66]/60 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#B22026] fill-current" />
            <span>Make Their Day</span>
          </span>

          {/* Admin link for organizers */}
          <Link
            href="/admin"
            className="flex items-center gap-1 text-[#A9C8EE] hover:text-white transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Organizer Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
