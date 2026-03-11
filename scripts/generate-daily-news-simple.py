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
    print("=" * 60)
    print("📬 Daily Newsletter Generator v4")
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
    
    # Step 3: Generate simple structure for assistant to translate
    newsletter_data = {
        "digestDate": datetime.now().strftime('%Y-%m-%d'),
        "sources": {}
    }
    
    for source_name, emails_list in sorted(sources.items()):
        newsletter_data["sources"][source_name] = []
        for email in emails_list[:3]:  # Max 3 per source
            newsletter_data["sources"][source_name].append({
                "title": email['subject'],
                "english_content": email['content'][:3] if email['content'] else [email['preview']],
                "chinese_translation": "[待翻译]",  # Assistant will fill this
                "summary": "[待总结]"  # Assistant will fill this
            })
    
    # Step 4: Save for assistant to process
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(newsletter_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved to {OUTPUT_FILE}")
    print("\n📋 Next step: Assistant will translate and summarize")
    
    return newsletter_data

if __name__ == '__main__':
    main()
