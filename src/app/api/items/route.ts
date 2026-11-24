import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';

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
        .from('mtd_items')
        .select('id, name, photo_url, description, active, order_index, created_at')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching items from Supabase:', error);
        return NextResponse.json(
          { items: inMemoryStore.items.filter((i) => i.active !== false) },
          { headers: NO_CACHE_HEADERS }
        );
      }

      const items = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        photoUrl: item.photo_url,
        description: item.description,
        orderIndex: item.order_index,
      }));

      return NextResponse.json({ items }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(
      { items: inMemoryStore.items.filter((i) => i.active !== false) },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('API /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', items: inMemoryStore.items },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
