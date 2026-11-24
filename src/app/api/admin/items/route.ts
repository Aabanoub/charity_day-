import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { AdminItemSummary, Item } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getServerSupabase();

    if (supabase) {
      // 1. Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('mtd_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (itemsError) {
        console.error('Supabase items fetch error:', itemsError);
      } else if (itemsData) {
        // 2. Fetch all submissions
        const { data: subsData, error: subsError } = await supabase
          .from('mtd_submissions')
          .select('*');

        if (subsError) {
          console.error('Supabase subs fetch error:', subsError);
        }

        const submissions = subsData || [];

        // Build summary for each item
        const result: AdminItemSummary[] = itemsData.map((item) => {
          const itemSubs = submissions
            .filter((s) => s.item_id === item.id)
            .map((s) => ({
              id: s.id,
              userId: s.user_id,
              userName: s.user_name || 'Anonymous',
              userClass: s.user_class || 'N/A',
              userPhone: s.user_phone || 'N/A',
              price: Number(s.price),
              comment: s.comment || '',
              submittedAt: s.updated_at || s.created_at,
            }))
            .sort((a, b) => a.price - b.price); // Low to high

          const lowest = itemSubs.length > 0 ? itemSubs[0] : null;

          return {
            id: item.id,
            name: item.name,
            photoUrl: item.photo_url,
            description: item.description,
            sectionId: item.section_id || 'supermarket',
            active: item.active,
            lowestPrice: lowest ? lowest.price : null,
            pricesCount: itemSubs.length,
            lowestBidder: lowest
              ? {
                  name: lowest.userName,
                  className: lowest.userClass,
                  phone: lowest.userPhone,
                  comment: lowest.comment,
                  price: lowest.price,
                  submittedAt: lowest.submittedAt,
                }
              : null,
            allSubmissions: itemSubs,
          };
        });

        return NextResponse.json({ items: result });
      }
    }

    // In-Memory Fallback
    const allSubsArray = Array.from(inMemoryStore.submissions.values());
    const result: AdminItemSummary[] = inMemoryStore.items.map((item) => {
      const itemSubs = allSubsArray
        .filter((s) => s.itemId === item.id)
        .map((s) => ({
          id: s.id,
          userId: s.userId,
          userName: s.userName || 'Anonymous',
          userClass: s.userClass || 'N/A',
          userPhone: s.userPhone || 'N/A',
          price: Number(s.price),
          comment: s.comment || '',
          submittedAt: s.updatedAt || s.createdAt,
        }))
        .sort((a, b) => a.price - b.price);

      const lowest = itemSubs.length > 0 ? itemSubs[0] : null;

      return {
        id: item.id,
        name: item.name,
        photoUrl: item.photoUrl,
        description: item.description,
        sectionId: item.sectionId || 'supermarket',
        active: item.active !== false,
        lowestPrice: lowest ? lowest.price : null,
        pricesCount: itemSubs.length,
        lowestBidder: lowest
          ? {
              name: lowest.userName,
              className: lowest.userClass,
              phone: lowest.userPhone,
              comment: lowest.comment,
              price: lowest.price,
              submittedAt: lowest.submittedAt,
            }
          : null,
        allSubmissions: itemSubs,
      };
    });

    return NextResponse.json({ items: result });
  } catch (error) {
    console.error('API /api/admin/items GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, photoUrl, description, sectionId } = await request.json();

    if (!name || !photoUrl) {
      return NextResponse.json({ error: 'Name and photo URL are required' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_items')
        .insert({
          name: name.trim(),
          photo_url: photoUrl.trim(),
          description: (description || '').trim(),
          section_id: sectionId || 'supermarket',
          active: true,
          order_index: Date.now() % 100000,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting item in Supabase:', error);
      } else if (data) {
        return NextResponse.json({
          success: true,
          item: {
            id: data.id,
            name: data.name,
            photoUrl: data.photo_url,
            description: data.description,
            sectionId: data.section_id,
            active: data.active,
          },
        });
      }
    }

    const newItem: Item = {
      id: 'item_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      photoUrl: photoUrl.trim(),
      description: (description || '').trim(),
      sectionId: sectionId || 'supermarket',
      active: true,
      orderIndex: inMemoryStore.items.length + 1,
    };

    inMemoryStore.items.push(newItem);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('API /api/admin/items POST error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, photoUrl, description, sectionId, active } = await request.json();

    if (!id || !name || !photoUrl) {
      return NextResponse.json({ error: 'ID, name, and photo URL are required' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const updateData: Record<string, any> = {
        name: name.trim(),
        photo_url: photoUrl.trim(),
        description: (description || '').trim(),
        active: active !== undefined ? active : true,
        updated_at: new Date().toISOString(),
      };
      if (sectionId) {
        updateData.section_id = sectionId;
      }

      const { data, error } = await supabase
        .from('mtd_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating item in Supabase:', error);
      } else if (data) {
        return NextResponse.json({
          success: true,
          item: {
            id: data.id,
            name: data.name,
            photoUrl: data.photo_url,
            description: data.description,
            sectionId: data.section_id,
            active: data.active,
          },
        });
      }
    }

    const index = inMemoryStore.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      inMemoryStore.items[index] = {
        ...inMemoryStore.items[index],
        name: name.trim(),
        photoUrl: photoUrl.trim(),
        description: (description || '').trim(),
        sectionId: sectionId || inMemoryStore.items[index].sectionId || 'supermarket',
        active: active !== undefined ? active : inMemoryStore.items[index].active,
      };
      return NextResponse.json({ success: true, item: inMemoryStore.items[index] });
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  } catch (error) {
    console.error('API /api/admin/items PUT error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const { error } = await supabase.from('mtd_items').delete().eq('id', id);
      if (error) {
        console.error('Error deleting item from Supabase:', error);
      } else {
        return NextResponse.json({ success: true, message: 'Item deleted' });
      }
    }

    inMemoryStore.items = inMemoryStore.items.filter((i) => i.id !== id);
    // Also remove associated submissions
    Array.from(inMemoryStore.submissions.keys()).forEach((key) => {
      if (key.startsWith(`${id}_`)) {
        inMemoryStore.submissions.delete(key);
      }
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('API /api/admin/items DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
