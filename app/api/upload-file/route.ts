import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const { src, dest } = await request.json();
    
    if (!src || !dest) {
      return NextResponse.json(
        { success: false, error: 'src and dest are required' },
        { status: 400 }
      );
    }
    
    // Read file content from request body instead of filesystem
    // This is safer for serverless environments
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 }
      );
    }
    
    // Upload to Blob
    const blob = await put(dest, body.content, {
      contentType: 'application/json',
      access: 'public',
    });
    
    return NextResponse.json({
      success: true,
      data: blob
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload to blob' },
      { status: 500 }
    );
  }
}
