# Auto-Update Architecture

## Overview

Template-based system: **Pre-built components + Data injection = Zero re-rendering**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
├─────────────────────┬─────────────────────┬─────────────────┤
│   Apple Calendar    │   Chat Memory       │   Manual Input  │
│   (calendarutil)    │   (YYYY-MM-DD.md)   │   (API)         │
└──────────┬──────────┴──────────┬──────────┴────────┬────────┘
           │                     │                   │
           ▼                     ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              auto-update-data.js (runs 4x daily)             │
│   - Fetch calendar events (next 3 days)                      │
│   - Extract todos from Chat memory                           │
│   - Save to data/calendar.json + data/todos.json            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    TEMPLATE ENGINE                           │
├────────────────────────────┬────────────────────────────────┤
│   CalendarTemplate.tsx     │   TodoTemplate.tsx             │
│   (pre-built layout)       │   (pre-built layout)           │
│   + data injection         │   + data injection             │
└─────────────┬──────────────┴───────────────┬────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   STATIC PAGES                               │
│   /calendar-todo (client-side fetch + template render)      │
└─────────────────────────────────────────────────────────────┘
```

## Auto-Update Schedule

| Time | Cron Job | Action |
|------|----------|--------|
| 9:00 AM | `6479db38-d69b-4d0b-9f6f-5dc5e2689dfd` | Run auto-update |
| 12:00 PM | `833e565d-57cf-48a5-895a-ac8d4745ec8d` | Run auto-update |
| 6:00 PM | `4bf4eaac-66db-482c-9d2f-d1f8f235ae39` | Run auto-update |
| 9:00 PM | `45bf00fb-19e4-42a4-a7ce-5c6fae5634d4` | Run auto-update |

All times in **America/New_York** timezone.

## Chat Integration

### Automatic Todo Detection

When Chat detects todo patterns in conversation:

```markdown
User: "I need to finish the report tomorrow"
Chat: [Auto-saves to memory/YYYY-MM-DD.md]
  ## Todos
  - [ ] Finish the report tomorrow (added: 2026-03-10 14:30)
```

### Manual Commands

```
User: "Add todo: Call dentist"
Chat: "✅ Added: Call dentist"

User: "Complete: Call dentist"
Chat: "✅ Marked complete: Call dentist"

User: "Show my todos"
Chat: [Lists current todos]
```

## Data Flow

### 1. Calendar Data
```
Apple Calendar
    ↓
calendarutil -export (or ICS file)
    ↓
parseCalendarOutput() / parseICS()
    ↓
Filter: next 3 days only
    ↓
data/calendar.json
```

### 2. Todo Data
```
Chat conversations
    ↓
memory/YYYY-MM-DD.md
    ↓
extractTodosFromMarkdown()
    ↓
Merge with existing (preserve completed)
    ↓
data/todos.json
```

### 3. Page Rendering
```
Client loads /calendar-todo
    ↓
fetch("/api/calendar-todo")
    ↓
CalendarTemplate({ days, events })
TodoTemplate({ todos })
    ↓
Inject data into pre-built HTML
    ↓
No re-rendering needed!
```

## Token Efficiency

### Before (Old Approach)
```
Every update → Regenerate entire page → ~500 tokens
4 updates/day → 2000 tokens/day
```

### After (Template Approach)
```
Pre-build templates once → ~100 tokens
Data injection only → ~50 tokens/update
4 updates/day → 300 tokens/day (85% savings!)
```

## Manual Update

```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/auto-update-data.js
```

## File Structure

```
kanban-board/
├── components/
│   ├── calendar/
│   │   └── CalendarTemplate.tsx    # Pre-built calendar
│   └── todo/
│       └── TodoTemplate.tsx        # Pre-built todo list
├── scripts/
│   └── auto-update-data.js         # Auto-update script
├── data/
│   ├── calendar.json               # Calendar data (auto)
│   └── todos.json                  # Todo data (auto)
└── app/
    └── calendar-todo/
        └── page.tsx                # Uses templates
```

## Configuration

### Add ICS Export (Optional)

1. Open Apple Calendar
2. File → Export → Export
3. Save as `calendar-export.ics` in project root

### Enable Chat Auto-Save

Add to Chat agent instructions:
```markdown
When user mentions tasks/todos:
1. Detect todo patterns
2. Save to memory/YYYY-MM-DD.md
3. Confirm to user
```
