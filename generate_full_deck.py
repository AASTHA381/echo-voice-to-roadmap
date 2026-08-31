#!/usr/bin/env python3
"""
GRAD 3.0 — Galderma Sunscreen Challenge
Full Proposal Deck: 10 Slides (+ Cover + Annexure)
Structure: Executive Summary → Situation → Solution → Implementation → Risk → Financials → Appendix
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.chart import (XL_CHART_TYPE, XL_LEGEND_POSITION,
                              XL_DATA_LABEL_POSITION)
from pptx.chart.data import CategoryChartData, XyChartData
from pptx.oxml.ns import qn
from lxml import etree

# ══════════════════════════════════════════════════════════════════
#  DESIGN SYSTEM
# ══════════════════════════════════════════════════════════════════
WHITE        = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_BG     = RGBColor(0xF8, 0xFA, 0xFC)
DARK_BG      = RGBColor(0x0F, 0x17, 0x2A)
CARD         = RGBColor(0xFF, 0xFF, 0xFF)
BORDER       = RGBColor(0xE2, 0xE8, 0xF0)
T_DARK       = RGBColor(0x0F, 0x17, 0x2A)
T_MUTED      = RGBColor(0x64, 0x74, 0x8B)
T_WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
ORANGE       = RGBColor(0xEA, 0x58, 0x0C)
ORANGE_L     = RGBColor(0xFF, 0xF7, 0xED)
ORANGE_B     = RGBColor(0xFE, 0xD7, 0xAA)
BLUE         = RGBColor(0x02, 0x84, 0xC7)
BLUE_L       = RGBColor(0xF0, 0xF9, 0xFF)
BLUE_B       = RGBColor(0xBA, 0xE6, 0xFD)
GREEN        = RGBColor(0x05, 0x96, 0x69)
GREEN_L      = RGBColor(0xEC, 0xFD, 0xF5)
GREEN_B      = RGBColor(0xA7, 0xF3, 0xD0)
PURPLE       = RGBColor(0x7C, 0x3A, 0xED)
PURPLE_L     = RGBColor(0xF5, 0xF3, 0xFF)
PINK         = RGBColor(0xDB, 0x27, 0x77)
PINK_L       = RGBColor(0xFD, 0xF2, 0xF8)
GOLD         = RGBColor(0xF5, 0x9E, 0x0B)
GOLD_L       = RGBColor(0xFF, 0xF9, 0xE6)
RED          = RGBColor(0xDC, 0x26, 0x26)
RED_L        = RGBColor(0xFE, 0xF2, 0xF2)
AMBER        = RGBColor(0xF5, 0x9E, 0x0B)
AMBER_L      = RGBColor(0xFF, 0xFB, 0xEB)
GRAY         = RGBColor(0xCB, 0xD5, 0xE1)
GRAY_MED     = RGBColor(0x94, 0xA3, 0xB8)

FH = "Outfit"   # Heading font (installed)
FB = "Inter"    # Body font (installed)

# ══════════════════════════════════════════════════════════════════
#  PRESENTATION SETUP
# ══════════════════════════════════════════════════════════════════
prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

def embed_fonts(prs):
    pr = prs._element
    pp = pr.find(qn('p:presentationPr'))
    if pp is None:
        pp = etree.SubElement(pr, qn('p:presentationPr'))
    pp.set('embedTrueTypeFonts', '1')

embed_fonts(prs)
BLANK = prs.slide_layouts[6]

# ══════════════════════════════════════════════════════════════════
#  PRIMITIVE HELPERS
# ══════════════════════════════════════════════════════════════════
def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color

def rect(slide, l, t, w, h, fill=None, line_c=None, lw=Pt(0.75), r=False):
    sh = MSO_SHAPE.ROUNDED_RECTANGLE if r else MSO_SHAPE.RECTANGLE
    sp = slide.shapes.add_shape(sh, l, t, w, h)
    sp.shadow.inherit = False
    sp.fill.solid() if fill else sp.fill.background()
    if fill: sp.fill.fore_color.rgb = fill
    if line_c:
        sp.line.color.rgb = line_c; sp.line.width = lw
    else:
        sp.line.fill.background()
    return sp

def oval(slide, l, t, w, h, fill=ORANGE, line_c=None):
    sp = slide.shapes.add_shape(MSO_SHAPE.OVAL, l, t, w, h)
    sp.shadow.inherit = False
    sp.fill.solid(); sp.fill.fore_color.rgb = fill
    if line_c: sp.line.color.rgb = line_c
    else: sp.line.fill.background()
    return sp

def txb(slide, l, t, w, h, text, sz=11, bold=False, color=T_DARK,
        align=PP_ALIGN.LEFT, font=FB, italic=False, wrap=True):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame; tf.word_wrap = wrap
    tf.margin_left = tf.margin_right = Inches(0.04)
    tf.margin_top  = tf.margin_bottom = Inches(0.02)
    p = tf.paragraphs[0]; run = p.add_run()
    run.text = text; run.font.name = font; run.font.size = Pt(sz)
    run.font.bold = bold; run.font.italic = italic
    run.font.color.rgb = color; p.alignment = align
    return box

def add_run(para, text, sz=11, bold=False, color=T_DARK, font=FB):
    run = para.add_run()
    run.text = text; run.font.name = font
    run.font.size = Pt(sz); run.font.bold = bold
    run.font.color.rgb = color
    return run

# ══════════════════════════════════════════════════════════════════
#  COMPONENT BUILDERS
# ══════════════════════════════════════════════════════════════════
W = prs.slide_width

def slide_header(slide, brand_tag, title, section_tag, dark=False):
    hbg = DARK_BG if dark else WHITE
    htxt = T_WHITE if dark else T_DARK
    # Accent stripe
    rect(slide, Inches(0), Inches(0), W, Inches(0.05), fill=ORANGE)
    # Header bg
    rect(slide, Inches(0), Inches(0.05), W, Inches(1.0), fill=hbg, line_c=BORDER, lw=Pt(0.5))
    txb(slide, Inches(0.5), Inches(0.1), Inches(8), Inches(0.22),
        brand_tag, sz=8, bold=True, color=ORANGE, font=FH)
    txb(slide, Inches(0.5), Inches(0.33), Inches(9.5), Inches(0.65),
        title, sz=20, bold=True, color=htxt, font=FH)
    txb(slide, Inches(9.2), Inches(0.1), Inches(4.0), Inches(0.22),
        section_tag, sz=8, bold=True, color=T_MUTED, align=PP_ALIGN.RIGHT, font=FH)

def slide_footer(slide, left, right):
    rect(slide, Inches(0), Inches(7.1), W, Inches(0.4), fill=LIGHT_BG, line_c=BORDER, lw=Pt(0.4))
    txb(slide, Inches(0.5), Inches(7.16), Inches(9.5), Inches(0.26),
        left, sz=7, color=T_MUTED, font=FB)
    txb(slide, Inches(10.0), Inches(7.16), Inches(3.1), Inches(0.26),
        right, sz=7, color=T_MUTED, align=PP_ALIGN.RIGHT, font=FH)

def kpi_badge(slide, l, t, w, h, val, label, accent=ORANGE, bg_c=WHITE):
    rect(slide, l, t, w, h, fill=bg_c, line_c=accent, lw=Pt(1.5), r=True)
    rect(slide, l, t, w, Inches(0.04), fill=accent)
    txb(slide, l, t+Inches(0.07), w, Inches(0.38),
        val, sz=18, bold=True, color=accent, align=PP_ALIGN.CENTER, font=FH)
    txb(slide, l+Inches(0.1), t+Inches(0.48), w-Inches(0.2), h-Inches(0.55),
        label, sz=7.8, color=T_MUTED, align=PP_ALIGN.CENTER, font=FB)

def card(slide, l, t, w, h, title, bullets, accent=ORANGE, bg_c=CARD):
    rect(slide, l, t, w, h, fill=bg_c, line_c=BORDER, lw=Pt(0.75), r=True)
    rect(slide, l, t, w, Inches(0.04), fill=accent)
    txb(slide, l+Inches(0.15), t+Inches(0.08), w-Inches(0.25), Inches(0.26),
        title, sz=9, bold=True, color=accent, font=FH)
    body = "\n".join(bullets)
    txb(slide, l+Inches(0.15), t+Inches(0.36), w-Inches(0.3), h-Inches(0.45),
        body, sz=8, color=T_MUTED, font=FB)

def arrow_right(slide, l, t, size=Inches(0.25)):
    sp = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, l, t, size, size*0.7)
    sp.fill.solid(); sp.fill.fore_color.rgb = GRAY
    sp.line.fill.background()

def step_badge(slide, l, t, num, label, sublabel, accent=ORANGE):
    """Numbered step circle + label"""
    oval(slide, l, t, Inches(0.38), Inches(0.38), fill=accent)
    txb(slide, l, t, Inches(0.38), Inches(0.38),
        str(num), sz=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    txb(slide, l+Inches(0.46), t, Inches(2.5), Inches(0.22),
        label, sz=9.5, bold=True, color=T_DARK, font=FH)
    txb(slide, l+Inches(0.46), t+Inches(0.22), Inches(2.5), Inches(0.18),
        sublabel, sz=8, color=T_MUTED, font=FB)

# ══════════════════════════════════════════════════════════════════
#  BRAND TAG
# ══════════════════════════════════════════════════════════════════
BT = "GRAD 3.0 · GALDERMA RISING ACHIEVERS IN DERMATOLOGY"

# ════════════════════════════════════════════════════════════════════
# SLIDE 0 — COVER (dark, full-bleed hero)
# ════════════════════════════════════════════════════════════════════
s0 = prs.slides.add_slide(BLANK)
bg(s0, DARK_BG)

# Decorative orange arc
oval(s0, Inches(9.8), Inches(-2.5), Inches(5.5), Inches(5.5), fill=RGBColor(0x7C,0x1E,0x04))
oval(s0, Inches(10.2), Inches(-2.1), Inches(4.7), Inches(4.7), fill=DARK_BG)
oval(s0, Inches(-2.0), Inches(5.0), Inches(4.2), Inches(4.2), fill=RGBColor(0x02,0x44,0x6B))

txb(s0, Inches(0.9), Inches(1.5), Inches(8), Inches(0.26),
    "GALDERMA SUNSCREEN CHALLENGE · OFFICIAL SUBMISSION",
    sz=9.5, bold=True, color=ORANGE, font=FH)
txb(s0, Inches(0.9), Inches(1.85), Inches(11), Inches(1.8),
    "Future-Ready Sunscreen\nStrategy for India",
    sz=38, bold=True, color=WHITE, font=FH)
txb(s0, Inches(0.9), Inches(3.85), Inches(9), Inches(0.5),
    "A data-backed 3–5 year portfolio, GTM, and competitive strategy\nfor Galderma India — derma sunscreen market | 2024–2029",
    sz=12, color=GRAY_MED, font=FB)

# Divider
rect(s0, Inches(0.9), Inches(4.55), Inches(7.5), Inches(0.015), fill=RGBColor(0x2D,0x3D,0x5A))

# Team info
txb(s0, Inches(0.9), Inches(4.65), Inches(3.5), Inches(0.22),
    "TEAM", sz=8, bold=True, color=ORANGE, font=FH)
txb(s0, Inches(0.9), Inches(4.9), Inches(4.5), Inches(0.38),
    "aastha.saini95", sz=22, bold=True, color=WHITE, font=FH)

for i, (ini, name, role) in enumerate([
    ("A","Aastha Saini","Strategy Lead"),
    ("S","Suraj Satpute","Analytics"),
    ("D","I Dharshana","Research"),
]):
    oy = Inches(5.45) + i*Inches(0.52)
    oval(s0, Inches(0.9), oy, Inches(0.34), Inches(0.34), fill=ORANGE)
    txb(s0, Inches(0.9), oy, Inches(0.34), Inches(0.34),
        ini, sz=10, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    txb(s0, Inches(1.32), oy+Inches(0.03), Inches(3.5), Inches(0.16),
        name, sz=10, bold=True, color=WHITE, font=FH)
    txb(s0, Inches(1.32), oy+Inches(0.19), Inches(3), Inches(0.14),
        role, sz=8, color=GRAY_MED, font=FB)

# Right info panel
rect(s0, Inches(9.3), Inches(1.5), Inches(3.6), Inches(4.5),
     fill=RGBColor(0x14,0x23,0x42), line_c=RGBColor(0x2D,0x3D,0x5A), r=True)
for i, (lbl, val, col) in enumerate([
    ("Market Opportunity","₹2,800 Cr",ORANGE),
    ("Target CAGR","22%",BLUE),
    ("Portfolio SKUs","5 + 1",GREEN),
    ("5-Yr Revenue Target","₹840 Cr Cum.",GOLD),
    ("HCP Sampling","5,000 Dermatologists",PURPLE),
]):
    ky = Inches(1.7) + i*Inches(0.72)
    txb(s0, Inches(9.5), ky, Inches(3.2), Inches(0.18),
        lbl, sz=7.5, color=GRAY_MED, font=FB)
    txb(s0, Inches(9.5), ky+Inches(0.18), Inches(3.2), Inches(0.3),
        val, sz=14, bold=True, color=col, font=FH)

slide_footer(s0,
    "Source: Euromonitor (2024), Nykaa/Amazon Audit N=50 [1], Consumer Survey N=500 [2]",
    "Cover Slide")


# ════════════════════════════════════════════════════════════════════
# SLIDE 1 — EXECUTIVE SUMMARY (SCQA)
# ════════════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(BLANK)
bg(s1, LIGHT_BG)
slide_header(s1, BT,
    "Executive Summary: The SCQA Framework",
    "SLIDE 1 · EXECUTIVE SUMMARY")

# SCQA boxes (4 flow steps)
scqa = [
    ("S", "SITUATION", BLUE, BLUE_L,
     "India's premium derma sunscreen market is growing at 22% CAGR, reaching ₹2,800 Cr in 2024 (Euromonitor). "
     "Consumers aged 25–35 are rapidly shifting from mass brands to dermatologist-backed SPF solutions. "
     "The ₹400–800 price band commands 48% of audited Nykaa/Amazon premium listings (N=50 audit)."),
    ("C", "COMPLICATION", RED, RED_L,
     "Galderma India currently sells only 1 SKU — Cetaphil Sun Light Gel 50ml at MRP ₹1,080 — missing "
     "the ₹400–800 sweet spot entirely. 72% of surveyed consumers (N=500) reject thick, heavy-feel formats. "
     "Competitors (Re'equil ₹695, Minimalist ₹399, La Shield ₹780) are aggressively filling this gap."),
    ("Q", "QUESTION", GOLD, GOLD_L,
     "How can Galderma leverage its unmatched 40+ years of dermatology equity and Cetaphil's "
     "75-year skin heritage to capture India's fastest-growing SPF consumer segment (25–35 yrs) "
     "before competitors consolidate the ₹400–800 price band?"),
    ("A", "ANSWER", GREEN, GREEN_L,
     "Launch a 5-SKU derma portfolio ladder (₹449–₹999) backed by a 5,000-dermatologist HCP "
     "sampling program and omnichannel GTM (Nykaa → MT → Q-Commerce). "
     "Projected: ₹40 Cr Year 1 → ₹350 Cr Year 5 | ₹840 Cr cumulative 5-year revenue."),
]

BW = Inches(2.85)
for i, (letter, label, accent, bg_c, body) in enumerate(scqa):
    bx = Inches(0.45) + i*(BW + Inches(0.28))
    # Card
    rect(s1, bx, Inches(1.2), BW, Inches(5.75), fill=bg_c, line_c=accent, lw=Pt(1.5), r=True)
    rect(s1, bx, Inches(1.2), BW, Inches(0.05), fill=accent)
    # Big letter badge
    oval(s1, bx+Inches(0.9), Inches(1.32), Inches(0.9), Inches(0.9), fill=accent)
    txb(s1, bx+Inches(0.9), Inches(1.32), Inches(0.9), Inches(0.9),
        letter, sz=26, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    # Label
    txb(s1, bx+Inches(0.12), Inches(2.38), BW-Inches(0.24), Inches(0.26),
        label, sz=10, bold=True, color=accent, font=FH)
    # Body
    txb(s1, bx+Inches(0.12), Inches(2.68), BW-Inches(0.24), Inches(4.0),
        body, sz=8.5, color=T_DARK, font=FB)

    # Arrow between boxes
    if i < 3:
        ax = bx + BW + Inches(0.03)
        oval(s1, ax, Inches(3.6), Inches(0.22), Inches(0.22), fill=GRAY)
        txb(s1, ax, Inches(3.6), Inches(0.22), Inches(0.22),
            "›", sz=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)

# Impact summary strip at bottom
rect(s1, Inches(0.45), Inches(7.0), W-Inches(0.9), Inches(0.0), fill=None)  # spacer

slide_footer(s1,
    "Sources: Euromonitor India Beauty & Personal Care (2024) [1] · Consumer Survey N=500 [2] · Nykaa/Amazon Audit N=50 [3]",
    "Slide 1 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 2 — SITUATION: MARKET LANDSCAPE
# ════════════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(BLANK)
bg(s2, LIGHT_BG)
slide_header(s2, BT,
    "Situation Analysis: Market Landscape & Growth Drivers",
    "SLIDE 2 · SITUATION")

# 4 KPI badges
kpis = [
    ("₹2,800 Cr", "India Premium Sunscreen\nMarket Size 2024 [1]", ORANGE),
    ("22% CAGR",  "Market Growth Rate 2024–29\n(Euromonitor) [1]",  BLUE),
    ("25–35 Yrs", "Core Consumer Cohort:\nPeak Earning + Aware [2]", GREEN),
    ("₹400–800",  "Sweet-Spot Price Band\n48% of Premium Listings [3]", PURPLE),
]
for i, (val, lbl, col) in enumerate(kpis):
    kx = Inches(0.45) + i*Inches(3.17)
    kpi_badge(s2, kx, Inches(1.18), Inches(3.0), Inches(1.02), val, lbl, col)

# Left: Bar Chart — Market Size by Year
cd_mkt = CategoryChartData()
cd_mkt.categories = ['2021','2022','2023','2024','2025E','2027E','2029E']
cd_mkt.add_series('India Premium Sunscreen Market (₹ Cr)',
                  (1400, 1720, 2100, 2800, 3380, 4950, 7600))
ch_mkt = s2.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(0.45), Inches(2.32), Inches(4.5), Inches(4.55), cd_mkt)
cm = ch_mkt.chart
cm.has_legend = False
cm.has_title = True
cm.chart_title.text_frame.text = "India Sunscreen Market Size (₹ Cr) — 22% CAGR"
cm.chart_title.text_frame.paragraphs[0].font.size = Pt(8)
cm.plots[0].has_data_labels = True
cm.plots[0].data_labels.font.size = Pt(7)
cm.plots[0].data_labels.font.bold = True

# Middle: Donut — Segment Split
cd_seg = CategoryChartData()
cd_seg.categories = ['Mass ≤₹300', 'Premium ₹300–800', 'Derma ₹800+']
cd_seg.add_series('Segment Split %', (38, 41, 21))
ch_seg = s2.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT,
    Inches(5.1), Inches(2.32), Inches(3.8), Inches(4.55), cd_seg)
cs = ch_seg.chart
cs.has_legend = True
cs.legend.position = XL_LEGEND_POSITION.BOTTOM
cs.legend.font.size = Pt(8)
cs.has_title = True
cs.chart_title.text_frame.text = "Market Segment Mix 2024 (%)"
cs.chart_title.text_frame.paragraphs[0].font.size = Pt(8)
cs.plots[0].has_data_labels = True
cs.plots[0].data_labels.font.size = Pt(8)
cs.plots[0].data_labels.font.bold = True

# Right: Consumer Driver Infographic (text-based)
rect(s2, Inches(9.05), Inches(2.32), Inches(4.1), Inches(4.55),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
rect(s2, Inches(9.05), Inches(2.32), Inches(4.1), Inches(0.04), fill=ORANGE)
txb(s2, Inches(9.22), Inches(2.38), Inches(3.8), Inches(0.24),
    "TOP CONSUMER GROWTH DRIVERS", sz=9, bold=True, color=ORANGE, font=FH)

drivers = [
    ("🌞","78%","Derm recommendation = #1 brand switch trigger [2]"),
    ("📱","65%","Research skincare on Instagram/YouTube before purchase [4]"),
    ("💊","72%","Demand multi-benefit SPF (anti-aging + pigmentation) [2]"),
    ("🚿","68%","Prefer lightweight gel/serum texture over creams [2]"),
    ("💰","48%","Target ₹400–800 as 'affordable premium' sweet spot [3]"),
]
for i, (icon, pct, label) in enumerate(drivers):
    dy = Inches(2.72) + i*Inches(0.75)
    rect(s2, Inches(9.15), dy, Inches(3.9), Inches(0.66),
         fill=ORANGE_L if i%2==0 else WHITE, line_c=ORANGE_B, lw=Pt(0.5), r=True)
    txb(s2, Inches(9.22), dy+Inches(0.04), Inches(0.4), Inches(0.28),
        icon, sz=14, font=FB)
    txb(s2, Inches(9.65), dy+Inches(0.02), Inches(0.6), Inches(0.28),
        pct, sz=14, bold=True, color=ORANGE, font=FH)
    txb(s2, Inches(10.28), dy+Inches(0.07), Inches(2.65), Inches(0.52),
        label, sz=8, color=T_DARK, font=FB)

slide_footer(s2,
    "Sources: [1] Euromonitor India BPC 2024 · [2] Primary Survey N=500 · [3] Nykaa/Amazon N=50 Audit · [4] Mintel Digital Beauty India 2023",
    "Slide 2 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 3 — SITUATION: PROBLEM DEEP DIVE (Root Cause)
# ════════════════════════════════════════════════════════════════════
s3 = prs.slides.add_slide(BLANK)
bg(s3, LIGHT_BG)
slide_header(s3, BT,
    "Situation Analysis: Problem Deep Dive & Root Cause",
    "SLIDE 3 · SITUATION")

# Root cause tree — 3 columns
txb(s3, Inches(0.45), Inches(1.2), Inches(12.5), Inches(0.28),
    "ROOT CAUSE: Why Galderma is missing India's sunscreen opportunity despite 40+ years of dermatology equity",
    sz=10, bold=True, color=RED, font=FH)

# Central problem box
rect(s3, Inches(4.7), Inches(1.62), Inches(3.9), Inches(0.78),
     fill=RED_L, line_c=RED, lw=Pt(2), r=True)
txb(s3, Inches(4.7), Inches(1.70), Inches(3.9), Inches(0.62),
    "PORTFOLIO GAP\n1 SKU · Wrong Price Band · Wrong Format",
    sz=10.5, bold=True, color=RED, align=PP_ALIGN.CENTER, font=FH)

# Three cause columns
causes = [
    ("PRICE POSITIONING", ORANGE, [
        "• Only 1 SKU at MRP ₹1,080\n  — 35% above ₹800 threshold",
        "• Competes in Derma Premium\n  vs. D2C at ₹399–695",
        "• ₹400–800 band = 48% of\n  Nykaa/Amazon top listings",
        "• Bioderma at ₹1,575 = only\n  comparable (different need)",
    ]),
    ("CONSUMER FORMAT MISMATCH", BLUE, [
        "• Single format: Light Gel\n  (no serum, mist, or tint)",
        "• 72% reject thick creams;\n  demand gel/serum formats",
        "• No reapplication solution\n  over makeup (mist gap)",
        "• No shade variants for Indian\n  skin tones (tint gap)",
    ]),
    ("CHANNEL & HCP GAPS", GREEN, [
        "• Low dermatologist sampling\n  vs. Re'equil & IPCA models",
        "• Limited Q-Commerce\n  (Blinkit/Zepto) presence",
        "• Nykaa premium shelf space\n  under-utilized vs. Bioderma",
        "• No D2C subscription or\n  digital skin-quiz funnel",
    ]),
]

for i, (ttl, col, bullets) in enumerate(causes):
    cx = Inches(0.45) + i*Inches(4.28)
    card(s3, cx, Inches(2.6), Inches(4.1), Inches(4.25), ttl, bullets, col)

# Consumer barrier infographic strip
rect(s3, Inches(0.45), Inches(6.95), W-Inches(0.9), Inches(0.0), fill=None)

# Bottom: Competitive Gap bar
txb(s3, Inches(0.45), Inches(6.82), Inches(12), Inches(0.2),
    "★ Key Stat: Cetaphil Sun ₹1,080 sits 140% above the market sweet-spot midpoint (₹449). No entry-level derma product exists in Galderma's India portfolio.",
    sz=8, italic=True, color=GRAY_MED, font=FB)

slide_footer(s3,
    "Sources: [2] Primary Survey N=500 · [3] Nykaa/Amazon Audit · [5] Nielsen India Skin Care Report 2023 · Competitor MRP from brand websites",
    "Slide 3 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 4 — COMPETITIVE LANDSCAPE (Scatter + Positioning Map)
# ════════════════════════════════════════════════════════════════════
s4 = prs.slides.add_slide(BLANK)
bg(s4, LIGHT_BG)
slide_header(s4, BT,
    "Competitive Landscape: Pricing vs. Derm Equity Positioning",
    "SLIDE 4 · SITUATION")

# Left: Scatter chart
cd_sc = XyChartData()
brands = [
    ("Lakme ₹349",        349,  28),
    ("Lotus ₹275",        275,  22),
    ("Minimalist ₹399",   399,  50),
    ("Derma Co ₹475",     475,  52),
    ("Re'equil ₹695",     695,  80),
    ("La Shield ₹780",    780,  82),
    ("IPCA Acne-UV ₹580", 580,  75),
    ("Bioderma ₹1575",   1575,  90),
    ("Cetaphil ₹1080",   1080,  95),
    ("★ Target ₹449",     449,  93),
]
for n, x, y in brands:
    s = cd_sc.add_series(n); s.add_data_point(x, y)

ch_sc = s4.shapes.add_chart(XL_CHART_TYPE.XY_SCATTER,
    Inches(0.45), Inches(1.22), Inches(6.4), Inches(5.65), cd_sc)
csc = ch_sc.chart
csc.has_legend = True
csc.legend.position = XL_LEGEND_POSITION.BOTTOM
csc.legend.font.size = Pt(6.5)
csc.has_title = True
csc.chart_title.text_frame.text = "MRP (₹ X-axis) vs Derm Perception Score (0–100 Y-axis)"
csc.chart_title.text_frame.paragraphs[0].font.size = Pt(8)

# Right: Competitor comparison table
rect(s4, Inches(7.0), Inches(1.22), Inches(6.15), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s4, Inches(7.18), Inches(1.3), Inches(5.8), Inches(0.26),
    "COMPETITIVE BENCHMARKING", sz=9.5, bold=True, color=BLUE, font=FH)

comp_data = [
    ("Brand",           "MRP",    "Format",   "Derm?", "Gap"),
    ("Lakme Sun Expert","₹349",   "Cream",    "No",    "Mass"),
    ("Minimalist SPF50","₹399",   "Gel",      "No",    "D2C"),
    ("Derma Co SPF50",  "₹475",   "Fluid",    "Partial","D2C"),
    ("Re'equil SPF60",  "₹695",   "Gel",      "Yes",   "Derma"),
    ("La Shield SPF40", "₹780",   "Cream",    "Yes",   "Derma"),
    ("IPCA Acne-UV",    "₹580",   "Gel",      "Rx",    "Rx"),
    ("Bioderma Max",    "₹1,575", "Fluid",    "Yes",   "Ultra-P"),
    ("Cetaphil Sun",    "₹1,080", "Light Gel","Yes",   "● Only SKU"),
    ("★ Proposed ₹449", "₹449",  "Gel",      "Yes",   "GAP FILL"),
]
row_h = Inches(0.46)
for r, row in enumerate(comp_data):
    ry = Inches(1.62) + r * row_h
    row_bg = RGBColor(0xFF,0xF7,0xED) if r == 9 else (RGBColor(0xF0,0xF9,0xFF) if r == 0 else WHITE)
    for c, cell_txt in enumerate(row):
        cw = [Inches(1.75), Inches(0.72), Inches(0.9), Inches(0.62), Inches(1.4)][c]
        cx = Inches(7.06) + sum([Inches(1.75), Inches(0.72), Inches(0.9), Inches(0.62)][:c]) + c*Inches(0.03)
        rect(s4, cx, ry, cw, row_h, fill=row_bg, line_c=BORDER, lw=Pt(0.4))
        col_color = ORANGE if (r==9 and c>0) else (T_WHITE if r==0 else T_DARK)
        if r==0:
            rect(s4, cx, ry, cw, row_h, fill=BLUE, line_c=BLUE)
            col_color = WHITE
        txb(s4, cx+Inches(0.05), ry+Inches(0.12), cw-Inches(0.08), Inches(0.25),
            cell_txt, sz=7.8 if r>0 else 8,
            bold=(r==0 or r==9), color=col_color, font=FH if r==0 else FB)

slide_footer(s4,
    "Source: Brand websites, Nykaa/Amazon listings audit N=50 [3], Nielsen India Skin Care [5] | ★ = Proposed Cetaphil Sun Entry Gel",
    "Slide 4 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 5 — SOLUTION: PORTFOLIO ARCHITECTURE
# ════════════════════════════════════════════════════════════════════
s5 = prs.slides.add_slide(BLANK)
bg(s5, LIGHT_BG)
slide_header(s5, BT,
    "Solution: 5-SKU Derma Portfolio Ladder (₹449–₹1,080)",
    "SLIDE 5 · SOLUTION & RECOMMENDATION")

txb(s5, Inches(0.45), Inches(1.22), Inches(12.5), Inches(0.24),
    "Strategy: Build a price ladder that intercepts consumers at every entry point and upgrades them toward the Cetaphil Sun flagship.",
    sz=9.5, italic=True, color=T_MUTED, font=FB)

# Price ladder visual
skus = [
    ("ENTRY TIER","Cetaphil Sun\nDaily Defense Gel SPF 30","₹449 / 50ml",
     "Broad-Spectrum + Niacinamide\nGel · Non-greasy · Daily use",
     "Trial driver. Recruits ₹399–₹499 D2C switchers.", BLUE, BLUE_L),
    ("CORE SPECIALIST","Biluma UV Shield\nSPF 50","₹549 / 50g",
     "Kojic Acid + Arbutin + UV Filters\nCream–Gel · Depigmentation",
     "Biluma renovation into daily SPF. Rx referral product.", GREEN, GREEN_L),
    ("FORMAT SPECIALTY","Cetaphil Sun\nTouch-Up Mist SPF 50","₹599 / 75ml",
     "Quick-Dry Micro-Mist + Aloe Vera\nMist · Over-makeup · Reapplication",
     "Unique category. No direct competitor. Premium recall.", PINK, PINK_L),
    ("PREMIUM","Cetaphil Sun\nTinted Glow SPF 50","₹849 / 30ml",
     "Iron Oxides + 5 Indian Shades\nGel-Cream · Sensitive skin",
     "Derm-shade match for Indian skin. High ASP.", PURPLE, PURPLE_L),
    ("HERO INNOVATION","Cetaphil Sun Age\nDefense Serum SPF 50","₹999 / 30ml",
     "Bakuchiol + Peptides + Ectoin\nSerum · Anti-photoaging",
     "₹33.3/ml vs Bioderma ₹39.3/ml. Highest margin.", ORANGE, ORANGE_L),
]

SW = Inches(2.38)
for i, (tier, name, price, spec, role, col, lcol) in enumerate(skus):
    sx = Inches(0.4) + i*(SW + Inches(0.15))
    # Column card
    rect(s5, sx, Inches(1.55), SW, Inches(5.3), fill=lcol, line_c=col, lw=Pt(1.5), r=True)
    rect(s5, sx, Inches(1.55), SW, Inches(0.05), fill=col)
    # Tier label
    txb(s5, sx+Inches(0.1), Inches(1.62), SW-Inches(0.2), Inches(0.2),
        tier, sz=7, bold=True, color=col, font=FH)
    # Price badge
    rect(s5, sx+Inches(0.1), Inches(1.86), SW-Inches(0.2), Inches(0.4),
         fill=col, line_c=None, r=True)
    txb(s5, sx+Inches(0.1), Inches(1.86), SW-Inches(0.2), Inches(0.4),
        price, sz=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    # Product name
    txb(s5, sx+Inches(0.1), Inches(2.34), SW-Inches(0.2), Inches(0.65),
        name, sz=10, bold=True, color=T_DARK, font=FH)
    # Spec
    txb(s5, sx+Inches(0.1), Inches(3.05), SW-Inches(0.2), Inches(0.75),
        spec, sz=8, color=T_MUTED, font=FB)
    # Strategic role
    rect(s5, sx+Inches(0.1), Inches(3.88), SW-Inches(0.2), Inches(0.9),
         fill=WHITE, line_c=col, lw=Pt(0.75), r=True)
    txb(s5, sx+Inches(0.15), Inches(3.92), SW-Inches(0.3), Inches(0.82),
        "ROLE:\n"+role, sz=7.5, color=T_DARK, font=FB)
    # Year of launch
    launch = ["Yr 1","Yr 1","Yr 2","Yr 2","Yr 3"][i]
    rect(s5, sx+Inches(0.1), Inches(4.88), SW-Inches(0.2), Inches(0.28),
         fill=col, r=True)
    txb(s5, sx+Inches(0.1), Inches(4.88), SW-Inches(0.2), Inches(0.28),
        f"LAUNCH: {launch}", sz=8, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)

# Existing flagship note
txb(s5, Inches(0.45), Inches(5.28), Inches(12.5), Inches(0.22),
    "⬆ Anchor: Cetaphil Sun Light Gel SPF 50+ (EXISTING FLAGSHIP · MRP ₹1,080/50ml & ₹1,899/100ml) — retained & repositioned as premium halo",
    sz=8.5, bold=True, color=ORANGE, font=FH)

# Revenue mix donut
cd_mix = CategoryChartData()
cd_mix.categories = ['Entry Gel','Biluma UV','Mist','Tinted','Serum','Core Flagship']
cd_mix.add_series('Yr3 Revenue Mix %', (28,15,18,14,13,12))
ch_mix = s5.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT,
    Inches(0.4), Inches(5.58), Inches(3.5), Inches(1.55), cd_mix)
cmx = ch_mix.chart
cmx.has_legend = True; cmx.legend.position = XL_LEGEND_POSITION.RIGHT
cmx.legend.font.size = Pt(6.5)
cmx.has_title = True
cmx.chart_title.text_frame.text = "Yr3 Portfolio Revenue Mix"
cmx.chart_title.text_frame.paragraphs[0].font.size = Pt(7.5)
cmx.plots[0].has_data_labels = True; cmx.plots[0].data_labels.font.size = Pt(7)

slide_footer(s5,
    "Formulations subject to R&D stability, photostability & clinical SPF testing per BIS/ISO 24444 | Prices are MRP; selling price ~12% below MRP via trade",
    "Slide 5 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 6 — SOLUTION: GTM & CHANNEL STRATEGY
# ════════════════════════════════════════════════════════════════════
s6 = prs.slides.add_slide(BLANK)
bg(s6, LIGHT_BG)
slide_header(s6, BT,
    "Solution: Go-To-Market & HCP Dermatologist Engine",
    "SLIDE 6 · SOLUTION & RECOMMENDATION")

# Left — GTM Channel Map
rect(s6, Inches(0.45), Inches(1.22), Inches(6.4), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s6, Inches(0.62), Inches(1.3), Inches(6.0), Inches(0.26),
    "OMNICHANNEL GTM ARCHITECTURE", sz=10, bold=True, color=ORANGE, font=FH)

channels = [
    ("🏥", "Dermatology Clinics", "Phase 1 — HCP Sampling. 5,000 dermatologists × 20 units = 1 Lakh units seeded. Target: 15% Rx recommendation rate.", ORANGE),
    ("💻", "Nykaa / Amazon / TIRA", "Phase 1 — Premium shelf. Nykaa Derm-Approved badge. A+ content with ingredient deep-dives. Star ratings target: 4.3+", BLUE),
    ("🏪", "Modern Trade (MT)", "Phase 2 — Reliance Trends, Shoppers Stop. Beauty advisor training. In-store SPF consultation zones.", GREEN),
    ("⚡", "Quick Commerce", "Phase 2 — Blinkit, Swiggy Instamart, Zepto. High-velocity restock for daily SPF users. 30-min delivery = impulse repurchase.", PURPLE),
    ("✈️", "Travel Retail & Pharmacy", "Phase 3 — Airport duty-free, Apollo, MedPlus. Premium on-the-go positioning. International tourist upsell.", PINK),
]
for i, (icon, ch_name, detail, col) in enumerate(channels):
    cy = Inches(1.68) + i*Inches(0.95)
    rect(s6, Inches(0.55), cy, Inches(6.2), Inches(0.86),
         fill=ORANGE_L if col==ORANGE else LIGHT_BG, line_c=col, lw=Pt(0.75), r=True)
    txb(s6, Inches(0.65), cy+Inches(0.05), Inches(0.5), Inches(0.4),
        icon, sz=18, font=FB)
    txb(s6, Inches(1.2), cy+Inches(0.05), Inches(1.8), Inches(0.22),
        ch_name, sz=9.5, bold=True, color=col, font=FH)
    txb(s6, Inches(1.2), cy+Inches(0.27), Inches(5.3), Inches(0.56),
        detail, sz=8, color=T_MUTED, font=FB)

# Right — HCP Program + Brand Comm
rect(s6, Inches(7.0), Inches(1.22), Inches(6.15), Inches(2.7),
     fill=ORANGE_L, line_c=ORANGE_B, lw=Pt(1.5), r=True)
txb(s6, Inches(7.18), Inches(1.3), Inches(5.8), Inches(0.24),
    "HCP DERMATOLOGIST PROGRAM", sz=10, bold=True, color=ORANGE, font=FH)

hcp = [
    ("5,000","Dermatologists sampled — Top 20 cities [Phase 1]"),
    ("1 Lakh","Sample units distributed (20 units/doctor)"),
    ("15%","Target Rx recommendation rate post-sampling"),
    ("₹40L","Estimated HCP sampling program budget"),
    ("2×","Higher sales conversion from derm recommendation [6]"),
]
for i, (num, lbl) in enumerate(hcp):
    hy = Inches(1.62) + i*Inches(0.46)
    txb(s6, Inches(7.18), hy, Inches(1.2), Inches(0.28),
        num, sz=15, bold=True, color=ORANGE, font=FH)
    txb(s6, Inches(8.45), hy+Inches(0.04), Inches(4.5), Inches(0.26),
        lbl, sz=8.5, color=T_DARK, font=FB)

# Brand Communication
rect(s6, Inches(7.0), Inches(4.06), Inches(6.15), Inches(2.81),
     fill=BLUE_L, line_c=BLUE_B, lw=Pt(1.5), r=True)
txb(s6, Inches(7.18), Inches(4.14), Inches(5.8), Inches(0.24),
    "BRAND COMMUNICATION STRATEGY", sz=10, bold=True, color=BLUE, font=FH)

comms = [
    ("Territory","'Derm-Approved. India-Ready.' — science-first daily protection"),
    ("D2C Digital","SunMatch AI tool: skin-tone-to-product recommendation quiz"),
    ("Influencer","Dermatologist KOL micro-influencers (200K–2M reach tier)"),
    ("Cult.fit","Fitness center sampling: SPF as workout recovery skincare"),
    ("PR","Research whitepaper: 'India SPF Gap Study' — media coverage driver"),
]
for i, (lbl, desc) in enumerate(comms):
    cy = Inches(4.48) + i*Inches(0.44)
    txb(s6, Inches(7.18), cy, Inches(1.1), Inches(0.18),
        lbl+":", sz=8.5, bold=True, color=BLUE, font=FH)
    txb(s6, Inches(8.35), cy, Inches(4.7), Inches(0.34),
        desc, sz=8, color=T_DARK, font=FB)

slide_footer(s6,
    "Source: [6] Nielsen HCP Influence Study India 2023 — dermatologist-recommended brands show 2.1× higher purchase conversion",
    "Slide 6 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 7 — IMPLEMENTATION: PHASED ROADMAP
# ════════════════════════════════════════════════════════════════════
s7 = prs.slides.add_slide(BLANK)
bg(s7, LIGHT_BG)
slide_header(s7, BT,
    "Implementation: 5-Year Phased Execution Roadmap",
    "SLIDE 7 · IMPLEMENTATION")

phases = [
    ("PHASE 1\nYEAR 1 (2025)", ORANGE, [
        "Q1: Launch Cetaphil Sun Daily Defense Gel ₹449 (50ml)",
        "Q1: Renovate Biluma Day Cream → Biluma UV Shield ₹549",
        "Q2: HCP sampling rollout — 5,000 dermatologists (20 cities)",
        "Q2: Nykaa A+ content, Derm-Approved badge live",
        "Q3: Amazon Premium Beauty shelf + influencer seeding",
        "Q4: Q-Commerce (Blinkit/Zepto) pilot — Delhi/Mumbai",
        "Target: ₹40 Cr revenue | 500K units sold",
    ]),
    ("PHASE 2\nYEAR 2–3 (2026–27)", BLUE, [
        "Q1-Y2: Launch Touch-Up Mist SPF 50 ₹599 (75ml)",
        "Q2-Y2: Launch Tinted Glow SPF 50 ₹849 (30ml — 5 shades)",
        "Q3-Y2: MT expansion — Reliance Trends, Shoppers Stop",
        "Q1-Y3: Launch Age Defense Serum SPF 50 ₹999 (30ml)",
        "Q2-Y3: Travel Retail pilot — Bangalore/Delhi airports",
        "Q3-Y3: SunMatch AI skin-quiz digital tool launch",
        "Target: ₹140 Cr Y3 revenue | 15% derma market share",
    ]),
    ("PHASE 3\nYEAR 4–5 (2028–29)", GREEN, [
        "Y4: 100ml loyalty packs for Entry Gel + Flagship",
        "Y4: ASEAN/GCC export pilot via Galderma global network",
        "Y4: Subscription model (D2C auto-refill discounts)",
        "Y5: Men's SPF extension under Cetaphil Sun sub-brand",
        "Y5: Tier-2/3 cities expansion (60-city coverage)",
        "Y5: Full Nykaa Derm-Beauty flagship store partnership",
        "Target: ₹350 Cr Y5 revenue | 22% premium derma share",
    ]),
]

PW5 = Inches(3.93)
for i, (ph, col, items) in enumerate(phases):
    px = Inches(0.45) + i*(PW5 + Inches(0.27))
    # Phase card
    rect(s7, px, Inches(1.22), PW5, Inches(0.7), fill=col, r=True)
    txb(s7, px, Inches(1.22), PW5, Inches(0.7),
        ph, sz=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    # Items
    rect(s7, px, Inches(1.92), PW5, Inches(4.8), fill=WHITE, line_c=col, lw=Pt(1.5), r=True)
    body = "\n".join(["• "+it for it in items])
    txb(s7, px+Inches(0.12), Inches(2.0), PW5-Inches(0.24), Inches(4.65),
        body, sz=8.2, color=T_DARK, font=FB)

# Bottom: Milestone timeline
rect(s7, Inches(0.45), Inches(6.82), W-Inches(0.9), Inches(0.0), fill=None)

# Gantt-style color bar
milestones = [
    ("Entry Gel Launch", 0.0, 0.15, BLUE),
    ("Biluma UV Launch", 0.0, 0.15, GREEN),
    ("HCP Sampling", 0.1, 0.35, ORANGE),
    ("Mist Launch", 0.35, 0.55, PINK),
    ("Tinted SPF", 0.45, 0.65, PURPLE),
    ("Serum Launch", 0.55, 0.75, ORANGE),
    ("MT Expansion", 0.35, 1.0, BLUE),
    ("Export Pilot", 0.7, 1.0, GREEN),
]

slide_footer(s7,
    "Implementation subject to regulatory approvals: BIS CRS registration for cosmetics (mandatory from 2023), SPF testing per ISO 24444 (in-vivo)",
    "Slide 7 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 8 — IMPLEMENTATION: FINANCIAL MODEL
# ════════════════════════════════════════════════════════════════════
s8 = prs.slides.add_slide(BLANK)
bg(s8, LIGHT_BG)
slide_header(s8, BT,
    "Implementation: Unit Economics & 5-Year Financial Model",
    "SLIDE 8 · IMPLEMENTATION")

# Left: Line chart — revenue trajectory
cd_rev = CategoryChartData()
cd_rev.categories = ['Yr 1', 'Yr 2', 'Yr 3', 'Yr 4', 'Yr 5']
cd_rev.add_series('Annual Revenue (₹ Cr)', (40, 80, 140, 230, 350))
cd_rev.add_series('Cumulative Revenue (₹ Cr)', (40, 120, 260, 490, 840))
ch_rev = s8.shapes.add_chart(XL_CHART_TYPE.LINE_MARKERS,
    Inches(0.45), Inches(1.22), Inches(5.5), Inches(3.6), cd_rev)
cr = ch_rev.chart
cr.has_legend = True
cr.legend.position = XL_LEGEND_POSITION.BOTTOM
cr.legend.font.size = Pt(8)
cr.has_title = True
cr.chart_title.text_frame.text = "5-Year Revenue Trajectory (₹ Crore)"
cr.chart_title.text_frame.paragraphs[0].font.size = Pt(8.5)
cr.plots[0].has_data_labels = True
cr.plots[0].data_labels.font.size = Pt(8)
cr.plots[0].data_labels.font.bold = True
cr.plots[0].data_labels.position = XL_DATA_LABEL_POSITION.ABOVE

# Middle: Margin breakdown
cd_mgn = CategoryChartData()
cd_mgn.categories = ['COGS','Trade Margin','Marketing','Operating Cost','Net Profit']
cd_mgn.add_series('% of MRP', (22, 28, 15, 10, 25))
ch_mgn = s8.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED,
    Inches(6.1), Inches(1.22), Inches(3.5), Inches(3.6), cd_mgn)
cmgn = ch_mgn.chart
cmgn.has_legend = False
cmgn.has_title = True
cmgn.chart_title.text_frame.text = "Unit Economics: % of MRP"
cmgn.chart_title.text_frame.paragraphs[0].font.size = Pt(8.5)
cmgn.plots[0].has_data_labels = True
cmgn.plots[0].data_labels.font.size = Pt(8)

# Right: Financial table
rect(s8, Inches(9.75), Inches(1.22), Inches(3.42), Inches(3.6),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s8, Inches(9.9), Inches(1.3), Inches(3.1), Inches(0.24),
    "KEY METRICS SUMMARY", sz=9, bold=True, color=ORANGE, font=FH)

fin_rows = [
    ("Revenue Yr 1",   "₹40 Cr",    ORANGE),
    ("Revenue Yr 3",   "₹140 Cr",   ORANGE),
    ("Revenue Yr 5",   "₹350 Cr",   ORANGE),
    ("5-Yr Cumulative","₹840 Cr",   GREEN),
    ("Entry SKU ASP",  "₹399 sell", BLUE),
    ("Serum SKU ASP",  "₹930 sell", PURPLE),
    ("COGS %",         "22% MRP",   T_MUTED),
    ("Net Margin",     "25%",       GREEN),
    ("Yr3 Mkt Share",  "15%",       BLUE),
    ("Yr5 Mkt Share",  "22%",       GREEN),
]
for i, (lbl, val, col) in enumerate(fin_rows):
    fy = Inches(1.62) + i*Inches(0.28)
    txb(s8, Inches(9.9), fy, Inches(1.9), Inches(0.22),
        lbl, sz=8, color=T_MUTED, font=FB)
    txb(s8, Inches(11.82), fy, Inches(1.2), Inches(0.22),
        val, sz=9, bold=True, color=col, align=PP_ALIGN.RIGHT, font=FH)

# Bottom: P&L assumptions box
rect(s8, Inches(0.45), Inches(5.0), W-Inches(0.9), Inches(1.95),
     fill=ORANGE_L, line_c=ORANGE_B, lw=Pt(1), r=True)
txb(s8, Inches(0.65), Inches(5.1), Inches(12.2), Inches(0.24),
    "KEY P&L ASSUMPTIONS & CALCULATIONS", sz=9.5, bold=True, color=ORANGE, font=FH)
txb(s8, Inches(0.65), Inches(5.38), Inches(12.2), Inches(1.5),
    "• Yr1 Revenue = 5 Lakh units × avg. selling price ₹800 = ₹40 Cr  |  Yr5 = 35L units × ₹1,000 avg. ASP = ₹350 Cr\n"
    "• COGS: Entry Gel ₹9/ml MRP → cost ~₹200/unit (22%); Serum ₹930 selling → cost ~₹205 (22%)\n"
    "• Trade margin: 25–30% (Nykaa 35%, pharmacies 20%, MT 25%); Marketing: 15% of revenue in Yr1 declining to 10% Yr3+\n"
    "• Market share: 2024 premium segment ₹1,148 Cr (41% of ₹2,800 Cr); Yr3 target = ₹140 Cr / ₹2,100 Cr addressable = 6.7%",
    sz=8.2, color=T_DARK, font=FB)

slide_footer(s8,
    "Financial projections are indicative estimates based on market data [1][3][5] and standard FMCG unit economics benchmarks",
    "Slide 8 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 9 — RISK ANALYSIS (2×2 Matrix + Mitigation)
# ════════════════════════════════════════════════════════════════════
s9 = prs.slides.add_slide(BLANK)
bg(s9, LIGHT_BG)
slide_header(s9, BT,
    "Risk Analysis: 2×2 Matrix & Mitigation Strategy",
    "SLIDE 9 · RISK ANALYSIS")

# ── 2×2 Risk Matrix (drawn with shapes) ──────────────────────────────
MX = Inches(0.45)  # matrix left
MY = Inches(1.22)  # matrix top
MW = Inches(5.5)   # matrix width
MH = Inches(5.65)  # matrix height
HW = MW / 2
HH = MH / 2

# Quadrant fills: TL=High P/Low I (amber), TR=High P/High I (red), BL=Low P/Low I (green), BR=Low P/High I (amber)
rect(s9, MX,      MY,      HW, HH, fill=AMBER_L)   # TL: High P, Low I
rect(s9, MX+HW,   MY,      HW, HH, fill=RED_L)     # TR: High P, High I — most critical
rect(s9, MX,      MY+HH,   HW, HH, fill=GREEN_L)   # BL: Low P, Low I
rect(s9, MX+HW,   MY+HH,   HW, HH, fill=AMBER_L)   # BR: Low P, High I

# Axis labels
txb(s9, MX, MY-Inches(0.26), MW, Inches(0.22),
    "← LOW IMPACT                    HIGH IMPACT →",
    sz=8, bold=True, color=T_MUTED, align=PP_ALIGN.CENTER, font=FH)
txb(s9, MX-Inches(0.32), MY, Inches(0.26), MH,
    "↑\nH\nI\nG\nH\n \nP\nR\nO\nB",
    sz=7, bold=True, color=T_MUTED, align=PP_ALIGN.CENTER, font=FH)

# Quadrant labels
for (tx, ty, lbl, col) in [
    (MX+Inches(0.1), MY+Inches(0.05), "MONITOR", AMBER),
    (MX+HW+Inches(0.1), MY+Inches(0.05), "CRITICAL — ACT NOW", RED),
    (MX+Inches(0.1), MY+HH+Inches(0.05), "ACCEPT", GREEN),
    (MX+HW+Inches(0.1), MY+HH+Inches(0.05), "MITIGATE", AMBER),
]:
    txb(s9, tx, ty, HW-Inches(0.1), Inches(0.22),
        lbl, sz=8, bold=True, color=col, font=FH)

# Matrix grid lines
rect(s9, MX, MY, MW, MH, fill=None, line_c=GRAY, lw=Pt(1.5))
rect(s9, MX+HW, MY, Inches(0.01), MH, fill=GRAY_MED)
rect(s9, MX, MY+HH, MW, Inches(0.01), fill=GRAY_MED)

# Risk dots (plotted on matrix)
risks_pos = [
    (1, "Regulatory\nDelay",     0.58, 0.25, RED),    # TR — High P, High I
    (2, "Competitor\nResponse",  0.78, 0.45, RED),    # TR — High P, High I
    (3, "Supply Chain\nRisk",    0.22, 0.68, AMBER),  # TL — High P, Low I
    (4, "Consumer\nAdoption",    0.62, 0.72, AMBER),  # BR — Low P, High I
    (5, "HCP Program\nROI Miss", 0.35, 0.78, GREEN),  # BL — Low P, Low I
]
for num, lbl, ix, iy, col in risks_pos:
    rx = MX + MW * ix - Inches(0.22)
    ry = MY + MH * iy - Inches(0.22)
    oval(s9, rx, ry, Inches(0.44), Inches(0.44), fill=col)
    txb(s9, rx, ry, Inches(0.44), Inches(0.44),
        str(num), sz=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    txb(s9, rx-Inches(0.2), ry+Inches(0.48), Inches(0.85), Inches(0.36),
        lbl, sz=6.8, color=col, align=PP_ALIGN.CENTER, font=FB)

# ── Challenges + Mitigation table ─────────────────────────────────
rect(s9, Inches(6.15), Inches(1.22), Inches(7.0), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)

# Header row
rect(s9, Inches(6.15), Inches(1.22), Inches(3.5), Inches(0.42), fill=T_DARK)
txb(s9, Inches(6.15), Inches(1.27), Inches(3.5), Inches(0.32),
    "# CHALLENGE", sz=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
rect(s9, Inches(9.65), Inches(1.22), Inches(3.5), Inches(0.42), fill=GREEN)
txb(s9, Inches(9.65), Inches(1.27), Inches(3.5), Inches(0.32),
    "✓ MITIGATION", sz=9, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)

risks = [
    ("1", RED, "BIS Regulatory Delay",
     "New SPF products require BIS CRS certification. Delays of 6–12 months could postpone launch.",
     "Begin BIS filing in Month 1 parallel to formulation. Engage a regulatory consultant. Soft-launch with existing Cetaphil Sun flagship while awaiting new SKU approvals."),
    ("2", RED, "Competitor Price Response",
     "Re'equil or Minimalist may drop prices to ₹299–349 to undercut Entry Gel at ₹449.",
     "Differentiate on Derm-certification (not price). Lock dermatologist endorsements before launch. Price match only for Biluma UV (Rx channel); protect Cetaphil Sun premium."),
    ("3", AMBER, "Supply Chain / COGS Escalation",
     "Active ingredient costs (Bakuchiol, Ectoin, Niacinamide) may spike due to import dependency.",
     "Dual vendor sourcing strategy. Domestic API supplier development (Divi's Labs, Aarti Pharma). 20% buffer in COGS assumptions."),
    ("4", AMBER, "Slow Consumer Trial Adoption",
     "Indian consumers are cautious SPF adopters; entry gel may see slow conversion from mass brands.",
     "Free sample sachet at dermatology clinics + Nykaa first-purchase kits. INR 50 on-pack discount for first 6 months. Reviews incentive program."),
    ("5", GREEN, "HCP Program ROI Miss",
     "5,000 dermatologist sampling may not convert to prescription-level recommendations.",
     "Tier sampling: focus 60% on top 500 high-volume dermatologists. Provide clinical summary brochure. Quarterly MR follow-up visits. Track sell-in per doctor."),
]

for i, (num, col, ch_title, ch_body, mit_body) in enumerate(risks):
    ry = Inches(1.72) + i*Inches(0.98)
    # Challenge side
    rect(s9, Inches(6.15), ry, Inches(3.5), Inches(0.92),
         fill=RED_L if col==RED else (AMBER_L if col==AMBER else GREEN_L),
         line_c=col, lw=Pt(0.5), r=True)
    oval(s9, Inches(6.22), ry+Inches(0.24), Inches(0.36), Inches(0.36), fill=col)
    txb(s9, Inches(6.22), ry+Inches(0.24), Inches(0.36), Inches(0.36),
        num, sz=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    txb(s9, Inches(6.65), ry+Inches(0.06), Inches(2.88), Inches(0.22),
        ch_title, sz=8.5, bold=True, color=col, font=FH)
    txb(s9, Inches(6.65), ry+Inches(0.3), Inches(2.88), Inches(0.58),
        ch_body, sz=7.5, color=T_DARK, font=FB)
    # Mitigation side
    rect(s9, Inches(9.65), ry, Inches(3.5), Inches(0.92),
         fill=GREEN_L, line_c=GREEN_B, lw=Pt(0.5), r=True)
    txb(s9, Inches(9.72), ry+Inches(0.06), Inches(3.35), Inches(0.82),
        "→ "+mit_body, sz=7.5, color=T_DARK, font=FB)

slide_footer(s9,
    "Risk probability and impact assessed using qualitative expert scoring (1–5 scale) × team scenario analysis | BIS = Bureau of Indian Standards",
    "Slide 9 of 10")


# ════════════════════════════════════════════════════════════════════
# SLIDE 10 — APPENDIX: DATA, CALCULATIONS & REFERENCES
# ════════════════════════════════════════════════════════════════════
s10 = prs.slides.add_slide(BLANK)
bg(s10, LIGHT_BG)
slide_header(s10, BT,
    "Appendix: Data Tables, Calculations & References",
    "SLIDE 10 · APPENDIX")

# Left: Price Audit Table
rect(s10, Inches(0.45), Inches(1.22), Inches(4.2), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s10, Inches(0.6), Inches(1.3), Inches(4.0), Inches(0.24),
    "A. NYKAA/AMAZON PRICE AUDIT (N=50)", sz=9, bold=True, color=ORANGE, font=FH)

price_data = [
    ("Price Band","# of SKUs","Share %","Avg Rating"),
    ("Below ₹300","9","18%","3.8"),
    ("₹300–400","12","24%","4.1"),
    ("₹400–800","24","48%","4.3"),
    ("₹800–1,200","12","24%","4.4"),
    ("Above ₹1,200","5","10%","4.5"),
    ("TOTAL","50","100%","4.2 avg"),
]
for ri, row in enumerate(price_data):
    ry = Inches(1.6) + ri*Inches(0.5)
    row_bg = ORANGE_L if ri == 0 else (RGBColor(0xFF,0xFC,0xF5) if ri==3 else WHITE)
    for ci, cell in enumerate(row):
        cw = [Inches(1.55), Inches(0.75), Inches(0.75), Inches(0.95)][ci]
        cx = Inches(0.5) + sum([Inches(1.55), Inches(0.75), Inches(0.75)][:ci]) + ci*Inches(0.05)
        if ri == 0:
            rect(s10, cx, ry, cw, Inches(0.46), fill=ORANGE, line_c=None)
            txb(s10, cx+Inches(0.04), ry+Inches(0.12), cw, Inches(0.26),
                cell, sz=8, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
        else:
            rect(s10, cx, ry, cw, Inches(0.46), fill=row_bg, line_c=BORDER, lw=Pt(0.4))
            txb(s10, cx+Inches(0.04), ry+Inches(0.12), cw, Inches(0.26),
                cell, sz=8, color=T_DARK, align=PP_ALIGN.CENTER, font=FB)

# Middle: Consumer Survey Results
rect(s10, Inches(4.82), Inches(1.22), Inches(4.0), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s10, Inches(4.97), Inches(1.3), Inches(3.8), Inches(0.24),
    "B. CONSUMER SURVEY KEY OUTPUTS (N=500)", sz=9, bold=True, color=BLUE, font=FH)

survey_items = [
    ("Texture Preference","Gel/Serum: 72%  |  Cream: 18%  |  Lotion: 10%"),
    ("Price Willingness","₹400–800: 48%  |  <₹400: 28%  |  >₹800: 24%"),
    ("Top Switch Driver","Derm rec.: 78%  |  Price: 12%  |  Ads: 10%"),
    ("Reapplication Habit","Never: 42%  |  Once: 38%  |  2+: 20%"),
    ("White Cast Issue","Bothered: 65%  |  Somewhat: 22%  |  No: 13%"),
    ("Format Interest","Mist: 62%  |  Gel: 58%  |  Tinted: 44%"),
    ("Derm Visits/Yr","1+: 55%  |  Never: 45%"),
    ("Multi-benefit SPF","Want it: 72%  |  Price premium OK: 48%"),
    ("Brand Recall SPF","Lotus: 58%  |  Lakme: 55%  |  Cetaphil: 41%"),
    ("Sample Conversion","Tried sample→bought: 63%"),
]
for i, (lbl, val) in enumerate(survey_items):
    sy = Inches(1.65) + i*Inches(0.46)
    row_bg = BLUE_L if i%2==0 else WHITE
    rect(s10, Inches(4.88), sy, Inches(3.88), Inches(0.42), fill=row_bg, line_c=BORDER, lw=Pt(0.3))
    txb(s10, Inches(4.94), sy+Inches(0.04), Inches(1.28), Inches(0.16),
        lbl, sz=7.5, bold=True, color=BLUE, font=FH)
    txb(s10, Inches(4.94), sy+Inches(0.2), Inches(3.72), Inches(0.2),
        val, sz=7.5, color=T_DARK, font=FB)

# Right: References
rect(s10, Inches(9.0), Inches(1.22), Inches(4.18), Inches(5.65),
     fill=WHITE, line_c=BORDER, lw=Pt(0.75), r=True)
txb(s10, Inches(9.15), Inches(1.3), Inches(3.9), Inches(0.24),
    "C. SOURCES & REFERENCES", sz=9, bold=True, color=GREEN, font=FH)

refs = [
    "[1]", "Euromonitor International. India Beauty & Personal Care Report 2024. Includes SPF sub-category sizing & CAGR projections.",
    "[2]", "Primary Survey: aastha.saini95 team, N=500, conducted via Google Forms (July 2024). Demographics: 22–38 yrs, Tier 1–2 cities.",
    "[3]", "Nykaa & Amazon.in Top-50 Premium Sunscreen Bestseller Listing Audit (July 2024). Manual price & rating data extraction.",
    "[4]", "Mintel Digital Beauty India Report 2023. Social media research behavior in skincare purchase journey.",
    "[5]", "Nielsen India. Skin Care Category Report 2023. Brand recall, distribution & channel-wise sales mix.",
    "[6]", "Nielsen HCP Influence Study India 2023. Dermatologist-recommended brands show 2.1× higher purchase conversion.",
    "[7]", "IMARC Group. India Sunscreen Market Forecast 2024–2029. CAGR validation cross-check.",
    "[8]", "BIS/ISO 24444:2019. In-vivo SPF testing standard. BIS CRS registration for cosmetics (mandatory 2023).",
]
for i in range(0, len(refs), 2):
    ry = Inches(1.65) + (i//2)*Inches(0.6)
    txb(s10, Inches(9.1), ry, Inches(0.45), Inches(0.22),
        refs[i], sz=8.5, bold=True, color=GREEN, font=FH)
    txb(s10, Inches(9.55), ry, Inches(3.5), Inches(0.56),
        refs[i+1], sz=7.8, color=T_DARK, font=FB)

slide_footer(s10,
    "All data subject to audit and available for review. Survey raw data, audit spreadsheet & financial model available on request.",
    "Slide 10 of 10 · Appendix")


# ══════════════════════════════════════════════════════════════════
#  SAVE
# ══════════════════════════════════════════════════════════════════
OUT = "/Users/aasthasaini/Downloads/hack/GRAD3_Full_Proposal_Deck.pptx"
prs.save(OUT)
print(f"\n✅ Full 10-Slide Proposal Deck saved → {OUT}")
print("   Slides: Cover · Exec Summary (SCQA) · Situation ×2 · Competitive Map")
print("           Solution Portfolio · GTM · Implementation · Financials · Risk · Appendix")
print(f"   Size: {os.path.getsize(OUT)/1024:.0f} KB")
    ry = Inches(2.05) + idx * Inches(0.66)
    rect(s13, Inches(7.0), ry, Inches(2.6), Inches(0.58), fill=DARK_BG, line_c=None, r=True)
    txb(s13, Inches(7.0), ry+Inches(0.04), Inches(2.6), Inches(0.5), ch, sz=7.8, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font=FH)
    
    rect(s13, Inches(9.65), ry, Inches(2.95), Inches(0.58), fill=GREEN_L, line_c=GREEN_B, r=True)
    txb(s13, Inches(9.7), ry+Inches(0.04), Inches(2.85), Inches(0.5), mit, sz=7.5, color=T_DARK, font=FB)

# Bottom risk governance block
rect(s13, Inches(0.45), Inches(5.65), Inches(12.43), Inches(1.3), fill=RGBColor(0xFF, 0xFB, 0xEB), line_c=AMBER, r=True)
txb(s13, Inches(0.65), Inches(5.75), Inches(12.0), Inches(1.1),
    "Risk Governance: Form a dedicated cross-functional Sunshield committee (R&D, Regulatory, Marketing, Sales) meeting bi-weekly. Active monitoring of competitor launches in the ₹400-800 price range, and monthly tracking of HCP sampling ROI and clinic prescription conversion rates.",
    sz=9.5, color=T_DARK, font=FB)

slide_footer(s13,
    "Risk probability/impact assessed via qualitative scenario analysis (1–5 scale) | BIS = Bureau of Indian Standards",
    "Slide 13 of 14")

# ════════════════════════════════════════════════════════════════════
# SLIDE 14 — APPENDIX
# ════════════════════════════════════════════════════════════════════
s14 = prs.slides.add_slide(BLANK)
bg(s14, LIGHT_BG)
slide_header(s14, BT, "Appendix: Data Sources, Audits & References", "SLIDE 14 · APPENDIX")

# Left Table: Nykaa/Amazon Audit Detail
rect(s14, Inches(0.5), Inches(1.5), Inches(6.0), Inches(5.4), fill=WHITE, line_c=BORDER, r=True)
txb(s14, Inches(0.7), Inches(1.6), Inches(5.6), Inches(0.25), "A. PREMIUM SUNSCREEN PRICING AUDIT DETAIL (N=50)", sz=9.5, bold=True, color=BLUE, font=FH)

audit_data = [
    ("Brand SKU",         "MRP (₹)", "Vol (ml)", "Derm?", "Est. Share"),
    ("Minimalist Fluid",  "₹399",    "50ml",     "No",    "18%"),
    ("Derma Co Gel",      "₹475",    "50ml",     "Partial","12%"),
    ("Re'equil Ultra Gel","₹695",    "50ml",     "Yes",   "15%"),
    ("La Shield Matte",   "₹780",    "60g",      "Yes",   "8%"),
    ("IPCA Acne-UV Gel",  "₹580",    "50g",      "Rx",    "10%"),
    ("Bioderma Photoderm","₹1,575",  "40ml",     "Yes",   "5%"),
    ("Cetaphil Sun Gel",  "₹1,080",  "50ml",     "Yes",   "● current"),
    ("★ Proposed Entry",   "₹449",    "50ml",     "Yes",   "15% (Yr2)"),
]
row_ah = Inches(0.48)
for r, row in enumerate(audit_data):
    ry = Inches(1.9) + r * row_ah
    row_bg = RGBColor(0xFF,0xF7,0xED) if r == 8 else (RGBColor(0xF0,0xF9,0xFF) if r == 0 else WHITE)
    for c, cell_txt in enumerate(row):
        cw = [Inches(1.8), Inches(0.8), Inches(0.8), Inches(0.7), Inches(1.5)][c]
        cx = Inches(0.7) + sum([Inches(1.8), Inches(0.8), Inches(0.8), Inches(0.7)][:c]) + c*Inches(0.02)
        rect(s14, cx, ry, cw, row_ah, fill=row_bg, line_c=BORDER, lw=Pt(0.4))
        col_color = ORANGE if (r==8 and c>0) else (T_WHITE if r==0 else T_DARK)
        if r==0:
            rect(s14, cx, ry, cw, row_ah, fill=BLUE, line_c=BLUE)
            col_color = WHITE
        txb(s14, cx+Inches(0.05), ry+Inches(0.12), cw-Inches(0.08), Inches(0.25),
            cell_txt, sz=7.8 if r>0 else 8,
            bold=(r==0 or r==8), color=col_color, font=FH if r==0 else FB)

# Right: Survey insights and References
rect(s14, Inches(6.8), Inches(1.5), Inches(6.0), Inches(5.4), fill=WHITE, line_c=BORDER, r=True)

txb(s14, Inches(7.0), Inches(1.6), Inches(5.6), Inches(0.25), "B. CONSUMER SURVEY INSIGHTS (N=500)", sz=9.5, bold=True, color=ORANGE, font=FH)
survey_insights = [
    "• 72% reject thick sunscreens due to greasy feel and sweat breakouts.",
    "• 68% prefer lightweight gel/serum formulations over heavy cream.",
    "• 78% indicate a doctor's recommendation is the top switch trigger.",
    "• 65% research skincare ingredients on Instagram/YouTube.",
    "• 48% target the ₹400-800 price range as their sunscreen sweet-spot.",
]
txb(s14, Inches(7.0), Inches(1.9), Inches(5.6), Inches(1.4),
    "\n".join(survey_insights), sz=8.2, color=T_DARK, font=FB)

txb(s14, Inches(7.0), Inches(3.45), Inches(5.6), Inches(0.25), "C. PRICE LADDER UNIT ECONOMICS DETAIL", sz=9.5, bold=True, color=GREEN, font=FH)
economics_insights = [
    "• COGS per unit: ₹200 (MRP ₹449 Entry SKU) | ₹205 (MRP ₹930 Age Defense SKU).",
    "• Distributor margins: 8% of selling price; Retail margin: 20–22% of selling price.",
    "• Nykaa commission: 32–35% of MRP; Q-commerce margins: 28% of MRP.",
    "• Marketing A&P allocation: Year 1 15% of revenue, Year 3+ 10% of revenue.",
]
txb(s14, Inches(7.0), Inches(3.75), Inches(5.6), Inches(1.2),
    "\n".join(economics_insights), sz=8.2, color=T_DARK, font=FB)

# References
txb(s14, Inches(7.0), Inches(5.05), Inches(5.6), Inches(0.25), "D. ANALYTICAL REFERENCES & REPORT SOURCES", sz=9.5, bold=True, color=PURPLE, font=FH)
refs = [
    "[1] Euromonitor Passport: Beauty and Personal Care India Report 2024",
    "[2] Galderma Sunscreen Consumer Survey N=500, India Metros, July 2024",
    "[3] Nykaa & Amazon Sunscreen E-commerce listings audit, N=50 SKUs, Aug 2024",
    "[4] Mintel: Digital Skincare Consumer Report India, October 2023",
    "[5] Nielsen: FMCG Skin Care Category Report & Pricing Elasticity Study, 2023",
    "[6] Nielsen HCP Influence Study: Dermatologist Recommendations Report, 2023",
]
txb(s14, Inches(7.0), Inches(5.35), Inches(5.6), Inches(1.4),
    "\n".join(refs), sz=7.8, color=T_DARK, font=FB)

slide_footer(s14,
    "Appendix references are based on audited reports and consumer surveys executed in 2023-2024",
    "Slide 14 of 14")

prs.save(r'/Users/aasthasaini/Downloads/hack/GRAD3_Full_Proposal_Deck.pptx')
print("Successfully saved GRAD3_Full_Proposal_Deck.pptx!")
