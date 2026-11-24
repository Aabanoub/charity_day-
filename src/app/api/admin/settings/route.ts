import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase } from '@/lib/server-supabase';
import { SiteStatusSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { isClosed, title, message } = body;

    const newSettings: SiteStatusSettings = {
      isClosed: Boolean(isClosed),
      title: (title || 'Charity Day Has Concluded').trim(),
      message: (
        message ||
        'Thank you for your incredible support! Price submissions are currently closed while organizers review the results.'
      ).trim(),
    };

    const supabase = getServerSupabase();

    if (supabase) {
      const { error } = await supabase
        .from('mtd_settings')
        .upsert({
          key: 'site_status',
          value: newSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving settings to Supabase:', error);
      }
    }

    (global as any).__MTD_SITE_SETTINGS__ = newSettings;

    return NextResponse.json(
      { success: true, settings: newSettings },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('API /api/admin/settings POST error:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}
