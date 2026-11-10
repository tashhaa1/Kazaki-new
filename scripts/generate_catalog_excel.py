# -*- coding: utf-8 -*-
"""
سيم بناء ملف الإكسل الاحترافي لكتالوج قسم ورد الليكو الجاهز (41 زهرة)
وفق أعلى معايير الجودة والتصميم (Classic Navy & Gold Luxury Palette)
"""
import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.path.append(os.path.join(os.path.dirname(__file__)))
from flowers_data import FLOWERS_DATA

def create_catalog_excel(output_paths):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "كتالوج ورد الليكو الجاهز"
    ws.views.sheetView[0].rightToLeft = True

    # Palette
    COLOR_PRIMARY = "1E3A8A"      # Deep Navy
    COLOR_HEADER = "1E40AF"       # Royal Blue
    COLOR_ACCENT = "B45309"       # Warm Amber/Gold
    COLOR_ZEBRA = "F8FAFC"        # Light Slate / Tint
    COLOR_BORDER = "CBD5E1"       # Slate 300
    COLOR_DARK_TEXT = "0F172A"    # Slate 900
    COLOR_WHITE = "FFFFFF"
    COLOR_CARD_BG = "F1F5F9"      # Slate 100

    font_title = Font(name="Calibri", size=16, bold=True, color=COLOR_WHITE)
    font_subtitle = Font(name="Calibri", size=10, italic=True, color="E2E8F0")
    font_header = Font(name="Calibri", size=11, bold=True, color=COLOR_WHITE)
    font_data = Font(name="Calibri", size=10, color=COLOR_DARK_TEXT)
    font_data_bold = Font(name="Calibri", size=10, bold=True, color=COLOR_DARK_TEXT)
    font_summary_label = Font(name="Calibri", size=9, bold=True, color="475569")
    font_summary_val = Font(name="Calibri", size=14, bold=True, color=COLOR_PRIMARY)
    font_total = Font(name="Calibri", size=11, bold=True, color=COLOR_WHITE)

    fill_title = PatternFill(start_color=COLOR_PRIMARY, end_color=COLOR_PRIMARY, fill_type="solid")
    fill_header = PatternFill(start_color=COLOR_HEADER, end_color=COLOR_HEADER, fill_type="solid")
    fill_zebra = PatternFill(start_color=COLOR_ZEBRA, end_color=COLOR_ZEBRA, fill_type="solid")
    fill_white = PatternFill(start_color=COLOR_WHITE, end_color=COLOR_WHITE, fill_type="solid")
    fill_card = PatternFill(start_color=COLOR_CARD_BG, end_color=COLOR_CARD_BG, fill_type="solid")
    fill_total = PatternFill(start_color=COLOR_PRIMARY, end_color=COLOR_PRIMARY, fill_type="solid")

    thin_border_side = Side(style="thin", color=COLOR_BORDER)
    border_cell = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    double_bottom = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=Side(style="double", color=COLOR_PRIMARY))

    # --- Row 1: Title Block ---
    ws.merge_cells("A1:M1")
    title_cell = ws["A1"]
    title_cell.value = "متجر كازاكي (Kazaki.iq) - كتالوج قسم ورد الليكو الجاهز الشامل للمالك"
    title_cell.font = font_title
    title_cell.fill = fill_title
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 40

    # --- Row 2: Subtitle ---
    ws.merge_cells("A2:M2")
    sub_cell = ws["A2"]
    sub_cell.value = "توثيق تفصيلي لـ 41 منتجاً من زهور الليكو الجاهزة - الأسماء، الأشكال، الألوان ودلالاتها الرمزية، والتسعير والكميات"
    sub_cell.font = font_subtitle
    sub_cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 22

    # --- Row 4-5: KPI Summary Cards ---
    # Card 1: إجمالي المنتجات (B4:C5)
    ws.merge_cells("B4:C4")
    ws["B4"] = "إجمالي عدد الزهور"
    ws["B4"].font = font_summary_label
    ws["B4"].alignment = Alignment(horizontal="center", vertical="center")
    ws["B4"].fill = fill_card
    ws.merge_cells("B5:C5")
    ws["B5"] = 41
    ws["B5"].font = font_summary_val
    ws["B5"].alignment = Alignment(horizontal="center", vertical="center")
    ws["B5"].fill = fill_card

    # Card 2: متوسط السعر (E4:F5)
    ws.merge_cells("E4:F4")
    ws["E4"] = "متوسط سعر البيع (د.ع)"
    ws["E4"].font = font_summary_label
    ws["E4"].alignment = Alignment(horizontal="center", vertical="center")
    ws["E4"].fill = fill_card
    ws.merge_cells("E5:F5")
    ws["E5"] = "=AVERAGE(I8:I48)"
    ws["E5"].number_format = "#,##0 \"د.ع\""
    ws["E5"].font = font_summary_val
    ws["E5"].alignment = Alignment(horizontal="center", vertical="center")
    ws["E5"].fill = fill_card

    # Card 3: إجمالي المخزون الافتتاحي (H4:I5)
    ws.merge_cells("H4:I4")
    ws["H4"] = "إجمالي المخزون الافتتاحي (قطعة)"
    ws["H4"].font = font_summary_label
    ws["H4"].alignment = Alignment(horizontal="center", vertical="center")
    ws["H4"].fill = fill_card
    ws.merge_cells("H5:I5")
    ws["H5"] = "=SUM(K8:K48)"
    ws["H5"].number_format = "#,##0 \"قطعة\""
    ws["H5"].font = font_summary_val
    ws["H5"].alignment = Alignment(horizontal="center", vertical="center")
    ws["H5"].fill = fill_card

    # Card 4: إجمالي القيمة السوقية (K4:L5)
    ws.merge_cells("K4:L4")
    ws["K4"] = "القيمة التقديرية للمخزون (د.ع)"
    ws["K4"].font = font_summary_label
    ws["K4"].alignment = Alignment(horizontal="center", vertical="center")
    ws["K4"].fill = fill_card
    ws.merge_cells("K5:L5")
    ws["K5"] = "=SUMPRODUCT(I8:I48, K8:K48)"
    ws["K5"].number_format = "#,##0 \"د.ع\""
    ws["K5"].font = font_summary_val
    ws["K5"].alignment = Alignment(horizontal="center", vertical="center")
    ws["K5"].fill = fill_card

    for r in [4, 5]:
        for c in [2, 3, 5, 6, 8, 9, 11, 12]:
            ws.cell(row=r, column=c).border = border_cell

    ws.row_dimensions[4].height = 18
    ws.row_dimensions[5].height = 26
    ws.row_dimensions[6].height = 12

    # --- Row 7: Table Headers ---
    headers = [
        "ت",
        "رمز المنتج (ID)",
        "اسم الوردة (عربي)",
        "الاسم بالإنجليزية (English)",
        "الاسم بالكردية (کوردی)",
        "شكل الزهرة وتكوين الليكو",
        "اللون الأساسي",
        "دلالة اللون (لشنو يرمز)",
        "سعر البيع (د.ع)",
        "السعر قبل الخصم (د.ع)",
        "المخزون المتوفر",
        "الأبعاد والمواصفات",
        "مسار الصورة في النظام"
    ]

    ws.row_dimensions[7].height = 28
    for col_idx, h_text in enumerate(headers, start=1):
        cell = ws.cell(row=7, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_cell

    # --- Rows 8-48: Data Rows ---
    start_row = 8
    for idx, f in enumerate(FLOWERS_DATA):
        row_num = start_row + idx
        ws.row_dimensions[row_num].height = 42

        is_even = (idx % 2 == 1)
        row_fill = fill_zebra if is_even else fill_white

        row_data = [
            f["num"],
            f["id"],
            f["title"],
            f["title_en"],
            f["title_ku"],
            f["shape"],
            f["color"],
            f["color_symbolism"],
            f["price"],
            f["original_price"],
            f["stock"],
            f["volume_or_size"],
            f["storage_path"]
        ]

        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=row_num, column=col_idx, value=val)
            cell.font = font_data
            cell.fill = row_fill
            cell.border = border_cell

            # Alignments & formats
            if col_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = font_data_bold
            elif col_idx == 2:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in (3, 4, 5):
                cell.alignment = Alignment(horizontal="right", vertical="center")
                if col_idx == 3:
                    cell.font = font_data_bold
            elif col_idx in (6, 7, 8):
                cell.alignment = Alignment(horizontal="right", vertical="center", wrap_text=True)
            elif col_idx in (9, 10):
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.number_format = "#,##0 \"د.ع\""
                cell.font = font_data_bold if col_idx == 9 else font_data
            elif col_idx == 11:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.number_format = "#,##0"
            elif col_idx == 12:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 13:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # --- Row 49: Total Row ---
    total_row = start_row + len(FLOWERS_DATA)
    ws.row_dimensions[total_row].height = 26
    ws.merge_cells(f"A{total_row}:H{total_row}")
    cell_tot_lbl = ws[f"A{total_row}"]
    cell_tot_lbl.value = "المجموع العام والمتوسطات"
    cell_tot_lbl.font = font_total
    cell_tot_lbl.fill = fill_total
    cell_tot_lbl.alignment = Alignment(horizontal="center", vertical="center")

    # Average price
    cell_avg_p = ws.cell(row=total_row, column=9, value=f"=AVERAGE(I8:I{total_row-1})")
    cell_avg_p.font = font_total
    cell_avg_p.fill = fill_total
    cell_avg_p.alignment = Alignment(horizontal="right", vertical="center")
    cell_avg_p.number_format = "#,##0 \"د.ع\""

    # Average original price
    cell_avg_op = ws.cell(row=total_row, column=10, value=f"=AVERAGE(J8:J{total_row-1})")
    cell_avg_op.font = font_total
    cell_avg_op.fill = fill_total
    cell_avg_op.alignment = Alignment(horizontal="right", vertical="center")
    cell_avg_op.number_format = "#,##0 \"د.ع\""

    # Total stock sum
    cell_tot_stock = ws.cell(row=total_row, column=11, value=f"=SUM(K8:K{total_row-1})")
    cell_tot_stock.font = font_total
    cell_tot_stock.fill = fill_total
    cell_tot_stock.alignment = Alignment(horizontal="center", vertical="center")
    cell_tot_stock.number_format = "#,##0 \"قطعة\""

    # Empty cells for 12 and 13
    for c in range(1, 14):
        ws.cell(row=total_row, column=c).border = double_bottom
        if c in (12, 13):
            ws.cell(row=total_row, column=c).fill = fill_total

    # --- Auto-fit Column Widths ---
    col_widths = {
        1: 6,    # ت
        2: 22,   # رمز المنتج
        3: 32,   # اسم عربي
        4: 28,   # اسم انجليزي
        5: 28,   # اسم كردي
        6: 35,   # شكل وتكوين
        7: 24,   # لون اساسي
        8: 45,   # دلالة اللون
        9: 15,   # سعر
        10: 16,  # سعر اصلي
        11: 14,  # مخزون
        12: 24,  # ابعاد
        13: 36   # مسار صورة
    }
    for col_idx, width in col_widths.items():
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = width

    # Save to all requested paths
    for p in output_paths:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        wb.save(p)
        print("Saved Excel catalog successfully to path.")

if __name__ == "__main__":
    destinations = [
        "data/ready_lego_flowers_catalog.xlsx",
        "قسم_ورد_الليكو_الجاهز_كتالوج_المالك.xlsx"
    ]
    create_catalog_excel(destinations)
