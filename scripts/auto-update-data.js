#!/usr/bin/env node

/**
 * Auto-update Calendar & Todo Data
 *
 * Sources:
 * - Apple Calendar (via JavaScript for Automation / JXA or ICS export)
 * - Chat agent todos (from memory)
 *
 * Output: data/calendar.json + data/todos.json (plus backup to blob)
 */

const { promises: fsp } = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CALENDAR_FILE = path.join(DATA_DIR, 'calendar.json');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');
const ENV_FILE = path.join(__dirname, '..', '.env.local');

function getNext3Days() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const copy = new Date(now);
    copy.setDate(copy.getDate() + i);
    copy.setHours(0, 0, 0, 0);
    days.push(formatDate(copy));
  }
  return days;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h} ${ampm}`;
}

async function fetchAppleCalendar() {
  const next3Days = getNext3Days();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 3);

  try {
    const rawEvents = runAppleScript(start.getTime(), end.getTime());
    return transformEvents(rawEvents, next3Days);
  } catch (error) {
    console.warn('⚠️  AppleScript calendar fetch failed:', error.message);
  }

  try {
    const icsPath = path.join(__dirname, '..', 'calendar-export.ics');
    const icsContent = await fsp.readFile(icsPath, 'utf-8');
    return parseICS(icsContent, next3Days);
  } catch (icsErr) {
    console.warn('⚠️  ICS fallback failed:', icsErr.message);
  }

  return [];
}

function runAppleScript(startMs, endMs) {
  const script = `
var app = Application('Calendar');
var start = new Date(${startMs});
var end = new Date(${endMs});
var events = [];
app.calendars().forEach(function(cal) {
  cal.events().forEach(function(ev) {
    var sd = ev.startDate();
    if (sd >= start && sd < end) {
      var title = ev.summary() || 'Untitled';
      var safeId = (cal.name() + '-' + sd.getTime() + '-' + title).replace(/[^a-zA-Z0-9_-]/g, '-');
      events.push({
        id: safeId,
        title: title,
        description: ev.description() || '',
        location: ev.location() || '',
        start: sd.toISOString(),
        calendar: cal.name(),
        allDay: typeof ev.allDayEvent === 'function' ? ev.allDayEvent() : false
      });
    }
  });
});
events.sort(function(a, b) {
  return new Date(a.start) - new Date(b.start);
});
JSON.stringify(events);
`;

  const output = execSync(`osascript -l JavaScript <<'JXA'\n${script}\nJXA`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return JSON.parse(output.trim() || '[]');
}

function transformEvents(rawEvents, validDates) {
  return rawEvents
    .map((event) => {
      if (!event.start) return null;
      const start = new Date(event.start);
      const dateOnly = formatDate(start);
      if (!validDates.includes(dateOnly)) return null;

      return {
        id: event.id || `cal-${dateOnly}-${start.getTime()}`,
        title: event.title || 'Untitled',
        calendar: event.calendar || 'Calendar',
        description: event.description || '',
        location: event.location || '',
        date: dateOnly,
        time: event.allDay ? 'All day' : formatTime(start),
      };
    })
    .filter(Boolean);
}

function parseICS(icsContent, validDates) {
  const events = [];
  const lines = icsContent.replace(/\r\n/g, '\n').split('\n');
  let currentEvent = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { id: `ics-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.date) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.slice(8);
      } else if (line.startsWith('DTSTART:')) {
        const dateStr = line.slice(8);
        const date = new Date(dateStr);
        const dateOnly = formatDate(date);
        if (validDates.includes(dateOnly)) {
          currentEvent.date = dateOnly;
          currentEvent.time = formatTime(date);
        }
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.slice(12);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.slice(9);
      }
    }
  }

  return events;
}

async function fetchChatTodos() {
  const todos = [];
  const today = new Date().toISOString().split('T')[0];
  const memoryFiles = [
    path.join(process.env.HOME || '', '.openclaw/workspace-chat/memory', `${today}.md`),
    path.join(process.env.HOME || '', '.openclaw/workspace-chat/CHAT-TODO.md'),
  ];

  for (const file of memoryFiles) {
    try {
      const content = await fsp.readFile(file, 'utf-8');
      const extracted = extractTodosFromMarkdown(content);
      todos.push(...extracted);
    } catch (err) {
      // ignore missing files
    }
  }

  try {
    const existing = JSON.parse(await fsp.readFile(TODOS_FILE, 'utf-8'));
    const existingIds = new Set(todos.map((t) => t.id));
    for (const todo of existing) {
      if (todo.completed && !existingIds.has(todo.id)) {
        todos.push(todo);
      }
    }
  } catch (err) {
    // no existing todos
  }

  return todos;
}

function extractTodosFromMarkdown(content) {
  const todos = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    let match = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.+)/);
    if (!match) {
      match = trimmed.match(/^(TODO|todo):\s*(.+)/i);
    }

    if (match) {
      const completed = match[1] === 'x' || match[1] === 'X';
      const title = match[2];
      todos.push({
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim(),
        completed,
        createdAt: new Date().toISOString(),
        source: 'chat',
      });
    }
  }

  return todos;
}

async function saveData(calendar, todos) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.writeFile(CALENDAR_FILE, JSON.stringify(calendar, null, 2));
  await fsp.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
  console.log(`✅ Saved ${calendar.length} calendar events`);
  console.log(`✅ Saved ${todos.length} todos`);
}

async function resolveBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  try {
    const envContent = await fsp.readFile(ENV_FILE, 'utf-8');
    const match = envContent.match(/BLOB_READ_WRITE_TOKEN="([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function uploadCalendarToBlob(events) {
  const token = await resolveBlobToken();
  if (!token) {
    console.log('⚠️  BLOB_READ_WRITE_TOKEN missing, skipping calendar blob upload');
    return false;
  }

  try {
    process.env.BLOB_READ_WRITE_TOKEN = token;
    const { put } = require('@vercel/blob');
    await put('calendar/events.json', JSON.stringify(events, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
    console.log('✅ Uploaded calendar/events.json to blob');
    return true;
  } catch (error) {
    console.warn('⚠️  Blob upload failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Auto-updating calendar and todos...\n');

  try {
    const [calendar, todos] = await Promise.all([fetchAppleCalendar(), fetchChatTodos()]);
    await saveData(calendar, todos);

    const blobUploaded = await uploadCalendarToBlob(calendar);

    console.log('\n✅ Update completed!');
    console.log(`   Calendar: ${calendar.length} events (next 3 days)`);
    console.log(`   Todos: ${todos.length} tasks`);
    console.log(`   Blob upload: ${blobUploaded ? 'completed' : 'skipped/failure'}`);

    console.log('\n📊 Summary:');
    console.log(`   - Calendar events: ${calendar.length}`);
    console.log(`   - Active todos: ${todos.filter((t) => !t.completed).length}`);
    console.log(`   - Completed todos: ${todos.filter((t) => t.completed).length}`);
  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    process.exit(1);
  }
}

main();
