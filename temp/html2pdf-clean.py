#!/usr/bin/env python3
"""
Convert clean HTML to PDF with Chinese font support
Uses STHeiti (华文黑体) for Chinese characters
"""

import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from html.parser import HTMLParser

# Register Chinese font (STHeiti on macOS)
chinese_font_path = '/System/Library/Fonts/STHeiti Light.ttc'
if os.path.exists(chinese_font_path):
    pdfmetrics.registerFont(TTFont('STHeiti', chinese_font_path))
    chinese_font_name = 'STHeiti'
    print(f"✅ Using Chinese font: {chinese_font_path}")
else:
    chinese_font_name = 'Helvetica'
    print("⚠️  Warning: No Chinese font found, using Helvetica")

# Input/Output files
html_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-clean.html'
pdf_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.pdf'

# Read HTML content
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Simple HTML parser to extract text content
class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.current_tag = None
        self.in_header = False
        self.in_paragraph = False
        self.in_blockquote = False
        self.in_em = False
        self.in_strong = False
        self.header_level = 0
        
    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        if tag in ['h1', 'h2', 'h3']:
            self.in_header = True
            self.header_level = int(tag[1])
        elif tag == 'p':
            self.in_paragraph = True
        elif tag == 'blockquote':
            self.in_blockquote = True
        elif tag == 'em':
            self.in_em = True
        elif tag == 'strong':
            self.in_strong = True
            
    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3']:
            self.in_header = False
            self.header_level = 0
        elif tag == 'p':
            self.in_paragraph = False
        elif tag == 'blockquote':
            self.in_blockquote = False
        elif tag == 'em':
            self.in_em = False
        elif tag == 'strong':
            self.in_strong = False
        self.current_tag = None
        
    def handle_data(self, data):
        if data.strip():
            self.text.append({
                'content': data.strip(),
                'tag': self.current_tag,
                'in_header': self.in_header,
                'header_level': self.header_level,
                'in_paragraph': self.in_paragraph,
                'in_blockquote': self.in_blockquote,
                'in_em': self.in_em,
                'in_strong': self.in_strong
            })

# Parse HTML
parser = HTMLTextExtractor()
parser.feed(html_content)

# Create PDF document
doc = SimpleDocTemplate(
    pdf_file,
    pagesize=A4,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=1*inch,
    bottomMargin=1*inch
)

# Container for the 'Flowable' objects
story = []

# Define styles with Chinese font
styles = getSampleStyleSheet()

# Title style
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontName=chinese_font_name,
    fontSize=26,
    leading=32,
    alignment=TA_CENTER,
    spaceAfter=30,
    textColor='#1a1a1a'
)

# Heading 2 style
heading2_style = ParagraphStyle(
    'CustomHeading2',
    parent=styles['Heading2'],
    fontName=chinese_font_name,
    fontSize=18,
    leading=24,
    spaceBefore=24,
    spaceAfter=12,
    textColor='#2c3e50'
)

# Heading 3 style
heading3_style = ParagraphStyle(
    'CustomHeading3',
    parent=styles['Heading3'],
    fontName=chinese_font_name,
    fontSize=15,
    leading=20,
    spaceBefore=18,
    spaceAfter=10,
    textColor='#34495e'
)

# Normal text style
normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=11,
    leading=17,
    spaceBefore=8,
    spaceAfter=8,
    alignment=TA_JUSTIFY
)

# Blockquote style
quote_style = ParagraphStyle(
    'CustomQuote',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=11,
    leading=17,
    leftIndent=20,
    rightIndent=20,
    spaceBefore=12,
    spaceAfter=12,
    textColor='#555555',
    borderLeftWidth=3,
    borderLeftColor='#e74c3c',
    borderLeftPadding=10
)

# Emphasis style
em_style = ParagraphStyle(
    'CustomEm',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=11,
    leading=17,
    spaceBefore=8,
    spaceAfter=8,
    alignment=TA_JUSTIFY,
    textColor='#444444'
)

# Meta info style
meta_style = ParagraphStyle(
    'CustomMeta',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=10,
    leading=14,
    spaceBefore=6,
    spaceAfter=6,
    textColor='#666666'
)

# Process parsed content
current_paragraph = []
in_blockquote = False

def flush_paragraph():
    global current_paragraph, in_blockquote
    if current_paragraph:
        text = ' '.join(current_paragraph)
        if in_blockquote:
            story.append(Paragraph(f"❝ {text} ❞", quote_style))
        else:
            story.append(Paragraph(text, normal_style))
        current_paragraph = []

for item in parser.text:
    content = item['content']
    
    # Skip navigation and footer links
    if '订阅' in content and 'Subscribe' in content:
        continue
    if 'Type your email' in content:
        continue
        
    # Handle headers
    if item['in_header']:
        flush_paragraph()
        if item['header_level'] == 1:
            story.append(Paragraph(content, title_style))
        elif item['header_level'] == 2:
            story.append(Paragraph(content, heading2_style))
        elif item['header_level'] == 3:
            story.append(Paragraph(content, heading3_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Handle blockquotes
    elif item['in_blockquote']:
        if not in_blockquote:
            flush_paragraph()
            in_blockquote = True
        current_paragraph.append(content)
    
    # Handle normal paragraphs
    elif item['in_paragraph']:
        if in_blockquote:
            flush_paragraph()
            in_blockquote = False
        current_paragraph.append(content)
    
    # Handle emphasis
    elif item['in_em'] or item['in_strong']:
        current_paragraph.append(f"<i>{content}</i>" if item['in_em'] else f"<b>{content}</b>")
    
    # Handle horizontal rules (from HR tags)
    elif content == '---':
        flush_paragraph()
        story.append(Spacer(1, 0.3*inch))
    
    else:
        # Meta information
        if '发布日期' in content or '来源' in content or '致谢' in content:
            flush_paragraph()
            story.append(Paragraph(content, meta_style))
        else:
            current_paragraph.append(content)

# Flush any remaining content
flush_paragraph()

# Build PDF
try:
    doc.build(story)
    print(f"\n✅ PDF created successfully!")
    print(f"📍 Location: {pdf_file}")
    size_kb = round(os.path.getsize(pdf_file) / 1024, 1)
    print(f"📄 File size: {size_kb} KB")
    print(f"\n📂 To open: open {pdf_file}")
except Exception as e:
    print(f"\n❌ Error creating PDF: {e}")
    import traceback
    traceback.print_exc()
