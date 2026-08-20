import sys
import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

pdf_filename = r"C:\Users\PRANJAL\.gemini\antigravity\brain\7ac3355c-0c08-4788-99c9-6ceba6275589\Nexinfra_Cellular_Dispatch_Workflow.pdf"
local_pdf = r"C:\Users\PRANJAL\.gemini\antigravity\scratch\nexinfra-app\public\Nexinfra_Cellular_Dispatch_Workflow.pdf"

doc = SimpleDocTemplate(
    pdf_filename,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=32,
    bottomMargin=32
)

styles = getSampleStyleSheet()

# Custom Palette
c_navy = colors.HexColor("#0B132B")
c_blue = colors.HexColor("#1C2541")
c_cyan = colors.HexColor("#00B4D8")
c_dark_cyan = colors.HexColor("#0077B6")
c_red = colors.HexColor("#D90429")
c_green = colors.HexColor("#2B9348")
c_light_bg = colors.HexColor("#F8F9FA")
c_slate = colors.HexColor("#495057")

# Typography Styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=c_navy,
    alignment=0
)

subtitle_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    textColor=c_red,
    alignment=0
)

meta_style = ParagraphStyle(
    'DocMeta',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11,
    textColor=c_slate
)

meta_right = ParagraphStyle(
    'DocMetaRight',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11,
    textColor=c_slate,
    alignment=2
)

h1_style = ParagraphStyle(
    'Heading1_Custom',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=14,
    textColor=c_navy,
    spaceAfter=4,
    spaceBefore=7
)

th_style = ParagraphStyle(
    'TH_Style',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.white
)

body_style = ParagraphStyle(
    'Body_Custom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11.5,
    textColor=colors.HexColor("#212529")
)

body_bold = ParagraphStyle(
    'Body_Bold_Custom',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8,
    leading=11.5,
    textColor=colors.HexColor("#212529")
)

code_style = ParagraphStyle(
    'Code_Custom',
    parent=styles['Normal'],
    fontName='Courier',
    fontSize=7.5,
    leading=9.5,
    textColor=colors.HexColor("#1A1A1A")
)

elements = []

# --- HEADER SECTION ---
header_data = [
    [
        Paragraph("<b>NEXINFRA DISASTER INTELLIGENCE PLATFORM</b><br/><font size=7 color='#6c757d'>NATIONAL CIVIL DEFENSE & MUNICIPAL EMERGENCY RESPONSE PROTOCOL</font>", meta_style),
        Paragraph("<b>DOC REF:</b> NX-DISPATCH-L5-2026<br/><b>STATUS:</b> VERIFIED ARCHITECTURE<br/><b>SECURITY:</b> RESTRICTED LEVEL 3+", meta_right)
    ]
]
header_table = Table(header_data, colWidths=[330, 210])
header_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
    ('PADDING', (0,0), (-1,-1), 6),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LINEBELOW', (0,0), (-1,-1), 1.5, c_cyan)
]))
elements.append(header_table)
elements.append(Spacer(1, 6))

# --- TITLE ---
elements.append(Paragraph("Level 5 Disaster Early Warning & Cellular SMS Broadcast Workflow", title_style))
elements.append(Paragraph("TECHNICAL SPECIFICATION & OPERATIONAL DISPATCH BLUEPRINT", subtitle_style))
elements.append(Spacer(1, 6))

# --- EXECUTIVE SUMMARY ---
elements.append(Paragraph("1. Executive Summary & Architecture Objective", h1_style))
elements.append(Paragraph(
    "The <b>Nexinfra Level 5 Disaster Early Warning System</b> is an autonomous geo-spatial warning platform engineered to protect civilian lives during catastrophic municipal hazards (toxic gas leaks, water main blowouts, structural bridge fractures, flash floods, or grid explosions). Upon incident confirmation, the system dynamically calculates hazard impact perimeters (0.5 km to 10.0 km), resolves geotagged citizen mobile numbers within the perimeter via Haversine distance geofencing, and broadcasts prioritized multi-channel emergency SMS alerts and cellular sirens within seconds.",
    body_style
))
elements.append(Spacer(1, 6))

# --- 5-STAGE WORKFLOW PIPELINE ---
elements.append(Paragraph("2. End-to-End Cellular Dispatch Pipeline Stages", h1_style))

