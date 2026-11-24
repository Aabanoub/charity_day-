import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase } from '@/lib/server-supabase';
import { SectionStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await request.json();
    const { sectionId, status } = body as { sectionId: string; status: SectionStatus };

    if (!sectionId || !['OPEN', 'CLOSED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid sectionId or status' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 503, headers: NO_CACHE_HEADERS }
      );
    }

    const { data, error } = await supabase
      .from('mtd_sections')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating section in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(
      {
        success: true,
        section: {
          id: data.id,
          nameEn: data.name_en,
          nameAr: data.name_ar,
          imageUrl: data.image_url,
          status: data.status,
          displayOrder: data.display_order,
          updatedAt: data.updated_at,
        },
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('API /api/admin/sections error:', error);
    return NextResponse.json(
      { error: 'Internal server error updating section' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
