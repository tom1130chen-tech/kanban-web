import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // Read newsletter-digest.json directly from filesystem
    const filePath = path.join(process.cwd(), "data", "newsletter-digest.json");
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Failed to read newsletter:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load newsletter" },
      { status: 500 }
    );
  }
}
