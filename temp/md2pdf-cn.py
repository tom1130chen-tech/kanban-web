#!/usr/bin/env python3
"""
Markdown to PDF converter with Chinese font support
Uses STHeiti (华文黑体) for Chinese characters
"""

import os
import re
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Chinese font (STHeiti on macOS)
chinese_font_path = '/Library/Fonts/STHeiti Light.ttc'
if os.path.exists(chinese_font_path):
    pdfmetrics.registerFont(TTFont('STHeiti', chinese_font_path))
    chinese_font_name = 'STHeiti'
    print(f"✅ Using Chinese font: {chinese_font_path}")
else:
    # Try alternative locations
    alt_fonts = [
        '/System/Library/Fonts/STHeiti Light.ttc',
        '/System/Library/Fonts/PingFang.ttc',
        '/Library/Fonts/PingFang.ttc',
    ]
    chinese_font_name = 'Helvetica'  # Fallback
    for font_path in alt_fonts:
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('ChineseFont', font_path))
            chinese_font_name = 'ChineseFont'
            print(f"✅ Using alternative Chinese font: {font_path}")
            break
    else:
        print("⚠️  Warning: No Chinese font found, using Helvetica (Chinese may not display correctly)")

# Input/Output files
md_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.md'
pdf_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.pdf'

# Read markdown content
with open(md_file, 'r', encoding='utf-8') as f:
    content = f.read()

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
    fontSize=24,
    leading=28,
    alignment=TA_CENTER,
    spaceAfter=30
)

# Heading style
heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontName=chinese_font_name,
    fontSize=16,
    leading=20,
    spaceBefore=20,
    spaceAfter=10
)

# Subheading style
subheading_style = ParagraphStyle(
    'CustomSubheading',
    parent=styles['Heading3'],
    fontName=chinese_font_name,
    fontSize=14,
    leading=18,
    spaceBefore=15,
    spaceAfter=8
)

# Normal text style
normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=11,
    leading=16,
    spaceBefore=6,
    spaceAfter=6
)

# Blockquote style
quote_style = ParagraphStyle(
    'CustomQuote',
    parent=styles['Normal'],
    fontName=chinese_font_name,
    fontSize=11,
    leading=16,
    leftIndent=20,
    rightIndent=20,
    spaceBefore=10,
    spaceAfter=10,
    textColor='#666666'
)

# Process markdown line by line
lines = content.split('\n')
i = 0

while i < len(lines):
    line = lines[i].strip()
    
    # Skip empty lines
    if not line:
        i += 1
        continue
    
    # Title (H1)
    if line.startswith('# '):
        title = line[2:].strip()
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.3*inch))
    
    # Heading (H2)
    elif line.startswith('## '):
        heading = line[3:].strip()
        story.append(Paragraph(heading, heading_style))
    
    # Subheading (H3)
    elif line.startswith('### '):
        subheading = line[4:].strip()
        story.append(Paragraph(subheading, subheading_style))
    
    # Blockquote
    elif line.startswith('>'):
        quote = line[1:].strip()
        # Remove bold markers
        quote = quote.replace('**', '')
        story.append(Paragraph(f"\"{quote}\"", quote_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Table (simplified - just show as text)
    elif line.startswith('|') and line.endswith('|'):
        # Skip table rows for now, or convert to simple text
        cells = [cell.strip() for cell in line.split('|')[1:-1]]
        if cells and any(cell and not cell.startswith('---') for cell in cells):
            text = ' | '.join(cells)
            if text.strip():
                story.append(Paragraph(text, normal_style))
    
    # List items
    elif line.startswith('- ') or line.startswith('* '):
        item = line[2:].strip()
        item = item.replace('**', '')  # Remove bold
        story.append(Paragraph(f"• {item}", normal_style))
    
    # Code blocks (skip or show as text)
    elif line.startswith('```'):
        i += 1
        while i < len(lines) and not lines[i].strip().startswith('```'):
            i += 1
    
    # Regular paragraph
    else:
        # Clean up markdown formatting
        clean_line = line
        clean_line = re.sub(r'\*\*(.*?)\*\*', r'\1', clean_line)  # Remove bold
        clean_line = re.sub(r'\*(.*?)\*', r'\1', clean_line)  # Remove italic
        clean_line = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_line)  # Remove links, keep text
        
        if clean_line.strip():
            story.append(Paragraph(clean_line, normal_style))
    
    i += 1

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
