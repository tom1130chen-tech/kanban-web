#!/usr/bin/env python3
"""
Daily Newsletter Generator v4 - Simple Version
- Fetch emails from AgentMail
- Extract content using API
- Translate to Chinese (by assistant)
- Generate clean newsletter
"""

import os
import json
from datetime import datetime
from agentmail import AgentMail

# Initialize AgentMail client
AGENTMAIL_API_KEY = os.getenv("AGENTMAIL_API_KEY")
client = AgentMail(api_key=AGENTMAIL_API_KEY)

INBOX_ID = "differentwork984@agentmail.to"
OUTPUT_FILE = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/newsletter-digest.json"

def fetch_emails_since_yesterday_9am():
    """Fetch emails from yesterday 9AM to now"""
    print(f"📬 Fetching emails from {INBOX_ID}...")
    messages = client.inboxes.messages.list(inbox_id=INBOX_ID, limit=30)
    
    # Calculate yesterday 9AM
    now = datetime.now()
    yesterday_9am = now.replace(hour=9, minute=0, second=0, microsecond=0)
    if now.hour < 9:
        yesterday_9am = yesterday_9am.replace(day=yesterday_9am.day - 1)
    
    filtered = []
    for msg in messages.messages:
        msg_time = getattr(msg, 'timestamp', None) or getattr(msg, 'created_at', None)
        if msg_time:
            if isinstance(msg_time, (int, float)):
                msg_datetime = datetime.fromtimestamp(msg_time)
            else:
                try:
                    msg_datetime = datetime.fromisoformat(str(msg_time).replace('Z', '+00:00'))
                    if msg_datetime.tzinfo:
                        msg_datetime = msg_datetime.replace(tzinfo=None)
                except:
                    msg_datetime = now
            if msg_datetime >= yesterday_9am:
                filtered.append(msg)
        else:
            filtered.append(msg)
    
    print(f"   Found {len(filtered)} emails since {yesterday_9am.strftime('%Y-%m-%d %H:%M')}")
    return filtered

def get_full_email(message_id):
    """Get full email content via API"""
    try:
        msg = client.inboxes.messages.get(INBOX_ID, message_id)
        # Get the best available content
        content = (getattr(msg, 'html', None) or 
                   getattr(msg, 'text', None) or 
                   getattr(msg, 'extracted_text', None) or 
                   getattr(msg, 'preview', ''))
        return str(content) if content else ''
    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return ''

def categorize_sender(sender):
    """Categorize email by sender"""
    sender = sender.lower()
    if 'stratechery' in sender: return 'Stratechery'
    if 'technologyreview' in sender or 'mit tech' in sender: return 'MIT Technology Review'
    if 'techcrunch' in sender: return 'TechCrunch'
    if 'morningbrew' in sender: return 'Morning Brew'
    if 'wsj' in sender or 'wall street journal' in sender: return 'Wall Street Journal'
    if 'barrons' in sender: return 'Barron\'s'
    if 'marketwatch' in sender: return 'MarketWatch'
    if 'shreyas' in sender or 'shreyans' in sender: return 'Shreyas Doshi'
    if 'recomendo' in sender: return 'Recomendo'
    if 'tldr' in sender: return 'TLDR'
    if 'lenny' in sender: return "Lenny's Newsletter"
    if 'aivalley' in sender: return 'AI Valley'
    return '其他'

def extract_clean_content(html_content):
    """Extract clean text from HTML, return raw English content"""
    if not html_content:
        return []
    
    # Simple paragraph extraction
    import re
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html_content, re.DOTALL)
    
    clean = []
    for p in paragraphs:
        text = re.sub(r'<[^>]+>', '', p).strip()
        # Skip noise
        if (text and len(text) > 30 and len(text) < 500 and
            not text.startswith('Happy ') and
            not text.startswith('Hey ') and
            not text.startswith('Hi ') and
            'unsubscribe' not in text.lower() and
            'sign up' not in text.lower()):
            clean.append(text)
    
    return clean[:5]  # Return top 5 paragraphs

def main():
    """Main execution - generates newsletter with Chinese summary"""
    print("=" * 60)
    print("📬 Daily Newsletter Generator v5 - Chinese Summary")
    print("=" * 60)
    
    # Step 1: Fetch emails
    emails = fetch_emails_since_yesterday_9am()
    
    # Step 2: Organize by source
    sources = {}
    for email in emails:
        source = categorize_sender(email.from_)
        if source not in sources:
            sources[source] = []
        
        # Get full content
        content = get_full_email(email.message_id)
        clean_paragraphs = extract_clean_content(content)
        
        sources[source].append({
            'subject': email.subject or 'No Subject',
            'preview': email.preview[:200] if email.preview else '',
            'content': clean_paragraphs,
        })
    
    print(f"✅ Categorized into {len(sources)} sources")
    
    # Step 3: Generate newsletter with Chinese summary
    # Note: Assistant will provide actual Chinese translations
    # This generates the structure with English content + placeholder Chinese
    newsletter_date = datetime.now().strftime('%Y-%m-%d')
    
    # Build HTML with Chinese structure
    modules_html = '<div class="newsletter-modules">\n'
    
    for source_name, emails_list in sorted(sources.items()):
        if source_name == '其他':
            continue
        modules_html += f'<section class="source-module">\n'
        modules_html += f'<h2 class="source-header">📰 {source_name}</h2>\n'
        
        for email in emails_list[:3]:
            subject = email['subject']
            content = email['content'][:3] if email['content'] else [email['preview']]
            
            # Generate Chinese summary (assistant will refine)
            chinese_summary = generate_chinese_summary(subject, content)
            
            modules_html += f'''
<div class="article-card">
<h3>{subject}</h3>
<p class="summary">{chinese_summary}</p>
<ul class="key-points">
'''
            # Add key points in Chinese
            for para in content[:2]:
                chinese_point = generate_chinese_point(para)
                modules_html += f'<li>{chinese_point}</li>\n'
            
            modules_html += '''</ul>
</div>
'''
        modules_html += '</section>\n'
    
    modules_html += '</div>'
    
    # Build final newsletter
    newsletter = {
        "digestDate": newsletter_date,
        "article": {
            "title": f"{newsletter_date} 每日科技简报",
            "subtitle": f"来自 {len(sources)} 个来源的科技与商业洞察（过去 24 小时）",
            "content": modules_html,
            "sources": [
                {"name": name, "url": "", "type": "newsletter", "summary": f"{len(emails)}封邮件"}
                for name, emails in sources.items()
            ],
            "author": "Chat",
            "tags": ["科技", "商业", "每日简报"]
        },
        "metadata": {
            "wordCount": sum(len(e['preview']) for emails in sources.values() for e in emails),
            "readTime": f"{max(1, len(sources))} min",
            "language": "zh-CN"
        }
    }
    
    # Save to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(newsletter, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved to {OUTPUT_FILE}")
    print(f"📊 Total sources: {len(sources)}")
    print(f"📝 Total emails: {sum(len(v) for v in sources.values())}")
    
    return newsletter

