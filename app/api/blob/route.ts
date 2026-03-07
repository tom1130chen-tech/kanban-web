import { NextRequest, NextResponse } from 'next/server';
import { put, get, list, del } from '@vercel/blob';

// GET - List files or get specific file
// POST - Upload new file
// DELETE - Delete file

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pathname = searchParams.get('pathname');
    
    if (pathname) {
      // Get specific file metadata (requires token from env)
      // For now, return error - user needs to configure BLOB_READ_WRITE_TOKEN
      return NextResponse.json(
        { success: false, error: 'Blob token not configured. Use list endpoint instead.' },
        { status: 503 }
      );
    } else {
      // List all files (optional prefix filter)
      const prefix = searchParams.get('prefix') || '';
      const result = await list({ prefix });
      return NextResponse.json({
        success: true,
        data: result.blobs
      });
    }
  } catch (error) {
    console.error('Blob GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from blob' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pathname, content, contentType = 'application/json' } = await request.json();
    
    if (!pathname || !content) {
      return NextResponse.json(
        { success: false, error: 'pathname and content are required' },
        { status: 400 }
      );
    }
    
    const blob = await put(pathname, content, {
      contentType,
      access: 'public', // or 'private'
    });
    
    return NextResponse.json({
      success: true,
      data: blob
    });
  } catch (error) {
    console.error('Blob POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload to blob' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pathname = searchParams.get('pathname');
    
    if (!pathname) {
      return NextResponse.json(
        { success: false, error: 'pathname is required' },
        { status: 400 }
      );
    }
    
    await del(pathname);
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${pathname}`
    });
  } catch (error) {
    console.error('Blob DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete from blob' },
      { status: 500 }
    );
  }
}
