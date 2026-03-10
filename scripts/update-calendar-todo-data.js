#!/usr/bin/env node

/**
 * Update Calendar-Todo Page Data
 * 
 * This script:
 * 1. Fetches events from Google Calendar for this week
 * 2. Reads todos from chat storage
 * 3. Saves both to the kanban-board data directory
 * 
 * Usage: node scripts/update-calendar-todo-data.js
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CALENDAR_FILE = path.join(DATA_DIR, 'calendar.json');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');

// Get start and end of current week (Sunday to Saturday)
function getWeekBounds() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
}

async function fetchGoogleCalendarEvents() {
  console.log('📅 Fetching Google Calendar events...');
  
  // TODO: Integrate with Google Calendar API using gog skill
  // For now, return placeholder events
  const { startOfWeek, endOfWeek } = getWeekBounds();
  
  // Sample events - will be replaced with actual API calls
  const events = [
    {
      id: 'evt-1',
      title: 'Team Standup',
      date: startOfWeek.toISOString().split('T')[0],
      time: '09:00',
      description: 'Daily team sync',
    },
    {
      id: 'evt-2',
      title: 'Project Review',
      date: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      description: 'Weekly project review meeting',
    },
  ];
  
  console.log(`   Found ${events.length} events for this week`);
  return events;
}

async function readTodos() {
  console.log('📝 Reading todos...');
  
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf-8');
    const todos = JSON.parse(data);
    console.log(`   Found ${todos.length} todos`);
    return todos;
  } catch (err) {
    console.log('   No existing todos found');
    return [];
  }
}

async function saveToFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`   ✓ Saved to ${path.basename(filePath)}`);
}

async function main() {
  console.log('🔄 Starting Calendar-Todo update...\n');
  
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Fetch and save calendar events
    const calendarEvents = await fetchGoogleCalendarEvents();
    await saveToFile(CALENDAR_FILE, calendarEvents);
    
    // Read and save todos (unchanged, just ensuring file exists)
    const todos = await readTodos();
    await saveToFile(TODOS_FILE, todos);
    
    console.log('\n✅ Update completed successfully!');
    console.log(`   Calendar: ${calendarEvents.length} events`);
    console.log(`   Todos: ${todos.length} tasks`);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

main();
