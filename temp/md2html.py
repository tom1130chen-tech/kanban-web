#!/usr/bin/env python3
"""Convert markdown to styled HTML for PDF generation"""

import markdown

# Read the markdown file
with open('/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert to HTML
html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

# Create full HTML with styling
html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2028 年全球智能危机 - CitriniResearch</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.8;
            color: #2d2d2d;
            background: #fafafa;
            padding: 40px 20px;
            max-width: 900px;
            margin: 0 auto;
        }}
        
        h1 {{
            font-family: 'Noto Serif SC', serif;
            font-size: 2.5em;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5em;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 0.3em;
        }}
        
        h2 {{
            font-family: 'Noto Serif SC', serif;
            font-size: 1.8em;
            font-weight: 600;
            color: #2c3e50;
            margin: 2em 0 0.8em 0;
            border-left: 4px solid #e74c3c;
            padding-left: 0.5em;
        }}
        
        h3 {{
            font-family: 'Noto Serif SC', serif;
            font-size: 1.4em;
            font-weight: 600;
            color: #34495e;
            margin: 1.5em 0 0.6em 0;
        }}
        
        p {{
            margin: 1em 0;
            text-align: justify;
        }}
        
        blockquote {{
            border-left: 4px solid #e74c3c;
            margin: 1.5em 0;
            padding: 0.5em 0 0.5em 1.5em;
            background: #fef5f4;
            font-style: italic;
            color: #555;
        }}
        
        code {{
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Menlo', 'Monaco', monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1.5em;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1.5em 0;
            font-family: 'Menlo', 'Monaco', monospace;
            font-size: 0.85em;
            line-height: 1.6;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        
        th {{
            background: #e74c3c;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}
        
        td {{
            padding: 12px;
            border-bottom: 1px solid #eee;
        }}
        
        tr:nth-child(even) {{
            background: #fafafa;
        }}
        
        tr:hover {{
            background: #fef5f4;
        }}
        
        hr {{
            border: none;
            border-top: 2px solid #eee;
            margin: 2em 0;
        }}
        
        .subtitle {{
            font-size: 1.2em;
            color: #7f8c8d;
            margin-bottom: 2em;
            font-style: italic;
        }}
        
        .meta {{
            background: #f8f9fa;
            padding: 1em;
            border-radius: 6px;
            margin: 1.5em 0;
            font-size: 0.9em;
            color: #666;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 20px;
            }}
            
            h1 {{
                border-bottom: 2px solid #e74c3c;
            }}
            
            h2 {{
                border-left: 3px solid #e74c3c;
            }}
            
            blockquote {{
                background: #fafafa;
            }}
            
            pre {{
                background: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
            }}
        }}
    </style>
</head>
<body>
    {html_body}
</body>
</html>
"""

# Write the HTML file
with open('/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("✅ HTML file created: 2028gic-chinese.html")
print("📍 Location: /Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/2028gic-chinese.html")
