import { NextResponse } from 'next/server';
import { generateAdminToken, getAdminPassword } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const correctPassword = getAdminPassword();

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Incorrect admin password' }, { status: 401 });
    }

    const token = generateAdminToken();

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Admin authenticated successfully',
    });

    response.cookies.set('mtd_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Signed out' });
  response.cookies.delete('mtd_admin_session');
  return response;
}
