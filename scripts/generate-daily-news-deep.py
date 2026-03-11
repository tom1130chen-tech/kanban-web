#!/usr/bin/env python3
"""
Daily Newsletter Generator v6 - Deep Analysis
- Fetch emails from AgentMail
- Extract full content
- Generate structured data for deep analysis
- Assistant will write 1000+ character Chinese analysis
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
    messages = client.inboxes.messages.list(inbox_id=INBOX_ID, limit=50)
    
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

def extract_full_content(html_content):
    """Extract all meaningful content from HTML"""
    if not html_content:
        return []
    
    import re
    # Extract all text content
    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html_content, re.DOTALL)
    headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', html_content, re.DOTALL)
    
    clean = []
    for items in [headings, paragraphs]:
        for p in items:
            text = re.sub(r'<[^>]+>', '', p).strip()
            # Keep meaningful content (longer than 50 chars)
            if (text and len(text) > 50 and
                not text.startswith('Happy ') and
                not text.startswith('Hey ') and
                not text.startswith('Hi ') and
                'unsubscribe' not in text.lower() and
                'sign up' not in text.lower() and
                'forwarded message' not in text.lower()):
                clean.append(text)
    
    return clean[:20]  # Return top 20 paragraphs for analysis

def main():
    print("=" * 60)
    print("📬 Daily Newsletter Generator v6 - Deep Analysis")
    print("=" * 60)
    
    # Step 1: Fetch emails
    emails = fetch_emails_since_yesterday_9am()
    
    # Step 2: Organize by source with full content
    sources = {}
    total_content_length = 0
    
    for email in emails:
        source = categorize_sender(email.from_)
        if source not in sources:
            sources[source] = []
        
        # Get full content
        content = get_full_email(email.message_id)
        full_paragraphs = extract_full_content(content)
        full_text = ' '.join(full_paragraphs)
        total_content_length += len(full_text)
        
        sources[source].append({
            'subject': email.subject or 'No Subject',
            'full_content': full_paragraphs,
            'full_text': full_text,
            'preview': email.preview[:300] if email.preview else '',
        })
    
    print(f"✅ Categorized into {len(sources)} sources")
    print(f"📊 Total content: {total_content_length} characters")
    
    # Step 3: Generate structured data for assistant
    newsletter_date = datetime.now().strftime('%Y-%m-%d')
    
    # Prepare data structure for deep analysis
    analysis_data = {
        "digestDate": newsletter_date,
        "request": {
            "type": "deep_analysis",
            "min_length": 1000,
            "language": "zh-CN",
            "requirements": [
                "深度分析每条新闻的背景和影响",
                "提供行业趋势洞察",
                "分析对公司/市场的影响",
                "给出个人观点和判断",
                "至少 1000 字中文分析"
            ]
        },
        "sources": {}
    }
    
    for source_name, emails_list in sorted(sources.items()):
        if source_name == '其他':
            continue
        
        analysis_data["sources"][source_name] = []
        
        for email in emails_list[:5]:  # Max 5 per source for deep analysis
            analysis_data["sources"][source_name].append({
                "title": email['subject'],
                "full_english_content": email['full_content'],
                "full_text": email['full_text'][:3000],  # Limit for API
                "key_points": [],  # Assistant will fill
                "analysis": "",  # Assistant will write deep analysis here
                "impact": "",  # Assistant will assess impact
            })
    
    # Save for assistant to process
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved to {OUTPUT_FILE}")
    print(f"📝 Ready for assistant to write deep analysis")
    print(f"📊 Sources: {len(sources)}, Total emails: {sum(len(v) for v in sources.values())}")
    
    return analysis_data

if __name__ == '__main__':
    main()
