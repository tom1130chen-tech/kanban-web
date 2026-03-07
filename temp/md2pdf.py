#!/usr/bin/env python3
"""Convert markdown to PDF using md2pdf"""

import os
from md2pdf.core import md2pdf

md_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.md'
pdf_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.pdf'

try:
    md2pdf(pdf_file,
           md_content=None,
           md_file_path=md_file,
           css_file_path=None,
           font_family='Noto Sans SC',
           base_url=None)
    
    print(f"✅ PDF created successfully!")
    print(f"📍 Location: {pdf_file}")
    print(f"📄 File size: {round(os.path.getsize(pdf_file) / 1024, 1)} KB")
except Exception as e:
    print(f"❌ Error: {e}")
    
    # Fallback: create simple PDF with reportlab
    print("\n🔄 Falling back to reportlab...")
    
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple markdown cleanup
    content = content.replace('# ', '').replace('## ', '').replace('### ', '')
    content = content.replace('**', '').replace('*', '')
    lines = content.split('\n')
    
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Chinese', fontName='Helvetica', fontSize=12, leading=14))
    
    story = []
    for line in lines:
        if line.strip():
            story.append(Paragraph(line.strip(), styles['Chinese']))
            story.append(Spacer(1, 0.1*inch))
    
    doc.build(story)
    print(f"✅ PDF created with reportlab fallback!")
    print(f"📍 Location: {pdf_file}")
    print(f"📄 File size: {round(os.path.getsize(pdf_file) / 1024, 1)} KB")
