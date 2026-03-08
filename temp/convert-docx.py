#!/usr/bin/env python3
"""
Convert Word document to newsletter JSON format
"""

from docx import Document
import json
from datetime import datetime

# Read Word document
doc = Document('/Users/tomchen/.openclaw/media/inbound/bb2bea02-e4b2-4bac-b091-56e90d87d157.docx')

# Extract text
paragraphs = []
for para in doc.paragraphs:
    if para.text.strip():
        paragraphs.append(para.text.strip())

full_text = '\n\n'.join(paragraphs)

# Convert to HTML
def para_to_html(text):
    """Convert paragraph to HTML with proper formatting"""
    # Split by lines
    lines = text.split('\n')
    html_parts = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if it's a section header (short line, no punctuation at end)
        if len(line) < 80 and not line.endswith(('。', '.', '!', '！', '?', '？')):
            html_parts.append(f'<h3>{line}</h3>')
        else:
            # Regular paragraph - add emphasis for key terms
            line = line.replace('**', '<strong>').replace('**', '</strong>')
            line = line.replace('"', '"').replace('"', '"')
            html_parts.append(f'<p>{line}</p>')
    
    return '\n'.join(html_parts)

# Build HTML content
html_content = '<p class="lead">这篇文章是基于 Citrini and Alap Shah 写的 THE 2028 GLOBAL INTELLIGENCE CRISIS 之后的世界观。在阅读这篇文章前，强烈建议阅读上述文章。</p>'

# Process paragraphs
in_intro = False
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
        "title": "2035 年回望：AI 经济时代的货币重构与能源本位",
        "subtitle": "从 2028 智能危机到新共识的形成",
        "content": html_content,
        "author": "CKC335",
        "sources": [
            {
                "name": "CitriniResearch",
                "type": "article",
                "url": "https://www.citriniresearch.com/p/2028gic",
                "summary": "THE 2028 GLOBAL INTELLIGENCE CRISIS - 前置阅读"
            }
        ],
        "tags": ["AI", "Future", "Economy", "Energy", "Token"]
    },
    "metadata": {
        "wordCount": len(full_text),
        "readTime": "8 min",
        "language": "zh-CN",
        "template": "guest-article"
    }
}

# Save to file
output_file = f'/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/newsletter-{today}-special.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(newsletter, f, ensure_ascii=False, indent=2)

print(f"✅ Newsletter created: {output_file}")
print(f"📅 Date: {today}")
print(f"📝 Title: {newsletter['article']['title']}")
print(f"📊 Word count: {newsletter['metadata']['wordCount']}")
print(f"⏱️  Read time: {newsletter['metadata']['readTime']}")
print(f"\n📋 Next steps:")
print(f"1. Review: {output_file}")
print(f"2. Upload to Blob via: https://kanban-ops-eta.vercel.app/blob-manager")
print(f"3. Or copy to newsletter-digest.json and push to git")
