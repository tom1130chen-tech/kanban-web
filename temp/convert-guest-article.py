#!/usr/bin/env python3
"""
Convert Word document to newsletter JSON and save to data/ folder
This will trigger GitHub Actions to auto-upload to Blob
"""

from docx import Document
import json
from datetime import datetime

# Read Word document
doc = Document('/Users/tomchen/.openclaw/media/inbound/20696d11-7987-4b99-b135-df4ac9ace2ab.docx')

# Extract text
paragraphs = []
for para in doc.paragraphs:
    if para.text.strip():
        paragraphs.append(para.text.strip())

full_text = '\n\n'.join(paragraphs)

# Convert to HTML
def para_to_html(text):
    """Convert paragraph to HTML with proper formatting"""
    lines = text.split('\n')
    html_parts = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Detect section headers (short line, no punctuation at end)
        if len(line) < 80 and not line.endswith(('。', '.', '!', '！', '?', '？', '）')):
            html_parts.append(f'<h3>{line}</h3>')
        else:
            # Regular paragraph
            line = line.replace('**', '<strong>').replace('**', '</strong>')
            html_parts.append(f'<p>{line}</p>')
    
    return '\n'.join(html_parts)

# Build HTML content
html_content = '<p class="lead">本文探讨了 AI 时代下人类智能与机器智能的关系，以及教育、认知和创造力的重新定义。</p>'

# Process paragraphs
for i, para in enumerate(paragraphs):
    if i == 0:
        continue  # Skip first paragraph (already in lead)
    
    # Detect section headers
    if len(para) < 60 and not para.endswith(('。', '.', '!', '！', '?', '？', '）')):
        html_content += f'\n\n<h2>{para}</h2>'
    else:
        html_content += f'\n\n<p>{para}</p>'

# Create newsletter JSON
today = datetime.now().strftime('%Y-%m-%d')
newsletter = {
    "digestDate": today,
    "article": {
        "title": "智能的边界：AI 时代的人类认知重构",
        "subtitle": "从工具理性到存在价值的思考",
        "content": html_content,
        "author": "CKC335",
        "sources": [
            {
                "name": "Guest Article",
                "type": "article",
                "url": "https://kanban-ops-eta.vercel.app/",
                "summary": "独家投稿"
            }
        ],
        "tags": ["AI", "Philosophy", "Education", "Cognition", "Creativity"]
    },
    "metadata": {
        "wordCount": len(full_text),
        "readTime": "10 min",
        "language": "zh-CN",
        "template": "guest-article"
    }
}

# Save to file
output_file = f'/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/newsletter-{today}-guest.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(newsletter, f, ensure_ascii=False, indent=2)

print(f"✅ Newsletter created: {output_file}")
print(f"📅 Date: {today}")
print(f"📝 Title: {newsletter['article']['title']}")
print(f"📊 Word count: {newsletter['metadata']['wordCount']}")
print(f"⏱️  Read time: {newsletter['metadata']['readTime']}")
print(f"\n📋 Next steps:")
print(f"1. Review the content")
print(f"2. Update newsletter-digest.json if this should be the default")
print(f"3. Git commit and push to trigger auto-upload")
