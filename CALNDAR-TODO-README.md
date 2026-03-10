# Calendar + To Do Page

## Overview
This page displays your weekly calendar events and todo list in a split view:
- **Left (2/3)**: Google Calendar events for the current week
- **Right (1/3)**: Todo items managed by Chat agent

## Files
- `app/calendar-todo/page.tsx` - The main page component
- `app/api/calendar-todo/route.ts` - API endpoint to fetch data
- `data/calendar.json` - Calendar events storage
- `data/todos.json` - Todo items storage
- `scripts/update-calendar-todo-data.js` - Update script

## Auto-Update Schedule
The page data is automatically updated at:
- **9:00 AM** - Morning update
- **12:00 PM** - Noon update
- **6:00 PM** - Evening update
- **9:00 PM** - Night update

All times are in America/New_York timezone.

## Manual Update
```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/update-calendar-todo-data.js
```

## Access
Visit: `https://kanban-ops-eta.vercel.app/calendar-todo`

## Todo Management
Chat agent manages todos. To add a todo:
- Tell Chat: "Add a todo: [task description]"
- Chat will save it to `data/todos.json`
- It will appear on the page after the next update

## Google Calendar Integration
To enable real Google Calendar data:
1. Configure gog skill with Google API credentials
2. Update `scripts/update-calendar-todo-data.js` to call Google Calendar API
3. Fetch events for the current week (Sunday to Saturday)