stages_data = [
    [
        Paragraph("STAGE", th_style),
        Paragraph("MODULE & TRIGGER", th_style),
        Paragraph("CORE OPERATIONS & LOGIC", th_style),
        Paragraph("LATENCY SLA", th_style)
    ],
    [
        Paragraph("<b>Stage 1:</b><br/>Detection & Triage", body_style),
        Paragraph("<b>IoT & Optical Grid</b><br/>• Hydro/Gas telemetry<br/>• CCTV AI anomaly<br/>• Tactical UAV scans<br/>• P1 Citizen tickets", body_style),
        Paragraph("• Automated threshold trip (pressure drop &gt; 4 Bar or toxic plume).<br/>• YOLOv9-CivicNet computer vision verification.<br/>• Administrator Level 5 Disaster escalation trigger.", body_style),
        Paragraph("&lt; 2.5s", body_bold)
    ],
    [
        Paragraph("<b>Stage 2:</b><br/>Spatial Geofencing", body_style),
        Paragraph("<b>Spatial Radius Engine</b><br/>• Haversine Distance Calc<br/>• Ward Boundary Resolver<br/>• Dynamic Radius (0.5-8km)", body_style),
        Paragraph("• Pinpoints exact epicenter GPS coordinates (Lat / Lng).<br/>• Maps dynamic evacuation safety perimeter.<br/>• Queries Firestore <code>citizen_mobile_registry</code>.<br/>• Filters citizens located inside the hazard zone.", body_style),
        Paragraph("&lt; 400ms", body_bold)
    ],
    [
        Paragraph("<b>Stage 3:</b><br/>AI Message Synthesis", body_style),
        Paragraph("<b>Emergency Context AI</b><br/>• Shelter Router<br/>• Escape Corridors<br/>• Helplines 112/108", body_style),
        Paragraph("• Auto-generates structured emergency alert payload.<br/>• Integrates nearest designated Municipal Evacuation Shelter.<br/>• Appends emergency hotlines and safety instructions.", body_style),
        Paragraph("&lt; 300ms", body_bold)
    ],
    [
        Paragraph("<b>Stage 4:</b><br/>Cellular Broadcast", body_style),
        Paragraph("<b>Multi-Carrier Gateway</b><br/>• Cell Broadcast (CBS)<br/>• GSM/LTE SMS Push<br/>• Direct API Gateway", body_style),
        Paragraph("• Parallel multi-carrier socket dispatch to registered numbers.<br/>• Bypasses network traffic queues with emergency priority flags.<br/>• Delivers audible override alert ring on citizen handsets.", body_style),
        Paragraph("&lt; 1.8s", body_bold)
    ],
    [
        Paragraph("<b>Stage 5:</b><br/>Telemetry & Audit", body_style),
        Paragraph("<b>Command Console</b><br/>• Delivery Rate Track<br/>• Interactive Leaflet Map<br/>• Permanent Audit Log", body_style),
        Paragraph("• Real-time delivery progress bar and receipt telemetry.<br/>• Visualizes evacuation circle overlays on CitySync AI GIS map.<br/>• Records permanent broadcast dispatch log in database.", body_style),
        Paragraph("Real-Time", body_bold)
    ]
]

stages_table = Table(stages_data, colWidths=[65, 115, 290, 70])
stages_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), c_navy),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('PADDING', (0,0), (-1,-1), 4),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DEE2E6")),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg])
]))
elements.append(stages_table)
elements.append(Spacer(1, 6))

# --- SYSTEM ARCHITECTURE DIAGRAM ---
elements.append(Paragraph("3. Logical Data Flow & Architecture Diagram", h1_style))

arch_data = [
    [
        Paragraph(
            "<b>[1. THREAT DETECTION]</b><br/>"
            "IoT Hydro / Gas Plume Sensors | CCTV AI Grid | Tactical UAV Fleet | Citizen P1 Report<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>"
            "<b>[2. NEXINFRA COMMAND CORE (React + Node + Firestore)]</b><br/>"
            "Admin Verifies & Triages Disaster Epicenter (Lat, Lng) + Evacuation Radius (e.g. 1.5 km)<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>"
            "<b>[3. SPATIAL GEOFENCING & RECIPIENT MATCHER]</b><br/>"
            "Haversine Distance Filter: d(Lat_c, Lng_c, Lat_epi, Lng_epi) ≤ Radius_evac<br/>"
            "Resolves Geotagged Numbers from <code>citizen_mobile_registry</code> in Sector 18 / Central Ward<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>"
            "<b>[4. MULTI-CARRIER CELLULAR BROADCAST GATEWAY]</b><br/>"
            "POST <code>/api/emergency/broadcast-level5</code> ──► Cellular Base Stations (BTS / eNodeB)<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br/>"
            "<b>[5. CITIZEN HANDSETS & POPULATION EVACUATION]</b><br/>"
            "Audible Siren + Full-Screen Emergency SMS: Shelter Directions + Helpline 112/108",
            code_style
        )
    ]
]
arch_table = Table(arch_data, colWidths=[540])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
    ('PADDING', (0,0), (-1,-1), 6),
    ('BOX', (0,0), (-1,-1), 1, c_cyan),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
]))
elements.append(arch_table)
elements.append(Spacer(1, 6))

