"""
IELTS Writing Task 1 - SVG Chart Generator
==========================================
Generates IELTS-authentic charts, graphs, and diagrams using deterministic SVG templates.
NO AI image generation - all visuals are data-driven SVGs.
"""

import json
import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import math

class IELTSChartGenerator:
    """
    Generates IELTS-authentic Task 1 visuals as SVG.
    
    Supported types:
    - Line graphs (single/multiple)
    - Bar charts (vertical/horizontal, grouped)
    - Pie charts (single/multiple)
    - Tables
    - Process diagrams
    - Maps (before/after)
    """
    
    # IELTS-authentic styling
    COLORS = {
        'primary': '#2563eb',    # Blue
        'secondary': '#dc2626',  # Red
        'tertiary': '#16a34a',   # Green
        'quaternary': '#9333ea', # Purple
        'quinary': '#ea580c',    # Orange
        'text': '#1f2937',
        'grid': '#e5e7eb',
        'background': '#ffffff',
        'axis': '#374151',
    }
    
    FONT = "Arial, sans-serif"
    
    # ============ LINE GRAPH ============
    
    def generate_line_graph(
        self,
        title: str,
        x_label: str,
        y_label: str,
        x_values: List[str],
        datasets: List[Dict[str, Any]],
        width: int = 800,
        height: int = 500
    ) -> str:
        """
        Generate a line graph SVG.
        
        datasets format: [
            {"label": "Country A", "values": [10, 20, 30, ...]},
            {"label": "Country B", "values": [15, 25, 35, ...]}
        ]
        """
        # Calculate bounds
        margin = {"top": 60, "right": 120, "bottom": 80, "left": 80}
        chart_width = width - margin["left"] - margin["right"]
        chart_height = height - margin["top"] - margin["bottom"]
        
        # Find y-axis range
        all_values = [v for d in datasets for v in d["values"]]
        y_min = 0
        y_max = max(all_values) * 1.1
        
        # Generate SVG
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            
            # Title
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        # Grid lines
        num_grid_lines = 5
        for i in range(num_grid_lines + 1):
            y = margin["top"] + (chart_height / num_grid_lines) * i
            value = y_max - (y_max / num_grid_lines) * i
            svg_parts.append(f'<line x1="{margin["left"]}" y1="{y}" x2="{width - margin["right"]}" y2="{y}" stroke="{self.COLORS["grid"]}" stroke-dasharray="3,3"/>')
            svg_parts.append(f'<text x="{margin["left"] - 10}" y="{y + 4}" text-anchor="end" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{int(value)}</text>')
        
        # X-axis labels
        x_step = chart_width / (len(x_values) - 1) if len(x_values) > 1 else chart_width
        for i, label in enumerate(x_values):
            x = margin["left"] + x_step * i
            svg_parts.append(f'<text x="{x}" y="{height - margin["bottom"] + 20}" text-anchor="middle" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{label}</text>')
        
        # Axis labels
        svg_parts.append(f'<text x="{width/2}" y="{height - 15}" text-anchor="middle" font-family="{self.FONT}" font-size="14" fill="{self.COLORS["text"]}">{x_label}</text>')
        svg_parts.append(f'<text x="20" y="{height/2}" text-anchor="middle" font-family="{self.FONT}" font-size="14" fill="{self.COLORS["text"]}" transform="rotate(-90, 20, {height/2})">{y_label}</text>')
        
        # Draw lines
        color_keys = ["primary", "secondary", "tertiary", "quaternary", "quinary"]
        for idx, dataset in enumerate(datasets):
            color = self.COLORS[color_keys[idx % len(color_keys)]]
            points = []
            for i, value in enumerate(dataset["values"]):
                x = margin["left"] + x_step * i
                y = margin["top"] + chart_height - (value / y_max * chart_height)
                points.append(f"{x},{y}")
            
            # Line
            svg_parts.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" stroke-width="2.5"/>')
            
            # Data points
            for i, value in enumerate(dataset["values"]):
                x = margin["left"] + x_step * i
                y = margin["top"] + chart_height - (value / y_max * chart_height)
                svg_parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{color}"/>')
            
            # Legend
            legend_y = margin["top"] + 20 + idx * 25
            svg_parts.append(f'<line x1="{width - margin["right"] + 10}" y1="{legend_y}" x2="{width - margin["right"] + 30}" y2="{legend_y}" stroke="{color}" stroke-width="2"/>')
            svg_parts.append(f'<text x="{width - margin["right"] + 35}" y="{legend_y + 4}" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{dataset["label"]}</text>')
        
        # Axes
        svg_parts.append(f'<line x1="{margin["left"]}" y1="{margin["top"]}" x2="{margin["left"]}" y2="{height - margin["bottom"]}" stroke="{self.COLORS["axis"]}" stroke-width="1.5"/>')
        svg_parts.append(f'<line x1="{margin["left"]}" y1="{height - margin["bottom"]}" x2="{width - margin["right"]}" y2="{height - margin["bottom"]}" stroke="{self.COLORS["axis"]}" stroke-width="1.5"/>')
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    # ============ BAR CHART ============
    
    def generate_bar_chart(
        self,
        title: str,
        x_label: str,
        y_label: str,
        categories: List[str],
        datasets: List[Dict[str, Any]],
        width: int = 800,
        height: int = 500,
        horizontal: bool = False
    ) -> str:
        """
        Generate a bar chart SVG.
        
        datasets format: [
            {"label": "2020", "values": [10, 20, 30, ...]},
            {"label": "2021", "values": [15, 25, 35, ...]}
        ]
        """
        margin = {"top": 60, "right": 120, "bottom": 80, "left": 80}
        chart_width = width - margin["left"] - margin["right"]
        chart_height = height - margin["top"] - margin["bottom"]
        
        all_values = [v for d in datasets for v in d["values"]]
        y_max = max(all_values) * 1.1
        
        num_categories = len(categories)
        num_datasets = len(datasets)
        group_width = chart_width / num_categories
        bar_width = (group_width * 0.8) / num_datasets
        bar_gap = group_width * 0.1
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        # Grid lines
        num_grid_lines = 5
        for i in range(num_grid_lines + 1):
            y = margin["top"] + (chart_height / num_grid_lines) * i
            value = y_max - (y_max / num_grid_lines) * i
            svg_parts.append(f'<line x1="{margin["left"]}" y1="{y}" x2="{width - margin["right"]}" y2="{y}" stroke="{self.COLORS["grid"]}" stroke-dasharray="3,3"/>')
            svg_parts.append(f'<text x="{margin["left"] - 10}" y="{y + 4}" text-anchor="end" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{int(value)}</text>')
        
        # Bars
        color_keys = ["primary", "secondary", "tertiary", "quaternary", "quinary"]
        for cat_idx, category in enumerate(categories):
            group_x = margin["left"] + group_width * cat_idx + bar_gap
            
            for ds_idx, dataset in enumerate(datasets):
                value = dataset["values"][cat_idx]
                bar_x = group_x + bar_width * ds_idx
                bar_height = (value / y_max) * chart_height
                bar_y = margin["top"] + chart_height - bar_height
                color = self.COLORS[color_keys[ds_idx % len(color_keys)]]
                
                svg_parts.append(f'<rect x="{bar_x}" y="{bar_y}" width="{bar_width - 2}" height="{bar_height}" fill="{color}"/>')
            
            # Category label
            label_x = margin["left"] + group_width * cat_idx + group_width / 2
            svg_parts.append(f'<text x="{label_x}" y="{height - margin["bottom"] + 20}" text-anchor="middle" font-family="{self.FONT}" font-size="11" fill="{self.COLORS["text"]}">{category}</text>')
        
        # Legend
        for idx, dataset in enumerate(datasets):
            color = self.COLORS[color_keys[idx % len(color_keys)]]
            legend_y = margin["top"] + 20 + idx * 25
            svg_parts.append(f'<rect x="{width - margin["right"] + 10}" y="{legend_y - 8}" width="16" height="16" fill="{color}"/>')
            svg_parts.append(f'<text x="{width - margin["right"] + 32}" y="{legend_y + 4}" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{dataset["label"]}</text>')
        
        # Axis labels
        svg_parts.append(f'<text x="{width/2}" y="{height - 15}" text-anchor="middle" font-family="{self.FONT}" font-size="14" fill="{self.COLORS["text"]}">{x_label}</text>')
        svg_parts.append(f'<text x="20" y="{height/2}" text-anchor="middle" font-family="{self.FONT}" font-size="14" fill="{self.COLORS["text"]}" transform="rotate(-90, 20, {height/2})">{y_label}</text>')
        
        # Axes
        svg_parts.append(f'<line x1="{margin["left"]}" y1="{margin["top"]}" x2="{margin["left"]}" y2="{height - margin["bottom"]}" stroke="{self.COLORS["axis"]}" stroke-width="1.5"/>')
        svg_parts.append(f'<line x1="{margin["left"]}" y1="{height - margin["bottom"]}" x2="{width - margin["right"]}" y2="{height - margin["bottom"]}" stroke="{self.COLORS["axis"]}" stroke-width="1.5"/>')
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    # ============ PIE CHART ============
    
    def generate_pie_chart(
        self,
        title: str,
        data: List[Dict[str, Any]],
        width: int = 600,
        height: int = 500
    ) -> str:
        """
        Generate a pie chart SVG.
        
        data format: [
            {"label": "Category A", "value": 30},
            {"label": "Category B", "value": 25},
            ...
        ]
        """
        center_x = width / 2 - 50
        center_y = height / 2 + 20
        radius = min(width, height) / 3
        
        total = sum(d["value"] for d in data)
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        color_keys = ["primary", "secondary", "tertiary", "quaternary", "quinary"]
        colors = [self.COLORS[k] for k in color_keys]
        
        # Add more colors if needed
        extra_colors = ["#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899", "#84cc16"]
        colors.extend(extra_colors)
        
        start_angle = -90  # Start from top
        
        for idx, item in enumerate(data):
            percentage = item["value"] / total
            angle = percentage * 360
            end_angle = start_angle + angle
            
            # Calculate arc path
            large_arc = 1 if angle > 180 else 0
            start_rad = math.radians(start_angle)
            end_rad = math.radians(end_angle)
            
            x1 = center_x + radius * math.cos(start_rad)
            y1 = center_y + radius * math.sin(start_rad)
            x2 = center_x + radius * math.cos(end_rad)
            y2 = center_y + radius * math.sin(end_rad)
            
            color = colors[idx % len(colors)]
            
            path = f'M {center_x} {center_y} L {x1} {y1} A {radius} {radius} 0 {large_arc} 1 {x2} {y2} Z'
            svg_parts.append(f'<path d="{path}" fill="{color}" stroke="{self.COLORS["background"]}" stroke-width="2"/>')
            
            # Percentage label on slice
            mid_angle = math.radians(start_angle + angle / 2)
            label_x = center_x + (radius * 0.65) * math.cos(mid_angle)
            label_y = center_y + (radius * 0.65) * math.sin(mid_angle)
            
            if percentage >= 0.05:  # Only show label if slice is big enough
                svg_parts.append(f'<text x="{label_x}" y="{label_y}" text-anchor="middle" font-family="{self.FONT}" font-size="12" font-weight="bold" fill="white">{item["value"]}%</text>')
            
            start_angle = end_angle
        
        # Legend
        legend_x = width - 150
        for idx, item in enumerate(data):
            color = colors[idx % len(colors)]
            legend_y = 60 + idx * 25
            svg_parts.append(f'<rect x="{legend_x}" y="{legend_y - 8}" width="16" height="16" fill="{color}"/>')
            svg_parts.append(f'<text x="{legend_x + 22}" y="{legend_y + 4}" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{item["label"]}</text>')
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    # ============ TABLE ============
    
    def generate_table(
        self,
        title: str,
        headers: List[str],
        rows: List[List[str]],
        width: int = 700,
        row_height: int = 35
    ) -> str:
        """Generate a table SVG."""
        num_cols = len(headers)
        num_rows = len(rows)
        col_width = width / num_cols
        height = 80 + (num_rows + 1) * row_height
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        table_y = 50
        
        # Header row
        svg_parts.append(f'<rect x="0" y="{table_y}" width="{width}" height="{row_height}" fill="#f3f4f6"/>')
        for col_idx, header in enumerate(headers):
            x = col_idx * col_width + col_width / 2
            svg_parts.append(f'<text x="{x}" y="{table_y + row_height/2 + 5}" text-anchor="middle" font-family="{self.FONT}" font-size="13" font-weight="bold" fill="{self.COLORS["text"]}">{header}</text>')
        
        # Data rows
        for row_idx, row in enumerate(rows):
            y = table_y + (row_idx + 1) * row_height
            if row_idx % 2 == 1:
                svg_parts.append(f'<rect x="0" y="{y}" width="{width}" height="{row_height}" fill="#f9fafb"/>')
            
            for col_idx, cell in enumerate(row):
                x = col_idx * col_width + col_width / 2
                svg_parts.append(f'<text x="{x}" y="{y + row_height/2 + 5}" text-anchor="middle" font-family="{self.FONT}" font-size="12" fill="{self.COLORS["text"]}">{cell}</text>')
        
        # Grid lines
        for i in range(num_rows + 2):
            y = table_y + i * row_height
            svg_parts.append(f'<line x1="0" y1="{y}" x2="{width}" y2="{y}" stroke="{self.COLORS["grid"]}" stroke-width="1"/>')
        
        for i in range(num_cols + 1):
            x = i * col_width
            svg_parts.append(f'<line x1="{x}" y1="{table_y}" x2="{x}" y2="{table_y + (num_rows + 1) * row_height}" stroke="{self.COLORS["grid"]}" stroke-width="1"/>')
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    # ============ PROCESS DIAGRAM ============
    
    def generate_process_diagram(
        self,
        title: str,
        steps: List[Dict[str, str]],
        width: int = 900,
        height: int = 400
    ) -> str:
        """
        Generate a process diagram SVG.
        
        steps format: [
            {"label": "Step 1", "description": "Raw materials collected"},
            {"label": "Step 2", "description": "Materials processed"},
            ...
        ]
        """
        margin = 50
        step_width = (width - 2 * margin) / len(steps)
        box_width = step_width * 0.7
        box_height = 80
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        center_y = height / 2
        
        for idx, step in enumerate(steps):
            x = margin + idx * step_width + (step_width - box_width) / 2
            
            # Box
            svg_parts.append(f'<rect x="{x}" y="{center_y - box_height/2}" width="{box_width}" height="{box_height}" rx="8" fill="{self.COLORS["primary"]}" opacity="0.1" stroke="{self.COLORS["primary"]}" stroke-width="2"/>')
            
            # Step label
            svg_parts.append(f'<text x="{x + box_width/2}" y="{center_y - 15}" text-anchor="middle" font-family="{self.FONT}" font-size="14" font-weight="bold" fill="{self.COLORS["primary"]}">{step["label"]}</text>')
            
            # Description (word wrap)
            desc = step["description"]
            words = desc.split()
            lines = []
            current_line = []
            for word in words:
                current_line.append(word)
                if len(' '.join(current_line)) > 15:
                    if len(current_line) > 1:
                        current_line.pop()
                        lines.append(' '.join(current_line))
                        current_line = [word]
                    else:
                        lines.append(' '.join(current_line))
                        current_line = []
            if current_line:
                lines.append(' '.join(current_line))
            
            for line_idx, line in enumerate(lines[:2]):  # Max 2 lines
                svg_parts.append(f'<text x="{x + box_width/2}" y="{center_y + 5 + line_idx * 16}" text-anchor="middle" font-family="{self.FONT}" font-size="11" fill="{self.COLORS["text"]}">{line}</text>')
            
            # Arrow to next step
            if idx < len(steps) - 1:
                arrow_x1 = x + box_width
                arrow_x2 = margin + (idx + 1) * step_width + (step_width - box_width) / 2
                svg_parts.append(f'<line x1="{arrow_x1}" y1="{center_y}" x2="{arrow_x2 - 5}" y2="{center_y}" stroke="{self.COLORS["axis"]}" stroke-width="2" marker-end="url(#arrowhead)"/>')
        
        # Arrow marker definition
        svg_parts.insert(1, '''
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
            </marker>
        </defs>
        ''')
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    # ============ MAP (BEFORE/AFTER) ============
    
    def generate_map_comparison(
        self,
        title: str,
        before_elements: List[Dict[str, Any]],
        after_elements: List[Dict[str, Any]],
        width: int = 900,
        height: int = 500
    ) -> str:
        """
        Generate a before/after map comparison SVG.
        
        elements format: [
            {"type": "building", "x": 100, "y": 100, "label": "School"},
            {"type": "road", "x1": 50, "y1": 100, "x2": 200, "y2": 100},
            {"type": "area", "x": 150, "y": 150, "width": 80, "height": 60, "label": "Park"},
            ...
        ]
        """
        half_width = width / 2 - 20
        map_height = height - 100
        
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
            f'<rect width="{width}" height="{height}" fill="{self.COLORS["background"]}"/>',
            f'<text x="{width/2}" y="30" text-anchor="middle" font-family="{self.FONT}" font-size="18" font-weight="bold" fill="{self.COLORS["text"]}">{title}</text>',
        ]
        
        # Before map
        svg_parts.append(f'<rect x="10" y="60" width="{half_width}" height="{map_height}" fill="#f0fdf4" stroke="{self.COLORS["grid"]}" stroke-width="1"/>')
        svg_parts.append(f'<text x="{half_width/2 + 10}" y="55" text-anchor="middle" font-family="{self.FONT}" font-size="14" font-weight="bold" fill="{self.COLORS["text"]}">Before</text>')
        
        for elem in before_elements:
            self._draw_map_element(svg_parts, elem, 10, 60)
        
        # After map
        svg_parts.append(f'<rect x="{half_width + 30}" y="60" width="{half_width}" height="{map_height}" fill="#fef3c7" stroke="{self.COLORS["grid"]}" stroke-width="1"/>')
        svg_parts.append(f'<text x="{half_width * 1.5 + 30}" y="55" text-anchor="middle" font-family="{self.FONT}" font-size="14" font-weight="bold" fill="{self.COLORS["text"]}">After</text>')
        
        for elem in after_elements:
            self._draw_map_element(svg_parts, elem, half_width + 30, 60)
        
        svg_parts.append('</svg>')
        return '\n'.join(svg_parts)
    
    def _draw_map_element(self, svg_parts: List[str], elem: Dict[str, Any], offset_x: float, offset_y: float):
        """Draw a single map element."""
        elem_type = elem.get("type", "building")
        
        if elem_type == "building":
            x = offset_x + elem["x"]
            y = offset_y + elem["y"]
            svg_parts.append(f'<rect x="{x}" y="{y}" width="40" height="30" fill="#94a3b8" stroke="#475569" stroke-width="1"/>')
            if "label" in elem:
                svg_parts.append(f'<text x="{x + 20}" y="{y + 45}" text-anchor="middle" font-family="{self.FONT}" font-size="10" fill="{self.COLORS["text"]}">{elem["label"]}</text>')
        
        elif elem_type == "road":
            x1 = offset_x + elem["x1"]
            y1 = offset_y + elem["y1"]
            x2 = offset_x + elem["x2"]
            y2 = offset_y + elem["y2"]
            svg_parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#1f2937" stroke-width="4"/>')
        
        elif elem_type == "area":
            x = offset_x + elem["x"]
            y = offset_y + elem["y"]
            w = elem.get("width", 60)
            h = elem.get("height", 40)
            fill = elem.get("fill", "#86efac")
            svg_parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="#166534" stroke-width="1"/>')
            if "label" in elem:
                svg_parts.append(f'<text x="{x + w/2}" y="{y + h/2 + 4}" text-anchor="middle" font-family="{self.FONT}" font-size="10" fill="{self.COLORS["text"]}">{elem["label"]}</text>')
        
        elif elem_type == "circle":
            x = offset_x + elem["x"]
            y = offset_y + elem["y"]
            r = elem.get("radius", 20)
            fill = elem.get("fill", "#60a5fa")
            svg_parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#1e40af" stroke-width="1"/>')
            if "label" in elem:
                svg_parts.append(f'<text x="{x}" y="{y + r + 15}" text-anchor="middle" font-family="{self.FONT}" font-size="10" fill="{self.COLORS["text"]}">{elem["label"]}</text>')

