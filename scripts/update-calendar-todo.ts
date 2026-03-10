#!/usr/bin/env ts-node

/**
 * Update calendar and todo data for the website
 * Fetches from Google Calendar and todo storage
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CALENDAR_FILE = path.join(DATA_DIR, "calendar.json");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  source?: string;
}

async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  // TODO: Integrate with Google Calendar API
  // For now, return placeholder events
  console.log("Fetching calendar events...");
  
  // Placeholder - will be replaced with actual Google Calendar integration
  return [
    {
      id: "cal-1",
      title: "Team Standup",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      description: "Daily sync with the team",
    },
  ];
}

async function fetchTodos(): Promise<TodoItem[]> {
  // Read todos from chat agent storage
  console.log("Fetching todos...");
  
  try {
    const todosData = await fs.readFile(TODOS_FILE, "utf-8");
    return JSON.parse(todosData);
  } catch (err) {
    console.log("No existing todos found");
    return [];
  }
}

async function saveCalendarEvents(events: CalendarEvent[]) {
  await fs.writeFile(CALENDAR_FILE, JSON.stringify(events, null, 2));
  console.log(`Saved ${events.length} calendar events`);
}

async function saveTodos(todos: TodoItem[]) {
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
  console.log(`Saved ${todos.length} todos`);
}

async function main() {
  console.log("Starting calendar-todo update...");
  
  try {
    // Fetch and save calendar events
    const calendarEvents = await fetchCalendarEvents();
    await saveCalendarEvents(calendarEvents);
    
    // Fetch and save todos
    const todos = await fetchTodos();
    await saveTodos(todos);
    
    console.log("Update completed successfully!");
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

main();
