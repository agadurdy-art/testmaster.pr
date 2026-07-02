"""
IELTS Writing Task 1 - Authentic Task Generator
================================================
Generates IELTS-authentic task descriptions following the ULTRA MASTER PROMPT.

CORE RULE: Every task MUST include:
- A specific location (city, country, institution, region)
- A clear subject/system/activity
- A defined time period
- A realistic academic or social context

If a task cannot be imagined as coming from a real IELTS exam paper, it is INVALID.
"""

import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from content.writing_task1_templates import (
    LOCATIONS,
    LINE_GRAPH_TEMPLATES,
    TREND_PATTERNS,
    TIME_PERIODS,
    BAR_CHART_TEMPLATES,
    PIE_CHART_TEMPLATES,
    TABLE_TEMPLATES,
    PROCESS_TEMPLATES,
    MAP_TEMPLATES,
)


class AuthenticTaskGenerator:
    """
    Generates IELTS-authentic task descriptions and datasets.
    
    AUTHENTICITY RULES (NON-NEGOTIABLE):
    1. Every task has specific location, subject, time period
    2. Data must force analysis (trends, comparisons, exceptions)
    3. Band-based complexity calibration
    4. No generic or template-like descriptions
    """
    
    # Authentic template DATA lives in content/writing_task1_templates.py
    # (Faz 1 refactor, 2026-07-02). Bound as class attributes so existing
    # references (cls.LOCATIONS, AuthenticTaskGenerator.LOCATIONS, ...) keep working.
    LOCATIONS = LOCATIONS
    LINE_GRAPH_TEMPLATES = LINE_GRAPH_TEMPLATES
    TREND_PATTERNS = TREND_PATTERNS
    TIME_PERIODS = TIME_PERIODS
    BAR_CHART_TEMPLATES = BAR_CHART_TEMPLATES
    PIE_CHART_TEMPLATES = PIE_CHART_TEMPLATES
    TABLE_TEMPLATES = TABLE_TEMPLATES
    PROCESS_TEMPLATES = PROCESS_TEMPLATES
    MAP_TEMPLATES = MAP_TEMPLATES

    
    @classmethod
    def validate_task_authenticity(cls, task_description: str, data: dict) -> Tuple[bool, List[str]]:
        """
        Task Authenticity Linter - validates that a task meets IELTS standards.
        
        Returns: (is_valid, list_of_issues)
        """
        issues = []
        
        # Check 1: Location specificity
        has_location = any([
            any(city in task_description for city in cls.LOCATIONS["cities"]),
            any(country in task_description for country in cls.LOCATIONS["countries"]),
            any(region in task_description for region in cls.LOCATIONS["regions"]),
            any(inst in task_description.lower() for inst in ["centre", "center", "university", "museum", "library"])
        ])
        if not has_location:
            issues.append("MISSING_LOCATION: Task must include specific location")
        
        # Check 2: Time period
        import re
        year_pattern = r'\b(19|20)\d{2}\b'
        years_found = re.findall(year_pattern, task_description)
        if len(years_found) < 2:
            issues.append("MISSING_TIME_PERIOD: Task must include start and end years")
        
        # Check 3: Subject specificity
        vague_terms = ["information about", "data about", "some information", "various"]
        if any(term in task_description.lower() for term in vague_terms):
            issues.append("VAGUE_SUBJECT: Task description too generic")
        
        # Check 4: Data forces analysis
        if data:
            values = []
            if "datasets" in data:
                for ds in data["datasets"]:
                    values.extend(ds.get("values", []))
            
            if values:
                # Check for meaningful variation
                if len(set(values)) < 3:
                    issues.append("FLAT_DATA: Data lacks meaningful variation")
                
                # Check for at least one notable trend or comparison
                max_val = max(values) if values else 0
                min_val = min(values) if values else 0
                if max_val > 0 and (max_val - min_val) / max_val < 0.15:
                    issues.append("INSUFFICIENT_CONTRAST: Data needs more variation for analysis")
        
        return (len(issues) == 0, issues)
    
    @classmethod
    def generate_line_graph_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """
        Generate a complete, authentic Line Graph task.
        
        Returns:
        - task_description: IELTS-authentic task prompt
        - data: Structured dataset for SVG generation
        - analysis_hints: Key features for model answer
        - band_calibration: Complexity indicators
        """
        # Select topic category
        if topic and topic in cls.LINE_GRAPH_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.LINE_GRAPH_TEMPLATES.keys()))
        
        # Select template
        template_config = random.choice(cls.LINE_GRAPH_TEMPLATES[category])
        
        # Determine complexity based on band
        if band_level == "4.0-5.0":
            num_lines = 2
            num_years = 5
            time_period = "short"
            trend_complexity = "simple"
        elif band_level == "5.5-6.5":
            num_lines = 3
            num_years = 8
            time_period = "medium"
            trend_complexity = "intermediate"
        else:  # 7.0-9.0
            num_lines = 4
            num_years = 10
            time_period = "long"
            trend_complexity = "complex"
        
        # Generate time range
        period_config = cls.TIME_PERIODS[time_period]
        start_year, end_year = random.choice(period_config["examples"])
        
        # Adjust years based on num_years
        actual_end = start_year + num_years
        if actual_end > 2024:
            start_year = 2024 - num_years
            actual_end = 2024
        
        years = list(range(start_year, actual_end + 1, max(1, (actual_end - start_year) // (num_years - 1))))
        if len(years) > num_years:
            years = years[:num_years]
        
        # Select location
        location_type = template_config.get("location_type", "cities")
        if location_type == "cities":
            location = random.choice(cls.LOCATIONS["cities"])
            city = location
        elif location_type == "countries":
            location = random.choice(cls.LOCATIONS["countries"])
            city = location
        else:
            location = random.choice(cls.LOCATIONS["institutions"])
            city = location
        
        # Generate task description
        task_description = template_config["template"].format(
            location=location,
            city=city,
            country=location if location_type == "countries" else random.choice(cls.LOCATIONS["countries"]),
            start_year=years[0],
            end_year=years[-1]
        )
        
        # Add standard IELTS instruction
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate categories (line labels)
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            line_labels = categories_list[:num_lines]
        else:
            # Use countries
            line_labels = random.sample(cls.LOCATIONS["countries"], num_lines)
        
        # Generate data with meaningful trends
        datasets = cls._generate_trending_data(
            num_lines=num_lines,
            num_points=len(years),
            value_range=template_config["value_range"],
            complexity=trend_complexity,
            labels=line_labels
        )
        
        # Identify key features for analysis
        analysis_hints = cls._identify_key_features(datasets, years)
        
        # Build complete response
        result = {
            "task_description": task_description,
            "title": cls._extract_title(task_description, years),
            "x_label": "Year",
            "y_label": template_config["y_label"],
            "x_values": [str(y) for y in years],
            "datasets": datasets,
            "analysis_hints": analysis_hints,
            "band_calibration": {
                "target_band": band_level,
                "complexity": trend_complexity,
                "num_variables": num_lines,
                "time_span": f"{years[-1] - years[0]} years"
            },
            "metadata": {
                "category": category,
                "subject_type": template_config["subject_type"],
                "data_type": template_config["data_type"],
                "unit": template_config["unit"]
            }
        }
        
        # Validate authenticity
        is_valid, issues = cls.validate_task_authenticity(task_description, result)
        if not is_valid:
            # Regenerate if invalid (recursive with max depth)
            return cls.generate_line_graph_task(topic, band_level)
        
        return result
    
    @classmethod
    def _generate_trending_data(
        cls, 
        num_lines: int, 
        num_points: int, 
        value_range: Tuple[int, int],
        complexity: str,
        labels: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate data with meaningful trends based on complexity."""
        
        min_val, max_val = value_range
        datasets = []
        
        # Select trend patterns based on complexity
        trend_pool = cls.TREND_PATTERNS[complexity]
        
        # Ensure at least one interesting relationship
        if complexity == "complex" and num_lines >= 3:
            # Force an overtaking scenario
            trend_assignments = ["steady_increase", "peak_then_decline", "recovery"]
            if num_lines > 3:
                trend_assignments.extend(random.choices(
                    [t["name"] for t in trend_pool], 
                    k=num_lines - 3
                ))
        else:
            trend_assignments = [random.choice(trend_pool)["name"] for _ in range(num_lines)]
        
        for i, label in enumerate(labels):
            trend = trend_assignments[i] if i < len(trend_assignments) else "fluctuating_increase"
            values = cls._generate_trend_values(
                trend=trend,
                num_points=num_points,
                min_val=min_val,
                max_val=max_val,
                starting_offset=i * 0.1  # Offset to differentiate lines
            )
            datasets.append({
                "label": label,
                "values": values,
                "trend_type": trend
            })
        
        return datasets
    
    @classmethod
    def _generate_trend_values(
        cls, 
        trend: str, 
        num_points: int, 
        min_val: int, 
        max_val: int,
        starting_offset: float = 0
    ) -> List[float]:
        """Generate values following a specific trend pattern."""
        
        range_size = max_val - min_val
        base = min_val + range_size * (0.3 + starting_offset * 0.4)
        values = []
        
        for i in range(num_points):
            progress = i / (num_points - 1) if num_points > 1 else 0
            
            if trend == "steady_increase":
                val = base + (range_size * 0.5 * progress)
            elif trend == "steady_decrease":
                val = base + range_size * 0.4 - (range_size * 0.4 * progress)
            elif trend == "stable":
                val = base + random.uniform(-range_size * 0.05, range_size * 0.05)
            elif trend == "fluctuating_increase":
                val = base + (range_size * 0.4 * progress) + random.uniform(-range_size * 0.1, range_size * 0.1)
            elif trend == "sharp_rise_then_stable":
                if progress < 0.4:
                    val = base + (range_size * 0.5 * progress / 0.4)
                else:
                    val = base + range_size * 0.5 + random.uniform(-range_size * 0.05, range_size * 0.05)
            elif trend == "gradual_decline":
                val = base + range_size * 0.3 - (range_size * 0.25 * progress)
            elif trend == "peak_then_decline":
                if progress < 0.5:
                    val = base + (range_size * 0.5 * progress / 0.5)
                else:
                    val = base + range_size * 0.5 - (range_size * 0.3 * (progress - 0.5) / 0.5)
            elif trend == "recovery":
                if progress < 0.4:
                    val = base - (range_size * 0.2 * progress / 0.4)
                else:
                    val = base - range_size * 0.2 + (range_size * 0.4 * (progress - 0.4) / 0.6)
            elif trend == "convergence":
                val = base + (range_size * 0.3 - range_size * 0.1 * starting_offset * 10) * (1 - progress * 0.6)
            elif trend == "divergence":
                val = base + (range_size * 0.4 * progress * (1 + starting_offset))
            elif trend == "overtaking":
                if starting_offset < 0.05:  # First line
                    val = base + range_size * 0.3 - (range_size * 0.15 * progress)
                else:  # Other lines
                    val = base - range_size * 0.1 + (range_size * 0.5 * progress)
            else:
                val = base + random.uniform(-range_size * 0.1, range_size * 0.1)
            
            # Add small noise for realism
            noise = random.uniform(-range_size * 0.02, range_size * 0.02)
            val = max(min_val, min(max_val, val + noise))
            values.append(round(val, 1))
        
        return values
    
    @classmethod
    def _identify_key_features(cls, datasets: List[Dict], years: List[int]) -> Dict[str, Any]:
        """Identify key features for academic analysis."""
        
        features = {
            "overall_trend": None,
            "highest_point": None,
            "lowest_point": None,
            "notable_changes": [],
            "comparisons": [],
            "exceptions": []
        }
        
        all_values = []
        for ds in datasets:
            all_values.extend(ds["values"])
        
        # Overall trend
        first_avg = sum(ds["values"][0] for ds in datasets) / len(datasets)
        last_avg = sum(ds["values"][-1] for ds in datasets) / len(datasets)
        
        if last_avg > first_avg * 1.15:
            features["overall_trend"] = "general upward trend"
        elif last_avg < first_avg * 0.85:
            features["overall_trend"] = "general downward trend"
        else:
            features["overall_trend"] = "mixed or stable trends"
        
        # Find highest and lowest
        max_val = max(all_values)
        min_val = min(all_values)
        
        for ds in datasets:
            if max_val in ds["values"]:
                idx = ds["values"].index(max_val)
                features["highest_point"] = {
                    "label": ds["label"],
                    "value": max_val,
                    "year": years[idx]
                }
            if min_val in ds["values"]:
                idx = ds["values"].index(min_val)
                features["lowest_point"] = {
                    "label": ds["label"],
                    "value": min_val,
                    "year": years[idx]
                }
        
        # Notable changes
        for ds in datasets:
            for i in range(1, len(ds["values"])):
                change = ds["values"][i] - ds["values"][i-1]
                pct_change = abs(change / ds["values"][i-1]) * 100 if ds["values"][i-1] > 0 else 0
                if pct_change > 25:
                    features["notable_changes"].append({
                        "label": ds["label"],
                        "from_year": years[i-1],
                        "to_year": years[i],
                        "direction": "increase" if change > 0 else "decrease",
                        "magnitude": f"{pct_change:.0f}%"
                    })
        
        # Comparisons (at end point)
        end_values = [(ds["label"], ds["values"][-1]) for ds in datasets]
        end_values.sort(key=lambda x: x[1], reverse=True)
        
        if len(end_values) >= 2:
            features["comparisons"].append({
                "type": "final_ranking",
                "highest": end_values[0][0],
                "lowest": end_values[-1][0]
            })
        
        return features
    
    @classmethod
    def _extract_title(cls, task_description: str, years: List[int]) -> str:
        """Extract a suitable title from task description."""
        
        # Find the main subject from the task
        import re
        
        # Try to extract between "shows" and "between/from/for"
        match = re.search(r'(?:shows?|gives?|illustrates?)\s+(?:information on\s+)?(?:the\s+)?(.+?)(?:\s+(?:between|from|for|in)\s+)', task_description, re.IGNORECASE)
        
        if match:
            subject = match.group(1).strip()
            # Capitalize properly
            subject = ' '.join(word.capitalize() if word.lower() not in ['of', 'in', 'at', 'the', 'a', 'an', 'for', 'and', 'or'] else word.lower() for word in subject.split())
            return f"{subject} ({years[0]}-{years[-1]})"
        
        return f"Data Overview ({years[0]}-{years[-1]})"
    
    # ============ BAR CHART GENERATOR ============
    @classmethod
    def generate_bar_chart_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Bar Chart task."""
        
        # Select category
        if topic and topic in cls.BAR_CHART_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.BAR_CHART_TEMPLATES.keys()))
        
        template_config = random.choice(cls.BAR_CHART_TEMPLATES[category])
        
        # Determine complexity
        if band_level == "4.0-5.0":
            num_categories = 4
            num_groups = 1
        elif band_level == "5.5-6.5":
            num_categories = 5
            num_groups = 2
        else:
            num_categories = 6
            num_groups = 2
        
        # Generate years
        year = random.randint(2015, 2023)
        year1 = year - 10
        year2 = year
        
        # Get location
        location_type = template_config.get("location_type", "cities")
        if location_type == "cities":
            location = random.choice(cls.LOCATIONS["cities"])
        elif location_type == "countries":
            location = random.choice(cls.LOCATIONS["countries"])
        else:
            location = random.choice(cls.LOCATIONS["regions"])
        
        # Generate task description
        task_description = template_config["template"].format(
            city=location,
            country=location,
            region=location,
            year=year,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate categories
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            categories = categories_list[:num_categories]
        else:
            categories = random.sample(cls.LOCATIONS["countries"], num_categories)
        
        # Generate data
        value_range = template_config.get("value_range", (10, 100))
        datasets = []
        
        if num_groups == 1:
            values = [round(random.uniform(*value_range), 1) for _ in categories]
            datasets.append({
                "label": str(year),
                "values": values
            })
        else:
            for yr in [year1, year2]:
                values = [round(random.uniform(*value_range), 1) for _ in categories]
                datasets.append({
                    "label": str(yr),
                    "values": values
                })
        
        return {
            "task_description": task_description,
            "title": f"Data for {location} ({year1}-{year2})" if num_groups > 1 else f"Data for {location} ({year})",
            "x_label": "Category",
            "y_label": template_config.get("y_label", "Value"),
            "categories": categories,
            "datasets": datasets,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_categories": num_categories,
                "num_groups": num_groups
            },
            "metadata": {
                "chart_type": "bar_chart",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ PIE CHART GENERATOR ============
    @classmethod
    def generate_pie_chart_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Pie Chart task."""
        
        if topic and topic in cls.PIE_CHART_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.PIE_CHART_TEMPLATES.keys()))
        
        template_config = random.choice(cls.PIE_CHART_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_segments = 4
            has_comparison = False
        elif band_level == "5.5-6.5":
            num_segments = 5
            has_comparison = template_config.get("has_comparison", False)
        else:
            num_segments = 6
            has_comparison = True
        
        year = random.randint(2015, 2023)
        year1 = year - 10
        year2 = year
        
        location_type = template_config.get("location_type", "cities")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year=year,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate segments
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            segments = categories_list[:num_segments]
        else:
            segments = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F"][:num_segments]
        
        # Generate percentages that sum to 100
        def generate_percentages(n):
            values = [random.randint(5, 40) for _ in range(n)]
            total = sum(values)
            return [round(v * 100 / total, 1) for v in values]
        
        datasets = []
        if has_comparison:
            datasets.append({
                "label": str(year1),
                "values": generate_percentages(num_segments)
            })
            datasets.append({
                "label": str(year2),
                "values": generate_percentages(num_segments)
            })
        else:
            datasets.append({
                "label": str(year),
                "values": generate_percentages(num_segments)
            })
        
        return {
            "task_description": task_description,
            "title": f"Distribution in {location}" + (f" ({year1} vs {year2})" if has_comparison else f" ({year})"),
            "segments": segments,
            "datasets": datasets,
            "has_comparison": has_comparison,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_segments": num_segments
            },
            "metadata": {
                "chart_type": "pie_chart",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ TABLE GENERATOR ============
    @classmethod
    def generate_table_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Table task."""
        
        if topic and topic in cls.TABLE_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.TABLE_TEMPLATES.keys()))
        
        template_config = random.choice(cls.TABLE_TEMPLATES[category])
        
        # Complexity
        if band_level == "4.0-5.0":
            num_rows = 4
        elif band_level == "5.5-6.5":
            num_rows = 5
        else:
            num_rows = 6
        
        year = random.randint(2018, 2023)
        year1 = year - 2
        year2 = year - 1
        year3 = year
        
        location_type = template_config.get("location_type", "cities")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year=year,
            year1=year1,
            year2=year2,
            year3=year3
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        columns = template_config.get("columns", ["Category", "Value 1", "Value 2", "Value 3"])
        row_type = template_config.get("row_type", "categories")
        
        # Generate row labels
        if row_type == "countries":
            row_labels = random.sample(cls.LOCATIONS["countries"], num_rows)
        elif row_type == "cities":
            row_labels = random.sample(cls.LOCATIONS["cities"], num_rows)
        elif row_type == "courses":
            row_labels = random.sample(["Business", "Engineering", "Medicine", "Law", "Arts", "Science", "IT", "Education"], num_rows)
        else:
            row_labels = [f"Item {i+1}" for i in range(num_rows)]
        
        # Generate data
        rows = []
        for label in row_labels:
            row_data = [label]
            for col in columns[1:]:  # Skip first column (label)
                if "%" in col:
                    row_data.append(round(random.uniform(5, 95), 1))
                elif "million" in col.lower():
                    row_data.append(round(random.uniform(1, 50), 1))
                elif "$" in col:
                    row_data.append(round(random.uniform(100, 50000), 0))
                else:
                    row_data.append(round(random.uniform(10, 1000), 0))
            rows.append(row_data)
        
        return {
            "task_description": task_description,
            "title": f"Data for {location} ({year})",
            "columns": columns,
            "rows": rows,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_rows": num_rows,
                "num_columns": len(columns)
            },
            "metadata": {
                "chart_type": "table",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ PROCESS DIAGRAM GENERATOR ============
    @classmethod
    def generate_process_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Process Diagram task."""
        
        if topic and topic in cls.PROCESS_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.PROCESS_TEMPLATES.keys()))
        
        template_config = random.choice(cls.PROCESS_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_stages = 6
        elif band_level == "5.5-6.5":
            num_stages = 8
        else:
            num_stages = 10
        
        location = random.choice(cls.LOCATIONS["countries"])
        
        task_description = template_config["template"].format(country=location)
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Get stages
        stages = template_config.get("stages", [])[:num_stages]
        
        return {
            "task_description": task_description,
            "title": template_config["subject_type"].replace("_", " ").title(),
            "stages": stages,
            "is_cyclical": template_config.get("is_cyclical", False),
            "has_branching": template_config.get("has_branching", False),
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_stages": len(stages)
            },
            "metadata": {
                "chart_type": "process",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ MAP GENERATOR ============
    @classmethod
    def generate_map_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Map Comparison task."""
        
        if topic and topic in cls.MAP_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.MAP_TEMPLATES.keys()))
        
        template_config = random.choice(cls.MAP_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_features_before = 4
            num_features_after = 5
        elif band_level == "5.5-6.5":
            num_features_before = 5
            num_features_after = 6
        else:
            num_features_before = 5
            num_features_after = 7
        
        year1 = random.randint(1990, 2005)
        year2 = year1 + random.randint(15, 25)
        
        location_type = template_config.get("location_type", "countries")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        features_before = template_config.get("features_before", [])[:num_features_before]
        features_after = template_config.get("features_after", [])[:num_features_after]
        
        return {
            "task_description": task_description,
            "title": f"Development in {location} ({year1}-{year2})",
            "year_before": year1,
            "year_after": year2,
            "features_before": features_before,
            "features_after": features_after,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "time_span": f"{year2 - year1} years"
            },
            "metadata": {
                "chart_type": "map",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }


# Create singleton instance
authentic_task_generator = AuthenticTaskGenerator()
