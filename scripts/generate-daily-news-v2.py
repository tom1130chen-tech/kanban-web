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
import json
from datetime import datetime
from agentmail import AgentMail

# Initialize AgentMail client
AGENTMAIL_API_KEY = os.getenv("AGENTMAIL_API_KEY")
client = AgentMail(api_key=AGENTMAIL_API_KEY)

INBOX_ID = "differentwork984@agentmail.to"
NEWSLETTER_DIR = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data"
BLOB_BASE = "/api/blob"

def fetch_emails(limit=20):
    """Fetch recent emails from inbox"""
    print(f"📬 Fetching emails from {INBOX_ID}...")
    messages = client.inboxes.messages.list(inbox_id=INBOX_ID, limit=limit)
    return messages.messages

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
        
        sources[source].append({
            'id': email.message_id,
            'subject': email.subject or "No Subject",
            'from': email.from_,
            'preview': email.preview[:200] if email.preview else '',
            'labels': email.labels or []
        })
    
    return sources

def generate_module(source_name, emails):
    """Generate HTML module for a source"""
    if not emails:
        return ""
    
    module_html = f'<section class="source-module">\n<h2 class="source-header">📰 {source_name}</h2>\n'
    
    for email in emails[:3]:  # Max 3 emails per source
        subject = email['subject']
        preview = email['preview'].replace('\n', ' ').strip()
        
        module_html += f'''
<div class="article-card">
<h3>{subject}</h3>
<p class="summary">{preview}...</p>
<ul class="key-points">
<li>核心观点待提取</li>
</ul>
</div>
'''
    
    module_html += '</section>\n'
    return module_html

def generate_newsletter(sources):
    """Generate full newsletter HTML"""
    today = datetime.now().strftime('%Y-%m-%d')
    
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
        "digestDate": today,
        "article": {
            "title": f"{today} 每日科技简报",
            "subtitle": f"来自 {len(sources)} 个来源的科技与商业洞察",
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
    print("📬 Daily Newsletter Generator v2")
    print("=" * 60)
    
    # Step 1: Fetch emails
    emails = fetch_emails(limit=20)
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
