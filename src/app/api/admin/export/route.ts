import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';

export const dynamic = 'force-dynamic';

function escapeCSV(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return `"${stringField}"`;
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filterClass = searchParams.get('class');

    const supabase = getServerSupabase();
    let itemsData: { id: string; name: string }[] = [];
    let subsData: Array<{
      item_id: string;
      user_name: string;
      user_class: string;
      user_phone: string;
      price: number;
      comment: string | null;
      updated_at: string;
    }> = [];

    if (supabase) {
      const { data: items } = await supabase.from('mtd_items').select('id, name');
      itemsData = items || [];

      let query = supabase.from('mtd_submissions').select('*');
      if (filterClass && filterClass !== 'ALL') {
        query = query.eq('user_class', filterClass);
      }
      const { data: subs } = await query;
      subsData = subs || [];
    } else {
      itemsData = inMemoryStore.items.map((i) => ({ id: i.id, name: i.name }));
      subsData = Array.from(inMemoryStore.submissions.values()).map((s) => ({
        item_id: s.itemId,
        user_name: s.userName,
        user_class: s.userClass,
        user_phone: s.userPhone,
        price: s.price,
        comment: s.comment || '',
        updated_at: s.updatedAt,
      }));

      if (filterClass && filterClass !== 'ALL') {
        subsData = subsData.filter((s) => s.user_class === filterClass);
      }
    }

    const itemMap = new Map<string, string>();
    itemsData.forEach((i) => itemMap.set(i.id, i.name));

    // Determine lowest price per item
    const itemLowestPrice = new Map<string, number>();
    subsData.forEach((s) => {
      const current = itemLowestPrice.get(s.item_id);
      if (current === undefined || s.price < current) {
        itemLowestPrice.set(s.item_id, s.price);
      }
    });

    const headers = [
      'Item Name',
      'Price ($)',
      'Is Lowest Price',
      'User Full Name',
      'Class',
      'Phone Number',
      'Comment',
      'Submitted At',
    ];

    const rows = subsData.map((sub) => {
      const itemName = itemMap.get(sub.item_id) || 'Unknown Item';
      const isLowest = itemLowestPrice.get(sub.item_id) === sub.price ? 'YES' : 'NO';
      return [
        escapeCSV(itemName),
        escapeCSV(sub.price.toFixed(2)),
        escapeCSV(isLowest),
        escapeCSV(sub.user_name),
        escapeCSV(sub.user_class),
        escapeCSV(sub.user_phone),
        escapeCSV(sub.comment || ''),
        escapeCSV(new Date(sub.updated_at).toLocaleString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    const filename = `MakeTheirDay_Prices_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSV Export Error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
