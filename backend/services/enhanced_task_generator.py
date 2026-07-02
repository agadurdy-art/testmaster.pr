"""
IELTS Writing Task 1 - Enhanced Authentic Task Generator
=========================================================
ULTRA MASTER PROMPT Implementation - Complete Version

Supports ALL visual types:
- Line Graph
- Bar Chart (simple, grouped, stacked)
- Pie Chart (single, multiple)
- Table
- Process Diagram
- Map Comparison

Each task includes:
- Specific location (city, country, institution)
- Clear subject/system
- Defined time period
- Realistic academic context
- Band-calibrated complexity
"""

import random
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from content.enhanced_task_templates import (
    LOCATIONS,
    TIME_PERIODS,
    LINE_GRAPH_TEMPLATES,
    BAR_CHART_TEMPLATES,
    PIE_CHART_TEMPLATES,
    TABLE_TEMPLATES,
    PROCESS_TEMPLATES,
    MAP_TEMPLATES,
    BAND_COMPLEXITY,
)


class EnhancedTaskGenerator:
    """
    Generates IELTS-authentic Task 1 descriptions with proper complexity calibration.
    """
    
    # Template DATA lives in content/enhanced_task_templates.py
    # (Faz 1 refactor, 2026-07-02). Bound as class attributes so existing
    # references (self.LOCATIONS, EnhancedTaskGenerator.LOCATIONS, ...) keep working.
    LOCATIONS = LOCATIONS
    TIME_PERIODS = TIME_PERIODS
    LINE_GRAPH_TEMPLATES = LINE_GRAPH_TEMPLATES
    BAR_CHART_TEMPLATES = BAR_CHART_TEMPLATES
    PIE_CHART_TEMPLATES = PIE_CHART_TEMPLATES
    TABLE_TEMPLATES = TABLE_TEMPLATES
    PROCESS_TEMPLATES = PROCESS_TEMPLATES
    MAP_TEMPLATES = MAP_TEMPLATES
    BAND_COMPLEXITY = BAND_COMPLEXITY

    
    def __init__(self):
        self.topics_by_course = {
            "beginner": ["daily_life", "family", "food", "work", "education", "travel", "health", "hobbies"],
            "mastery": ["technology", "environment", "urbanization", "media", "culture", "economics"],
            "advanced": ["globalization", "scientific_research", "policy", "demographics", "sustainability"]
        }
    
    def generate_task(
        self,
        visual_type: str,
        topic: Optional[str] = None,
        band_level: str = "5.5-6.5"
    ) -> Dict[str, Any]:
        """
        Generate a complete IELTS Task 1 with authentic description and data.
        """
        generators = {
            "line_graph": self._generate_line_graph,
            "bar_chart": self._generate_bar_chart,
            "pie_chart": self._generate_pie_chart,
            "table": self._generate_table,
            "process": self._generate_process,
            "map": self._generate_map
        }
        
        generator = generators.get(visual_type)
        if not generator:
            raise ValueError(f"Unknown visual type: {visual_type}")
        
        return generator(topic, band_level)
    
    def _generate_line_graph(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate line graph task."""
        template = random.choice(self.LINE_GRAPH_TEMPLATES)
        complexity = self.BAND_COMPLEXITY.get(band_level, self.BAND_COMPLEXITY["5.5-6.5"])
        
        # Select time period
        if band_level == "4.0-5.0":
            period = random.choice(self.TIME_PERIODS["short"])
        elif band_level == "7.0-9.0":
            period = random.choice(self.TIME_PERIODS["historical"])
        else:
            period = random.choice(self.TIME_PERIODS["medium"])
        
        start_year, end_year = period
        years = list(range(start_year, end_year + 1, max(1, (end_year - start_year) // complexity["data_points"])))
        
        # Select location
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        institution = random.choice(self.LOCATIONS["universities"])
        
        # Build description
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{institution}", institution)
        description = description.replace("{start_year}", str(start_year))
        description = description.replace("{end_year}", str(end_year))
        
        if "{venues}" in description:
            venue = random.choice(template.get("venues", ["museums"]))
            description = description.replace("{venues}", venue)
        
        # Generate categories
        categories = random.choice(template.get("categories_options", [["Category A", "Category B", "Category C"]]))
        categories = categories[:complexity["categories"]]
        
        # Generate data with realistic trends
        datasets = []
        value_range = template.get("value_range", (50, 200))
        
        for cat in categories:
            trend = random.choice(template.get("trends", ["growth", "decline", "fluctuation"]))
            values = self._generate_trend_data(years, value_range, trend, complexity["trends"])
            datasets.append({"label": cat, "values": values})
        
        # Add IELTS instruction
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "line_graph",
            "task_description": full_description,
            "title": description.split(".")[0],
            "x_values": years,
            "x_label": "Year",
            "y_label": template.get("y_label", "Values"),
            "datasets": datasets,
            "band_calibration": {
                "target_band": band_level,
                "complexity": complexity["trends"]
            },
            "analysis_hints": {
                "overall_trend": self._identify_overall_trend(datasets),
                "notable_features": self._identify_notable_features(datasets, years),
                "comparison_points": self._identify_comparison_points(datasets)
            }
        }
    
    def _generate_bar_chart(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate bar chart task."""
        template = random.choice(self.BAR_CHART_TEMPLATES)
        complexity = self.BAND_COMPLEXITY.get(band_level, self.BAND_COMPLEXITY["5.5-6.5"])
        
        year = random.randint(2019, 2023)
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        
        # Build description
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 5))
        description = description.replace("{end_year}", str(year))
        
        if "{sector}" in description:
            sector = random.choice(template.get("sector", ["education"]))
            description = description.replace("{sector}", sector)
        
        if "{institution}" in description:
            institution = random.choice(self.LOCATIONS.get(template.get("institution_type", "universities")))
            description = description.replace("{institution}", institution)
        
        # Generate categories
        if template.get("categories"):
            categories = template["categories"][:complexity["categories"] + 1]
        else:
            categories = random.sample(self.LOCATIONS["countries"], complexity["categories"] + 1)
        
        # Generate data
        value_range = template.get("value_range", (100, 500))
        chart_style = template.get("chart_style", "simple")
        
        if chart_style == "grouped":
            # Two sets of data for comparison
            datasets = [
                {"label": "Group A", "values": [random.randint(*value_range) for _ in categories]},
                {"label": "Group B", "values": [random.randint(*value_range) for _ in categories]}
            ]
        else:
            datasets = [{"label": "Values", "values": [random.randint(*value_range) for _ in categories]}]
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "bar_chart",
            "chart_style": chart_style,
            "task_description": full_description,
            "title": description.split(".")[0],
            "categories": categories,
            "y_label": template.get("y_label", "Values"),
            "datasets": datasets,
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_pie_chart(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate pie chart task."""
        template = random.choice(self.PIE_CHART_TEMPLATES)
        
        year = random.randint(2019, 2023)
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        region = random.choice(self.LOCATIONS["regions"])
        
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{region}", region)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 10))
        description = description.replace("{end_year}", str(year))
        
        segments = template["segments"]
        
        # Generate percentages that sum to 100
        if template.get("comparison"):
            # Two pie charts
            values_1 = self._generate_percentages(len(segments))
            values_2 = self._generate_percentages(len(segments))
            datasets = [
                {"label": f"{year - 10}", "values": values_1},
                {"label": f"{year}", "values": values_2}
            ]
        else:
            values = self._generate_percentages(len(segments))
            datasets = [{"label": "Percentage", "values": values}]
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "pie_chart",
            "task_description": full_description,
            "title": description.split(".")[0],
            "segments": segments,
            "datasets": datasets,
            "is_comparison": template.get("comparison", False),
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_table(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate table task."""
        template = random.choice(self.TABLE_TEMPLATES)
        
        country = random.choice(self.LOCATIONS["countries"])
        year = random.randint(2019, 2023)
        
        description = template["template"]
        description = description.replace("{country}", country)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 5))
        description = description.replace("{end_year}", str(year))
        
        row_headers = template["row_headers"]
        column_headers = template["column_headers"]
        value_range = template.get("value_range", (10, 50))
        
        # Generate table data
        rows = []
        for row_header in row_headers:
            row = [row_header]
            if template.get("must_sum_100"):
                values = self._generate_percentages(len(column_headers))
                row.extend(values)
            else:
                for _ in column_headers:
                    row.append(random.randint(*value_range))
            rows.append(row)
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "table",
            "task_description": full_description,
            "title": description.split(".")[0],
            "columns": ["Category"] + column_headers,
            "rows": rows,
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_process(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate process diagram task."""
        template = random.choice(self.PROCESS_TEMPLATES)
        
        description = template["template"]
        description = description.replace("{product}", template["product"])
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "process",
            "task_description": full_description,
            "title": description,
            "stages": template["stages"],
            "is_cyclical": template.get("is_cyclical", False),
            "product": template["product"],
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_map(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate map comparison task."""
        template = random.choice(self.MAP_TEMPLATES)
        
        description = template["template"]
        description = description.replace("{place_name}", template["place_name"])
        description = description.replace("{island_name}", template.get("place_name", "Kalua"))
        description = description.replace("{village_name}", template.get("place_name", "Chorlton"))
        description = description.replace("{start_year}", template["time_before"])
        description = description.replace("{end_year}", template["time_after"])
        description = description.replace("{future_year}", template.get("time_after", "2035"))
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "map",
            "task_description": full_description,
            "title": description,
            "place_name": template["place_name"],
            "time_before": template["time_before"],
            "time_after": template["time_after"],
            "features_before": template["features_before"],
            "features_after": template["features_after"],
            "key_changes": template.get("key_changes", []),
            "band_calibration": {"target_band": band_level}
        }
    
    # ============ HELPER METHODS ============
    
    def _generate_trend_data(
        self, 
        years: List[int], 
        value_range: tuple, 
        trend: str,
        complexity: str
    ) -> List[float]:
        """Generate realistic trend data."""
        n = len(years)
        min_val, max_val = value_range
        
        if trend == "growth":
            base = random.uniform(min_val, min_val + (max_val - min_val) * 0.3)
            values = [base + (max_val - base) * (i / n) ** 0.8 for i in range(n)]
        elif trend == "decline":
            base = random.uniform(max_val * 0.7, max_val)
            values = [base - (base - min_val) * (i / n) ** 0.8 for i in range(n)]
        elif trend == "fluctuation":
            mid = (min_val + max_val) / 2
            values = [mid + random.uniform(-0.3, 0.3) * (max_val - min_val) for _ in range(n)]
        elif trend == "convergence":
            start = random.uniform(min_val, max_val)
            target = random.uniform(min_val + (max_val - min_val) * 0.4, max_val * 0.6)
            values = [start + (target - start) * (i / n) for i in range(n)]
        else:  # stability
            base = random.uniform(min_val + (max_val - min_val) * 0.3, max_val * 0.7)
            values = [base + random.uniform(-0.05, 0.05) * base for _ in range(n)]
        
        # Add noise for complexity
        if complexity == "complex":
            noise = 0.1
        elif complexity == "moderate":
            noise = 0.05
        else:
            noise = 0.02
        
        values = [v + random.uniform(-noise, noise) * v for v in values]
        return [round(v, 1) for v in values]
    
    def _generate_percentages(self, n: int) -> List[float]:
        """Generate n percentages that sum to 100."""
        values = [random.random() for _ in range(n)]
        total = sum(values)
        percentages = [round(v / total * 100, 1) for v in values]
        
        # Adjust to sum exactly to 100
        diff = 100 - sum(percentages)
        percentages[0] = round(percentages[0] + diff, 1)
        
        return percentages
    
    def _identify_overall_trend(self, datasets: List[Dict]) -> str:
        """Identify the overall trend in the data."""
        trends = []
        for ds in datasets:
            values = ds["values"]
            if values[-1] > values[0] * 1.1:
                trends.append("increasing")
            elif values[-1] < values[0] * 0.9:
                trends.append("decreasing")
            else:
                trends.append("stable")
        
        if all(t == "increasing" for t in trends):
            return "All categories showed an upward trend"
        elif all(t == "decreasing" for t in trends):
            return "All categories experienced a decline"
        else:
            return "The trends varied across different categories"
    
    def _identify_notable_features(self, datasets: List[Dict], years: List[int]) -> List[str]:
        """Identify notable features for analysis."""
        features = []
        
        for ds in datasets:
            values = ds["values"]
            label = ds["label"]
            
            # Highest and lowest points
            max_idx = values.index(max(values))
            min_idx = values.index(min(values))
            
            features.append(f"{label} peaked at {max(values)} in {years[max_idx]}")
            
            # Significant changes
            for i in range(1, len(values)):
                change = (values[i] - values[i-1]) / values[i-1] * 100 if values[i-1] != 0 else 0
                if abs(change) > 20:
                    direction = "increased" if change > 0 else "decreased"
                    features.append(f"{label} {direction} sharply between {years[i-1]} and {years[i]}")
        
        return features[:5]
    
    def _identify_comparison_points(self, datasets: List[Dict]) -> List[str]:
        """Identify key comparison points."""
        if len(datasets) < 2:
            return []
        
        comparisons = []
        
        # Compare final values
        final_values = [(ds["label"], ds["values"][-1]) for ds in datasets]
        final_values.sort(key=lambda x: x[1], reverse=True)
        
        comparisons.append(f"{final_values[0][0]} had the highest final value at {final_values[0][1]}")
        comparisons.append(f"{final_values[-1][0]} recorded the lowest at {final_values[-1][1]}")
        
        return comparisons


# Create singleton instance
enhanced_task_generator = EnhancedTaskGenerator()
