# 🔐 GitHub Secrets 配置指南

## 需要的 Secrets

访问：https://github.com/tom1130chen-tech/kanban-web/settings/secrets/actions

添加以下 3 个 secrets：

### 1. VERCEL_TOKEN

**获取方法**：
1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 选择 "Machine" 类型
4. 命名：`kanban-web-github-actions`
5. 复制 token
6. 在 GitHub Secrets 中添加：
   - Name: `VERCEL_TOKEN`
   - Value: `复制的 token`

### 2. VERCEL_ORG_ID

**获取方法**：
1. 访问 https://vercel.com/bottomchens-projects/kanban-ops/settings
2. 找到 "Git" 部分
3. 复制 "Organization ID"
4. 在 GitHub Secrets 中添加：
   - Name: `VERCEL_ORG_ID`
   - Value: `复制的 ID`

### 3. VERCEL_PROJECT_ID

**获取方法**：
1. 访问 https://vercel.com/bottomchens-projects/kanban-ops/settings
2. 找到 "Git" 部分
3. 复制 "Project ID"
4. 在 GitHub Secrets 中添加：
   - Name: `VERCEL_PROJECT_ID`
   - Value: `复制的 ID`

---

## 验证配置

配置完成后：

1. **Commit 并 push** 任何更改到 `data/newsletter*.json`
2. **访问**：https://github.com/tom1130chen-tech/kanban-web/actions
3. **查看** "Auto-Upload Newsletters to Vercel Blob" workflow
4. **确认** 上传成功

---

## 工作流程

```
push to main (data/newsletter*.json)
    ↓
GitHub Actions triggered
    ↓
Install Vercel CLI
    ↓
Upload to Blob
    ↓
✅ Success / ❌ Failed
```

---

## 日常使用

**你只需要**：
1. ✍️ 写文章
2. 💾 保存到 `data/newsletter-YYYY-MM-DD.json`
3. 📄 更新 `newsletter-digest.json`
4. 🚀 `git commit + push`
5. ✅ **自动上传到 Blob！**

**完全自动化，无需手动操作！** 🎉
