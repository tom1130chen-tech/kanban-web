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
- **功能**: 读取 calendar.json 和 todos.json 并返回数据

### 3. 数据存储
- **Calendar**: `data/calendar.json`
- **Todos**: `data/todos.json`

### 4. 更新脚本
- **位置**: `scripts/update-calendar-todo-data.js`
- **功能**: 
  - 获取 Google Calendar 事件（当前为示例数据）
  - 读取 todo 列表
  - 保存数据文件

### 5. 定时任务 (Cron Jobs)
| 时间 | Cron ID |
|------|---------|
| 9:00 AM | 07235d67-d30b-4ff6-8e19-826ea5254383 |
| 12:00 PM | 3a1c0792-b459-45fa-a41e-6675b68a0113 |
| 6:00 PM | e4ea5414-d545-4552-b6fa-1cc9301c2617 |
| 9:00 PM | 78bda693-9d8b-4d31-a17b-2d1e4950f49c |

所有任务都在 America/New_York 时区运行，通过 Discord #claw 频道汇报结果。

### 6. Chat Agent Todo 管理
- **文档**: `CHAT-TODO.md`
- Chat 负责记录和管​​理 todo 项目
- Todo 格式包含：id, title, completed, createdAt, source

## 🔧 待完成

### Google Calendar 集成
当前脚本使用示例数据。要启用真实的 Google Calendar：

1. 配置 gog skill:
```bash
openclaw configure --section gog
```

2. 更新脚本中的 `fetchGoogleCalendarEvents()` 函数，使用 gog CLI:
```javascript
const { execSync } = require('child_process');
const events = execSync('gog calendar list --week', 'utf-8');
```

### 页面访问
- **本地开发**: `http://localhost:3000/calendar-todo`
- **生产环境**: `https://kanban-ops-eta.vercel.app/calendar-todo`

## 📋 使用说明

### 添加 Todo
告诉 Chat：
- "添加一个 todo：明天完成项目报告"
- "标记 todo [任务名] 为已完成"

### 手动更新数据
```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/update-calendar-todo-data.js
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
│   └── update-calendar-todo-data.js  # 更新脚本
└── CALNDAR-TODO-README.md    # 文档
```