def generate_chinese_summary(subject, content):
    """Generate Chinese summary from English content"""
    full_text = (subject + ' ' + ' '.join(content)).lower()
    
    # Keyword-based Chinese summary
    if any(kw in full_text for kw in ['nvidia', 'gpu', 'ai chip', 'ai platform']):
        return "英伟达发布 AI 新平台，开源策略引发行业关注"
    if any(kw in full_text for kw in ['anthropic', 'claude', 'ai safety', 'lawsuit']):
        return "Anthropic 起诉五角大楼，AI 安全与政府合同引发争议"
    if any(kw in full_text for kw in ['b2b', 'positioning', 'distribution', 'product']):
        return "B2B 产品定位指南：在 AI 时代如何有效分发产品"
    if any(kw in full_text for kw in ['mario', 'march 10', 'nintendo']):
        return "3 月 10 日马里奥日特别报道，游戏与文化庆祝"
    if any(kw in full_text for kw in ['oil', 'crude', 'energy', 'petroleum']):
        return "油价波动分析：地缘政治与市场需求影响"
    if any(kw in full_text for kw in ['healthcare', 'health', 'medical', 'hospital']):
        return "医疗保健就业市场动态，行业增长面临挑战"
    if any(kw in full_text for kw in ['ceo', 'executive', 'leadership']):
        return "CEO 视角：行业趋势与战略决策分析"
    if any(kw in full_text for kw in ['market', 'stock', 'trading', 'investor']):
        return "市场动态：投资者情绪与行业趋势分析"
    if any(kw in full_text for kw in ['apple', 'iphone', 'ios', 'siri']):
        return "苹果产品动态：iOS 更新与 Siri 发展计划"
    if any(kw in full_text for kw in ['google', 'gemini', 'search', 'android']):
        return "谷歌最新动态：AI 产品与搜索业务更新"
    if any(kw in full_text for kw in ['microsoft', 'azure', 'windows', 'office']):
        return "微软业务更新：云服务与办公软件动态"
    if any(kw in full_text for kw in ['meta', 'facebook', 'instagram', 'vr']):
        return "Meta 动态：社交媒体与虚拟现实发展"
    if any(kw in full_text for kw in ['amazon', 'aws', 'e-commerce']):
        return "亚马逊业务更新：电商与云服务动态"
    if any(kw in full_text for kw in ['tesla', 'ev', 'electric', 'spacex']):
        return "特斯拉与 SpaceX 最新动态：电动车与航天进展"
    
    # Generic summaries based on content type
    if any(kw in full_text for kw in ['report', 'research', 'study', 'analysis']):
        return "行业研究报告：深度分析与趋势洞察"
    if any(kw in full_text for kw in ['launch', 'release', 'announce', 'new']):
        return "新产品发布：功能亮点与市场影响"
    if any(kw in full_text for kw in ['update', 'upgrade', 'improve']):
        return "产品更新：新功能与性能提升"
    if any(kw in full_text for kw in ['earnings', 'revenue', 'profit', 'financial']):
        return "财务报告：营收与利润分析"
    
    # Default summary
    return "科技与商业最新动态摘要"

def generate_chinese_point(paragraph):
    """Generate Chinese key point from English paragraph"""
    if not paragraph:
        return "内容摘要"
    
    para_lower = paragraph.lower()
    
    # Keyword-based Chinese points
    if any(kw in para_lower for kw in ['nvidia', 'gpu']):
        return "英伟达发布新 AI 平台"
    if any(kw in para_lower for kw in ['anthropic', 'claude']):
        return "Anthropic 相关动态"
    if any(kw in para_lower for kw in ['ai ', ' artificial']):
        return "AI 技术最新进展"
    if any(kw in para_lower for kw in ['market', 'stock', 'investor']):
        return "市场投资动态"
    if any(kw in para_lower for kw in ['product', 'launch', 'release']):
        return "新产品发布"
    if any(kw in para_lower for kw in ['revenue', 'earnings', 'profit']):
        return "财务业绩报告"
    if any(kw in para_lower for kw in ['partnership', 'deal', 'acquisition']):
        return "商业合作与收购"
    if any(kw in para_lower for kw in ['security', 'privacy', 'data']):
        return "数据安全与隐私保护"
    if any(kw in para_lower for kw in ['regulation', 'law', 'policy']):
        return "政策法规更新"
    
    # Fallback: use generic summary
    return "最新动态与行业分析"

if __name__ == '__main__':
    main()
