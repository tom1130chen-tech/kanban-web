import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "kanban.json");
    const content = await fs.readFile(filePath, "utf-8");
    const kanban = JSON.parse(content);
    
    return NextResponse.json({
      success: true,
      data: kanban,
    });
  } catch (error) {
    console.error("Failed to read kanban:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load kanban board" },
      { status: 500 }
    );
  }
}
