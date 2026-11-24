import { NextResponse } from 'next/server';
import { getServerSupabase, inMemoryStore } from '@/lib/server-supabase';
import { validatePhoneNumber } from '@/lib/utils';
import { UserProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, fullName, phoneNumber, className } = body;

    if (!id || !fullName || !phoneNumber || !className) {
      return NextResponse.json(
        { error: 'All fields (full name, phone number, and class) are required.' },
        { status: 400 }
      );
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const userProfile: UserProfile = {
      id,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      className: className.trim(),
      createdAt: new Date().toISOString(),
    };

    const supabase = getServerSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('mtd_users')
        .upsert({
          id: userProfile.id,
          full_name: userProfile.fullName,
          phone_number: userProfile.phoneNumber,
          class_name: userProfile.className,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving user in Supabase:', error);
      } else if (data) {
        return NextResponse.json({ success: true, user: userProfile });
      }
    }

    // Fallback store
    inMemoryStore.users.set(userProfile.id, userProfile);

    return NextResponse.json({ success: true, user: userProfile });
  } catch (error) {
    console.error('API /api/users error:', error);
    return NextResponse.json({ error: 'Failed to save survey profile' }, { status: 500 });
  }
}
