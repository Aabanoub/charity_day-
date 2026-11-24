import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { AdminMessage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin messages from Supabase:', error);
      } else if (data) {
        const messages: AdminMessage[] = data.map((m) => ({
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
      messages: inMemoryStore.messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error('API /api/admin/messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_messages')
        .insert({
          title: title.trim(),
          message: message.trim(),
          active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error broadcasting message to Supabase:', error);
      } else if (data) {
        return NextResponse.json({
          success: true,
          message: {
            id: data.id,
            title: data.title,
            message: data.message,
            active: data.active,
            createdAt: data.created_at,
          },
        });
      }
    }

    const newMessage: AdminMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      message: message.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.messages.unshift(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('API /api/admin/messages POST error:', error);
    return NextResponse.json({ error: 'Failed to broadcast message' }, { status: 500 });
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
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    if (supabase) {
      const { error } = await supabase.from('mtd_messages').delete().eq('id', id);
      if (error) {
        console.error('Error deleting message in Supabase:', error);
      } else {
        return NextResponse.json({ success: true, message: 'Message deleted' });
      }
    }

    inMemoryStore.messages = inMemoryStore.messages.filter((m) => m.id !== id);

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('API /api/admin/messages DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
