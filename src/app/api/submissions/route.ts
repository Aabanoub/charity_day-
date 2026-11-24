import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { PriceSubmission } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_submissions')
        .select('id, item_id, user_id, price, comment, created_at, updated_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching submissions from Supabase:', error);
      } else if (data) {
        const submissions = data.map((sub) => ({
          id: sub.id,
          itemId: sub.item_id,
          userId: sub.user_id,
          price: Number(sub.price),
          comment: sub.comment || '',
          createdAt: sub.created_at,
          updatedAt: sub.updated_at,
        }));
        return NextResponse.json({ submissions }, { headers: NO_CACHE_HEADERS });
      }
    }

    // Fallback to in-memory store
    const userSubs: PriceSubmission[] = [];
    inMemoryStore.submissions.forEach((sub) => {
      if (sub.userId === userId) {
        userSubs.push(sub);
      }
    });

    return NextResponse.json({ submissions: userSubs }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('API /api/submissions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, userId, userName, userPhone, userClass, price, comment } = body;

    if (!itemId || !userId || price === undefined || price === null || price === '') {
      return NextResponse.json(
        { error: 'itemId, userId, and price are required' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_submissions')
        .upsert(
          {
            item_id: itemId,
            user_id: userId,
            user_name: userName || 'Anonymous',
            user_phone: userPhone || '',
            user_class: userClass || '',
            price: numPrice,
            comment: (comment || '').trim(),
            updated_at: now,
          },
          { onConflict: 'item_id,user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error upserting submission in Supabase:', error);
      } else if (data) {
        return NextResponse.json({
          success: true,
          submission: {
            id: data.id,
            itemId: data.item_id,
            userId: data.user_id,
            userName: data.user_name,
            userPhone: data.user_phone,
            userClass: data.user_class,
            price: Number(data.price),
            comment: data.comment,
            updatedAt: data.updated_at,
          },
        });
      }
    }

    // In-memory fallback
    const key = `${itemId}_${userId}`;
    const existing = inMemoryStore.submissions.get(key);
    const subRecord: PriceSubmission = {
      id: existing ? existing.id : 'sub_' + Math.random().toString(36).substring(2, 9),
      itemId,
      userId,
      userName: userName || 'Anonymous',
      userPhone: userPhone || '',
      userClass: userClass || '',
      price: numPrice,
      comment: (comment || '').trim(),
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    inMemoryStore.submissions.set(key, subRecord);

    return NextResponse.json({
      success: true,
      submission: subRecord,
    });
  } catch (error) {
    console.error('API /api/submissions POST error:', error);
    return NextResponse.json({ error: 'Failed to save price' }, { status: 500 });
  }
}
