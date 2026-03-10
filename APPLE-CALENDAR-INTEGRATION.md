# Calendar + To Do 页面

## 数据来源
- **Calendar**: Apple Calendar (iCloud) - 通过 macOS `calendarutil` 或 ICS 导出文件
- **Todo**: Chat agent 管理，存储在 `data/todos.json`

## Apple Calendar 集成方式

### 方法 1: calendarutil CLI（推荐）
macOS 自带工具，直接读取系统日历：
```bash
calendarutil -export -start "2026-03-10T00:00:00" -end "2026-03-17T23:59:59"
```

### 方法 2: ICS 文件导出
从 Apple Calendar 导出 ICS 文件：
1. 打开 Apple Calendar
2. File → Export → Export
3. 保存为 `calendar-export.ics` 到项目根目录

脚本会自动检测并使用这两种方式之一。

## 自动更新时间
每天 4 次（America/New_York 时区）：
- 9:00 AM
- 12:00 PM
- 6:00 PM
- 9:00 PM

## 手动更新
```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/update-calendar-todo-data.js
```

## Todo 管理
告诉 Chat agent：
- "添加一个 todo：明天完成报告"
- "标记 todo 报告 为已完成"
