import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { src, dest } = await request.json();
    
    if (!src || !dest) {
      return NextResponse.json(
        { success: false, error: 'src and dest are required' },
        { status: 400 }
      );
    }
    
    // Read file from local filesystem
    const filePath = path.join(process.cwd(), 'data', src);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `File not found: ${src}` },
        { status: 404 }
      );
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Upload to Blob
    const blob = await put(dest, content, {
      contentType: 'application/json',
      access: 'public',
    });
    
    return NextResponse.json({
      success: true,
      data: blob
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload to blob' },
      { status: 500 }
    );
  }
}
