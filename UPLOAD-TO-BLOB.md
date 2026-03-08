# 📤 上传文章到 Blob 存储

## 当前状态

- ✅ 网页已修改为从 Blob 读取文章
- ✅ 日期按钮和 History 页面已就绪
- ⚠️ **Blob 目前是空的，需要上传文章**

---

## 方法 1：通过 Blob Manager 上传（最简单）

1. **访问**：https://kanban-ops-eta.vercel.app/blob-manager
2. **选择文件**：
   - `data/newsletter-digest.json` → 上传为 `newsletter/2026-03-07.json`
   - `data/newsletter-2026-03-07-special.json` → 上传为 `newsletter/2026-03-07-special.json`
3. **点击** "Upload to Blob"

---

## 方法 2：使用 Vercel CLI

```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board

# 上传 CitriniResearch 翻译
curl -X POST "https://$BLOB_READ_WRITE_TOKEN.blob.vercel-storage.com/newsletter/2026-03-07.json" \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -d @data/newsletter-digest.json

# 上传 CKC335 加更文章
curl -X POST "https://$BLOB_READ_WRITE_TOKEN.blob.vercel-storage.com/newsletter/2026-03-07-special.json" \
  -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -d @data/newsletter-2026-03-07-special.json
```

---

## 方法 3：使用 Node.js 脚本

```bash
cd /Users/tomchen/.openclaw/workspace-chat/kanban-board
node scripts/upload-newsletters.js
```

然后按照提示手动上传。

---

## 验证上传

上传后访问：
- **主页**：https://kanban-ops-eta.vercel.app/
- **History**：https://kanban-ops-eta.vercel.app/history
- **Blob Manager**：https://kanban-ops-eta.vercel.app/blob-manager

---

## 文件结构

```
kanban-ops-blob/
├── newsletter/
│   ├── 2026-03-07.json              (CitriniResearch 翻译)
│   └── 2026-03-07-special.json      (CKC335 加更文章)
├── board-state/
├── calendar/
├── finance/
└── focus/
```
