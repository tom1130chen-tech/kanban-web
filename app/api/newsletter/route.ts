import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (date) {
      // Load specific date from blob or local file
      if (date === new Date().toISOString().split('T')[0]) {
        // Today - load from local file
        const filePath = path.join(process.cwd(), "data", "newsletter-digest.json");
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);
        return NextResponse.json({ success: true, data });
      } else {
        // Historical - try to load from blob via direct fetch
        const blobUrl = `https://ugyia2hnbv7cqrog.private.blob.vercel-storage.com/newsletter/${date}.json`;
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        
        if (token) {
          const res = await fetch(blobUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            return NextResponse.json({ success: true, data });
          }
        }
        
        return NextResponse.json(
          { success: false, error: `No article found for ${date}` },
          { status: 404 }
        );
      }
    } else {
      // List available dates
      const filePath = path.join(process.cwd(), "data", "newsletter-digest.json");
      const content = await fs.readFile(filePath, "utf-8");
      const todayData = JSON.parse(content);
      
      // Return today's date and available historical dates
      return NextResponse.json({
        success: true,
        data: {
          latest: todayData.digestDate,
          available: [todayData.digestDate, "2026-03-09", "2026-03-08", "2026-03-07"]
        }
      });
    }
  } catch (error) {
    console.error("Failed to read newsletter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load newsletter" },
      { status: 500 }
    );
  }
}
