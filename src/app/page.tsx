'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProgressBar from '@/components/ProgressBar';
import ItemCard from '@/components/ItemCard';
import SurveyModal from '@/components/SurveyModal';
import ThankYouScreen from '@/components/ThankYouScreen';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import SiteClosureOverlay from '@/components/SiteClosureOverlay';
import CategoryDashboard from '@/components/CategoryDashboard';
import { Item, PriceSubmission, UserProfile, SiteStatusSettings, Section } from '@/lib/types';
import { DEFAULT_SECTIONS } from '@/lib/constants';
import { getSupabase } from '@/lib/supabase';
import { Heart, Sparkles, AlertCircle, RefreshCw, ArrowLeft, Layers } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="bg-[#0b1d33] border border-[#123A66] rounded-[16px] p-4 space-y-4">
      <div className="w-full aspect-video rounded-[12px] bg-[#123A66]/30 animate-pulse flex items-center justify-center text-xs text-[#A9C8EE]/50 font-medium">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A9C8EE] animate-ping" />
          Loading item...
        </span>
      </div>
      <div className="h-5 bg-[#123A66]/40 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-[#123A66]/30 rounded w-1/2 animate-pulse" />
      <div className="h-10 bg-[#123A66]/20 rounded-lg animate-pulse" />
    </div>
  );
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isSurveyGated, setIsSurveyGated] = useState(true);

  // Items & submissions state
  const [items, setItems] = useState<Item[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, PriceSubmission>>(new Map());
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sections state (The 5 Image-Only Categories)
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  // Site Closure state
  const [siteStatus, setSiteStatus] = useState<SiteStatusSettings | null>(null);

  // Thank you banner control
  const [showThankYouBanner, setShowThankYouBanner] = useState(true);

  // 1. Initial Profile & Site Status Load
  useEffect(() => {
    // Check saved profile
    try {
      const saved = localStorage.getItem('mtd_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.fullName) {
          setUserProfile(parsed);
          setIsSurveyGated(false);
        }
      }
    } catch (e) {
      console.error('Failed reading user profile from localStorage', e);
    }

    // Check Site Status
    const checkSiteStatus = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSiteStatus(data.settings);
          }
        }
      } catch (err) {
        console.error('Error fetching site status:', err);
      }
    };
    checkSiteStatus();

    // Fetch Category Sections
    loadSections();
  }, []);

  // Fetch sections
  const loadSections = async () => {
    try {
      setIsLoadingSections(true);
      const res = await fetch('/api/sections', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          setSections(data.sections);

          // Update active selected section if it exists
          if (selectedSection) {
            const updatedActive = data.sections.find((s: Section) => s.id === selectedSection.id);
            if (updatedActive) {
              setSelectedSection(updatedActive);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading sections:', err);
    } finally {
      setIsLoadingSections(false);
    }
  };

  // 2. Fetch live items from database
  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      setFetchError(null);
      const res = await fetch('/api/items', { cache: 'no-store' });

      if (!res.ok) {
        throw new Error('Could not load catalogue items');
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setFetchError(err.message || 'Could not connect to item catalogue');
    } finally {
      setIsLoadingItems(false);
    }
  };

  // 3. Fetch user's own submissions
  const loadUserSubmissions = async (userId: string) => {
    try {
      const res = await fetch(`/api/submissions?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
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
      loadSections();
    }
  }, [userProfile, isSurveyGated]);

  // Realtime subscription for live item catalog and section status updates
  useEffect(() => {
    if (!userProfile || isSurveyGated) return;

    const supabase = getSupabase();
    if (!supabase) return;

    // Items channel
    const itemsChannel = supabase
      .channel('mtd_realtime_items_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mtd_items' },
        () => {
          loadItems();
        }
      )
      .subscribe();

    // Sections channel (Realtime status sync across all connected users!)
    const sectionsChannel = supabase
      .channel('mtd_realtime_sections_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mtd_sections' },
        (payload: any) => {
          if (payload.new && payload.new.id) {
            setSections((prev) =>
              prev.map((sec) =>
                sec.id === payload.new.id
                  ? {
                      ...sec,
                      status: payload.new.status,
                      updatedAt: payload.new.updated_at,
                    }
                  : sec
              )
            );

            // Handle user inside a section that gets closed or completed
            setSelectedSection((currentActive) => {
              if (currentActive && currentActive.id === payload.new.id) {
                if (payload.new.status !== 'OPEN') {
                  // Replaced or closed while inside
                  alert(
                    payload.new.status === 'COMPLETED'
                      ? 'Thank you! This section is completed. We appreciate your contribution ❤️'
                      : 'Thank you! This section is currently closed.'
                  );
                  return null; // Return back to Category Dashboard
                }
                return { ...currentActive, status: payload.new.status };
              }
              return currentActive;
            });
          } else {
            loadSections();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(sectionsChannel);
    };
  }, [userProfile, isSurveyGated]);

  // Window Focus & Daily Resume Sync
  useEffect(() => {
    const handleSyncOnResume = () => {
      if (document.visibilityState === 'visible' && userProfile && !isSurveyGated) {
        loadItems();
        loadUserSubmissions(userProfile.id);
        loadSections();
      }
    };

    document.addEventListener('visibilitychange', handleSyncOnResume);
    window.addEventListener('focus', handleSyncOnResume);
    return () => {
      document.removeEventListener('visibilitychange', handleSyncOnResume);
      window.removeEventListener('focus', handleSyncOnResume);
    };
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403 && errorData.error) {
          alert(errorData.error);
          setSelectedSection(null); // Return to dashboard
        }
        return false;
      }

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

  // Filter items for active section if selected
  const activeSectionItems = selectedSection
    ? items.filter((item) => (item.sectionId || 'supermarket') === selectedSection.id)
    : items;

  // Counts
  const totalCount = items.length;
  const completedCount = items.filter((i) => submissions.has(i.id)).length;
  const isFinishedAll = totalCount > 0 && completedCount === totalCount;

  // Section specific counts
  const sectionTotalCount = activeSectionItems.length;
  const sectionCompletedCount = activeSectionItems.filter((i) => submissions.has(i.id)).length;

  // 1. ABSOLUTE TOP PRIORITY: If site is closed, render closure overlay only
  if (siteStatus?.isClosed) {
    return (
      <main className="min-h-screen bg-brand-black flex flex-col justify-center items-center p-4">
        <SiteClosureOverlay siteStatusProp={siteStatus} />
      </main>
    );
  }

  // 2. STRICT RULE: "No item is visible before the survey is completed."
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
              Submit your price for each item.
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

        {/* =============================================================== */}
        {/* VIEW 1: PREMIUM FIVE-CATEGORY IMAGE-ONLY DASHBOARD */}
        {/* =============================================================== */}
        {!selectedSection ? (
          <section aria-label="Shopping Categories" className="space-y-4">
            <CategoryDashboard
              sections={sections}
              isLoading={isLoadingSections}
              onSelectSection={(section) => {
                setSelectedSection(section);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>
        ) : (
          /* =============================================================== */
          /* VIEW 2: CATEGORY ITEMS VIEW (Entered into an OPEN section) */
          /* =============================================================== */
          <section aria-label="Category Items" className="space-y-5 animate-fadeIn">
            {/* Top Navigation Bar inside Category */}
            <div className="flex items-center justify-between pb-3 border-b border-[#123A66]/50">
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#123A66]/30 border border-[#123A66] hover:bg-[#123A66] text-xs text-[#A9C8EE] hover:text-white transition-colors duration-200 tap-active"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Categories</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">
                  {sectionCompletedCount} of {sectionTotalCount} priced
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Item Cards in this Category */}
            <div className="space-y-6">
              {isLoadingItems ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
              ) : activeSectionItems.length === 0 ? (
                /* Empty Category State */
                <div className="text-center py-16 px-4 border border-[#123A66]/50 rounded-[16px] bg-[#0b1d33]/40 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#123A66]/50 flex items-center justify-center text-[#A9C8EE]">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-medium text-white">No Items in this Category Yet</h3>
                  <p className="text-xs text-[#A9C8EE] max-w-xs mx-auto">
                    Items will appear here once added by organizers. Feel free to explore other categories!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSection(null)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B22026] hover:bg-[#c9252c] text-white text-xs font-medium transition-colors"
                  >
                    <span>View Other Categories</span>
                  </button>
                </div>
              ) : (
                /* Render Items */
                activeSectionItems.map((item, index) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    userSubmission={submissions.get(item.id)}
                    onSavePrice={handleSavePrice}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#123A66]/50 py-6 text-center text-xs text-[#A9C8EE]/60 bg-[#000000]">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="flex items-center gap-1.5">
            <span>Make Their Day &copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span className="text-[#B22026] font-medium">Warmth, Caring & Trust</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
