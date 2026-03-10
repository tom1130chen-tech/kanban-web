#!/usr/bin/env python3
"""
Daily Newsletter Generator v2
- Fetch emails from AgentMail inbox
- Generate newsletter by source modules
- Upload to Vercel Blob
- Mark processed emails as read
- Commit to Git
"""

import os
import re
import json
from datetime import datetime
from agentmail import AgentMail

# Initialize AgentMail client
AGENTMAIL_API_KEY = os.getenv("AGENTMAIL_API_KEY")
client = AgentMail(api_key=AGENTMAIL_API_KEY)

INBOX_ID = "differentwork984@agentmail.to"
NEWSLETTER_DIR = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data"
BLOB_BASE = "/api/blob"

def fetch_emails(limit=30):
    """Fetch recent emails from inbox (last 24h since 9AM)"""
    print(f"📬 Fetching emails from {INBOX_ID}...")
    messages = client.inboxes.messages.list(inbox_id=INBOX_ID, limit=limit)
    
    # Filter emails received since yesterday 9AM
    now = datetime.now()
    yesterday_9am = now.replace(hour=9, minute=0, second=0, microsecond=0)
    if now.hour < 9:
        yesterday_9am = yesterday_9am.replace(day=yesterday_9am.day - 1)
    
    filtered_messages = []
    for msg in messages.messages:
        # Use timestamp or created_at field
        msg_time = getattr(msg, 'timestamp', None) or getattr(msg, 'created_at', None)
        if msg_time:
            if isinstance(msg_time, (int, float)):
                msg_datetime = datetime.fromtimestamp(msg_time)
            else:
                try:
                    msg_datetime = datetime.fromisoformat(str(msg_time).replace('Z', '+00:00'))
                    # Convert to naive datetime for comparison
                    if msg_datetime.tzinfo is not None:
                        msg_datetime = msg_datetime.replace(tzinfo=None)
                except:
                    msg_datetime = now
            if msg_datetime >= yesterday_9am:
                filtered_messages.append(msg)
        else:
            filtered_messages.append(msg)  # Include if no timestamp
    
    print(f"   Filtered to {len(filtered_messages)} emails since {yesterday_9am.strftime('%Y-%m-%d %H:%M')}")
    return filtered_messages

def get_email_content(message_id):
    """Get full email content using messages.get()"""
    try:
        full_msg = client.inboxes.messages.get(INBOX_ID, message_id)
        # Try html first, then text, then extracted versions
        content = (getattr(full_msg, 'html', None) or 
                   getattr(full_msg, 'text', None) or 
                   getattr(full_msg, 'extracted_html', None) or 
                   getattr(full_msg, 'extracted_text', None) or 
                   '')
        return str(content) if content else ""
    except Exception as e:
        print(f"  ⚠️  Failed to get message {message_id}: {e}")
        return ""

def categorize_emails(emails):
    """Categorize emails by source"""
    sources = {}
    
    for email in emails:
        sender = email.from_.lower()
        subject = email.subject or "No Subject"
        
        # Identify source
        if 'stratechery' in sender:
            source = 'Stratechery'
        elif 'technologyreview' in sender or 'mit tech' in sender:
            source = 'MIT Technology Review'
        elif 'techcrunch' in sender:
            source = 'TechCrunch'
        elif 'morningbrew' in sender:
            source = 'Morning Brew'
        elif 'wsj' in sender or 'wall street journal' in sender:
            source = 'Wall Street Journal'
        elif 'barrons' in sender:
            source = 'Barron\'s'
        elif 'marketwatch' in sender:
            source = 'MarketWatch'
        elif 'shreyas' in sender or 'shreyans' in sender:
            source = 'Shreyas Doshi'
        elif 'recomendo' in sender:
            source = 'Recomendo'
        elif 'mkt1' in sender:
            source = 'MKT1'
        elif 'tldr' in sender:
            source = 'TLDR'
        elif 'lenny' in sender:
            source = "Lenny's Newsletter"
        elif 'aivalley' in sender:
            source = 'AI Valley'
        else:
            source = 'Other'
        
        if source not in sources:
            sources[source] = []
        
        # Get full email content
        content = get_email_content(email.message_id)
        
        sources[source].append({
            'id': email.message_id,
            'subject': email.subject or "No Subject",
            'from': email.from_,
            'preview': email.preview[:200] if email.preview else '',
            'content': content,
            'labels': email.labels or []
        })
    
    return sources

def generate_module(source_name, emails):
    """Generate HTML module for a source using full email content"""
    if not emails:
        return ""
    
    module_html = f'<section class="source-module">\n<h2 class="source-header">📰 {source_name}</h2>\n'
    
    for email in emails[:3]:  # Max 3 emails per source
        subject = email['subject']
        content = email.get('content', '')
        
        # Extract content from HTML
        if content:
            # Extract main content paragraphs
            paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', content, re.DOTALL)
            # Filter out noise
            meaningful = []
            for p in paragraphs:
                text = re.sub(r'<[^>]+>', '', p).strip()
                # Skip dates, greetings, unsubscribe, etc.
                if (text and 
                    len(text) > 40 and 
                    len(text) < 500 and
                    not re.match(r'^[A-Z][a-z]+ \d+, \d+$', text) and  # Skip dates
                    not text.startswith('Happy ') and  # Skip greetings
                    not text.startswith('Hey there') and
                    'unsubscribe' not in text.lower() and
                    'sign up' not in text.lower() and
                    'forwarded message' not in text.lower() and
                    'read online' not in text.lower()):
                    meaningful.append(text)
            
            # Use first 2-3 meaningful paragraphs as key points
            key_points = meaningful[:3] if meaningful else [subject]
            # Summary is first meaningful paragraph
            summary = meaningful[0][:250] if meaningful else (email['preview'][:200] if email.get('preview') else '点击标题查看原文')
        else:
            # Fallback to preview
            preview = email['preview'].replace('~', '').strip()[:200] if email.get('preview') else ''
            summary = preview if preview else '点击标题查看原文'
            key_points = [subject]
        
        key_points_html = ''.join([f'<li>{point}</li>' for point in key_points])
        
        module_html += f'''
<div class="article-card">
<h3>{subject}</h3>
<p class="summary">{summary}</p>
<ul class="key-points">
{key_points_html}
</ul>
</div>
'''
    
    module_html += '</section>\n'
    return module_html

