# Calendar + To Do 页面数据源说明

## 数据来源
- **Calendar**: Apple Calendar（macOS Automation / `osascript -l JavaScript` 读取未来 3 天事件，遇到权限问题时 fallback 到 `calendar-export.ics`）
- **Todos**: Chat agent 记录的任务，保存在 `memory/YYYY-MM-DD.md` 和 `CHAT-TODO.md`

## 抓取 Apple Calendar 的方式
1. `scripts/auto-update-data.js` 会执行 `osascript -l JavaScript`，直接从 macOS Calendar API 拉取事件（标题、开始时间、地点、备注、是否全天）。
2. 如果 Automation 访问被拒绝，脚本自动切换到项目根目录下的 `calendar-export.ics`，并解析出下一周事件。
3. 处理完数据后，脚本会写入 `data/calendar.json`，并把同一份 JSON 上传到 Vercel Blob（`calendar/events.json`）。
4. 堆栈中用到的 helper：`formatTime()`、`parseICS()` 等都在 `scripts/auto-update-data.js` 里。

## 自动更新时间
脚本由 Cron 每天执行 4 次（America/New_York）：
- 09:00 AM
- 12:00 PM
- 06:00 PM
- 12:00 AM

每次都会刷新本地 JSON 以及 Blob 中的 `calendar/events.json`，并向 Discord 报告事件/待办数量。

## 运行要求
- `node`/`osascript` 需要 Calendar 的 Automation 访问权限。执行脚本时，如果系统弹出“Terminal 想要控制 Calendar”的授权弹窗，请点击“允许”。
- 若脚本提示权限缺失，可手动打开：系统偏好设置 > 隐私与安全性 > 自动化，勾选 Terminal（或运行脚本的 shell）控制 Calendar。

## 手动执行
```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/auto-update-data.js
```

## 常见问题
- **没看到事件？** 先确认 Calendar 的自动化权限；也可以导出 `.ics` 文件（File → Export → Export）放到项目根目录命名为 `calendar-export.ics`，脚本会自动读取。
- **为什么还同步到 Blob？** Blob 备份让其他服务（History页面、dashboard）可以直接引用 `calendar/events.json`，避免每次都读取本地文件。