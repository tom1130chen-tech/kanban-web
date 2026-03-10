# Calendar + To Do 页面实现总结

## ✅ 已完成

### 1. 页面创建
- **位置**: `app/calendar-todo/page.tsx`
- **布局**: 左边 2/3 Calendar，右边 1/3 Todo
- **功能**: 
  - 显示本周日历事件（按日期分组）
  - 显示 todo 列表（带完成状态）
  - 显示最后更新时间

### 2. API 接口
- **位置**: `app/api/calendar-todo/route.ts`
- **功能**: 读取 `calendar.json` 和 `todos.json` 并返回数据给前端

### 3. 数据存储
- **Calendar**: `data/calendar.json`（自动生成）
- **Todos**: `data/todos.json`（Chat 会话生成）
- **Blob 备份**: `calendar/events.json`（同步到 Vercel Blob，供其他页面/工具使用）

### 4. 更新脚本
- **位置**: `scripts/auto-update-data.js`
- **功能**: 
  - 使用 macOS Automation（JavaScript for Automation/`osascript`）抓取未来 3 天的 Apple Calendar 事件
  - 解析 `memory/YYYY-MM-DD.md` + `CHAT-TODO.md` 中的 todo 条目
  - 写入 `data/calendar.json` + `data/todos.json`
  - 自动上传 `calendar/events.json` 到 Vercel Blob（`BLOB_READ_WRITE_TOKEN`）作为备份
  - 如果 Automation 失效则自动 fallback 到 `calendar-export.ics`

### 5. 定时任务 (Cron Jobs)
| 时间 | Cron ID |
|------|---------|
| 9:00 AM | `6479db38-d69b-4d0b-9f6f-5dc5e2689dfd` |
| 12:00 PM | `833e565d-57cf-48a5-895a-ac8d4745ec8d` |
| 6:00 PM | `4bf4eaac-66db-482c-9d2f-d1f8f235ae39` |
| 12:00 AM | `45bf00fb-19e4-42a4-a7ce-5c6fae5634d4` |

所有任务都在 America/New_York 时区运行，通过 Discord #claw 频道汇报结果。

### 6. Chat Agent Todo 管理
- **文档**: `CHAT-TODO.md`
- Chat 负责记录和管理 todo 项目
- Todo 格式包含：`id`, `title`, `completed`, `createdAt`, `source`

## 📋 使用说明

### 授权提示
`node`/`osascript` 需要控制 Calendar 的 Automation 权限；系统会弹窗询问，允许后 cron 任务即可直接运行。

### 添加 Todo
告诉 Chat：
- "添加一个 todo：明天完成项目报告"
- "标记 todo [任务名] 为已完成"

### 手动更新数据
```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/auto-update-data.js
```

### 查看 Cron 任务
```bash
openclaw cron list
```

## 📁 文件结构
```
kanban-board/
├── app/
│   ├── calendar-todo/
│   │   └── page.tsx          # 主页面
│   └── api/
│       └── calendar-todo/
│           └── route.ts      # API 接口
├── data/
│   ├── calendar.json         # 日历数据
│   └── todos.json            # Todo 数据
├── scripts/
│   └── auto-update-data.js   # 自动更新脚本
└── CALNDAR-TODO-README.md    # 文档
```
