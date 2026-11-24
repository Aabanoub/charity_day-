'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SurveyModal from '@/components/SurveyModal';
import ItemCard from '@/components/ItemCard';
import ProgressBar from '@/components/ProgressBar';
import ThankYouScreen from '@/components/ThankYouScreen';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import SkeletonCard from '@/components/SkeletonCard';
import { Item, PriceSubmission, UserProfile } from '@/lib/types';
import { Heart, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [isSurveyGated, setIsSurveyGated] = useState<boolean>(true); // Strictly blocks items until profile loaded
  const [items, setItems] = useState<Item[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, PriceSubmission>>(new Map());
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showThankYouBanner, setShowThankYouBanner] = useState<boolean>(true);

  // 1. Initial Device Check: Read survey profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mtd_user_profile');
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (parsed.fullName && parsed.phoneNumber && parsed.className) {
          setUserProfile(parsed);
          setIsSurveyOpen(false);
          setIsSurveyGated(false); // Unlocks items!
        } else {
          setIsSurveyOpen(true);
          setIsSurveyGated(true);
        }
      } else {
        // First visit: Survey blocks the page
        setIsSurveyOpen(true);
        setIsSurveyGated(true);
      }
    } catch {
      setIsSurveyOpen(true);
      setIsSurveyGated(true);
    }
  }, []);

  // 2. Fetch items ONLY when survey is verified/completed
  const loadItems = async () => {
    setIsLoadingItems(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to load charity items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      console.error('Error fetching items:', err);
      setFetchError(err.message || 'Could not connect to item catalogue');
    } finally {
      setIsLoadingItems(false);
    }
  };

  // 3. Fetch user's own submissions
  const loadUserSubmissions = async (userId: string) => {
    try {
      const res = await fetch(`/api/submissions?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const map = new Map<string, PriceSubmission>();
        (data.submissions || []).forEach((sub: PriceSubmission) => {
          map.set(sub.itemId, sub);
        });
        setSubmissions(map);
      }
    } catch (err) {
      console.error('Error fetching user submissions:', err);
    }
  };

  useEffect(() => {
    if (userProfile && !isSurveyGated) {
      loadItems();
      loadUserSubmissions(userProfile.id);
    }
  }, [userProfile, isSurveyGated]);

  // Handle survey completion
  const handleSurveyComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsSurveyOpen(false);
    setIsSurveyGated(false); // Unlocks items!
  };

  // Handle price submission
  const handleSavePrice = async (itemId: string, price: number, comment?: string): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          userId: userProfile.id,
          userName: userProfile.fullName,
          userPhone: userProfile.phoneNumber,
          userClass: userProfile.className,
          price,
          comment: comment || '',
        }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.success && data.submission) {
        setSubmissions((prev) => {
          const updated = new Map(prev);
          updated.set(itemId, data.submission);
          return updated;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error submitting price:', err);
      return false;
    }
  };

  // Calculate completed count
  const completedCount = items.filter((item) => submissions.has(item.id)).length;
  const totalCount = items.length;
  const isFinishedAll = totalCount > 0 && completedCount >= totalCount;

  // STRICT RULE: "No item is visible before the survey is completed."
  if (isSurveyGated || !userProfile) {
    return (
      <main className="min-h-screen bg-brand-black flex flex-col justify-center items-center p-4">
        <SurveyModal
          isOpen={true}
          initialProfile={userProfile}
          onComplete={handleSurveyComplete}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Realtime Admin Broadcast Popups */}
      <AnnouncementPopup />

      {/* Survey Modal (can also be re-opened if user taps edit profile in header) */}
      <SurveyModal
        isOpen={isSurveyOpen}
        initialProfile={userProfile}
        onComplete={handleSurveyComplete}
      />

      {/* Header */}
      <Header
        user={userProfile}
        completedCount={completedCount}
        totalCount={totalCount}
        onEditProfile={() => setIsSurveyOpen(true)}
      />

      {/* Progress Bar */}
      <ProgressBar completed={completedCount} total={totalCount} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
        {/* Finished Celebratory Screen */}
        {isFinishedAll && showThankYouBanner && (
          <div className="mb-8">
            <ThankYouScreen
              completedCount={completedCount}
              userName={userProfile.fullName}
              onReviewPrices={() => {
                setShowThankYouBanner(false);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Welcome Intro Banner */}
        <div className="mb-6 bg-gradient-to-r from-[#123A66]/40 via-[#071526] to-[#123A66]/40 border border-[#123A66] rounded-[16px] p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-1.5">
              <span>Welcome, {userProfile.fullName.split(' ')[0]}!</span>
              <Sparkles className="w-4 h-4 text-[#A9C8EE]" />
            </h2>
            <p className="text-xs text-[#A9C8EE] font-normal leading-relaxed">
              Submit your price for each charity item. Every bid brings warmth!
            </p>
          </div>
          <div className="shrink-0 ml-3">
            <div className="w-10 h-10 rounded-full bg-[#B22026]/20 border border-[#B22026]/40 flex items-center justify-center text-[#B22026]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="mb-6 p-4 rounded-[16px] bg-[#B22026]/20 border border-[#B22026]/50 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B22026] shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={loadItems}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#B22026] text-white hover:bg-[#c9252c] transition-colors duration-200"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Item Cards List */}
        <section aria-label="Charity Items Catalogue" className="space-y-6">
          {isLoadingItems ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : items.length === 0 ? (
            // Empty State
            <div className="text-center py-16 px-4 border border-[#123A66]/50 rounded-[16px] bg-[#0b1d33]/40">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#123A66]/50 flex items-center justify-center text-[#A9C8EE]">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium text-white">No Items Available Yet</h3>
              <p className="text-xs text-[#A9C8EE] mt-1 max-w-xs mx-auto">
                Items will appear here shortly as the organizers upload them. Check back in a moment!
              </p>
            </div>
          ) : (
            // Render Items
            items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                userSubmission={submissions.get(item.id)}
                onSavePrice={handleSavePrice}
              />
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#123A66]/50 py-6 text-center text-xs text-[#A9C8EE]/60 bg-[#000000]">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="flex items-center gap-1.5">
            <span>Make Their Day &copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span className="text-[#B22026] font-medium">Warmth, Caring & Trust</span>
          </p>
          <p className="text-[11px] text-gray-500">
            One price per device. Newer prices replace older prices automatically.
          </p>
        </div>
      </footer>
    </div>
  );
}
