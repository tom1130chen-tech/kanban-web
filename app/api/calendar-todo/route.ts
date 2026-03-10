import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CALENDAR_FILE = path.join(DATA_DIR, "calendar.json");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

export async function GET() {
  try {
    // Read calendar data
    let calendarEvents = [];
    try {
      const calendarData = await fs.readFile(CALENDAR_FILE, "utf-8");
      calendarEvents = JSON.parse(calendarData);
    } catch (err) {
      console.log("No calendar data found, using empty array");
    }

    // Read todos data
    let todos = [];
    try {
      const todosData = await fs.readFile(TODOS_FILE, "utf-8");
      todos = JSON.parse(todosData);
    } catch (err) {
      console.log("No todos data found, using empty array");
    }

    // Get last updated time from file metadata or use current time
    let lastUpdated = new Date().toISOString();
    try {
      const stats = await fs.stat(CALENDAR_FILE);
      lastUpdated = stats.mtime.toISOString();
    } catch {
      try {
        const stats = await fs.stat(TODOS_FILE);
        lastUpdated = stats.mtime.toISOString();
      } catch {
        lastUpdated = new Date().toISOString();
      }
    }

    return NextResponse.json({
      calendarEvents,
      todos,
      lastUpdated,
    });
  } catch (error) {
    console.error("Error reading calendar-todo data:", error);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
