import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { SiteStatusSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

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
        return NextResponse.json(
          {
            settings: data.value as SiteStatusSettings,
            source: 'supabase',
          },
          { headers: NO_CACHE_HEADERS }
        );
      }

      if (error) {
        console.error('Error fetching settings from Supabase:', error);
      }
    }

    // In-memory fallback
    const memSettings = (global as any).__MTD_SITE_SETTINGS__ || DEFAULT_STATUS;
    return NextResponse.json(
      {
        settings: memSettings,
        source: 'memory',
        hasSupabase: Boolean(supabase),
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('API /api/settings error:', error);
    return NextResponse.json(
      { settings: DEFAULT_STATUS, error: error?.message },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