# ============ SAMPLE DATA GENERATORS ============

class IELTSDataGenerator:
    """Generate realistic IELTS Task 1 datasets."""
    
    TOPICS_DATA = {
        "education": {
            "entities": ["University graduates", "Primary school students", "Teachers", "Online learners"],
            "metrics": ["enrollment rates", "completion rates", "test scores", "spending per student"],
            "units": ["%", "thousands", "points", "USD"],
        },
        "environment": {
            "entities": ["CO2 emissions", "Renewable energy", "Deforestation", "Recycling rates"],
            "metrics": ["levels", "capacity", "area", "percentage"],
            "units": ["million tonnes", "gigawatts", "hectares", "%"],
        },
        "economy": {
            "entities": ["GDP", "Unemployment", "Exports", "Foreign investment"],
            "metrics": ["growth rate", "rate", "value", "inflow"],
            "units": ["%", "%", "billion USD", "million USD"],
        },
        "health": {
            "entities": ["Life expectancy", "Healthcare spending", "Hospital beds", "Doctors"],
            "metrics": ["years", "percentage of GDP", "per 1000 people", "per 1000 people"],
            "units": ["years", "%", "beds", "doctors"],
        },
        "technology": {
            "entities": ["Internet users", "Smartphone ownership", "E-commerce sales", "R&D investment"],
            "metrics": ["percentage", "percentage", "value", "percentage of GDP"],
            "units": ["%", "%", "billion USD", "%"],
        },
    }
    
    @staticmethod
    def generate_line_graph_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate data for a line graph based on topic and band level."""
        years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"]
        
        if band_level == "4.0-5.0":
            # Simple: 1-2 lines, clear trend
            num_lines = 1
            years = years[::2]  # Fewer data points
        elif band_level == "5.5-6.5":
            # Medium: 2-3 lines, mixed trends
            num_lines = 2
        else:
            # Advanced: 3-4 lines, complex patterns
            num_lines = 3
        
        datasets = []
        for i in range(num_lines):
            base = random.randint(20, 60)
            trend = random.choice(["up", "down", "fluctuate"])
            values = []
            for j in range(len(years)):
                if trend == "up":
                    val = base + j * random.randint(3, 8) + random.randint(-3, 3)
                elif trend == "down":
                    val = base - j * random.randint(2, 5) + random.randint(-3, 3)
                else:
                    val = base + random.randint(-10, 10)
                values.append(max(5, min(100, val)))
            
            datasets.append({
                "label": f"Country {chr(65 + i)}",
                "values": values
            })
        
        return {
            "title": f"Comparison of {topic.title()} Metrics (2015-2023)",
            "x_label": "Year",
            "y_label": "Percentage (%)",
            "x_values": years,
            "datasets": datasets
        }
    
    @staticmethod
    def generate_bar_chart_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate data for a bar chart."""
        categories = ["Country A", "Country B", "Country C", "Country D", "Country E"]
        
        if band_level == "4.0-5.0":
            categories = categories[:3]
            num_groups = 1
        elif band_level == "5.5-6.5":
            categories = categories[:4]
            num_groups = 2
        else:
            num_groups = 3
        
        datasets = []
        years = ["2010", "2015", "2020"][:num_groups]
        for year in years:
            values = [random.randint(15, 85) for _ in categories]
            datasets.append({"label": year, "values": values})
        
        return {
            "title": f"{topic.title()} Statistics by Country",
            "x_label": "Country",
            "y_label": "Value",
            "categories": categories,
            "datasets": datasets
        }
    
    @staticmethod
    def generate_pie_chart_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate data for a pie chart."""
        if band_level == "4.0-5.0":
            num_slices = 4
        elif band_level == "5.5-6.5":
            num_slices = 5
        else:
            num_slices = 6
        
        labels = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F"][:num_slices]
        
        # Generate values that sum to 100
        values = []
        remaining = 100
        for i in range(num_slices - 1):
            max_val = remaining - (num_slices - i - 1) * 5
            val = random.randint(10, min(40, max_val))
            values.append(val)
            remaining -= val
        values.append(remaining)
        
        data = [{"label": labels[i], "value": values[i]} for i in range(num_slices)]
        
        return {
            "title": f"Distribution of {topic.title()} (2023)",
            "data": data
        }


# Create singleton instance
chart_generator = IELTSChartGenerator()
data_generator = IELTSDataGenerator()
