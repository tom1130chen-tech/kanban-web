# Daily Newsletter 格式模板（新版）

## 格式要求

**执行时间**：每天 9:00 AM EST 开始

**核心变化**：
1. ⏰ 时间从 7:30 AM → 9:00 AM
2. 📦 按来源分模块，每个模块独立
3. 🏷️ 每个模块标注清晰的信息源
4. 📏 总长度不做限制

---

## 数据结构

```json
{
  "digestDate": "2026-03-10",
  "article": {
    "title": "2026-03-10 每日科技简报",
    "subtitle": "按来源分类的科技与商业洞察",
    "content": "<div class=\"newsletter-modules\">...</div>",
    "sources": [
      { "name": "Stratechery", "url": "https://stratechery.com", "type": "newsletter" },
      { "name": "MIT Tech Review", "url": "https://technologyreview.com", "type": "news" }
    ],
    "author": "Chat",
    "tags": ["AI", "Tech", "Business"]
  },
  "metadata": {
    "wordCount": 2000,
    "readTime": "10 min",
    "language": "zh-CN"
  }
}
```

---

## HTML 模块格式

```html
<div class="newsletter-modules">
  
  <!-- 模块 1: Stratechery -->
  <section class="source-module">
    <h2 class="source-header">📰 Stratechery</h2>
    <div class="article-card">
      <h3>文章标题</h3>
      <p class="summary">核心观点（1-2 句）</p>
      <ul class="key-points">
        <li>关键数据/洞察 1</li>
        <li>关键数据/洞察 2</li>
      </ul>
      <a href="原文链接" class="read-more">阅读原文 →</a>
    </div>
  </section>
  
  <!-- 模块 2: MIT Tech Review -->
  <section class="source-module">
    <h2 class="source-header">🔬 MIT Technology Review</h2>
    <div class="article-card">
      <h3>文章标题</h3>
      <p class="summary">核心观点</p>
      <ul class="key-points">
        <li>关键洞察</li>
      </ul>
      <a href="原文链接" class="read-more">阅读原文 →</a>
    </div>
  </section>
  
  <!-- 更多模块... -->
  
</div>
```

---

## CSS 样式（添加到 globals.css）

```css
.newsletter-modules {
  max-width: 1100px;
  margin: 0 auto;
}

.source-module {
  margin-bottom: 48px;
  padding: 24px;
  border: 2px solid var(--accent);
  border-radius: var(--r-wobbly-md);
  box-shadow: 4px 4px 0 var(--shadow);
}

.source-header {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px dashed var(--accent);
}

.article-card {
  background: white;
  padding: 16px;
  border-radius: var(--r-wobbly);
}

.article-card h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.summary {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
}

.key-points {
  margin: 12px 0;
  padding-left: 20px;
}

.key-points li {
  margin-bottom: 6px;
}

.read-more {
  display: inline-block;
  margin-top: 12px;
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}

.read-more:hover {
  text-decoration: underline;
}
```

---

## 示例内容

```json
{
  "digestDate": "2026-03-10",
  "article": {
    "title": "2026-03-10 每日科技简报",
    "subtitle": "AI 代理安全与微软生态反击",
    "content": "<div class=\"newsletter-modules\"><section class=\"source-module\"><h2 class=\"source-header\">📰 Stratechery</h2><div class=\"article-card\"><h3>AI 代理安全危机</h3><p class=\"summary\">提示注入链攻击首次大规模暴露，多家企业受影响。</p><ul class=\"key-points\"><li>攻击者通过多层代理传递恶意提示</li><li>传统单点防御失效</li><li>行业急需统一安全标准</li></ul><a href=\"https://stratechery.com/...\" class=\"read-more\">阅读原文 →</a></div></section><section class=\"source-module\"><h2 class=\"source-header\">🔬 MIT Technology Review</h2><div class=\"article-card\"><h3>微软发布 Microsoft 365 Agent Layer</h3><p class=\"summary\">定义企业代理安全新标准，整合现有 M365 生态。</p><ul class=\"key-points\"><li>内置安全沙箱和权限隔离</li><li>与企业现有身份系统深度整合</li><li>可能成为事实标准</li></ul><a href=\"https://technologyreview.com/...\" class=\"read-more\">阅读原文 →</a></div></section></div>",
    "sources": [
      { "name": "Stratechery", "url": "https://stratechery.com", "type": "newsletter", "summary": "AI 代理安全分析" },
      { "name": "MIT Tech Review", "url": "https://technologyreview.com", "type": "news", "summary": "微软新产品发布" }
    ],
    "author": "Chat",
    "tags": ["AI", "Security", "Microsoft"]
  },
  "metadata": {
    "wordCount": 1500,
    "readTime": "8 min",
    "language": "zh-CN"
  }
}
```

---

## 工作流程

1. **9:00 AM** - Cron 触发
2. **读取邮件** - AgentMail 收件箱
3. **按来源分类** - Stratechery、MIT、TechCrunch 等
4. **撰写模块** - 每个来源独立模块
5. **保存 Blob** - `newsletter/YYYY-MM-DD.json`
6. **更新本地** - `data/newsletter-digest.json`
7. **Git 提交** - 触发 Vercel 部署
8. **Discord 汇报** - 完成状态

---

**总长度不做限制**，根据实际内容多少撰写！📝