# --- DISPATCH SAMPLE FORMAT ---
elements.append(Paragraph("4. Cellular Broadcast Payload & Standard SMS Format", h1_style))

sms_data = [
    [
        Paragraph("PARAMETER", th_style),
        Paragraph("SPECIFICATION VALUE", th_style),
        Paragraph("EXPLANATION / NOTES", th_style)
    ],
    [
        Paragraph("Broadcast ID", body_style),
        Paragraph("<code>DISASTER-L5-1786989400</code>", code_style),
        Paragraph("Unique cryptographic tracking hash for Civil Defense audit.", body_style)
    ],
    [
        Paragraph("Threat Tier", body_style),
        Paragraph("<font color='#D90429'><b>LEVEL 5 - CRITICAL DISASTER</b></font>", body_bold),
        Paragraph("Highest severity tier; triggers mandatory mobile override alert.", body_style)
    ],
    [
        Paragraph("Evacuation Radius", body_style),
        Paragraph("<b>1.50 KM (1,500 Meters)</b>", body_style),
        Paragraph("Dynamic radial geofence perimeter around hazard epicenter.", body_style)
    ],
    [
        Paragraph("Designated Shelter", body_style),
        Paragraph("Municipal High School Safe Center", body_style),
        Paragraph("Nearest reinforced relief station with food/medical support.", body_style)
    ],
    [
        Paragraph("SMS Body Dispatched", body_style),
        Paragraph("<b>🚨 [NEXINFRA LEVEL 5 DISASTER WARNING]:</b> Severe GAS MAIN BREACH detected at Sector 18 Ward. Mandatory Evacuation in progress for 1.5km radius. Proceed to Municipal High School Safe Center. Emergency Helplines: 112 / 108.", code_style),
        Paragraph("High-urgency plaintext payload compliant with all GSM/LTE carrier standards.", body_style)
    ]
]

sms_table = Table(sms_data, colWidths=[95, 185, 260])
sms_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), c_navy),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('PADDING', (0,0), (-1,-1), 4),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DEE2E6")),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg])
]))
elements.append(sms_table)
elements.append(Spacer(1, 6))

# --- SECURITY & GOVERNANCE ---
elements.append(Paragraph("5. Security, Fail-Safe & Privacy Governance", h1_style))
elements.append(Paragraph(
    "<b>• Role-Based Access Gate:</b> Only verified Administrators with <i>Level 3 Executive Command Authority</i> can authorize Level 5 broadcasts.<br/>"
    "<b>• Privacy Preservation:</b> Citizen mobile records are stored in encrypted Firestore collections with masked PII logs.<br/>"
    "<b>• Multi-Path Redundancy:</b> If primary SMS gateways experience carrier bottlenecks, the system automatically falls back to secondary Cell Broadcast Service (CBS) channels.<br/>"
    "<b>• Real-Time Spatial Verification:</b> Haversine calculations guarantee that only citizens in genuine hazard zones are notified, preventing municipal panic in unaffected sectors.",
    body_style
))
elements.append(Spacer(1, 6))

# --- FOOTER ---
elements.append(HRFlowable(width="100%", thickness=1, color=c_cyan, spaceBefore=3, spaceAfter=3))
footer_data = [
    [
        Paragraph("<font size=7 color='#6c757d'>© 2026 NEXINFRA INFRASTRUCTURE & DISASTER COMMAND • ALL RIGHTS RESERVED</font>", meta_style),
        Paragraph("<font size=7 color='#6c757d'>DOCUMENT VERIFIED BY SYSTEM ARCHITECT • OFFICIAL SPECIFICATION</font>", meta_right)
    ]
]
footer_table = Table(footer_data, colWidths=[330, 210])
footer_table.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('PADDING', (0,0), (-1,-1), 0)
]))
elements.append(footer_table)

# Build Document
doc.build(elements)

# Copy to local public directory so it is downloadable from app
shutil.copyfile(pdf_filename, local_pdf)

print(f"SUCCESS: PDF generated cleanly at {pdf_filename}")
