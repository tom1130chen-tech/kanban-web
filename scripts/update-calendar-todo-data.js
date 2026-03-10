#!/usr/bin/env node

/**
 * Update Calendar-Todo Page Data
 * 
 * This script:
 * 1. Fetches events from Apple Calendar (iCloud) for this week
 * 2. Reads todos from chat storage
 * 3. Saves both to the kanban-board data directory
 * 
 * Usage: node scripts/update-calendar-todo-data.js
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

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

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Format time to HH:MM
function formatTime(date) {
  return date.toTimeString().split(' ')[0].slice(0, 5);
}

async function fetchAppleCalendarEvents() {
  console.log('📅 Fetching Apple Calendar events...');
  
  const { startOfWeek, endOfWeek } = getWeekBounds();
  
  try {
    // Use macOS calendarutil to export calendar data
    // This requires Apple Calendar to be configured on the system
    const cmd = `calendarutil -export -start "${startOfWeek.toISOString()}" -end "${endOfWeek.toISOString()}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    
    // Parse the output (format depends on calendarutil output)
    // For now, return placeholder if parsing fails
    const events = parseCalendarOutput(output);
    
    console.log(`   Found ${events.length} events for this week`);
    return events;
  } catch (err) {
    console.log('   calendarutil not available, using fallback method');
    
    // Fallback: Try to read from .ics file if exported
    try {
      const icsPath = path.join(__dirname, '..', 'calendar-export.ics');
      const icsContent = await fs.readFile(icsPath, 'utf-8');
      const events = parseICS(icsContent, startOfWeek, endOfWeek);
      console.log(`   Found ${events.length} events from ICS file`);
      return events;
    } catch (icsErr) {
      console.log('   No ICS file found, using sample events');
      // Return sample events for testing
      return [
        {
          id: 'apple-cal-1',
          title: 'Team Standup',
          date: formatDate(startOfWeek),
          time: '09:00',
          description: 'Daily team sync',
        },
        {
          id: 'apple-cal-2',
          title: 'Project Review',
          date: formatDate(new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000)),
          time: '14:00',
          description: 'Weekly project review meeting',
        },
      ];
    }
  }
}

// Parse calendarutil output (simplified)
function parseCalendarOutput(output) {
  // TODO: Implement proper parsing based on calendarutil output format
  // For now, return empty array
  return [];
}

// Parse ICS file format
function parseICS(icsContent, startDate, endDate) {
  const events = [];
  const lines = icsContent.split('\r\n').join('\n').split('\n');
  
  let currentEvent = null;
  
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { id: `ics-${Date.now()}-${Math.random()}` };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent && line.startsWith('SUMMARY:')) {
      currentEvent.title = line.slice(8);
    } else if (currentEvent && line.startsWith('DTSTART')) {
      const dateStr = line.split(':')[1];
      const date = new Date(dateStr);
      if (date >= startDate && date <= endDate) {
        currentEvent.date = formatDate(date);
        currentEvent.time = formatTime(date);
      }
    } else if (currentEvent && line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.slice(12);
    }
  }
  
  return events.filter(e => e.date);
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
    const calendarEvents = await fetchAppleCalendarEvents();
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
