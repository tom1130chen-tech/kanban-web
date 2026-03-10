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
      // Get specific file content
      try {
        const blob = await get(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN!, access: 'public' });
        if (blob) {
          // Always fetch from downloadUrl for actual content
          const downloadUrl = (blob as any).downloadUrl || (blob as any).url;
          let body = '';
          
          if (downloadUrl) {
            try {
              const res = await fetch(downloadUrl);
              body = await res.text();
            } catch (fetchErr) {
              console.warn('Fetch from downloadUrl failed:', fetchErr);
              body = typeof (blob as any).text === 'function' ? await (blob as any).text() : JSON.stringify(blob);
            }
          } else {
            body = typeof (blob as any).text === 'function' ? await (blob as any).text() : JSON.stringify(blob);
          }
          
          return NextResponse.json({
            success: true,
            data: {
              pathname,
              body,
              contentType: (blob as any).contentType || 'application/json',
              size: body.length
            }
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'File not found' },
            { status: 404 }
          );
        }
      } catch (error: any) {
        // If token not configured, try direct URL fetch
        console.warn('Blob get failed, trying direct fetch:', error.message);
        return NextResponse.json(
          { success: false, error: 'Blob token not configured for read' },
          { status: 503 }
        );
      }
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
