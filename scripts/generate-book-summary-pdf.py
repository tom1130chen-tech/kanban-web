#!/usr/bin/env python3
"""
PDF Summary Report Generator
生成两本书章节的完整总结报告
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import os

# Register Chinese font - 使用系统字体
font_registered = False
font_name = 'Helvetica'  # 默认英文字体

# 尝试注册中文字体
font_paths = [
    '/System/Library/Fonts/STHeiti Light.ttc',
    '/System/Library/Fonts/STHeiti Medium.ttc',
    '/Library/Fonts/PingFang.ttc',
]

for font_path in font_paths:
    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(TTFont('ChineseFont', font_path))
            font_name = 'ChineseFont'
            font_registered = True
            print(f"✅ 成功注册中文字体：{font_path}")
            break
        except Exception as e:
            print(f"⚠️ 字体注册失败 {font_path}: {e}")
            continue

if not font_registered:
    print("⚠️ 未找到中文字体，使用英文字体（中文可能显示异常）")

def create_summary_report(output_path):
    """创建完整总结报告"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.7*inch,
        bottomMargin=0.7*inch
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#1a1a2e'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName=font_name
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#666666'),
        spaceAfter=15,
        alignment=TA_CENTER,
        fontName=font_name
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#16213e'),
        spaceAfter=10,
        spaceBefore=15,
        fontName=font_name
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=13,
        textColor=colors.HexColor('#0f3460'),
        spaceAfter=8,
        spaceBefore=10,
        fontName=font_name
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10.5,
        textColor=colors.HexColor('#333333'),
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        fontName=font_name
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-15,
        spaceAfter=4,
        fontName=font_name
    )
    
    # Title
    elements.append(Paragraph("文献总结报告", title_style))
    elements.append(Paragraph("Chapter 6 + Marketcrafters Ch10 详细分析", subtitle_style))
    elements.append(Paragraph(f"生成日期：{datetime.now().strftime('%Y-%m-%d %H:%M')}", body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Table of Contents
    elements.append(Paragraph("目录", heading_style))
    toc_data = [
        ['1. Chapter 6: Globalization In Overdrive', '页码'],
        ['  1.1 核心主题', '3'],
        ['  1.2 主要内容', '3'],
        ['  1.3 关键洞察', '5'],
        ['2. Marketcrafters Chapter 10', '6'],
        ['  2.1 核心主题', '6'],
        ['  2.2 主要内容', '6'],
        ['  2.3 关键洞察', '8'],
        ['3. 两文件关联性分析', '9'],
        ['4. 综合启示', '10'],
    ]
    
    toc_table = Table(toc_data, colWidths=[5*inch, 0.8*inch])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    elements.append(toc_table)
    elements.append(PageBreak())
    
    # Chapter 6
    elements.append(Paragraph("1. Chapter 6: Globalization In Overdrive", heading_style))
    elements.append(Paragraph("全球化过度驱动", subheading_style))
    
    info_table = Table([
        ['文件信息', '详情'],
        ['页数', '18 页'],
        ['字数', '~7 万字符'],
        ['主题', '全球化及其对普通工人的冲击'],
        ['历史对比', '1896 vs 2016'],
    ], colWidths=[2*inch, 3.5*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#e8f4f8')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Chapter 6 核心主题
    elements.append(Paragraph("1.1 核心主题", subheading_style))
    core_text = """
    <b>全球化过度驱动及其对普通工人的冲击</b><br/><br/>
    本章通过煤矿工人的个人叙事，揭示全球化带来的繁荣与分配不均之间的矛盾。
    整体经济受益，但工人阶级被遗忘，为民粹主义崛起提供土壤。
    """
    elements.append(Paragraph(core_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Chapter 6 主要内容
    elements.append(Paragraph("1.2 主要内容", subheading_style))
    
    content_points = [
        "<b>1. 开篇叙事：美国煤矿工人的困境</b><br/>" +
        "• 以煤矿工人视角讲述全球化冲击<br/>" +
        "• 几代人的稳定工作突然消失<br/>" +
        "• 金融危机从沿海蔓延到内陆<br/>" +
        "• 失业→房贷违约→失去家园→与社会脱节",
        
        "<b>2. 历史对比：1896 vs 2016</b><br/>" +
        "• <b>1896 年</b>：William Jennings Bryan 的民粹主义崛起<br/>" +
        "• <b>2016 年</b>：Donald Trump 的让美国再次伟大<br/>" +
        "• <b>共同点</b>：反建制、反华尔街、反沿海精英",
        
        "<b>3. 全球化的历史进程</b><br/>" +
        "• 19 世纪工业化→世界真正互联<br/>" +
        "• 电报发明→次日送达→全球供应链<br/>" +
        "• 英国作为世界霸主的新外交政策",
        
        "<b>4. 地缘政治转变</b><br/>" +
        "• 英国从战场荣耀转向贸易主导<br/>" +
        "• 日本从封闭到开放（煤炭、渔业资源）<br/>" +
        "• 太平洋贸易路线的重要性",
        
        "<b>5. 核心矛盾</b><br/>" +
        "• 全球化带来整体繁荣<br/>" +
        "• 但分配不均导致工人阶级困境<br/>" +
        "• 民粹主义政治家的崛起土壤",
    ]
    
    for point in content_points:
        elements.append(Paragraph(point, bullet_style))
        elements.append(Spacer(1, 0.15*inch))
    
    elements.append(PageBreak())
    
    # Chapter 6 关键洞察
    elements.append(Paragraph("1.3 关键洞察", subheading_style))
    insights_text = """
    <b>经济启示：</b><br/>
    全球化创造整体繁荣但分配不均，被遗忘的工人阶级是民粹主义土壤。<br/><br/>
    
    <b>历史启示：</b><br/>
    历史在重复（1896→2016），经济困境导致政治极化。<br/><br/>
    
    <b>政策启示：</b><br/>
    需要更好的分配机制和社会保障，避免工人阶级被全球化抛弃。
    """
    elements.append(Paragraph(insights_text, body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Marketcrafters Chapter 10
    elements.append(Paragraph("2. Marketcrafters Chapter 10", heading_style))
    elements.append(Paragraph("Robert Noyce 与半导体产业政策 (1983-93)", subheading_style))
    
    info_table2 = Table([
        ['文件信息', '详情'],
        ['页数', '20 页'],
        ['主题', '硅谷拯救：Robert Noyce 与半导体产业政策'],
        ['时间跨度', '1959-1993'],
        ['关键人物', 'Robert Noyce'],
    ], colWidths=[2*inch, 3.5*inch])
    info_table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fff3cd')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    elements.append(info_table2)
    elements.append(Spacer(1, 0.2*inch))
    
    # Marketcrafters 核心主题
    elements.append(Paragraph("2.1 核心主题", subheading_style))
    core_text2 = """
    <b>硅谷拯救：Robert Noyce 与半导体产业政策</b><br/><br/>
    讲述 Robert Noyce 如何通过个人魅力和政府关系，在 1980 年代日本半导体竞争压力下，
    成功推动美国产业政策拯救硅谷的故事。
    """
    elements.append(Paragraph(core_text2, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Marketcrafters 主要内容
    elements.append(Paragraph("2.2 主要内容", subheading_style))
    
    content_points2 = [
        "<b>1. 场景设定：1959 年 Fairchild Semiconductor</b><br/>" +
        "• 黑色豪华轿车驶入帕洛阿尔托<br/>" +
        "• 果园环绕的仓库→硅谷前身<br/>" +
        "• 纽约企业文化与加州的冲突",
        
        "<b>2. Robert Noyce 背景</b><br/>" +
        "• 爱荷华小镇出身<br/>" +
        "• 牧师家庭，4 个儿子之一<br/>" +
        "• 经济大萧条时期成长<br/>" +
        "• 格林内尔学院（7000 人口大学城）",
        
        "<b>3. 性格特点</b><br/>" +
        "• 魅力非凡，能吸引权威帮助<br/>" +
        "• 大学时偷猪办派对（经典故事）<br/>" +
        "• 但最终能走上正轨<br/>" +
        "• 这一特质后来拯救了硅谷",
        
        "<b>4. 半导体发明的历史意义</b><br/>" +
        "• 1940 年代末发明<br/>" +
        "• 与电力、核弹同等重要<br/>" +
        "• 半导体=调节电流的材料",
        
        "<b>5. 集成电路的发明</b><br/>" +
        "• Noyce 团队将多个晶体管嵌入单芯片<br/>" +
        "• 实现微型化和大规模生产<br/>" +
        "• 开启太空旅行、手机、个人电脑时代",
        
        "<b>6. 产业政策的关键作用</b><br/>" +
        "• Noyce 转向华盛顿寻求拯救<br/>" +
        "• 政府政策对硅谷发展的支持<br/>" +
        "• 1983-93 年关键十年的产业政策",
    ]
    
    for point in content_points2:
        elements.append(Paragraph(point, bullet_style))
        elements.append(Spacer(1, 0.15*inch))
    
    elements.append(PageBreak())
    
    # Marketcrafters 关键洞察
    elements.append(Paragraph("2.3 关键洞察", subheading_style))
    insights_text2 = """
    <b>创新启示：</b><br/>
    集成电路的发明是现代文明基石，与电力、核弹同等重要。<br/><br/>
    
    <b>政策启示：</b><br/>
    产业政策可以拯救关键行业，政府支持对科技发展至关重要。<br/><br/>
    
    <b>个人启示：</b><br/>
    个人魅力 + 政府支持=成功，Noyce 的特质拯救了硅谷。
    """
    elements.append(Paragraph(insights_text2, body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # 关联性分析
    elements.append(Paragraph("3. 两文件关联性分析", heading_style))
    
    comparison_data = [
        ['主题', 'Chapter 6', 'Marketcrafters Ch10'],
        ['时间背景', '19 世纪末 +2016', '1959-1993'],
        ['核心冲突', '全球化 vs 工人阶级', '美国 vs 日本半导体竞争'],
        ['政府角色', '民粹主义反建制', '产业政策拯救硅谷'],
        ['地理焦点', '美国内陆（煤矿）', '硅谷（帕洛阿尔托）'],
        ['关键人物', 'William Jennings Bryan / Trump', 'Robert Noyce'],
    ]
    
    comparison_table = Table(comparison_data, colWidths=[1.5*inch, 2.2*inch, 2.2*inch])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), font_name),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(comparison_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # 综合启示
    elements.append(Paragraph("4. 综合启示", heading_style))
    
    synthesis_text = """
    <b>经济政策的双重挑战：</b><br/><br/>
    
    1. <b>分配问题（Chapter 6）</b><br/>
    全球化创造整体繁荣，但需要更好的分配机制，避免工人阶级被抛弃。<br/><br/>
    
    2. <b>产业政策（Marketcrafters）</b><br/>
    战略性产业政策可以拯救关键行业，政府支持对科技发展至关重要。<br/><br/>
    
    3. <b>平衡之道</b><br/>
    需要在开放市场与产业保护之间找到平衡，既要促进创新，又要保障公平。<br/><br/>
    
    4. <b>历史教训</b><br/>
    历史在重复，经济困境导致政治极化，需要前瞻性政策避免民粹主义崛起。
    """
    elements.append(Paragraph(synthesis_text, body_style))
    elements.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_text = f"""
    <para alignment="center">
    <b>报告完成</b><br/>
    生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>
    文件来源：Dropbox - Chapter6GlobalizationInOverdrive.pdf + MarketcraftersCh10.pdf
    </para>
    """
    elements.append(Paragraph(footer_text, body_style))
    
    # Build PDF
    doc.build(elements)
    print(f"✅ PDF 报告已生成：{output_path}")
    return output_path

if __name__ == '__main__':
    output = '/Users/tomchen/.openclaw/workspace-chat/kanban-board/temp/Book_Chapters_Summary_Report.pdf'
    create_summary_report(output)
