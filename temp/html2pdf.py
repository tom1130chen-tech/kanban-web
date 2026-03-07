#!/usr/bin/env python3
"""Convert HTML to PDF using WeasyPrint"""

import os
from weasyprint import HTML

# Convert HTML to PDF
html_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.html'
pdf_file = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.pdf'

try:
    HTML(filename=html_file).write_pdf(pdf_file)
    print(f"✅ PDF created successfully!")
    print(f"📍 Location: {pdf_file}")
    print(f"📄 File size: {round(os.path.getsize(pdf_file) / 1024, 1)} KB")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
