import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { SiteStatusSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DEFAULT_STATUS: SiteStatusSettings = {
  isClosed: false,
  title: 'Charity Day Has Concluded',
  message:
    'Thank you for your incredible support! Price submissions are currently closed while organizers review the results.',
};

export async function GET() {
  try {
    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_settings')
        .select('value')
        .eq('key', 'site_status')
        .single();

      if (!error && data?.value) {
        return NextResponse.json({ settings: data.value as SiteStatusSettings });
      }
    }

    // In-memory fallback
    const memSettings = (global as any).__MTD_SITE_SETTINGS__ || DEFAULT_STATUS;
    return NextResponse.json({ settings: memSettings });
  } catch (error) {
    console.error('API /api/settings error:', error);
    return NextResponse.json({ settings: DEFAULT_STATUS });
  }
}
