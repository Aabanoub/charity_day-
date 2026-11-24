import { NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { getServerSupabase } from '@/lib/server-supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Selected file must be an image' }, { status: 400 });
    }

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file size must be under 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try uploading to Supabase Storage if configured
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${sanitizedExt}`;

        // Ensure bucket exists or upload directly
        const { error: uploadError } = await supabase.storage
          .from('mtd-items')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('mtd-items')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
            });
          }
        } else {
          console.warn('Supabase storage upload failed, falling back to data URL:', uploadError.message);
        }
      } catch (storageErr) {
        console.warn('Supabase storage exception, falling back to data URL:', storageErr);
      }
    }

    // 2. Fallback: Base64 Data URL (persists in DB seamlessly without needing storage buckets configured yet)
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (error: any) {
    console.error('API /api/admin/upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}
