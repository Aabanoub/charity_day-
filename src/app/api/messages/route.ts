import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_messages')
        .select('id, title, message, active, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages from Supabase:', error);
      } else if (data) {
        const messages = data.map((m) => ({
          id: m.id,
          title: m.title,
          message: m.message,
          active: m.active,
          createdAt: m.created_at,
        }));
        return NextResponse.json({ messages });
      }
    }

    return NextResponse.json({
      messages: inMemoryStore.messages.filter((m) => m.active),
    });
  } catch (error) {
    console.error('API /api/messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
