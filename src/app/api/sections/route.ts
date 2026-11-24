import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/server-supabase';
import { DEFAULT_SECTIONS } from '@/lib/constants';
import { Section } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET() {
  try {
    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const sections: Section[] = data.map((s) => ({
          id: s.id,
          nameEn: s.name_en,
          nameAr: s.name_ar,
          imageUrl: s.image_url,
          status: s.status,
          displayOrder: s.display_order,
          updatedAt: s.updated_at,
        }));

        return NextResponse.json({ sections }, { headers: NO_CACHE_HEADERS });
      }
    }

    return NextResponse.json({ sections: DEFAULT_SECTIONS }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { sections: DEFAULT_SECTIONS, error: 'Failed to fetch sections from database' },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