def extract_key_points_from_preview(preview):
    """Extract key points from email preview"""
    if not preview:
        return ['暂无摘要']
    
    # Clean up common newsletter headers/footers
    preview = preview.replace('~', '').strip()
    
    # Remove common unsubscribe/header patterns
    patterns_to_remove = [
        r'\[Sign up\].*?\|',
        r'\[Follow us.*?\].*?\|',
        r'\[Sponsor\].*?\|',
        r'View this post on the web at.*?  ',
        r'View image:.*?  ',
        r'All eyes are on.*?\.\.\.',
    ]
    
    for pattern in patterns_to_remove:
        preview = re.sub(pattern, '', preview, flags=re.IGNORECASE)
    
    # Split by sentences and take meaningful ones
    sentences = re.split(r'[.!?]\s+', preview)
    
    # Filter meaningful sentences
    key_points = []
    for sent in sentences:
        sent = sent.strip()
        # Skip if too short, too long, or contains common noise
        if (sent and 
            20 < len(sent) < 200 and 
            not any(skip in sent.lower() for skip in ['unsubscribe', 'click here', 'view online', 'sign up', 'follow us', 'sponsor', 'forwarded message'])):
            key_points.append(sent[:200])
    
    # If no good sentences, use first meaningful part
    if not key_points and preview:
        # Take first 150 chars that aren't all links
        clean_preview = re.sub(r'http[s]?://\S+', '', preview).strip()
        if clean_preview and len(clean_preview) > 20:
            key_points.append(clean_preview[:200])
    
    return key_points[:3] if key_points else ['暂无摘要']

def generate_newsletter(sources):
    """Generate full newsletter HTML"""
    now = datetime.now()
    # Newsletter date is today if after 9AM, otherwise yesterday
    if now.hour >= 9:
        newsletter_date = now.strftime('%Y-%m-%d')
    else:
        newsletter_date = now.replace(day=now.day-1).strftime('%Y-%m-%d')
    
    modules_html = '<div class="newsletter-modules">\n'
    
    # Generate modules for each source
    for source_name, emails in sorted(sources.items()):
        if source_name != 'Other':
            modules_html += generate_module(source_name, emails)
    
    # Add Other section if exists
    if 'Other' in sources:
        modules_html += generate_module('其他来源', sources['Other'])
    
    modules_html += '</div>'
    
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
            "tags": ["Tech", "Business", "Daily"]
        },
        "metadata": {
            "wordCount": sum(len(e['preview']) for emails in sources.values() for e in emails),
            "readTime": f"{max(1, len(sources))} min",
            "language": "zh-CN"
        }
    }
    
    return newsletter

def mark_emails_as_read(emails):
    """Mark processed emails as read by removing 'unread' label"""
    print(f"\n📧 Marking {len(emails)} emails as read...")
    
    for email in emails:
        try:
            client.inboxes.messages.update(
                inbox_id=INBOX_ID,
                message_id=email['id'],
                remove_labels=["unread"]
            )
            print(f"  ✅ Marked read: {email['subject'][:50]}")
        except Exception as e:
            print(f"  ❌ Failed: {email['subject'][:50]} - {e}")

def save_newsletter(newsletter):
    """Save newsletter to local file"""
    filepath = os.path.join(NEWSLETTER_DIR, "newsletter-digest.json")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(newsletter, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved to {filepath}")
    return filepath

def main():
    """Main execution"""
    print("=" * 60)
    print("📬 Daily Newsletter Generator v3 (24h window since 9AM)")
    print("=" * 60)
    
    # Step 1: Fetch emails (since yesterday 9AM)
    emails = fetch_emails(limit=30)
    print(f"✅ Fetched {len(emails)} emails")
    
    # Step 2: Categorize by source
    sources = categorize_emails(emails)
    print(f"✅ Categorized into {len(sources)} sources")
    
    # Step 3: Generate newsletter
    newsletter = generate_newsletter(sources)
    print(f"✅ Generated newsletter ({newsletter['metadata']['wordCount']} chars)")
    
    # Step 4: Save locally
    filepath = save_newsletter(newsletter)
    
    # Step 5: Mark emails as read
    all_emails = [e for emails in sources.values() for e in emails]
    mark_emails_as_read(all_emails)
    
    # Step 6: Instructions for next steps
    print("\n" + "=" * 60)
    print("📋 Next Steps:")
    print("=" * 60)
    print(f"1. Upload to Blob:")
    print(f"   cd /Users/tomchen/.openclaw/workspace-chat/kanban-board")
    print(f"   vercel blob put data/newsletter-digest.json -p newsletter/{newsletter['digestDate']}.json")
    print(f"\n2. Commit to Git:")
    print(f"   git add data/newsletter-digest.json")
    print(f"   git commit -m 'Update newsletter {newsletter['digestDate']}'")
    print(f"   git push origin main")
    print(f"\n3. Wait for Vercel deployment (~1-2 min)")
    print("=" * 60)
    
    return newsletter

if __name__ == '__main__':
    main()
