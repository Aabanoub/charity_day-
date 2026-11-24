'use client';

import React, { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { AdminMessage } from '@/lib/types';
import Logo from './Logo';
import { Bell, Heart, Check } from 'lucide-react';

export default function AnnouncementPopup() {
  const [activeMessage, setActiveMessage] = useState<AdminMessage | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const checkAndShowMessage = (message: AdminMessage) => {
    try {
      const dismissedRaw = localStorage.getItem('mtd_dismissed_messages');
      const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
      if (!dismissed.includes(message.id)) {
        setActiveMessage(message);
        setIsOpen(true);
      }
    } catch {
      setActiveMessage(message);
      setIsOpen(true);
    }
  };

  const handleDismiss = () => {
    if (activeMessage) {
      try {
        const dismissedRaw = localStorage.getItem('mtd_dismissed_messages');
        const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
        if (!dismissed.includes(activeMessage.id)) {
          dismissed.push(activeMessage.id);
          localStorage.setItem('mtd_dismissed_messages', JSON.stringify(dismissed));
        }
      } catch (err) {
        console.error('Error saving dismissed message:', err);
      }
    }
    setIsOpen(false);
  };

  useEffect(() => {
    // 1. Initial fetch from API
    const fetchLatestMessage = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          checkAndShowMessage(data.messages[0]);
        }
      } catch (err) {
        console.warn('Could not fetch messages:', err);
      }
    };

    fetchLatestMessage();

    // 2. Setup Supabase Realtime subscription
    const supabase = getSupabase();
    let channel: any = null;

    if (supabase) {
      channel = supabase
        .channel('mtd_realtime_announcements')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'mtd_messages' },
          (payload: any) => {
            if (payload.new && payload.new.active) {
              const newMsg: AdminMessage = {
                id: payload.new.id,
                title: payload.new.title,
                message: payload.new.message,
                active: payload.new.active,
                createdAt: payload.new.created_at,
              };
              checkAndShowMessage(newMsg);
            }
          }
        )
        .subscribe();
    }

    // 3. Fallback polling every 4 seconds to guarantee admin pop-ups reach users within seconds
    const interval = setInterval(fetchLatestMessage, 4000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (!isOpen || !activeMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-brand-black border border-[#A9C8EE]/40 rounded-[16px] p-6 shadow-[0_8px_36px_rgba(0,0,0,0.9),0_0_20px_rgba(18,58,102,0.6)] text-white text-center">
        {/* Glow Accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#B22026]/30 rounded-full blur-xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-[#123A66] border border-[#A9C8EE]/40 flex items-center justify-center text-[#A9C8EE] shadow-inner">
            <Bell className="w-5 h-5 text-white animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-medium tracking-tight text-white mb-2">
          {activeMessage.title}
        </h3>

        {/* Message body */}
        <p className="text-sm text-[#A9C8EE] leading-relaxed mb-6 font-normal whitespace-pre-wrap">
          {activeMessage.message}
        </p>

        {/* Dismiss Button - "Got it" */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full min-h-[46px] py-2.5 px-6 bg-[#B22026] hover:bg-[#c9252c] text-white font-medium text-sm rounded-[12px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(178,32,38,0.4)] transition-all duration-200 tap-active"
        >
          <Check className="w-4 h-4" />
          <span>Got it</span>
        </button>
      </div>
    </div>
  );
}
