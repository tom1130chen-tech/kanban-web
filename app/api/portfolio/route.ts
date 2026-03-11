import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "portfolio.json");
    const content = await fs.readFile(filePath, "utf-8");
    const portfolio = JSON.parse(content);
    
    return NextResponse.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("Failed to read portfolio:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load portfolio" },
      { status: 500 }
    );
  }
}
