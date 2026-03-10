#!/usr/bin/env node

/**
 * Auto-update Calendar & Todo Data
 * 
 * Sources:
 * - Apple Calendar (via calendarutil or ICS export)
 * - Chat agent todos (from memory file)
 * 
 * Output: data/calendar.json + data/todos.json
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CALENDAR_FILE = path.join(DATA_DIR, 'calendar.json');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');
const CHAT_TODO_FILE = path.join(process.env.HOME, '.openclaw/workspace-chat/memory', new Date().toISOString().split('T')[0] + '.md');

// Get next 3 days (today + 2 days)
function getNext3Days() {
  const days = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// Parse Apple Calendar events
async function fetchAppleCalendar() {
  const next3Days = getNext3Days();
  const { startOfWeek, endOfWeek } = getWeekBounds();
  
  try {
    // Try calendarutil first
    const cmd = `calendarutil -export -start "${startOfWeek.toISOString()}" -end "${endOfWeek.toISOString()}" 2>/dev/null`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    return parseCalendarOutput(output, next3Days);
  } catch (err) {
    // Fallback to ICS file
    try {
      const icsPath = path.join(__dirname, '..', 'calendar-export.ics');
      const icsContent = await fs.readFile(icsPath, 'utf-8');
      return parseICS(icsContent, next3Days);
    } catch (icsErr) {
      console.log('No calendar source available');
      return [];
    }
  }
}

function getWeekBounds() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { startOfWeek: start, endOfWeek: end };
}

function parseCalendarOutput(output, validDates) {
  // Parse calendarutil output (simplified)
  const events = [];
  // TODO: Implement proper parsing
  return events;
}

function parseICS(icsContent, validDates) {
  const events = [];
  const lines = icsContent.split('\r\n').join('\n').split('\n');
  let currentEvent = null;
  
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { id: `ics-${Date.now()}-${Math.random()}` };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.date) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent && line.startsWith('SUMMARY:')) {
      currentEvent.title = line.slice(8);
    } else if (currentEvent && line.startsWith('DTSTART:')) {
      const dateStr = line.slice(8);
      const date = new Date(dateStr);
      const dateOnly = date.toISOString().split('T')[0];
      if (validDates.includes(dateOnly)) {
        currentEvent.date = dateOnly;
        currentEvent.time = formatTime(date);
      }
    } else if (currentEvent && line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.slice(12);
    }
  }
  
  return events;
}

function formatTime(date) {
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h} ${ampm}`;
}

// Fetch todos from Chat agent memory
async function fetchChatTodos() {
  const todos = [];
  
  // Try to read from Chat workspace memory
  try {
    const today = new Date().toISOString().split('T')[0];
    const memoryFiles = [
      path.join(process.env.HOME, '.openclaw/workspace-chat/memory', `${today}.md`),
      path.join(process.env.HOME, '.openclaw/workspace-chat/CHAT-TODO.md'),
    ];
    
    for (const file of memoryFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const extracted = extractTodosFromMarkdown(content);
        todos.push(...extracted);
      } catch (err) {
        // File doesn't exist, skip
      }
    }
  } catch (err) {
    console.log('No chat todos found');
  }
  
  // Also read existing todos.json to preserve completed items
  try {
    const existing = JSON.parse(await fs.readFile(TODOS_FILE, 'utf-8'));
    const existingIds = new Set(todos.map(t => t.id));
    
    // Keep completed todos from existing
    for (const todo of existing) {
      if (todo.completed && !existingIds.has(todo.id)) {
        todos.push(todo);
      }
    }
  } catch (err) {
    // No existing file
  }
  
  return todos;
}

function extractTodosFromMarkdown(content) {
  const todos = [];
  const lines = content.split('\n');
  
  // Look for todo patterns like:
  // - [ ] Task description
  // - [x] Completed task
  // - TODO: Task description
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let match = null;
    
    // Pattern: - [ ] or - [x]
    if (line.match(/^[-*]\s*\[([ x])\]\s*(.+)/)) {
      match = line.match(/^[-*]\s*\[([ x])\]\s*(.+)/);
    }
    // Pattern: TODO: or todo:
    else if (line.match(/^(TODO|todo):\s*(.+)/i)) {
      match = line.match(/^(TODO|todo):\s*(.+)/i);
    }
    
    if (match) {
      const completed = match[1] === 'x' || match[1] === 'X';
      const title = match[2] || match[1];
      
      todos.push({
        id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: title.trim(),
        completed: completed,
        createdAt: new Date().toISOString(),
        source: 'chat',
      });
    }
  }
  
  return todos;
}

// Save to JSON files (template-ready format)
async function saveData(calendar, todos) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  await fs.writeFile(CALENDAR_FILE, JSON.stringify(calendar, null, 2));
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
  
  console.log(`✅ Saved ${calendar.length} calendar events`);
  console.log(`✅ Saved ${todos.length} todos`);
}

// Main execution
async function main() {
  console.log('🔄 Auto-updating calendar and todos...\n');
  
  try {
    const [calendar, todos] = await Promise.all([
      fetchAppleCalendar(),
      fetchChatTodos(),
    ]);
    
    await saveData(calendar, todos);
    
    console.log('\n✅ Update completed!');
    console.log(`   Calendar: ${calendar.length} events (next 3 days)`);
    console.log(`   Todos: ${todos.length} tasks`);
    
    // Output for cron logging
    console.log('\n📊 Summary:');
    console.log(`   - Calendar events: ${calendar.length}`);
    console.log(`   - Active todos: ${todos.filter(t => !t.completed).length}`);
    console.log(`   - Completed todos: ${todos.filter(t => t.completed).length}`);
    
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

main();
